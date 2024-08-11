//1
console.log("1st");

function imp(name){
  setTimeout(function() {
    return name
  }, 1000);
}

imp("aj");
console.log("2nd");
// 1st
// undefined
// 2nd

//2
console.log("1st");

function imp(name,cb){
  setTimeout(function() {
    cb(name)
  }, 1000);
}

imp("aj",(val)=>{
  console.log(val)
});
console.log("2nd");
// 1st
// 2nd
// aj

//3
console.log("1st");

function imp(name){
  return new Promise((resolve,reject) => {
    setTimeout(function() {
      resolve(name)
    }, 1000);
  })
}

imp("aj").then((ele) => console.log(ele))
console.log("2nd");
// 1st
// 2nd
// aj

//4
