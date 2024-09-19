import React from 'react';

interface TestCase {
  _attributes: {
    name: string;
    time: string;
    classname?: string;
    timestamp?: string;
    file?: string;
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
    return (
      <div className="result-container">
        <div className="h2">Problem Statement</div>
        <hr />
        <div className="question">1. Consider already having a class called `gradebook` that manages a student's grades for a class, but you want to *define* the following member function for it:
      double getAverage(); // returns the average of all the current grades
      void addGrade(double grade); // adds a new grade into the gradebook
      Complete the following function by: 
       (1) creating a new gradebook
       (2) adding the scores `80` and `95` to it, and 
       (3) returning what `averageGrade` calculates.</div>
        <div className="h2">Test case results</div>
        <hr />
        <div>No results to display.</div> {/* Placeholder for when no results are available */}
      </div>
    );
  }

  if (codeData.result && codeData.result.testsuites && codeData.result.testsuites.testsuite) {
    const testSuites: TestSuite[] = Array.isArray(codeData.result.testsuites.testsuite)
      ? codeData.result.testsuites.testsuite
      : [codeData.result.testsuites.testsuite];

    return (
      <div className="result-container">
        <div className="h2">Problem Statement</div>
        <hr />
        <div className="question">1. Consider already having a class called `gradebook` that manages a student's grades for a class, but you want to *define* the following member function for it:
      double getAverage(); // returns the average of all the current grades
      void addGrade(double grade); // adds a new grade into the gradebook
      Complete the following function by: 
       (1) creating a new gradebook
       (2) adding the scores `80` and `95` to it, and 
       (3) returning what `averageGrade` calculates.</div>
        <div className="h2">Test case results</div>
        <hr />
        {testSuites.map((suite, index) => (
          <div key={index}>
            <h2>{suite._attributes.name}</h2>
            <p>Tests: {suite._attributes.tests}</p>
            <p>File: {suite._attributes.file}</p>
            <p>Time: {suite._attributes.time} seconds</p>
            <p>Timestamp: {suite._attributes.timestamp}</p>
            <p>Failures: {suite._attributes.failures}</p>
            <p>Errors: {suite._attributes.errors}</p>
            <p>Skipped: {suite._attributes.skipped}</p>
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

  return (
    <div className="result-container">
      <div className="h2">Test case results</div>
      <hr />
      <div>No valid result data available.</div> {/* When there's an invalid result format */}
    </div>
  );
};

export default Result;
