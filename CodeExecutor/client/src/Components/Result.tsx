import React from'react';
interface ResultProps {
    result:string
}

const Result: React.FC <ResultProps>= ({result})=>{
    return (
        <div>
            <h3>Result:</h3>
            <div>{result}</div>
        </div>
    )
}
export default Result