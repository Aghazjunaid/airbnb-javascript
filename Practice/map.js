let opt = new Map()

opt.set(1,3)
opt.set({},5)
opt.set("aj",6)
opt.set("aj",8)

console.log(opt) //Map(3) { 1 => 3, {} => 5, 'aj' => 8 }

let obj = {
    2:1,
    3:2,
    4:5
}

obj[4] -= 1
obj[4] -= 1
obj[4] -= 1
obj[4] -= 1
obj[4] -= 1

if(obj[4] == 0){
    delete obj[4]
}
console.log(obj) //{ '2': 1, '3': 2 }