let output = (function(x) {
    delete x;
    return x;
})(0);
  
document.write(output);
 
Explain the order of console execute
 
setTimeout(() => console.log('Task 1 completed'));
let result = new Promise(function(myResolve, myReject) {
// some logic
});
result.then(
console.log('Task 2 completed')
);
console.log('Task 3 completed');
 
"   Hello     World "
 
s1 = "My name is X Y Z"
 
s1output = "Z Y X is name My"
 
Reverse the ordering of words in a String
 
consider an array let arr = [1, 2, 3]. Without destructuring, if you wanted to assign these values to separate variables, how we can do it also With destructuring, how we can achieve the same result
 
const [a,b,c] = arr;
 
const a = arr[0]
const b = arr[1]
const c = arr[2]
 
let myFunc = {
 name: "Full Stack Tutorials",
 regFunc() {
  console.log(`Welcome to, ${this.name}`); 
 }, 
 arrowFunc: () => {
  console.log(`Welcome to, ${this.name}`);
 }
};
myFunc.regFunc();
myFunc.arrowFunc();
 
const obj = {name:"Sridhar", address:"BTM", city:"Bangalore"};
 
const newObj = {...obj};
 
function getData(...obj){
 
const {name, ...params} = obj;





const inputComponent = () => {
  const [name, setName] = useState('');
  
  useEffect(()=> {
    console.log('input updting')
    return () => {
      
    }
  },[name])
  
  const inputFun = (value) => {
    console.log(value);
  }
  
  return ( 
    <>
     <childComponent inputFun={inputFun} />
    </>
  )
}


export default inputComponent;

const childComponent = ({inputFun}) => {
  const [name, setName] = useState('');
  
  const handleChange = (e) => {
    setName(e.target.value)
    inputFun(name);
  }

  return (
    <>
     <>
      <input type='text' onChange={handleChange} />
    </>
    </>
  )
}



(function invoke(){
  conosle.log('hi')
})()
