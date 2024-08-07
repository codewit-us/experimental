import './App.css';
import Result from './Components/Result';
import { useState } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from '@codemirror/lang-python';




const App: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const handleSubmit = async (code: string) => {
    try {
      const response = await fetch('http://localhost:3003/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      setResult('error');
    }
  };
  function handleChange(value:string):void {
    setCode(value)
  } 

  return (
    <div className='App'>
     <CodeMirror
        value={code}
        height="400px"
        width='400px'
        theme={vscodeDark}
        extensions={[python()]}
        onChange={(value) => setCode(value)}
        options={{
          lineNumbers: true,
          tabSize: 4,
        }}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          textAlign: 'left',
        }}
        onChange:handleChange
      
      />
      {code}
      <button type='submit' onClick={handleSubmit}>Submit</button>
      <Result result={result} />
    </div>
    

  );
}

export default App;
