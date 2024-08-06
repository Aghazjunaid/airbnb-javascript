// function sumRange(n){
//     if(n==0){
//         return 0
//     }
//     return n + sumRange(n-1)
// }

// console.log(sumRange(3)) //6

// function sumRange(n){
//     if(n==0){
//         return 
//     }
//     return n + sumRange(n-1)
// }

// console.log(sumRange(3)) //NaN

//============================================
// const res=[]
// function getOddValues(arr,i){
//     if(arr.length == i){
//         return
//     }
//     if(arr[i] % 2 != 0){
//         res.push(arr[i])
//     }
//     getOddValues(arr,++i)
// }

// getOddValues([1,2,3,4,5],0)
// console.log(res) //[ 1, 3, 5 ]


//=============================================
// function power(x,y){
//     if(y == 1){
//         return x;
//     }
//     return x * power(x,y-1)

// }
// console.log(power(3,4)) //81

//==============================================
// let num = 1
// function productOfArray(arr,i){
//     if(arr.length == i){
//         return 1;
//     }
//     num *= arr[i]
//     productOfArray(arr,++i)
// }
// productOfArray([1,2,3,4],0)
// console.log(num) //24

// //OR
// function productOfArray2(arr){
//     if(arr.length == 0){
//         return 1;
//     }
//     let aj = arr.pop()
//     return aj * productOfArray2(arr)
// }
// console.log(productOfArray2([1,2,3,4])) //24

//=================================================
// function fib(n){
//     if(n==0){
//         return 0;
//     }
//     if(n==1){
//         return 1;
//     }
//     return fib(n-1)+fib(n-2)
    
// }
// console.log(fib(7)) //13

//==================================================
// let newStr = ''
// function reverse(str,i){
//     if( i == -1){
//         return;
//     }
//     newStr += str[i]
//     reverse(str,--i)
// }
// reverse("hello","hello".length-1)
// console.log(newStr) //olleh

// // OR
// function reverse2(str){
//     if( str.length == 0){
//         return '';
//     }
//     return reverse2(str.slice(1)) + str[0]
// }

// console.log(reverse2("hello")) //olleh


//====================================================
// let newArr = []
// function capitalStr(arr){
//     if(arr.length == 0){
//         return
//     }
//     let aj = arr[0]
//     newArr.push(aj[0].toUpperCase()+aj.slice(1))
//     capitalStr(arr.slice(1))
// }

// capitalStr(['aj','naz'])
// console.log(newArr) //[ 'Aj', 'Naz' ]

// //OR(Not Working)
// function capitalStr2(arr){
//     if(arr.length == 0){
//         return []
//     }
//     let aj = arr[0]
//     arr[0] = aj[0].toUpperCase()+aj.slice(1)
//     capitalStr2(arr.slice(1))
//     return arr
// }

// console.log(capitalStr2(['aj','naz']))


//================================================

// let sum = 0
// function nestedEvenSum(obj){
//     for(let key of Object.keys(obj)){
//         if(typeof obj[key] == "object"){
//             nestedEvenSum(obj[key])
//         }else{
//             if(obj[key] % 2 == 0){
//                 sum += obj[key]
//             }
//         }
//     }
// }

// let obj1 ={
//     a: 1,
//     b: {
//         bb: 2,
//         bbb: 4,
//         c: {
//             cc : 3,
//             ccc: 6,
//             c: "naz"
//         }
//     },
//     d: 8
// }

// console.log(nestedEvenSum(obj1)) //20
// console.log(sum)

// //OR

// function nestedEvenSum2(obj){
//     let total = 0
//     for(let key of Object.keys(obj)){
//         if(typeof obj[key] == "object"){
//             total += nestedEvenSum2(obj[key])
//         }else if(typeof obj[key] == "number"){
//             if(obj[key] % 2 == 0){
//                 total += obj[key]
//             }
//         }
//     }
//     return total
// }

// console.log(nestedEvenSum2(obj1)) //20

//============================================
// function convertToStr(obj){
//     for(let key in obj){
//         if(typeof obj[key] == 'number'){
//             obj[key] = String(obj[key])
//         } else if( typeof obj[key] == 'object'){
//             convertToStr(obj[key])
//         }
//     }
//     return obj
// }

// let obj1 ={
//     a: 1,
//     b: {
//         bb: 2,
//         bbb: 4,
//         c: {
//             cc : [],
//             ccc: 6,
//             c: "naz"
//         }
//     },
//     d: 8
// }

// console.log(convertToStr(obj1))

//====================================================
// let arr = []
// function collectString(obj){
//     for(let key in obj){
//         if(typeof obj[key] == 'string'){
//             arr.push(obj[key])
//         } else if( typeof obj[key] == 'object'){
//             collectString(obj[key])
//         }
//     }
// }


// let obj1 ={
//     a: 1,
//     b: {
//         bb: 'aj',
//         bbb: 4,
//         c: {
//             cc : [],
//             ccc: 6,
//             c: "naz"
//         }
//     },
//     d: 'bye'
// }

// console.log(collectString(obj1))
// console.log(arr) //[ 'aj', 'naz', 'bye' ]

// //OR
// function collectString1(obj){
//     let arr1 = []
//     for(let key in obj){
//         if(typeof obj[key] == 'string'){
//             arr1.push(obj[key])
//         } else if( typeof obj[key] == 'object'){
//             let r = collectString1(obj[key])
//             if(r.length>0){
//                 arr1.push(...r)
//             }
//         }
//     }
//     return arr1
// }

// console.log(collectString1(obj1)) //[ 'aj', 'naz', 'bye' ]


//========================================================
let arr1 = []
function flattenArray(arr){
    for(let ele of arr){
        if(typeof ele == 'object'){
            flattenArray(ele)
        } else {
            arr1.push(ele)
        }
    }
}

console.log(flattenArray([1,2,[3,[4]],5]))
console.log(arr1) //[ 1, 2, 3, 4, 5 ]

//OR
function flattenArray1(arr){
    let arr1 = []
    for(let ele of arr){
        if(typeof ele == 'object'){
            let r = flattenArray1(ele)
            arr1 = arr1.concat(r)
        } else {
            arr1.push(ele)
        }
    }
    return arr1
}

console.log(flattenArray1([1,2,[3,[4]],5])) //[ 1, 2, 3, 4, 5 ]
