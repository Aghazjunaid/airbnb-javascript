//1
var map = new Map();
map.set('orange', 10);
map.set('apple', 5);
map.set('banana', 20);
map.set('cherry', 13);

// console.log(map)

const sortedMap = new Map([...map].sort((a,b) => a[1]-b[1]))

console.log(sortedMap)

//2
const str = "abc";

function perm(str){
  const results = [];
  
  const permute = (prefix, rem) => {
    if(rem.length === 0){
      results.push(prefix)
    }
    
    for(let i=0;i<rem.length;i++){
      permute(prefix + rem[i], rem.slice(0,i) + rem.slice(i+1))
    }
  }
  
  permute('',str);
  return results
}

console.log(perm(str))

//3
-- create
CREATE TABLE EMPLOYEE (
  empId INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept TEXT NOT NULL
);

-- create
CREATE TABLE ADDRESS (
  id INTEGER PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  empId INTEGER  NOT NULL
);

-- insert
INSERT INTO EMPLOYEE VALUES (0001, 'Clark', 'Sales');
INSERT INTO EMPLOYEE VALUES (0002, 'Dave', 'Accounting');
INSERT INTO EMPLOYEE VALUES (0003, 'Ava', 'Sales');

INSERT INTO EMPLOYEE VALUES (0004, 'Atul', 'Sales');

INSERT INTO ADDRESS VALUES (0001, 'address', 'city', 0002);
INSERT INTO ADDRESS VALUES (0002, 'address2', 'city2', 0002);

INSERT INTO ADDRESS VALUES (0003, 'address4', 'city4', 0001);

INSERT INTO ADDRESS VALUES (0004, 'address3', 'city3', 0003);

-- fetch 
SELECT * FROM EMPLOYEE ;

select * from ADDRESS ;


select count(e.empId) as empCount, e.name from EMPLOYEE e
inner join ADDRESS a on a.empId = e.empId
group by e.empId having count(e.empId) > 1;

//4
db={
  "orders": [
    {
      "_id": 1,
      "item": "almonds",
      "price": 12,
      "quantity": 2
    },
    {
      "_id": 2,
      "item": "pecans",
      "price": 20,
      "quantity": 1
    },
    {
      "_id": 3
    }
  ],
  "inventory": [
    {
      "_id": 1,
      "sku": "almonds",
      "description": "product 1",
      "instock": 120
    },
    {
      "_id": 2,
      "sku": "bread",
      "description": "product 2",
      "instock": 80
    },
    {
      "_id": 3,
      "sku": "cashews",
      "description": "product 3",
      "instock": 60
    },
    {
      "_id": 4,
      "sku": "pecans",
      "description": "product 4",
      "instock": 70
    },
    {
      "_id": 5,
      "sku": null,
      "description": "Incomplete"
    }
  ]
}
write join in this


Let there is a character set - 'a', 'b', 'c', 'd'. How many unique words can be formed using the character set (print them) and just to keep in mind no character should repeat in the word. The example should come up like abcd, cbad etc.
Catches - 1. All words should be unique, The length of word should match the array length, there should not be duplication of characters in any formulated words.

Given a number N. Find the minimum number of operations required to reach N starting from 0. You have 2 operations available:
Double the number
Add one to the number
 
Input - 8
Output - 4
 
Steps:- 0 + 1 = 1 --> 1 + 1 = 2 --> 2 * 2 = 4 --> 4 * 2 = 8.
