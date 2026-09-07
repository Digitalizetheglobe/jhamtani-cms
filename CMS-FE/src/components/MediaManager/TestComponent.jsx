import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-6 bg-green-100 border-2 border-green-500 rounded-lg">
      <h1 className="text-2xl font-bold text-green-800">Media Manager Test Component</h1>
      <p className="text-green-700">If you can see this, the routing is working!</p>
      <div className="mt-4 p-4 bg-white rounded">
        <h2 className="font-semibold">Debug Info:</h2>
        <p>Component: TestComponent</p>
        <p>Time: {new Date().toLocaleString()}</p>
        <p>URL: {window.location.href}</p>
      </div>
    </div>
  );
};

export default TestComponent;
