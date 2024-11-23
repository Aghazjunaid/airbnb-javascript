console.time("map")

const sweetArray = [2, 3, 4, 5, 35]
const sweeterArray = sweetArray.map(sweetItem => {
    return sweetItem * 2
})

console.log(sweeterArray)

console.timeEnd("map")  //map: 16.715ms

console.time("for")
const aj = [2, 3, 4, 5, 35]
const arr = []
for(let i=0;i<aj.length;i++){
  arr.push(aj[i]*2)
}
console.log(arr)

console.timeEnd("for")  //for: 1.015ms

Sure, let's break down the code step-by-step and explain what it does:

Code Explanation
Array Initialization:

;
An array arr of integers is initialized with the values {10, 20, 30, 40}.
Pointer Initialization:

;
A pointer ptr is declared and initialized to point to the first element of the array arr.
Modifying Array Elements Using Pointer:

25
The expression *(ptr + 1) accesses the second element of the array (i.e., arr[1]).
The value of arr[1] is changed from 20 to 25.
;
The pointer ptr is incremented by 2, so it now points to the third element of the array (i.e., arr[2]).
35
The expression *ptr now accesses the third element of the array (i.e., arr[2]).
The value of arr[2] is changed from 30 to 35.
Printing Array Elements:

}
A for loop iterates over the array indices from 0 to 3.
In each iteration, the value of the current array element arr[i] is printed followed by a space.
