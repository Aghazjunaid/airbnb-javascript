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