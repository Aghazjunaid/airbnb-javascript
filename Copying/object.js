// Shallow Copy
// 1
const obj = { one: 1, two: 2 };

const obj2 = obj;

obj2.two = 3;

console.log(obj2); //{ one: 1, two: 3 }
console.log(obj); //{ one: 1, two: 3 }


// 2
const nestedObject = {
    flag: '🇨🇦',
    country: {
      city: 'vancouver',
    },
};

const shallowClone = { ...nestedObject };

shallowClone.flag = '🇹🇼';
shallowClone.country.city = 'taipei';

console.log(nestedObject) //{ flag: '🇨🇦'  , country: { city: 'taipei' } }
console.log(shallowClone) //{ flag: '🇹🇼'  , country: { city: 'taipei' } }


// 3
let person = {
    firstName: 'John',
    lastName: 'Doe',
    address: {
        street: 'North 1st street',
        city: 'San Jose',
        state: 'CA',
        country: 'USA'
    }
};


let copiedPerson = Object.assign({}, person);

copiedPerson.firstName = 'Jane'; // disconnected

copiedPerson.address.street = 'Amphitheatre Parkway'; // connected
copiedPerson.address.city = 'Mountain View'; // connected

console.log(copiedPerson);
// {
//     firstName: 'Jane',
//     lastName: 'Doe',
//     address: {
//       street: 'Amphitheatre Parkway',
//       city: 'Mountain View',
//       state: 'CA',
//       country: 'USA'
//     }
//   }
console.log(person);
// {
//     firstName: 'John',
//     lastName: 'Doe',
//     address: {
//       street: 'Amphitheatre Parkway',
//       city: 'Mountain View',
//       state: 'CA',
//       country: 'USA'
//     }
//   }



// Deep Copy
// 1
const empDetails = { 
    name: "John", 
    age: 25, 
    expertise: "Software Developer" 
}

const empDetailsDeepCopy = { 
    name: empDetails.name, 
    age: empDetails.age, 
    expertise: empDetails.expertise 
}

empDetailsDeepCopy.name = "aj"

console.log(empDetails) //{ name: 'John', age: 25, expertise: 'Software Developer' }
console.log(empDetailsDeepCopy) //{ name: 'aj', age: 25, expertise: 'Software Developer' }


// 2
let person1 = {
    firstName: 'John',
    lastName: 'Doe',
    address: {
        street: 'North 1st street',
        city: 'San Jose',
        state: 'CA',
        country: 'USA'
    }
};


let copiedPerson1 = JSON.parse(JSON.stringify(person1));

copiedPerson1.firstName = 'Jane'; // disconnected

copiedPerson1.address.street = 'Amphitheatre Parkway';
copiedPerson1.address.city = 'Mountain View';

console.log(person1);
// {
//     firstName: 'John',
//     lastName: 'Doe',
//     address: {
//       street: 'North 1st street',
//       city: 'San Jose',
//       state: 'CA',
//       country: 'USA'
//     }
//   }