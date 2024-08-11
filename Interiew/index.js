let str = "This is the string";

let obj ={}

for(let i=0;i<str.length;i++){
    let la = str[i].toLowerCase()
    if(str[i] in obj){
        obj[la] += 1
    } else{
        obj[la] = 1
    }
}

let newStr = ""
for(let [key,value] of Object.entries(obj)){ //t2h2i3s3...
    if(key !== ' '){
        newStr += `${key}${value}`
    }
}

console.log(newStr)


for USER

0. _id
1. fisrtname
2. lastName
3. email
4. mobile
5. code
6. follow: [_id,_id]

for Post

0. _id
1. title
2. body
3. image
4. likes : [{
    _id:
    name:
    image:
}]
6. useId: []
5. comment : [
    {
        _id :
        name: 
        comment: [
            
        ]
    }
]

//find pivot in rotated sorted Array

var calc = {
    total: 0,
    add(a) {
        this.total += a;
        return this;
    },
    subtract(a) {
        this.total -= a;
        return this;
    },
    multiply(a) {
        this.total *= a;
        return this;
    },
};
let result = calc.add(10).multiply(5).subtract(30).add(10) 
console.log(result.total);

