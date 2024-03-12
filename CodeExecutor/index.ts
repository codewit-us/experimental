import express,{Express,Request,Response} from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import {promisify} from 'util';
import {exec} from 'child_process';

const PORT:Number=3003
const app:Express=express() 
const writeAsync=promisify(fs.writeFile)

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))

app.set('view engine','ejs')
app.get('/',(req:Request,res:Response)=>{
    res.render('index')
})

const timeLimit = function(fn: (...args: any[]) => Promise<any>) {
    return async function(...args: any[]) {
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
        const code: string = req.body.codeText;
        const filepath: string = 'code_files/code.py';
        
        // Write the code to a file within the Docker container
        await writeAsync(filepath, code);

        // Execute the code within the Docker container with a time limit
        const timeLimitedExec = timeLimit((command: string) => {
            return new Promise((resolve, reject) => {
                exec(command, (error: Error | null, stdout: string, stderr: string) => {
                    if (stdout.includes('SyntaxError')) {
                        // Handle compilation error based on stdout content
                        console.error(`Compilation error: ${stdout}`);
                        stdout = 'Compilation failed: ' + stdout;
                        resolve(stdout);
                        return;
                    }

                    if (error) {
                        console.error(`Error executing command: ${error}`);
                        reject('Error executing command');
                        return;
                    }
                    
                    console.log(`Command stdout: ${stdout}`);
                    resolve(stdout);
                });
            });
        });

        const command = `docker run -v "$(pwd)/code_files/code.py":/usr/src/code.py codewitus-python 2>&1`;
        const stdout = await timeLimitedExec(command);

        // Render the output to the frontend
        res.render('index', { code: stdout });
    } catch (e) {
        if (e=='Time Limit Exceeded'){
            res.render('index',{code:'Time Limit Exceeded'})
        }
        else{
            console.error(e);
            res.status(500).send('Error 500 - Failure');
        }
    }
});

app.listen(PORT,()=>{
    console.log('Working correctly')
})