const existing = [{id:1,name:'aj'},{id:2,name:'naz'},{id:3,name:'sam'}]
const input = [{id:4,name:'rt'},{id:3,name:'sam'}]

const newUser = []; //{id:4,name:'rt'}
const oldUser = []; //{id:3,name:'sam'}

let obj= {}
for(let i=0;i<existing.length;i++){
  obj[existing[i].id] = existing[i].name;
}


for(let i=0;i<input.length;i++){
  if(input[i].id in obj){
    oldUser.push(input[i])
  } else {
    newUser.push(input[i])
  }
}

console.log(newUser, oldUser)

const existing = [{id:1},{id:2},{id:3}]
const arr = existing.map(ele => {
  ele.id = ele.id *2
  return   ele.id*2
})


console.log(arr) //[ 4, 8, 12 ]
console.log(existing) //[ { id: 2 }, { id: 4 }, { id: 6 } ]
