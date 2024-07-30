import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { xml2js } from 'xml-js';
import { truncate, mkdir } from 'fs/promises';
import path from 'path';

const PORT: number = 3003;

// Initialize Express application
const app: Express = express();

// Promisify file system functions
const writeAsync = promisify(fs.writeFile);
const readAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const readdirAsync = promisify(fs.readdir);
const accessAsync = promisify(fs.access);
const rmdirAsync = promisify(fs.rmdir);


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
 * HTTP POST endpoint to execute code.
 * @param req - Express request object containing code to be executed
 * @param res - Express response object to send back the execution result
 */
app.post('/code', async (req: Request, res: Response) => {
    try {
        // Ensure the test-reports directory exists
        await mkdir('code_files/test-reports', { recursive: true });

        // Ensure the output.xml file exists, then truncate it
        try {
            await accessAsync('code_files/test-reports/output.xml', fs.constants.F_OK);
        } catch (err) {
            await writeAsync('code_files/test-reports/output.xml', '');
        }
        await truncate('code_files/test-reports/output.xml');
        
        // Get code from request body
        const code: string = req.body.codeText;
        const filepath: string = 'code_files/code.py';

        // Write the code to a file within the Docker container
        await writeAsync(filepath, code);

        // Execute the code within the docker container
        const command = `docker run --memory 300m --network none --security-opt=no-new-privileges -v "$(pwd)/code_files/code.py":/usr/src/code.py -v "$(pwd)/code_files/test-reports":/usr/src/test-reports codewitus-python`;
        
        exec(command, async (error: Error | any, stdout: string, stderr: string) => {
            if (stderr) { 
                if (error && error['code'] === 124) {
                    res.render('index', { code: `Time Limit Exceeded!` });
                    await cleanup();
                    return;
                }
                // Both the correct output and compilation errors are available in stderr. Thus we check if output.xml is empty, If it is empty then it has to be a compilation error. 
                const xmlData = await readAsync('code_files/test-reports/output.xml', 'utf-8');
                if (!xmlData || xmlData.trim() === '') {
                    console.log(stderr);
                    res.render('index', { code: 'Compilation failed: ' + stderr });
                    await cleanup();
                    return;
                }
                const xmlObject = xml2js(xmlData, { compact: true });
                res.render('index', { code: xmlObject });
                await cleanup();
                return;
            }

            if (error) {
                res.render('index', { code: `Error executing command: ${error}` });
                await cleanup();
                return;
            }

            // Render the output to the frontend
            res.render('index', { code: stdout });
            await cleanup();
        });
    } catch (e: any) {
        // Handle errors and render error message
        let errorMessage = '';
        if (e instanceof Error) {
            errorMessage = e.message;
        } else {
            errorMessage = e.toString();
        }
        res.render('index', { code: errorMessage });
        await cleanup();
    }
});

// Function to clean up the code_files directory
const cleanup = async () => {
    try {
        // Read the contents of the test-reports directory and delete each file
        try {
            const files = await readdirAsync('code_files/test-reports');
            for (const file of files) {
                await unlinkAsync(path.join('code_files/test-reports', file));
            }
        } catch (err) {
            console.log('test-reports directory does not exist or is empty, skipping...');
        }
        // Delete the test-reports directory itself
        try {
            await rmdirAsync('code_files/test-reports');
            console.log('test-reports directory deleted successfully');
        } catch (err) {
            console.log('Failed to delete test-reports directory or it does not exist, skipping...');
        }
        
        console.log('Cleanup successful');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
};

// Start the server
app.listen(PORT, () => {
    console.log('Working correctly');
});
