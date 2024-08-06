'use strict'
const result = true;
function demoBasics(){
    let demoVariable1 = 1;
    var testVariable1 = 2;
    if(result){
        demoVariable1 = 3;
        testVariable1 = 4;
        let demoVariable2 = 1;
        var testVariable2 = 2;
    }
    console.log(demoVariable1); //3
    console.log(testVariable1); //4
    console.log(demoVariable2); //reference error
    console.log(testVariable2);
} 
demoBasics();


// const me = {
//     age:36
// }
// const friend = me;
// friend.age = 40;
// console.log(me.age);
// console.log(friend.age);

// //Write ann add function which can take any number of parameters from 1 - n 
// //and it will give sum of all elements in return


// function sum(...num){
//     let value = 0
//     for(let i=0;i<num.length;i++){
//         value += num[i]
//     }
//     return value
// }

// console.log(sum(1,2,3))


employee
id
name
mangerId
salary

1,ajay,2,1000
2,deepak,0,2000
3,saran,2,3000

// select name,salary from employee ea INNER JOIN employee eb ON ea.id = eb.mangerId Where eb.salary > ea.salary
// select salary, name from (select name,salary from employee order by salary desc limit 3) as emp order by salary limit 1

// (select salary from employee order by salary desc limit 3 offset 2)


referral

user
id
name
amount
referralcode:

refferal
id
userId
amount
parentID
timestamps

graph

const inputArray = [
    {
      a: [1, 2, 3, "text"],
    },
    [[1, 2, 3, { a: [1, 2, 3, "text"] }]],
    [2, 4, 5],
];


  [
    1, 2, 3, 1, 2,
    3, 1, 2, 3, 2,
    4, 5
  ]

  How to secure ReactJS Application
Is ReactJS supporting SEO, how can we improve it
React-helmet
Optimisation Techniques
