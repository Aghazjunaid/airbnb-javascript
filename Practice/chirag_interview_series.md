1.
```
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
