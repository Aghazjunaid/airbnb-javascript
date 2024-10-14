//1 Left rotate
function rotate (arr, k){
  
  const n = arr.length;
  const effectiveRotation = k%n;
  let temp =  arr.slice(effectiveRotation);
  let result = arr.slice(0,effectiveRotation)
  let ans =  temp.concat(result);
  return ans
  
}

console.log(rotate( [58, 51, 1, 154, -6, -60],51))


//2 Find n largest element
