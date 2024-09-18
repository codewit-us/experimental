import './App.css';
import Result from './Components/Result';
import { useState } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from '@codemirror/lang-python';

const App: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3003/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeText: code }),
      });
  
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult('Error executing code');
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
  };

  return (
    <div className='App'>
      <div className='CodeMirror'>
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
        <button type='submit' className='submitBtn' onClick={handleSubmit}>Submit</button>
      </div>
      <div className='Result'>
        <Result result={result} />
      </div>
    </div>
  );
}

export default App;
