//Map
let arr = [1, 2, 4, 5, 6, 4];
Array.prototype.myMap =  function(cb) {
  let temp = [];
  for(let i=0;i<this.length;i++){ //this here refers to globat arr
    temp.push(cb(this[i],i,this))
  }
  return temp
}

const result = arr.myMap((ele,i) => ele * 2)

console.log(result) //[ 2, 4, 8, 10, 12, 8 ]

//Filter
Array.prototype.myFilter =  function(cb) {
  let temp = [];
  for(let i=0;i<this.length;i++){
    if(cb(this[i],i,this)){
        temp.push(this[i])
    }
  }
  return temp
}

const result = arr.myFilter((ele,i) => ele > 2)

console.log(result)[ 4, 5, 6, 4 ]

//ForEach
Array.prototype.myForEach = function(callback) {
  for (let i = 0; i < this.length; i++) {
    callback(this[i], i, this);
  }
};

const arrData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

arrData.myForEach((element) => {
  console.log(element);
});

//Reducer
Array.prototype.myReducer =  function(cb, initialValue) {
  let acc = initialValue;
  
  for(let i=0;i<this.length;i++){
    acc = acc ? cb(acc,this[i], i, this) : this[i]
  }
  return acc
}

const result = arr.myReducer((acc,curr) => { return acc+curr},0)

console.log(result) // 22

//Call
Function.prototype.myCall = function(callObj = {}, ...params) {
  if (typeof this !== "function") {
    throw new Error(this + " is not a Function");
  }
  callObj.tempFunction = this; //inside this callObj , create a function printName so that object 2 has printName function
  const result = callObj.tempFunction(...params); // call the function printName with arguments
  return result;
};

let object1 = {
  name: "Vivek",
  surname: "moradiya",
  printName: function(age) {
    return this.name + " " + this.surname + " " + age;
  }
};

let object2 = {
  name: "Amy",
  surname: "Patel"
};

console.log(object1.printName.myCall(object2, 22));  // Amy Patel 22

//Apply
Function.prototype.myApply = function(callObj = {}, paramsArray) {
  if (typeof this !== "function") {
    throw new Error(this + " is not a Function");
  }
  callObj.tempFunction = this; //inside this callObj , create a function printName so that object 2 has printNames 
  const result = callObj.tempFunction(...paramsArray); // call the function printName with arguments
  return result;
};

let object1 = {
  name: "Vivek",
  surname: "moradiya",
  printName: function(age) {
    return this.name + " " + this.surname + " " + age;
  }
};

let object2 = {
  name: "Amy",
  surname: "Patel"
};

console.log(object1.printName.myApply(object2, [22]));  // Amy Patel 22

//Bind
Function.prototype.myApply = function(callObj = {}, ...params) {
  if (typeof this !== "function") {
    throw new Error(this + " is not a Function");
  }
  callObj.tempFunction = this; //inside this callObj , create a function printName so that object 2 has printNames 
  return function (...newParams){
    return callObj.tempFunction(...params,...newParams); 
  }
};

let object1 = {
  name: "Vivek",
  surname: "moradiya",
  printName: function(age) {
    return this.name + " " + this.surname + " " + age;
  }
};

let object2 = {
  name: "Amy",
  surname: "Patel"
};

let aj = object1.printName.myApply(object2, 22)
console.log(aj());  // Amy Patel 22

//Promise.all
const p1 = new Promise(function (resolve, reject) {
  setTimeout(() => {
    resolve("resolved 1");
  }, 1000);
});

const p2 = new Promise(function (resolve, reject) {
  setTimeout(() => {
    reject("rejected 2");
  }, 2000);
});

const p3 = new Promise(function (resolve, reject) {
  setTimeout(() => {
    resolve("resolved 3");
  }, 3000);
});

const p4 = new Promise(function (resolve, reject) {
  setTimeout(() => {
    resolve("resolved 4");
  }, 3000);
});

Promise.myAll = function (promises) {
  return new Promise(function (resolve, reject) {
    let result = [];
    let total = 0;

    promises.forEach((item, index) => {
      Promise.resolve(item)
        .then((res) => {
          result[index] = res;
          total++;
          if (total === promises.length) resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

Promise.myAll([p1, p2, p3])
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });

Promise.myAll([p1, p3, p4])
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });

//
