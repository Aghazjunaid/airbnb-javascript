1. React.memo implementation

2. React state batching + closures
function App() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(value+1)
    setValue(value+2)
    setValue(value+3)
  },[])

  return (
    <>
      {value} //3
    </>
  )
}

function App() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue((value) => value+1)
    setValue((value) => value+2)
    setValue((value) => value+3)
  },[])

  return (
    <>
      {value} //6
    </>
  )
}

React State Batching (simple)
  What is batching?
     React groups multiple setState calls and updates the UI once

3. web vitals
Web Vitals = metrics that measure real user experience
like FCP, LCP, FID, CLS
  FID (First Input Delay) (now replaced by INP)
    → How fast the site responds to user actions
    ✅ Good: < 100 ms
  CLS (Cumulative Layout Shift)
    → How stable the page layout is (no jumping)
    ✅ Good: < 0.1

4. how nodejs handle multi threading
  Node.js is single-threaded for JS, but multi-threaded under the hood
  JS runs on one main thread
  I/O handled by:
  OS
  libuv thread pool
  Heavy CPU work → Worker Threads

5. media query vs container query
media query - Based on width
container query -Based on parent container size

6. generic types

7. useDebounce hook code
import { useEffect, useState } from "react";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

8. rate limiting code

9. how flipkart handles millions of request incresement on big billion days
High-level strategy 🚀
  1️⃣ Horizontal scaling
  Thousands of servers
  Auto-scaling groups
  2️⃣ Caching everywhere
  CDN
  Redis
  Edge caching
  3️⃣ Rate limiting
  Protect backend
  4️⃣ Queue-based processing
  Kafka / SQS
  Async order processing
  5️⃣ Microservices
  Cart, Payment, Search separate
  6️⃣ Circuit breakers
  Prevent cascading failures

10. type and interface diff
