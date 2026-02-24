// //two sum
// // let arr = [2,3,2,1,4,5] 
// // let num = 5

// // let obj = {}
// // for(let i=0;i<arr.length;i++){
// //     if(arr[i] in obj){
// //         obj[arr[i]] += 1
// //     } else {
// //         obj[arr[i]] = 1
// //     }
// // }

// // for(let i=0;i<arr.length;i++){
// //     let diff = num - arr[i]
// //     if(diff in obj && obj[arr[i]] > 0){
// //         console.log([arr[i],diff])
// //         obj[arr[i]] -= 1
// //     }
// // }

// // console.log(obj)

// function printPairs(arr, n, sum) {
//     // Store counts of all elements in map m
//     var m = {};

//     // Traverse through all elements
//     for (var i = 0; i < n; i++) {
//       // Search if a pair can be formed with
//       // arr[i].
//       var rem = sum - arr[i];

//       if (m.hasOwnProperty(rem)) {
//         var c = m[rem];

//         for (var j = 0; j < c; j++) {
//             console.log(rem,arr[i])
//         }
//       }

//       if (m.hasOwnProperty(arr[i])) {
//         m[arr[i]]++;
//       } else {
//         m[arr[i]] = 1;
//       }
//     }
// }
// printPairs([1, 5, 7, -1, 5],[1, 5, 7, -1, 5].length,6)

// // let arr = [1,2,2,3,4,5] 
// // let num = 5

// // let l=0
// // let h=arr.length-1
// // while(l<h){
// //     if(arr[l]+arr[h] == num){
// //         console.log(arr[l],arr[h])
// //         l++
// //         h--
// //     }
// //     if(arr[l] + arr[h] > num){
// //         h--
// //     } else{
// //         l++
// //     }
// // }


// //isequal Object
// const A = {
//     name: "Aakash",
//     age: 22,
// }

// const B = {
//     name: "Aakash",
//     age: 22,
// }

// function isEqual(A,B) {
//     for(let key of Object.keys(A)){
//         if(A[key] != B[key]){
//             return false
//         }
//     }
//     return true
// }

// console.log(isEqual(A,B))

function isEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}

const posts = [
    {id: 1, category: "frontend", title: "All About That Sass"},
    {id: 2, category: "backend", title: "Beam me up, Scotty: Apache Beam tips"},
    {id: 3, category: "frontend", title: "Sanitizing HTML: Going antibactirial on XSS attacks"}
];

let categoryPosts = {}

for(let i=0;i<posts.length;i++){
    if(posts[i].category in categoryPosts){
        categoryPosts[posts[i].category].push(posts[i].id)
    } else {
        categoryPosts[posts[i].category] = [posts[i].id]
    }
}

console.log(categoryPosts) //{ frontend: [ 1, 3 ], backend: [ 2 ] }
