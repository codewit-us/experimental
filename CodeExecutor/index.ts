import express,{Express,Request,Response} from 'express'
import bodyParser from 'body-parser'
import path from 'path'

const PORT:Number=3001
const app:Express=express() 
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))

app.set('view engine','ejs')
app.get('/',(req:Request,res:Response)=>{
    res.render('index')
})

app.post('/code',(req: Request, res:Response)=>{
    const code=req.body.codeText
    res.send(code)
})

app.listen(PORT,()=>{
    console.log('Working correctly')
})