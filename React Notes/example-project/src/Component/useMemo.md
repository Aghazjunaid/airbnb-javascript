The `useMemo` hook in React is used to optimize performance by memoizing the results of expensive calculations. It helps prevent unnecessary re-computations of values when the dependencies haven't changed. This is particularly useful in preventing costly operations from running on every render, thus improving the performance of your components.

### When to Use `useMemo`

- **Expensive Calculations**: When you have a calculation that takes a significant amount of time.
- **Referential Equality**: When you need to maintain referential equality for objects or arrays to prevent unnecessary re-renders of child components.

### How `useMemo` Works

`useMemo` takes two arguments:
1. A function that returns a value (the calculation).
2. An array of dependencies that, when changed, will trigger the recalculation of the value.

### Example of `useMemo`

Let’s illustrate the use of `useMemo` with a simple example.

#### Scenario: Calculating Fibonacci Numbers

Imagine we have a component that calculates Fibonacci numbers. This calculation can be computationally expensive, especially for larger numbers.

```javascript
import React, { useState, useMemo } from 'react';

// Function to calculate Fibonacci numbers
const fibonacci = (n) => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
};

const FibonacciCalculator = () => {
    const [number, setNumber] = useState(0);
    const [count, setCount] = useState(0);

    // Use useMemo to optimize the Fibonacci calculation
    const fibValue = useMemo(() => {
        console.log('Calculating Fibonacci...');
        return fibonacci(number);
    }, [number]);

    return (
        <div>
            <h1>Fibonacci Calculator</h1>
            <input
                type="number"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
            />
            <h2>Fibonacci of {number} is {fibValue}</h2>
            <button onClick={() => setCount(count + 1)}>Increment Count: {count}</button>
        </div>
    );
};

export default FibonacciCalculator;
```

### Explanation

1. **State Variables**:
   - `number`: This holds the input number for which we want to calculate the Fibonacci value.
   - `count`: This is a simple counter that we can increment to demonstrate rendering behavior.

2. **Fibonacci Function**:
   - A recursive function that calculates the Fibonacci number. This function can become slow for larger values of `number`.

3. **Using `useMemo`**:
   - The `fibValue` variable is memoized using `useMemo`. It recalculates the Fibonacci number only when `number` changes.
   - If we increment `count`, the component re-renders, but the Fibonacci calculation is only performed again if `number` changes, thus improving performance.

4. **Console Log**:
   - The message "Calculating Fibonacci..." will only appear when the Fibonacci value is recalculated, demonstrating the optimization.

### Performance Improvement

Without `useMemo`, every time the component renders (e.g., when `count` changes), the Fibonacci function would run again. This can lead to performance issues, especially with larger Fibonacci numbers. Using `useMemo` ensures that the calculation only occurs when necessary.

### Summary

The `useMemo` hook is a powerful tool for optimizing performance in React applications. It allows developers to memoize expensive calculations and prevent unnecessary re-computations, which can lead to smoother and faster user experiences. Use `useMemo` when you have expensive calculations or need to maintain referential equality for complex objects or arrays.
