import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { xml2js } from 'xml-js';
import { truncate, mkdir } from 'fs/promises';
import path from 'path';
import cors from 'cors';

const PORT: number = 3003;

const app: Express = express();

// Promisify file system functions
const writeAsync = promisify(fs.writeFile);
const readAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const readdirAsync = promisify(fs.readdir);
const accessAsync = promisify(fs.access);
const rmdirAsync = promisify(fs.rmdir);

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors())

// Render an empty code snippet on the root page
app.get('/', (req: Request, res: Response) => {
  res.render('index', { code: "" });
});

// POST endpoint to execute the code
app.post('/code', async (req: Request, res: Response) => {
    console.log('Request body:', req.body)
  try {
    await mkdir('code_files/test-reports', { recursive: true });

    try {
      await accessAsync('code_files/test-reports/output.xml', fs.constants.F_OK);
    } catch (err) {
      await writeAsync('code_files/test-reports/output.xml', '');
    }
    await truncate('code_files/test-reports/output.xml');
    
    // Get code from request body (matching frontend)
    const code: string = req.body.codeText;
    const filepath: string = 'code_files/code.py';
    await writeAsync(filepath, code);

    const command = `docker run --memory 300m --network none --security-opt=no-new-privileges -v "$(pwd)/code_files/code.py":/usr/src/code.py -v "$(pwd)/code_files/test-reports":/usr/src/test-reports codewitus-python`;

    exec(command, async (error: Error | any, stdout: string, stderr: string) => {
      if (stderr) { 
        if (error && error['code'] === 124) {
          res.json({ result: 'Time Limit Exceeded!' });
          await cleanup();
          return;
        }
        
        const xmlData = await readAsync('code_files/test-reports/output.xml', 'utf-8');
        if (!xmlData || xmlData.trim() === '') {
          res.json({ result: 'Compilation failed: ' + stderr });
          await cleanup();
          return;
        }

        const xmlObject = xml2js(xmlData, { compact: true });
        res.json({ result: xmlObject });
        await cleanup();
        return;
      }

      if (error) {
        res.json({ result: `Error executing command: ${error}` });
        await cleanup();
        return;
      }

      // Respond with the result
      res.json({ result: stdout });
      await cleanup();
    });
  } catch (e: any) {
    let errorMessage = e instanceof Error ? e.message : e.toString();
    res.json({ result: errorMessage });
    await cleanup();
  }
});

// Cleanup function
const cleanup = async () => {
  try {
    const files = await readdirAsync('code_files/test-reports');
    for (const file of files) {
      await unlinkAsync(path.join('code_files/test-reports', file));
    }

    try {
      await rmdirAsync('code_files/test-reports');
    } catch (err) {
      console.log('Failed to delete test-reports directory');
    }
    
    console.log('Cleanup successful');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Start the server
app.listen(PORT, () => {
  console.log('Backend server running on port', PORT);
});
