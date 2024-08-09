// 00:00 Intro
// 00:58 Round 1
// 01:12 Q1 - map vs forEach 
// 03:42 Q2 - null vs undefined
// 05:57 Q3 - Event Deligation
// 09:01 Q4 - Array.flat implementation
// 14:35 Q5 - Project Showcase
// 15:22 Round 2
// 15:25 Q1 - var vs let vs const
// 18:13 Q2 - setTimeout Based Output
// 21:59 Q3 - call, bind and apply
// 24:52 Q4 - Infinite Currying
// 24:43 Q5 - Compose Polyfill
// 27:52 Q6 - Implement Promise.all()
// 32:25 Round 3
// 32:28 Q1 - React Lifecycle methods
// 40:10 Q2 - Ways to center a div
// 43:02 Q3 - CSS Box Model
// 44:24 Q4 - Implement Debounce
// 48:33 Round 4

// map vs forEach 
// let arr = [1,2,3,4,5]

// arr.forEach((ele,i) => {
//     arr[i] = ele*2
// })
// console.log(arr) //[ 2, 4, 6, 8, 10 ]

// Array.flat implementation
// let arr = [
//     [1,2],
//     [3,4,[5,6]],
//     7,
//     [8]
// ]

// // let flatten = [].concat(...arr)
// // console.log(flatten) //[ 1, 2, 3, 4, [ 5, 6 ], 7, 8 ]

// function customFlat (arr,depth=1){
//     let result = []
//     arr.forEach((ar) => {
//         if(Array.isArray(ar) && depth > 0){
//             result.push(...customFlat(ar,depth-1))
//         } else{
//             result.push(ar)
//         }
//     })
//     return result
// }

// console.log(customFlat(arr,2)) //[ 1, 2, 3, 4, 5, 6, 7, 8 ]


// //setTimeout Based Output

// for(var i = 0; i < 3; i ++){
//     function timer(iter){
//              setTimeout(()=>{
//                      console.log(iter);    
//              }, iter * 1000)
//      }
//  timer(i);
//  }


//
// let obj = {
//     nam : function (age) {
//         console.log(this.name,age)
//     }
// }

// let obj2 = {
//     name: "AJ"
// }

// obj.nam.call(obj2,10)
// obj.nam.apply(obj2,[10])
// obj.nam.bind(obj2,10)()




