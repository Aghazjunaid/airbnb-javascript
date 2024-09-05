1.
```javascript
const obj = [
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 2', data: 'Data2' },
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 3', data: 'Data1' },
    { key: 'Sample 4', data: 'Data1' },
]

let result = {}

obj.forEach(ele => {
  if(ele.key in result){
    result[ele.key].push(ele)
  } else {
    result[ele.key] = [ele]
  }
})

console.log(result)
{
  'Sample 1': [
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 1', data: 'Data1' }
  ],
  'Sample 2': [ { key: 'Sample 2', data: 'Data2' } ],
  'Sample 3': [ { key: 'Sample 3', data: 'Data1' } ],
  'Sample 4': [ { key: 'Sample 4', data: 'Data1' } ]
}

```
2.
```javascript

const createComputeFunctions=()=>{
    let totalAmount=0
    return {
        thousand:function(amount){
            totalAmount+=amount*1000
            return this

        },

        lacs:function(amount){
            totalAmount+=amount*100000
            return this
        },

        crore:function(amount){
            totalAmount+=amount*10000000
            return this

        },

        value:function(){
            return totalAmount

        }
    }
}

const compute =createComputeFunctions()

const result=compute.lacs(15).crore(5).crore(2).lacs(20).thousand(45).crore(7).value();
console.log(result) //143545000
```
3. 
```javascript
function memoize(){
  let obj = {};
  return function(a,b){
    if((a+','+b) in obj){
      console.log('memoize')
      return obj[a+','+b];
    } else {
      obj[a+','+b] = a+b;
      return a+b;
    }
  }
}

const aj = memoize();

console.log(aj(1,2)) //3
console.log(aj(1,2)) //3 from memoize
console.log(aj(2,2)) //4


function memorizeOne(cb){
    const cache = {};
    return function (...args){
        const key = JSON.stringify(args);        // Creating unique keys because objects are reference type
        if (key in cache) {
            console.log("Using memoized result");
            return cache[key];
        } else {
            console.log("Calculating result");
            const result = cb(...args);
            cache[key] = result;
            return result;
        }
    }
}

const add = (a, b) => a + b;

const memorize = memorizeOne(add);

console.log(memorize(1, 2)); // Calculates result: 3
console.log(memorize(1, 2)); // Uses memoized result: 3
console.log(memorize(2, 3)); // Calculates result: 5
console.log(memorize(1, 2)); // Uses memoized result: 3
```


