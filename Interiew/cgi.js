const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
 
async function asyncFunction() {   
  console.log('Async Function Start');  //2 
  const result1 = await delay(1000).then(() => {     
    console.log('First Delay');  //4 
    return 'Result 1';   
  });
 
  const result2 = await delay(500).then(() => {
    console.log('Second Delay');     //5
    return 'Result 2';   
  });   
  console.log(result1, result2);   //6
  console.log('Async Function End');  //7
} 
console.log('Before Async Call'); //1
asyncFunction();
console.log('After Async Call'); //3
