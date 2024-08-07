
import './App.css'
import Result from './Components/Result'
import Editor from './Components/Editor'
import { useState } from 'react'

const App:React.FC= ()=>{
  const [result,setResult] = useState<string>('')

  const handleSubmit = async (code:string)=>{
    try{
      const response= await fetch('http://localhost:3003/', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({code}),
      })
      const data= await response.json()
      setResult(data)
      
    }catch(e){
      setResult('error')
    }
  }

  return (
    <div className='App'>
      <Editor onSubmit={handleSubmit}></Editor>
      <Result result={result}></Result>
    </div>
  )
}

export default App
