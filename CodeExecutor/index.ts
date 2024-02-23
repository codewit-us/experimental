import express,{Express,Request,Response} from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import fs from 'fs'
import {promisify} from 'util';
import { exec } from 'child_process';

const PORT:Number=3001
const app:Express=express() 
const writeAsync=promisify(fs.writeFile)

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))

app.set('view engine','ejs')
app.get('/',(req:Request,res:Response)=>{
    res.render('index')
})

app.post('/code',async (req: Request, res:Response)=>{
    try{
        const code=req.body.codeText
        const filepath='code_files/code.py'
        await writeAsync(filepath,code)
        const command = 'docker run -v "$(pwd)/code_files/code.py":/usr/src/code.py codewitus-python';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error}`);
                res.status(500).send('Error executing command');
                return;
            }
    
            if (stderr) {
                console.error(`Command stderr: ${stderr}`);
                res.status(500).send('Error executing command');
                return;
            }
    
            // Command executed successfully, stdout contains the output
            console.log(`Command stdout: ${stdout}`);
            res.send(stdout); // Send the output as response
        });
    } catch(e){
        console.log(e)
        res.send('Error 500 - Failure to write code to a file')
    }
    
})

app.listen(PORT,()=>{
    console.log('Working correctly')
})