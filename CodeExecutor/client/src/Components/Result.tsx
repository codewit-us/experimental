import React from 'react';

interface TestCase {
  _attributes: {
    name: string;
    time: string;
    classname?: string;
    line?: string;
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
    name: string;
    tests: string;
    file: string;
    time: string;
    timestamp: string;
    failures: string;
    errors: string;
    skipped: string;
  };
  testcase: TestCase | TestCase[];
}

interface TestSuites {
  testsuite: TestSuite | TestSuite[];
}

interface ResultProps {
  result: string;
}

const Result: React.FC<ResultProps> = ({ result }) => {
  let codeData;
  try {
    codeData = JSON.parse(result);
  } catch {
    return <div>{result}</div>;
  }

  if (codeData.result && codeData.result.testsuites && codeData.result.testsuites.testsuite) {
    const testSuites: TestSuite[] = Array.isArray(codeData.result.testsuites.testsuite)
      ? codeData.result.testsuites.testsuite
      : [codeData.result.testsuites.testsuite];

    return (
      <div className="result-container">
        {testSuites.map((suite, index) => (
          <div key={index}>
            <div className="summary">
              <h2>{suite._attributes.name}</h2>
              <p>Tests: {suite._attributes.tests}</p>
              <p>Time: {suite._attributes.time} seconds</p>
              <p>Failures: {suite._attributes.failures}</p>
              <p>Errors: {suite._attributes.errors}</p>
              <p>Skipped: {suite._attributes.skipped}</p>
            </div>
            <ul className="test-case-list">
              {(Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase]).map((testCase, idx) => {
                const hasError = testCase.error;
                const hasFailure = testCase.failure;
                const statusClass = hasError || hasFailure ? 'failed' : 'passed';
                return (
                  <li key={idx} className={`test-case ${statusClass}`}>
                    <strong>{testCase._attributes.name}</strong> - {testCase._attributes.time} seconds
                    {hasError || hasFailure ? (
                      <div className="error-details">
                        <p>{hasError ? 'Test failed: ' + testCase.error._attributes.message : 'Test failed: ' + testCase.failure._attributes.message}</p>
                        <p>Details:</p>
                        <pre>{hasError ? testCase.error._cdata?.trim() : testCase.failure._cdata?.trim()}</pre>
                      </div>
                    ) : (
                      <p className="success-message">Test passed successfully.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return <div>{result}</div>;
};

export default Result;
