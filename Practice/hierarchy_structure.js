const employees = [
  { id: 1, name: "CEO", managerId: null },
  { id: 2, name: "Manager A", managerId: 1 },
  { id: 3, name: "Manager B", managerId: 1 },
  { id: 4, name: "Dev 1", managerId: 2 },
  { id: 5, name: "Dev 2", managerId: 2 },
  { id: 6, name: "Dev 3", managerId: 5 },
];

// [
//   {
//     id: 1,
//     name: "CEO",
//     children: [
//       {
//         id: 2,
//         name: "Manager A",
//         children: [
//           { id: 4, name: "Dev 1", children: [] },
//           { id: 5, name: "Dev 2", children: [] }
//         ]
//       },
//       {
//         id: 3,
//         name: "Manager B",
//         children: []
//       }
//     ]
//   }
// ]

let result = []
const map = {}
for(let i=0;i<employees.length;i++){
  map[employees[i].id] = {
    ...employees[i],
    children: []
  }
}


console.log(map)

for(let i=0;i<employees.length;i++ ){
  let node = map[employees[i].id];
  
  if(employees[i].managerId === null){
    result.push(node)
  } else {
    map[employees[i].managerId].children.push(node);  
  }
}

console.log(JSON.stringify(result))


function buildTree(data, parentId = null) {
  let result = [];
  
  for(let i=0;i<data.length;i++){
    
    if(data[i].managerId == parentId){
      result.push({
        ...data[i],
        children: buildTree(data,data[i].id)
      })
    }
  }

  return result;
}

console.log(buildTree(employees,null))


