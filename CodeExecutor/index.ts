/**
 * Express application to handle code execution requests.
 * Provides endpoints to execute code within a Docker container and render the output to the frontend.
 * Supports handling time-limited executions and compilation failures.
 */

import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { xml2js } from 'xml-js';
import { truncate } from 'fs/promises';

const PORT: number = 3003;

// Initialize Express application
const app: Express = express();

// Promisify file system functions
const writeAsync = promisify(fs.writeFile);
const readAsync = promisify(fs.readFile);

// Middleware setup
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

/**
 * Middleware function to handle HTTP GET requests to the root endpoint ('/').
 * Renders the index view with an empty code snippet.
 * @param req - Express request object
 * @param res - Express response object
 */
app.get('/', (req: Request, res: Response) => {
    res.render('index', { code: "" });
});

/**
 * Function to limit execution time of a promise.
 * @param fn - Function to be executed within a time limit
 * @returns A promise that resolves or rejects based on the outcome of the provided function
 */
const timeLimit = function (fn: (...args: any[]) => Promise<any>) {
    return async function (...args: any[]) {
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Time Limit Exceeded"));
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

/**
 * HTTP POST endpoint to execute code.
 * @param req - Express request object containing code to be executed
 * @param res - Express response object to send back the execution result
 */
app.post('/code', async (req: Request, res: Response) => {
    try {
        // Clear output.xml file before execution
        await truncate('code_files/test-reports/output.xml');
        
        // Get code from request body
        const code: string = req.body.codeText;
        const filepath: string = 'code_files/code.py';

        // Write the code to a file within the Docker container
        await writeAsync(filepath, code);

        // Execute the code within the docker container with a time limit
        const timeLimitedExec = timeLimit((command: string) => {
            return new Promise((resolve, reject) => {
                exec(command, async (error: Error | null, stdout: string, stderr: string) => {

                    if (stderr) { 
                        // Both the correct output and compilation errors are available in stderr. Thus we check if output.xml is empty, If it is empty then it has to be a compilation error. 
                        const xmlData = await readAsync('code_files/test-reports/output.xml', 'utf-8');
                        if (!xmlData || xmlData.trim() === '') {
                            reject(new Error('Compilation failed: ' + stderr));
                            return;
                        }
                        const xmlObject = xml2js(xmlData, { compact: true });
                        resolve(xmlObject);
                        return
                    }

                    if (error) {
                        reject(new Error(`Error executing command: ${error}`));
                        return;
                    }
                   
                });
            });
        });

        // Docker command to run the code
        const command = `docker run -v "$(pwd)/code_files/code.py":/usr/src/code.py -v "$(pwd)/code_files/test-reports":/usr/src/test-reports codewitus-python`;
        const result = await timeLimitedExec(command);

        // Render the output to the frontend
        res.render('index', { code: result });
    } catch (e:any) {
        // Handle errors and render error message
        let errorMessage = '';
        if (e instanceof Error) {
            errorMessage = e.message;
        } else {
            errorMessage = e.toString();
        }
        res.render('index', { code: errorMessage });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('Working correctly');
});
