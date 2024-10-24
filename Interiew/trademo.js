async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}

async function async2() {
    console.log('async2');
}

console.log('script start');
async1();
console.log('script end');

// script start
// async1 start
// async2
// script end
// async1 end

var obj_1 = {
    firstName: "alice",
    lastName: "bob",
    printNameWithArrowFunction: () => {
        console.log(this.firstName, " ", this.lastName)
    },
    printNameWithFunction: function() {
        console.log(this.firstName, " ", this.lastName)
    },
}

obj_1.printNameWithArrowFunction();
obj_1.printNameWithFunction();
// undefined   undefined
// alice   bob
