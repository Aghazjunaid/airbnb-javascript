
// 00:00 Intro
// 00:21 How I got the Interview?
// 01:02 Round 1 ( Javascript )
// 01:16 Q1 - Hoisting
// 04:03 Q2 - Implicit and Explicit binding
// 06:13 Q3 - Implement a Caching Function
// 11:50 Q4 - Output Question on Event Loop
// 15:12 Q5 - Infinite Currying
// 18:56 Q6 - Implement this Logic
// 21:11 Round 2 ( React JS )
// 32:32 Follow up Question
// 33:03 Round 3 ( HR Interview )



let obj = {
    total:0,
    add : function (a){
        this.total += a
        return this
    },
    substract : function(b){
        this.total -= b
        return this
    },
    multiply : function(c){
        this.total *= c
        return this
    }
}

let res = obj.add(10).multiply(5).substract(30).add(10)
console.log(res.total)