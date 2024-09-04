1.
```javascript
const obj = [
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 2', data: 'Data2' },
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 3', data: 'Data1' },
    { key: 'Sample 4', data: 'Data1' },
]

let result = {}

obj.forEach(ele => {
  if(ele.key in result){
    result[ele.key].push(ele)
  } else {
    result[ele.key] = [ele]
  }
})

console.log(result)
{
  'Sample 1': [
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 1', data: 'Data1' },
    { key: 'Sample 1', data: 'Data1' }
  ],
  'Sample 2': [ { key: 'Sample 2', data: 'Data2' } ],
  'Sample 3': [ { key: 'Sample 3', data: 'Data1' } ],
  'Sample 4': [ { key: 'Sample 4', data: 'Data1' } ]
}

```
2.
```javascript

const createComputeFunctions=()=>{
    let totalAmount=0
    return {
        thousand:function(amount){
            totalAmount+=amount*1000
            return this

        },

        lacs:function(amount){
            totalAmount+=amount*100000
            return this
        },

        crore:function(amount){
            totalAmount+=amount*10000000
            return this

        },

        value:function(){
            return totalAmount

        }
    }
}

const compute =createComputeFunctions()

const result=compute.lacs(15).crore(5).crore(2).lacs(20).thousand(45).crore(7).value();
console.log(result) //143545000
```


