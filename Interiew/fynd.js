function f1(){
	var a = 10;
  this.a = a;
}

f1();
console.log(a);


const items = [1,2,3,4,5];
items.push(6);



const url = `api.facebook.com/posts/:postId`

Write a function which accepts postId as arg and makes a GET request with a postId return the post data.

{
	_id: 5,
  title: "xyz"
}

async function getPostData(postId){
	try{
  	const faceBookPostData = await axios.get(`api.facebook.com/posts/${postId}`);
    console.log(faceBookPostData);
    return faceBookPostData;
  } catch(error){
  	console.log(error)//
  }
}

getPostData(5).then((el))

console.log(getPostData(5));//

const postIds = [1,2,3,4,5,6,7,8,9,10];
async function promise(){
	let postIdResponse = await Promise.allSettled(postIds.map((ele) => getPostData(ele)));
  

}


const express= require("express");
const app = express();

function mid1(req,res,next){
	req
  next()
  
  res.end()
}

app.get('post/:posId',mid1,async (req,res) => {
  try{
  	// some error occurs
  }catch(err){
    
  }
})

app.listen(5000, ()=>{
console.log(5000)
})


async function sleep(time){
console.log("1");
setTimeout(()=> {
 console.log("20000")
},time)
console.log("2");
}

console.log("100");
await sleep(2000);
console.log("200");

//solution
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('Taking a break...');
  await sleep(2000);
  console.log('Two second break is over');
}

demo();

useEffect(()=>{
	
  return (()=>{
		removeEventListen.mouseorver()  
  })
},[])


//Sure, here's a simple example of how to create a circle using HTML and CSS:
<div class="circle"></div>
.circle {
  width: 100px;
  height: 100px;
  background-color: #555;
  border-radius: 50%;
}

//
const express = require('express');
const app = express();


const mid1 = function(req,res,next){
    console.log('mid 1 running');
    next()
}

const ErrorHandler = (err, req, res, next) => {
    console.log(err,next);

    console.log("Middleware Error Hadnling");
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
}

app.use(ErrorHandler)


app.get('/',(req,res,next) => {
    try{
        throw "aj"
    } catch(err){
        next(err)

    }
    // return res.json("hello")
})


app.listen(1337,()=>{
    console.log('3000 port')
})

//========
app.get('/', (req, res, next) => {
    try {
        // Some code that might throw an error
        const data = someFunctionThatMightThrowError();
        res.status(200).json(
            { message: 'Data retrieved successfully', data });
    } catch (error) {
        next(error);
    }
});

// Custom error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json(
        { message: 'Something went wrong!' });
});

