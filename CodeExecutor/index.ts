import express,{Express,Request,Response} from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import {promisify} from 'util';
import { exec } from 'child_process';

const PORT:Number=3002
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
        const code: string=req.body.codeText
        const filepath: string='code_files/code.py'
        await writeAsync(filepath,code)
        const command = 'docker run -v "$(pwd)/code_files/code.py":/usr/src/code.py codewitus-python';
        exec(command, (error:Error | null, stdout:string, stderr:string) => {
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
            console.log(`Command stdout: ${stdout}`);
            res.render('index', { code:stdout} ); 
        });

    } catch(e){
    
        console.log(e)
        res.send('Error 500 - Failure to write code to a file')
    }
    
})

app.listen(PORT,()=>{
    console.log('Working correctly')
})