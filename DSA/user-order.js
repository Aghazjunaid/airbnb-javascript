const users = [
    {
      id: 123,
      name: "Sagar",
      city: "Indore",
    },
    {
      id: 124,
      name: "Arun",
      city: "Morena",
    },
    {
      id: 125,
      name: "Nikhil",
      city: "Dhule",
    },
  ];
  const orders = [
    {
      id: 1234,
      name: "iPhone 13 Pro Max",
      price: "123000",
      customerId: 123,
    },
    {
      id: 1235,
      name: "Apple iWatch",
      price: "49000",
      customerId: 124,
    },
  ];


//method-1
  let ans = []
  for(let i=0;i<users.length;i++){
      let data = {
          userId : users[i].id,
          userName : users[i].name,
          orders : []
      }
      for(let j=0;j<orders.length;j++){
          if(users[i].id == orders[j].customerId){
            data.orders.push({
                orderId: orders[j].id,
                productName: orders[j].name,
                productPrice: orders[j].price,
            })
          }
      }
      ans.push(data)
  }

  console.log(ans)

//method-2
let res = users.reduce((acc,cur) => {
    let data = {
        userId : cur.id,
        userName : cur.name,
        orders : []
    }
    for(let j=0;j<orders.length;j++){
        if(cur.id == orders[j].customerId){
          data.orders.push({
              orderId: orders[j].id,
              productName: orders[j].name,
              productPrice: orders[j].price,
          })
        }
    }
    acc.push(data)
    return acc
  },[])

  console.log(res)

//method-3
 const res = users.reduce((acc,cur) => {
    const userData = {
        userId : cur.id,
        userName : cur.name,
    }

    const orderList = orders.reduce((acc1,cur1) => {
        if(cur.id === cur1.customerId){
            acc1.push({
                orderId: cur1.id,
                productName: cur1.name,
                productPrice: cur1.price,
            })
        }
        return acc1

    },[])
    userData.orders = orderList
    acc.push(userData)
    return acc
  },[])

  console.log(res)

//method - 4
 const obj = {};
  for(let i in orders){
    if(orders[i].customerId in obj){
      obj[orders[i].customerId].push({
          orderId: orders[i].id,
          productName: orders[i].name,
          productPrice: orders[i].price,
      })
    } else {
      obj[orders[i].customerId] = [{
          orderId: orders[i].id,
          productName: orders[i].name,
          productPrice: orders[i].price,
      }]
    }
  }
  
  const result = [];
  for(let i=0;i<users.length;i++){
    let arr = {
      userId: users[i].id,
      userName: users[i].name,
      orders: []
    };
    if(users[i].id in obj){
      arr.orders.push(obj[users[i].id])
    }
    result.push(arr)
  }
  
  console.log(JSON.stringify(result));

  const result = [
    {
      userId: 123,
      userName: "Sagar",
      orders: [
        {
          orderId: 1234,
          productName: "iPhone 13 Pro Max",
          productPrice: "123000",
        },
      ],
    },
  ];
