import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { xml2js } from 'xml-js';
import { truncate } from 'fs/promises';

const PORT: number = 3003;
const app: Express = express();
const writeAsync = promisify(fs.writeFile);
const readAsync = promisify(fs.readFile);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.get('/', (req: Request, res: Response) => {
    res.render('index', { code: "" });
});



const timeLimit = function (fn: (...args: any[]) => Promise<any>) {
    return async function (...args: any[]) {
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject("Time Limit Exceeded");
            }, 5000);

            try {
                const res = await fn(...args);
                clearTimeout(timeout);
                resolve(res);
            } catch (e) {
                clearTimeout(timeout);
                reject(e);
            }
        });
    };
};

app.post('/code', async (req: Request, res: Response) => {
    try {
        await truncate('code_files/test-reports/output.xml');
        const code: string = req.body.codeText;
        const filepath: string = 'code_files/code.py';

        // Write the code to a file within the Docker container
        await writeAsync(filepath, code);

        // Execute the code within the Docker container with a time limit
        const timeLimitedExec = timeLimit((command: string) => {
            return new Promise((resolve, reject) => {
                exec(command, async (error: Error | null, stdout: string, stderr: string) => {
                    console.log("stderr:"+stderr)
                    if (stderr.includes('SyntaxError') || stderr.includes('IndentationError')) {
                        // Handle compilation error based on stdout content
                        console.error(`Syntax Error: ${stderr}`);
                        const message= 'Compilation failed: ' + stderr;
                        resolve(message);
                        return;
                    }

                    if (error) {
                        console.error(`Error executing command: ${error}`);
                        reject(`Error executing command ${error} `);
                        return;
                    }

                    const readfilepath: string = 'code_files/test-reports/output.xml';
                    const xmlData = await readAsync(readfilepath, 'utf-8');

                    // Parse XML data to JavaScript object
                    const xmlObject = xml2js(xmlData, { compact: true });

                    if (!xmlObject || Object.keys(xmlObject).length === 0) {
                        reject('Failure to execute testcases');
                        return;
                    }

                    console.log(`Command stdout: ${stdout}`);
                    resolve(xmlObject);
                });
            });
        });

        const command = `docker run -v "$(pwd)/code_files/code.py":/usr/src/code.py -v "$(pwd)/code_files/test-reports":/usr/src/test-reports codewitus-python &2>1`;
        const stdout = await timeLimitedExec(command);

        // Render the output to the frontend
        res.render('index', { code: stdout });
    } catch (e) {
        if (typeof e === 'string' && e === 'Time Limit Exceeded') {
            res.render('index', { code: 'Time Limit Exceeded' });
        } else {
           
            console.error(e);
            let errorMessage = '';
            if (e instanceof TypeError) {
                errorMessage = `TypeError: ${e.message}`;
            } else if (e instanceof Error) {
                errorMessage = e.message;
            } else {
                errorMessage = e+"";
            }
            res.render('index', { code: errorMessage });
        }
    }
});

app.listen(PORT, () => {
    console.log('Working correctly');
});
