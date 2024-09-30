//1
const person = {
    fullName: function() {
      return this.firstName + " " + this.lastName;
    }
}

const person1 = {
    firstName : "Aghaz",
    lastName: "Junaid"
}

const person2 = {
    firstName:"Mary",
    lastName: "Doe"
}

console.log(person.fullName.call(person1)) // Aghaz Junaid
console.log(person.fullName.call(person2)) // Mary Doe


//2
const person = {
    fullName: function(city, country) {
      return this.firstName + " " + this.lastName + "," + city + "," + country;
    }
  }
  
  const person1 = {
    firstName:"John",
    lastName: "Doe"
  }
  
  console.log(person.fullName.call(person1, "Oslo", "Norway")) //John Doe,Oslo,Norway

  //3
  const object = {
    full : function(age,salary){
        return `${this.name},${age},${salary}`
    }
}

const name = {
    name: "AJ"
}

console.log(object.full.call(name,20,80000)) //AJ,20,80000
console.log(object.full.call(name,[20,90000])) //AJ,20,90000,undefined
console.log(object.full.apply(name,[20,90000])) //AJ,20,90000
console.log(object.full.bind(name,20,80000)()) //AJ,20,80000
