// //1
// function freq(str){
//     let obj = {}
//     for(let i=0; i<str.length;i++){
//         if(str[i] in obj){
//             obj[str[i]] += 1
//         }else{
//             obj[str[i]] = 1
//         }
//     }
//     return obj
// }

// let ans = freq("aghazjunaid")
// console.log(ans) //{ a: 3, g: 1, h: 1, z: 1, j: 1, u: 1, n: 1, i: 1, d: 1 }

// //2
// let arr = [1,2,2,3,3,4,2,2,3,3,4,4,5]
// console.log([...new Set(arr)]) // [ 1, 2, 3, 4, 5 ]

// for(let i=0;i<arr.length;i++){
//     for(let j=i+1;j<arr.length;j++){
//         if(arr[i]===arr[j]){
//             arr.splice(j--,1)
//         }
//     }
// }
// console.log(arr) // [ 1, 2, 3, 4, 5 ]

// //3
// const arr = [
//     {label: 'All', value: 'All'},
//     {label: 'All', value: 'All'},
//     {label: 'Alex', value: 'Ninja'},
//     {label: 'Bill', value: 'Op'},
//     {label: 'Cill', value: 'iopop'}
// ]
// console.log([...new Set(arr)]) //not worked

// for(let i=0;i<arr.length;i++){
//     for(let j=i+1;j<arr.length;j++){
//         if(arr[i].label === arr[j].label && arr[i].value === arr[j].value){
//             arr.splice(j--,1)
//         }
//     }
// }
// console.log(arr)

// //4
// let kvArray = [{key: 1, value: 10},
//     {key: 2, value: 20},
//     {key: 3, value: 30}]

// let newArr = kvArray.map(ele => {
//     let obj = {}
//     obj[ele.key] = ele.value
//     return obj
// })
// console.log(newArr)
// // reformattedArray is now [{1: 10}, {2: 20}, {3: 30}],

// // kvArray is still:
// // [{key: 1, value: 10},
// //  {key: 2, value: 20},
// //  {key: 3, value: 30}]

// //5
// let arr = [{x: 1}, {x: 2}, {x: 3}]
// let ans = arr.reduce((acc,curr) => {
//     acc += curr.x
//     return acc
// },0)
// console.log(ans)//6

// //6
// let names = ['Alice', 'Bob', 'Tiff', 'Bruce', 'Alice']

// let ans = names.reduce((acc,curr) => {
//     if(curr in acc){
//         acc[curr] += 1
//     }else{
//         acc[curr] = 1
//     }
//     return acc
// },{})

// console.log(ans) //{ Alice: 2, Bob: 1, Tiff: 1, Bruce: 1 }

// //7
// const add = {
//     a: {value:1},
//     b: {value:2},
//     c: {value:3}
//   }
  
// let ans = Object.values(add).reduce((t, {value}) => t + value, 0)
// console.log(ans) //6

// let sum = 0
// for(let [key,value] of Object.entries(add)){
//     sum += value.value
// }
// console.log(sum) //6


// //8
// const posts = [
//     {id: 1, category: "frontend", title: "All About That Sass"},
//     {id: 2, category: "backend", title: "Beam me up, Scotty: Apache Beam tips"},
//     {id: 3, category: "frontend", title: "Sanitizing HTML: Going antibactirial on XSS attacks"}
// ];

// let categoryPosts = posts.reduce((acc,curr) => {
//     if(acc[curr.category]){
//         acc[curr.category].push(curr.id)
//     }else{
//         acc[curr.category] = [curr.id]
//     }
//     return acc
// },{})

// console.log(categoryPosts) //{ frontend: [ 1, 3 ], backend: [ 2 ] }


// //9
// var wizards = [
//     {
//       name: 'Harry Potter',
//       house: 'Gryfindor'
//     },
//     {
//       name: 'Cedric Diggory',
//       house: 'Hufflepuff'
//     },
//     {
//       name: 'Tonks',
//       house: 'Hufflepuff'
//     },
//     {
//       name: 'Ronald Weasley',
//       house: 'Gryfindor'
//     },
//     {
//       name: 'Hermione Granger',
//       house: 'Gryfindor'
//     }
// ];

// let ans = wizards.reduce((acc,curr) => {
//     if(curr.house === 'Gryfindor') acc.push(curr.name)
//     return acc
// },[])
// console.log(ans) //[ 'Harry Potter', 'Ronald Weasley', 'Hermione Granger' ]


// //10
// function multiply(num1){
//     return function index(num2){
//         return `${num1} * ${num2} = ${num1*num2}`
//     }
// }

// const table2 = multiply(2)
// console.log(table2(1))
// console.log(table2(2))
// console.log(table2(3))
// console.log(table2(4))
// console.log(table2(5))
// // 2 * 1 = 2
// // 2 * 2 = 4
// // 2 * 3 = 6
// // 2 * 4 = 8
// // 2 * 5 = 10

// const table5 = multiply(5)
// console.log(table5(1))
// console.log(table5(2))
// console.log(table5(3))
// console.log(table5(4))
// console.log(table5(5))
// // 5 * 1 = 5
// // 5 * 2 = 10
// // 5 * 3 = 15
// // 5 * 4 = 20
// // 5 * 5 = 25

// //11
// function curry(a){
//     return function(b){
//         return function(c){
//             return a+b+c
//         }
//     }
// }
// console.log(curry(1)(2)(3)) //6

// //12 Compare two objects in js
// const obj1 = {
//     name: 'Aghaz',
//     age: 22,
// };

// const obj2 = {
//     age: 22,
//     name: 'Aghaz',
// };

// for(let key1 of Object.keys(obj1)){
//     if(!(key1 in obj2) && obj1[key1] !== obj2[key1]){
//         console.log(false)
//     }
// }

//// 13 ======================================Promise example===================================
// let promise = new Promise((resolve, reject) => {
//     let otp = Math.floor(Math.random()*1000 + 9000)
//     if(otp%2 === 0){
//         resolve(`${otp} is Even`)
//     }
//     reject(`${otp} is Odd`)
// })

// promise
// .then(result => console.log(result))
// .catch(error => console.log(error))
// .finally(msg=> console.log("will run everytime"))
////==========================================OR=============================================
// async function resolvePromise(){
//     try {
//         const data = await promise;
//         console.log(data)
//     } catch (error) {
//         console.log("...",error)
//     }
// }
// resolvePromise()

// //14
// function counter(){
//     let count = 0
//     return function(){
//         return ++count
//     }
// }

// let ans = counter()
// console.log(ans())
// console.log(ans())
// console.log(ans())
// console.log(ans())

//========================19-08-2024============================================================
function add(a){
    return function(b){
        if(b) return add(a+b);
        return a;
    }
}

console.log(add(1)(2)(3)(4)()); // 10

let obj = {
    name: 'John',
    city: 'New York'
}

function aj(age){
    console.log(this.name,age)
}

aj.call(obj,'30') // John 30
aj.apply(obj,['30']) // John 30
let binded = aj.bind(obj,'30')
binded() // John 30


let sleep = new Promise((resolve,reject) => {
    setTimeout(() => {
        resolve('')
    },2000)
})


async function aj1(){
    console.log('start')
    await sleep;
    console.log('end')
}

aj1()
