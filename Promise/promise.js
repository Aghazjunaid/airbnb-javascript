// 1
let examplePromise = new Promise((resolve, reject) => {
	let timeout = 3000;
	let randomWaitTime = Math.floor(Math.random() * 5000) + 1;
	console.log(randomWaitTime);
	if (randomWaitTime <= timeout) {
		setTimeout(() => {
			resolve();
		}, randomWaitTime);
	} else {
		setTimeout(() => {
			reject();
		}, randomWaitTime);
	}
});

examplePromise
	.then(() => {
		console.log("RESOLVED!");
	})
	.catch(() => {
		console.log("REJECTED!");
    });
// REJECTED!

// 2
var p = new Promise((resolve, reject) => {
    reject(Error('The Fails!'))
  })
  p.catch(error => console.log(error.message))
  p.catch(error => console.log(error.message))
// print error message twice


//3
console.log('initial');

setTimeout(function() {
   console.log('setTimeout');
}, 0);

var promise = new Promise(function(resolve, reject) {
   resolve();
});

promise.then(function(resolve) {
   console.log('1st Promise');
})
.then(function(resolve) {
   console.log('2nd Promise');
});

console.log('final');
// initial => final => 1st Promise => 2nd Promise => setTimeout


// 4
const promise_1 = Promise.resolve('First');
const promise_2 = Promise.resolve('Second');
const promise_3 = Promise.reject('Third');
const promise_4 = Promise.resolve('Fourth');

const runPromises = async () => {
	const res1  = await Promise.all([promise_1, promise_2])
	const res2  = await Promise.all([promise_3, promise_4])
	return [res1, res2];
}

runPromises()
	.then(res => console.log(res))
    .catch(err => console.log(err))
//Third


// 5
new Promise((resolve, reject) => {
    console.log(4)
    resolve(5)
    console.log(6)
  }).then(() => console.log(7))
  .catch(() => console.log(8))
  .then(() => console.log(9))
  .catch(() => console.log(10))
  .then(() => console.log(11))
  .then(console.log)
  .finally(() => console.log(12))
//   4
// 6
// 7
// 9
// 11
// undefined
// 12


// 6
const myPromise = () => Promise.resolve('I have resolved!');

function firstFunction() {
  myPromise().then(res => console.log(res));
  console.log('second');
}

async function secondFunction() {
  console.log(await myPromise());
  console.log('second');
}

firstFunction();
secondFunction();
// second, I have resolved! and I have resolved!, second


// 7
const myPromise = Promise.resolve('Woah some cool data');

(async () => {
  try {
    console.log(await myPromise);
  } catch {
    throw new Error(`Oops didn't work`);
  } finally {
    console.log('Oh finally!');
  }
})();
// Woah some cool data Oh finally!




async function callMe() {
  return "Hello Aj"
}

(async()=> {
    console.log(await callMe()) //Hello AJ
})()

===========================================Examples=====================================
const axios = require('axios');

//1
axios.get('https://jsonplaceholder.typicode.com/posts/1')
.then(ele => console.log(ele.data))
.catch(err => console.log(err))

async function getData(id){
    try {
        const {data} = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
        return data;
    } catch(err){
        return err
    }
}

(async () => {
    console.log(await getData(1))
})()

getData(1).then(ele => console.log(ele))
.catch(err => console.log(err))

//2
let pro = Promise.allSettled([1,2,3].map(ele => getData(ele)));

pro.then(ele => console.log(ele))
.catch(err => console.log(err))
//OR
(async () => {
    console.log(await pro)
})()

//3
let pro1 = Promise.all([1,2,3].map(ele => getData(ele)));

(async () => {
    console.log(await pro1)
})()

//4
let pro2 = Promise.any([1,2,3].map(ele => getData(ele)));

(async () => {
    console.log(await pro2)
})()

//5
let pro3 = Promise.race([1,2,3].map(ele => getData(ele)));

(async () => {
    console.log(await pro3,'race')
})()
