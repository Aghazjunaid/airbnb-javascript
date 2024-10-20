// Flat
const arr = [1,[2,3,[4,5],6],7]
const result = []
function myFlat(arr){
  for(let i=0;i<arr.length;i++){
    if(Array.isArray(arr[i])){
      myFlat(arr[i])
    } else {
      result.push(arr[i])
    }
  }
}

myFlat(arr)
console.log(result) //[1, 2, 3, 4,5, 6, 7]


//Deep copy
const clone = structuredClone(original);
//OR
var obj = {
    a: {
        b: {
            c: 12,
            j: false
        },
        k: null
    }
};

function deepCopy(src) {
  let target = Array.isArray(src) ? [] : {};
  for (let prop in src) {
    let value = src[prop];
    if(value && typeof value === 'object') {
      target[prop] = deepCopy(value);
  } else {
      target[prop] = value;
  }
 }
    return target;
}

let newObj = deepCopy(obj);

newObj.a.k = 5;

console.log(obj) //{ a: { b: { c: 12, j: false }, k: 5 } }

//Find Path
var obj = {
    a: {
        b: {
            c: 12,
            j: false
        },
        k: null
    }
};

const findPath = (object, path) => {
    let splitData = path.split('.');
        for (var i = 0; i < splitData.length; i++) {
        
            if (object === undefined || object == null){
                return undefined;  
            } else{
                object = object[splitData[i]];
            }
        }
        return object;
}


console.log(findPath(obj, 'a.b.c')); // 12
console.log(findPath(obj, 'a.b')); // {c: 12, j: false}
console.log(findPath(obj, 'a.b.d')); // undefined
console.log(findPath(obj, 'a.c')); // undefined
console.log(findPath(obj, 'a.b.c.d')); // undefined
console.log(findPath(obj, 'a.b.c.d.e')); // undefined
console.log(findPath(obj, 'a.b.j')); //false
console.log(findPath(obj, 'a.b.j.k')); //undefined
console.log(findPath(obj, 'a.k')); //null


const inputArray = [
    {
      a: [1, 2, 3, "text"],
    },
    [[1, 2, 3, { a: [1, 2, 3, "text"] }]],
    [2, 4, 5],
    9
];


const result = [];

function rec(arr){
  
  for(let i=0;i<arr.length;i++){
    if(typeof arr[i] == 'object'){
      if(Array.isArray(arr[i])){
        rec(arr[i])
      } else {
        Object.values(arr[i]).forEach(rec);
      }
    } else if(typeof arr[i] == 'number') {
      result.push(arr[i])
    }
  }
}

rec(inputArray)
console.log(result); 
// [
//   1, 2, 3, 1, 2, 3,
//   1, 2, 3, 2, 4, 5,
//   9
// ]

