// 1
const user = {
    name: "aj",
    age: 23
}

function getFullName(user) {
    const { name, age } = user;
    return `${name} ${age}`;
}

console.log(getFullName(user)) //aj 23

// 2
let person = {
    firstName: 'John',
    lastName: 'Doe'
};

let { firstName: fname, lastName: lname } = person;
console.log(fname,lname) //John Doe
console.log(firstName,lastName) //ReferenceError: firstName is not defined

// 3
let person = {
    firstName: 'John',
    lastName: 'Doe'
};
let { firstName, lastName, middleName } = person;
console.log(middleName) //undefined

// 4
let person = {
    firstName: 'John',
    lastName: 'Doe',
    currentAge: 28
};

let { firstName, lastName, middleName = '', currentAge: age = 18 } = person;
console.log(middleName) //''
console.log(age)//28

// 5
let employee = {
    id: 1001,
    name: {
        firstName: 'John',
        lastName: 'Doe'
    }
};

let {
    name: {
        firstName,
        lastName
    },
    name,
    id
} = employee;

console.log(id) // 1001
console.log(firstName); // John
console.log(lastName); // Doe
console.log(name); // { firstName: 'John', lastName: 'Doe' }

// 6
let display = ({firstName, lastName}) => console.log(`${firstName} ${lastName}`);

let person = {
    firstName: 'John',
    lastName: 'Doe'
};

display(person);

// 7
let person = {
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'C.',
    currentAge: 28
};

let {firstName, lastName,...leftData} = person
console.log(firstName,lastName) //John Doe
console.log(leftData) //{ middleName: 'C.', currentAge: 28 }



