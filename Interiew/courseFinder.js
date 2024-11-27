/*
You are given an m x n grid where each cell can have one of three values:


0 representing an empty cell,

1 representing a non virus infected system, or

2 representing a virus infected system.



Every minute, any non virus system that is connected to any 4-directionally virus infected system becomes virus infected system.



Return the minimum number of minutes that must elapse so that all system become virus infected.

nput: grid =

[

[2,1,1],

[1,1,0],

[0,1,1]

]



Output: 4

*/
let grid = [

        [2,1,1],
        
        [1,1,0],
        
        [0,1,1]
        
        ]

        const rows = grid.length;
        const col = grid[0].length;
        const queue = [];
        let freshCount = 0;
        const direction = [[1,0],[-1,0],[0,1],[0,-1]]
        for(let r=0;r<rows;r++){
            for(let c=0;c<col;c++){
                if(grid[r][c] == 2){
                    queue.push([r,c])
                } else if(grid[r][c] === 1){
                    freshCount++
                }
            }
        }

        let minutes = 0;
        while(queue.length > 0 && freshCount > 0){
            minutes++;
            const size = queue.length;
            for(let i=0;i<size;i++){
                const [x,y] = queue.shift();
                for(const [dx,dy] of direction){
                    const newX = x+dx;
                    const newY = y+dy;

                    if(newX >=0 && newX < rows && newY >= 0 && newY < col && grid[newX][newY] == 1){
                        grid[newX][newY] = 2;
                        freshCount --;
                        queue.push([newX, newY])
                    }
                }
            }
        }

        let result = freshCount === 0 ? minutes : -1;
        console.log(result);// 4

/*
Create an API endpoint that accepts a JSON object with nested arrays and objects and returns the sum of all the numeric values within it. The API should be accessible at /sum, and it should accept a POST request with a JSON payload. The API should return a JSON response containing the sum of all numeric values.

Requirements:
Parse nested structures and handle various data types.
Use recursion to sum values if needed.
Handle error cases (e.g., if non-numeric values are passed in unexpected ways).

{[
[{"num":8},{"num":9}],
[{"num":8},{"num":9}],
[{"num":8},{"num":9}]
]}
*/
const express = require('express');
const app = express();

app.post('/sum',(req,res) => {
  try{
    const { numValue } = req.allParams();
    
    
    
    let result = 0;

    for(let i=0;i<numValue.length;i++){
      const firstArr = numValue[i];
      for(let j=0;j<firstArr.length;j++){
        result += firstArr[j].num;
      }
    }
    
    return res.status(200).json({
      message: 'sucess',
      data: result;
    })

  } catch(error) {
    return res.status(error.status || 500).json({
      error: error
    })
  }
})


app.listen(3000,() => {
  console.log('server is running on 3000 port')
})