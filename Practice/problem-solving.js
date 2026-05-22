# JavaScript Problem-Solving

1. Implement **infinite currying**
*You are expected to design a function that keeps returning another function until no argument is passed. This tests your understanding of closures, function chaining, and how values are preserved across calls.*
`sum(1)(2)(3)...() // 6`
function sum(a){
  return function(b){
    if(b) return sum(a+b)
    else return a
  }
}

console.log(sum(1)(2)(3)(4)()); //6

2. Create a **counter using closures** with increment, decrement, and reset.
*Tests your ability to create private state without classes and avoid global variables.*

    function createCounter(initialValue){
      let count = initialValue;
      
      return {
        increment() {
          count++
          return count
        },
        
        decrement(){
          count--
          return count
        },
        
        reset(){
          count = initialValue
          return count
        }
      }
    }
    
    // example
    const counter = createCounter(5);
    console.log(counter)
    console.log(counter.increment()); // 6
    console.log(counter.increment()); // 7
    console.log(counter.decrement()); // 6
    console.log(counter.reset());  // 5

    
3. Implement a **once() function** that runs only the first time.
Common utility problem that checks closure usage and side-effect control.
`//example`
    
        function once(cb){
      let called = false;
      
      return function(){
        
       if(!called){
         called = true
         return cb()
       }
      
      }
    }
    
    const init = once(() => {
    console.log("Initialized");
    return 42;
    });
    
    init(); // "Initialized"
    init(); // nothing
    init(); // nothing
    
4. Write a **deep copy polyfill**
*You must clone nested objects without sharing references. Interviewers look for correct handling of arrays, special objects, and circular references.*
function deepCopy(obj, map = new WeakMap()) {

  // primitive values
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // circular reference handling
  if (map.has(obj)) {
    return map.get(obj);
  }

  // array handling
  const copy = Array.isArray(obj) ? [] : {};

  // store reference
  map.set(obj, copy);

  for (let key in obj) {

    copy[key] = deepCopy(obj[key], map);

  }

  return copy;
}

const user = {
  name: "Aghaz",
  address: {
    city: "Delhi"
  },
  skills: ["JS", "Node"]
};

const cloned = deepCopy(user);

cloned.address.city = "Mumbai";

console.log(user.address.city);
console.log(cloned.address.city);

  
5. Implement **deep comparison** of two nested objects.
function deepEqual(obj1, obj2) {

  // same reference or primitive equality
  if (obj1 === obj2) {
    return true;
  }

  // null check
  if (
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  // type check
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  // keys
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // different number of keys
  if (keys1.length !== keys2.length) {
    return false;
  }

  // recursive comparison
  for (let key of keys1) {

    if (!keys2.includes(key)) {
      return false;
    }

    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

const A = {
  name: "Aghaz",
  address: {
    city: "Delhi"
  }
};

const B = {
  name: "Aghaz",
  address: {
    city: "Delhi"
  }
};

console.log(deepEqual(A, B)); //true


6. Flatten a **nested** object
`{ a: { b: { c: 1 }}} → { "a.b.c": 1 }`

const obj = {
  user: {
    name: "Aghaz",
    address: {
      city: "Delhi"
    }
  }
};


function flattenObject(obj,parent,result){
  for(let [key,value] of Object.entries(obj)){
    
    let newKey = parent
      ? `${parent}.${key}`
      : key;
    
    if(typeof value === 'object' && value != null ){
      flattenObject(obj[key],newKey,result)
    } else{
      result[newKey] = value
    }
  }
  
  return result
}
console.log(flattenObject(obj,'',{})); //{ 'user.name': 'Aghaz', 'user.address.city': 'Delhi' }


7. Create an **object from a string path**
`"a.b.c=10" → { a: { b: { c: 10 }}}`
8. Implement **debounce()**.
9. Implement **throttle()**.
10. **Flatten an array** without using `Array.prototype.flat().` 
11. Design a **chainable API**.
`computeAmount().lacs(10).crore(2).valueOf()` 
12. Implement a **Browser History class**.
`//example` 
    
    `const browser = new BrowserHistory("home");`
    
    `browser.visit("page1");
    browser.visit("page2");
    browser.back(1);      // "page1"
    browser.forward(1);   // "page2"
    browser.getCurrentPage(); // "page2"` 
    
13. Implement an **EventEmitter / Pub-Sub system**.
**VVVIMP**
14. Implement **retry logic with exponential backoff**.
*Very common in real-world frontend apps for handling flaky network calls.*
15. **Chunk** array problem
*Chunking splits an array into fixed-size subarrays*
`chunk([1, 2, 3, 4, 5], 2);
// output - [[1, 2], [3, 4], [5]]`
16. Create a fetch with **autoRetry**, which automatically **fetch again when error happens until the maximum count is meet**
17. Implement a function called **`parallelLimit`** that takes two parameters:
    - tasks: An array of functions that return promises
    - limit: Maximum number of tasks to run in parallel
    
    `const tasks = [
    () => new Promise(resolve => setTimeout(() => resolve(1), 1000)),
    () => new Promise(resolve => setTimeout(() => resolve(2), 500)),
    () => new Promise(resolve => setTimeout(() => resolve(3), 100)),
    () => new Promise(resolve => setTimeout(() => resolve(4), 800))
    ];`
    
    `// With limit of 2 concurrent tasks
    const results = await parallelLimit(tasks, 2);
    console.log(results); // [2, 3, 1, 4]`
    
18. **Cache** with expiration
19. Memoization method
20. **auto-retry** Promise on rejection
`fetchWithAutoRetry(fetcher, count)`, *which automatically fetch again when error happens, until the maximum count is met.*
