import React from 'react';

interface TestCase {
  _attributes: {
    name: string;
    time: string;
  };
  error?: {
    _attributes: {
      message: string;
    };
    _cdata?: string;
  };
  failure?: {
    _attributes: {
      message: string;
    };
    _cdata?: string;
  };
}

interface TestSuite {
  _attributes: {
    tests: string;
    failures: string;
  };
  testcase: TestCase | TestCase[];
}

interface ResultProps {
  result: string;
}

const Result: React.FC<ResultProps> = ({ result }) => {
  let codeData;

  try {
    codeData = JSON.parse(result);
  } catch {
    codeData = null; // Handle the case where JSON parsing fails
  }

  const renderTestResults = () => {
    if (!codeData) {
      return <div>No valid result data available.</div>;
    }

    // Check for "Time Limit Exceeded" or any other error message
    if (typeof codeData.result === 'string') {
      if (codeData.result === 'Time Limit Exceeded!') {
        return <div className='error-message'>{codeData.result}</div>;
      }
      return <div className='error-message'>{codeData.result}</div>; // Display any other error messages like compilation errors
    }

    // Now, process the test results from the XML output (in JSON form)
    if (codeData.result.testsuites && codeData.result.testsuites.testsuite) {
      const testSuites: TestSuite[] = Array.isArray(codeData.result.testsuites.testsuite)
        ? codeData.result.testsuites.testsuite
        : [codeData.result.testsuites.testsuite];

      return (
        <div>
          {testSuites.map((suite, index) => (
            <div key={index}>
              <ul className="test-case-list">
                {(Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase]).map((testCase, idx) => (
                  <li key={idx} className={`test-case ${testCase.error || testCase.failure ? 'failed' : 'passed'}`}>
                    <strong>{testCase._attributes.name}</strong> - {testCase._attributes.time} seconds
                    {testCase.error || testCase.failure ? (
                      <div className="failure">
                        <p>Test failed: {testCase.error ? testCase.error._attributes.message : testCase.failure._attributes.message}</p>
                        <p>Details:</p>
                        <pre>{testCase.error ? testCase.error._cdata?.trim() : testCase.failure._cdata?.trim()}</pre>
                      </div>
                    ) : (
                      <div className="success-message">
                        <p>Test passed successfully.</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    return <div>No valid test result data available.</div>;
  };

  return (
    <div className="result-container">
      <div className="h2">Problem Statement</div>
      <hr />
      <div className="question">
        1. Consider already having a class called `GradeBook` that manages a student's grades for a class, but you want to <em>define</em> the following member function for it:
        <br />
        <code>double get_average();</code> // returns the average of all the current grades
        <br />
        <code>void add_grade(double grade);</code> // adds a new grade into the gradebook
        <br />
        Complete the following function by: 
        <ol>
          <li>Creating a new gradebook</li>
          <li>Adding the scores <strong>80</strong> and <strong>95</strong> to it</li>
          <li>Returning what <code>averageGrade</code> calculates</li>
        </ol>
      </div>
      <div className="h2">Test Case Results</div>
      <hr />
      {renderTestResults()}
    </div>
  );
};

export default Result;
