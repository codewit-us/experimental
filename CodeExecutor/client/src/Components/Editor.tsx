import React, {useState} from 'react';

interface EditorProps{
    onSubmit:(code: string)=>void
}

const Editor: React.FC<EditorProps> = ({onSubmit}) => {
    const [code , setCode] =useState<string>('')
    const handleSubmit = () =>{
        onSubmit(code);
    }


return  (
    <div>
        <textarea
            value={code}
            onChange={(e)=> setCode(e.target.value)}
            rows={30}
            cols={50}
            placeholder='Write your code here ...'
        />
        <br />
        <button onClick={handleSubmit}>Submit Code</button>
    </div>
);
};
export default Editor