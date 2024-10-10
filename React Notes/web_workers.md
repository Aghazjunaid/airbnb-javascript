Web Workers allow you to run scripts in background threads, enabling you to perform tasks without affecting the performance of the main application thread. This is particularly useful for computationally intensive tasks that would otherwise block the UI.

### Key Features of Web Workers
- **Background Processing**: They run in a separate thread, allowing for non-blocking operations.
- **No Access to DOM**: Web Workers cannot manipulate the DOM directly.
- **Communication via Messages**: Data is passed between the main thread and the worker via messages.

### Example: Using Web Workers in React

We'll create a simple React application that uses a Web Worker to perform a computationally intensive task, such as calculating Fibonacci numbers.

#### Step 1: Create a Web Worker File

Create a new file named `worker.js` in the `src` directory.

```javascript
// src/worker.js
self.onmessage = function (e) {
    const num = e.data;
    const result = fibonacci(num);
    self.postMessage(result);
};

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

#### Step 2: Create a React Component

Now, create a component that will use this Web Worker. We'll call it `FibonacciWorker.js`.

```javascript
// src/FibonacciWorker.js
import React, { useState, useEffect } from 'react';

const FibonacciWorker = () => {
    const [number, setNumber] = useState(0);
    const [result, setResult] = useState(null);
    const [worker, setWorker] = useState(null);

    useEffect(() => {
        const newWorker = new Worker(new URL('./worker.js', window.location));
        newWorker.onmessage = (e) => {
            setResult(e.data);
        };
        setWorker(newWorker);

        return () => {
            newWorker.terminate(); // Cleanup the worker
        };
    }, []);

    const handleCalculate = () => {
        if (worker) {
            worker.postMessage(number);
        }
    };

    return (
        <div>
            <h1>Fibonacci Calculator using Web Workers</h1>
            <input
                type="number"
                value={number}
                onChange={(e) => setNumber(Number(e.target.value))}
            />
            <button onClick={handleCalculate}>Calculate Fibonacci</button>
            {result !== null && <p>Result: {result}</p>}
        </div>
    );
};

export default FibonacciWorker;
```

#### Step 3: Update the App Component

Now, update your `App.js` to include the `FibonacciWorker` component.

```javascript
// src/App.js
import React from 'react';
import FibonacciWorker from './FibonacciWorker';

const App = () => {
    return (
        <div>
            <FibonacciWorker />
        </div>
    );
};

export default App;
```

### Step 4: Run the Application

Now you can run your application:

```bash
npm start
```

### Summary

In this example:

- **Web Worker**: The `worker.js` file contains the logic to calculate Fibonacci numbers.
- **React Component**: The `FibonacciWorker` component creates a Web Worker, sends a number to it, and receives the result via messages.
- **Non-Blocking**: The computation is done in the background, so the UI remains responsive.

This approach is beneficial for performing heavy computations without freezing the UI, ensuring a smooth user experience.
