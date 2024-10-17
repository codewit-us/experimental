import './App.css';
import Result from './Components/Result';
import { useState } from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';

const App: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('python');

  const handleSubmit = async () => {
    if (language !== 'python') return;

    try {
      const response = await fetch('http://localhost:3003/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeText: code }),
      });
  
      const data = await response.json();
      console.log(data);
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult('Error executing code');
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    setCode(''); // Clear code editor when language is changed
  };

  const getCodeMirrorExtension = () => {
    switch (language) {
      case 'python':
        return python();
      case 'java':
        return java();
      case 'cpp':
        return cpp();
      default:
        return python();
    }
  };

  return (
    <div className='App'>
      <div className='h1'>Code evaluation</div>
      
      <div className="language-selector">
        <label htmlFor="language">Select Language: </label>
        <select id="language" onChange={handleLanguageChange} value={language}>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <div className='code-platform'>
        <div className='CodeMirror'>
          <CodeMirror
            value={code}
            height="100%"
            width='100%'
            theme={vscodeDark}
            extensions={[getCodeMirrorExtension()]}
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
          />
          <button
            type='submit'
            className='submitBtn'
            onClick={handleSubmit}
            disabled={language !== 'python'} // Disable for non-Python languages
          >
            Submit
          </button>
        </div>
        <div className='Result'>
          <Result result={result} />
        </div>
      </div>
    </div>
  );
}

export default App;
