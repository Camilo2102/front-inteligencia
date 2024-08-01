import axios from 'axios';
import React, { useState } from 'react';

function App() {
  const [code, setCode] = useState('');
  const [translatedCode, setTranslatedCode] = useState('');
  const [inputLanguage, setInputLanguage] = useState('javascript');
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [paramsValues, setParamsValues] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const response = await axios.post(`http://localhost:5000/translate`,
        { inputText: code },
        {
          params: {
            inputLanguage,
            outputLanguage: targetLanguage,
          },
        }
      );
      setTranslatedCode(response.data.result);
    } catch (error) {
      setTranslatedCode("No es una funcion valida de ningun lenguaje");
    } finally {
      setIsTranslating(false);
    }
  };

  const extractFunctionComponents = (code: string) => {
    const paramsMatch = code.match(/\(([^)]*)\)/);
    const bodyMatch = code.match(/\{([^}]*)\}/);

    const params = paramsMatch ? paramsMatch[1].trim() : '';
    const body = bodyMatch ? bodyMatch[1].trim() : '';

    return { params, body };
  };

  const processParameters = (paramString: string) => {
    return paramString
      .split(',')
      .map((param: string) => param.trim())
      .map((value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
  };

  const handleRunCode = () => {
    setIsRunning(true);
    const { params, body } = extractFunctionComponents(translatedCode);

    try {
      const fnParams = processParameters(params);
      const valueParams = processParameters(paramsValues);
      const fnBody = body.replace('return', 'return '); // Ensure 'return' is properly formatted
      const func = new Function(...fnParams, fnBody);

      const result = func(...valueParams);
      setOutput(result);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (translatedCode) {
      navigator.clipboard.writeText(translatedCode)
        .then(() => {
          setCopyMessage('Code copied to clipboard!');
          setTimeout(() => setCopyMessage(''), 3000); // Clear message after 3 seconds
        })
        .catch((error) => {
          setCopyMessage('Failed to copy code to clipboard.');
          console.error('Copy to clipboard failed:', error);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-5">Code Translator</h1>
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-5">
        <textarea
          className="w-full p-3 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your code here..."
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        ></textarea>
        <div className="mb-3">
          <label htmlFor="input-language" className="block mb-2 text-sm font-medium text-gray-700">
            Input Language
          </label>
          <select
            id="input-language"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={inputLanguage}
            onChange={(e) => setInputLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="ruby">Ruby</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="output-language" className="block mb-2 text-sm font-medium text-gray-700">
            Target Language
          </label>
          <select
            id="output-language"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="ruby">Ruby</option>
            <option value="java">Java</option>
          </select>
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
          onClick={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? 'Translating...' : 'Translate Code'}
        </button>
        {translatedCode && (
          <div className="mt-5 p-3 bg-gray-100 border rounded">
            <h2 className="text-xl font-semibold mb-3">Translated Code:</h2>
            <pre className="whitespace-pre-wrap">{translatedCode}</pre>
            <button
              className="mt-3 w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition duration-300"
              onClick={handleCopyToClipboard}
            >
              Copy to Clipboard
            </button>
            {copyMessage && (
              <p className="mt-3 text-green-500">{copyMessage}</p>
            )}
          </div>
        )}
        {translatedCode && targetLanguage === 'javascript' && (
          <>
            <div className="mb-3">
              <label htmlFor="params" className="block mb-2 text-sm font-medium text-gray-700">
                Function Parameters
              </label>
              <input
                id="params"
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter parameters, e.g., 1, 2"
                value={paramsValues}
                onChange={(e) => setParamsValues(e.target.value)}
              />
            </div>
            <button
              className="w-full mt-3 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-300"
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? 'Running Code...' : 'Run Code'}
            </button>
          </>
        )}
        {output && targetLanguage === 'javascript' && (
          <div className="mt-5 p-3 bg-gray-100 border rounded">
            <h2 className="text-xl font-semibold mb-3">Output:</h2>
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
