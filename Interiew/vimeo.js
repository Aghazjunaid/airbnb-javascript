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
function rotateArray(arr, rotations) {
    const n = arr.length;
    // Normalize the number of rotations
    const effectiveRotations = rotations % n;

    // Slice and rearrange the array
    const rotatedArray = arr.slice(-effectiveRotations).concat(arr.slice(0, n - effectiveRotations));
    
    return rotatedArray;
}

// Example usage
let arr = [1, 2, 3, 4, 5];
let rotations = 2;
let result = rotateArray(arr, rotations);
console.log(result); // Output: [4, 5, 1, 2, 3]

<p id="help">Help message</p>
<p>E-mail: <input type="text" id="email" name="email"></p>
<p>Name: <input type="text" id="name" name="name"></p>
<p>Age: <input type="text" id="age" name="age"></p>

function showHelp(help) {
  document.getElementById('help').innerHTML = help;
}

function setupHelp() {
  var helpText = [
      {'id': 'email', 'help': 'Your e-mail address'},
      {'id': 'name', 'help': 'Your full name'},
/*       {'id': 'age', 'help': 'Your age (you must be over 16)'}
       */    ];

  for (let i = 0; i < helpText.length; i++) {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = function(e) {
    console.log(e.target.name)
    let inputName = e.target.name;
    let 
    if()
      showHelp(item.help);
    }
  }
}

setupHelp();
