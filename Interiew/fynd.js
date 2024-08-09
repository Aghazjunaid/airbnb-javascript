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


