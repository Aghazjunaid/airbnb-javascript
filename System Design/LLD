# Low-Level Design (LLD) Notes — JavaScript Full Stack (5+ Years Interview Prep)

> Ye notes Hinglish mein likhe gaye hain taaki samajhna easy ho, par har topic ki **simple English definition** bhi di gayi hai jo interview mein bolne ke liye useful hai. Examples saare JavaScript/Node.js mein hain.

---

## 📑 Table of Contents

1. [OOP Concepts](#1-oop-concepts)
2. [SOLID Principles](#2-solid-principles)
3. [Design Patterns](#3-design-patterns)
4. [Architectural Patterns (Layered, MVC, etc.)](#4-architectural-patterns)
5. [DRY, KISS, YAGNI](#5-dry-kiss-yagni)
6. [Coupling & Cohesion](#6-coupling--cohesion)
7. [Composition over Inheritance](#7-composition-over-inheritance)
8. [Dependency Injection](#8-dependency-injection)
9. [UML Diagrams](#9-uml-diagrams)
10. [Concurrency in JavaScript](#10-concurrency-in-javascript)
11. [Error Handling Patterns](#11-error-handling-patterns)
12. [Common LLD Interview Problems](#12-common-lld-interview-problems)
13. [How to Approach an LLD Interview](#13-how-to-approach-an-lld-interview)

---

## 1. OOP Concepts

> **English Definition:** Object-Oriented Programming is a programming paradigm based on the concept of "objects" that contain data (fields) and behavior (methods).

LLD ka foundation yahi hai. Char pillars hain — yaad rakhna: **A-PIE** (Abstraction, Polymorphism, Inheritance, Encapsulation).

### a) Encapsulation

> **Definition:** Bundling data and methods that operate on the data within a single unit (class), and restricting direct access to internal state.

**Hinglish:** Data ko class ke andar lock karna aur sirf methods ke through access dena.

```javascript
class BankAccount {
  #balance = 0; // private field (# symbol)

  deposit(amount) {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.#balance += amount;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
  }

  getBalance() {
    return this.#balance;
  }
}

const acc = new BankAccount();
acc.deposit(1000);
// acc.#balance = 99999;  ❌ Error - directly access nahi kar sakte
console.log(acc.getBalance()); // 1000
```

**Why important?** Data integrity maintain hoti hai. Koi bhi random jagah se balance change nahi kar sakta.

---

### b) Inheritance

> **Definition:** A mechanism where a new class derives properties and behaviors from an existing class.

**Hinglish:** Ek class doosri class se properties/methods inherit kar sakti hai. Code reuse hota hai.

```javascript
class Vehicle {
  constructor(brand) {
    this.brand = brand;
  }
  start() {
    console.log(`${this.brand} started`);
  }
}

class Car extends Vehicle {
  constructor(brand, model) {
    super(brand); // parent constructor call
    this.model = model;
  }
  honk() {
    console.log("Beep beep!");
  }
}

const c = new Car("Tata", "Nexon");
c.start(); // Tata started  (inherited method)
c.honk();  // Beep beep!
```

**Interview tip:** Bolna — "I prefer **composition over inheritance** for flexibility, but inheritance is good for true `is-a` relationships."

---

### c) Polymorphism

> **Definition:** The ability of different objects to respond to the same method call in different ways.

**Hinglish:** Same method, different implementation har class mein.

```javascript
class PaymentMethod {
  pay(amount) {
    throw new Error("Must implement pay()");
  }
}

class UPIPayment extends PaymentMethod {
  pay(amount) {
    console.log(`Paid ₹${amount} via UPI`);
  }
}

class CardPayment extends PaymentMethod {
  pay(amount) {
    console.log(`Paid ₹${amount} via Card`);
  }
}

class WalletPayment extends PaymentMethod {
  pay(amount) {
    console.log(`Paid ₹${amount} via Wallet`);
  }
}

// Polymorphism in action
function processPayment(method, amount) {
  method.pay(amount); // doesn't care which type, just calls pay()
}

processPayment(new UPIPayment(), 500);
processPayment(new CardPayment(), 1500);
```

**Real example tere code se:** Tera `wallet-service` agar multiple payment gateways handle karta hai (Razorpay, Stripe, PayU) — sab ka `processPayment()` method hoga, but implementation alag.

---

### d) Abstraction

> **Definition:** Hiding complex implementation details and exposing only the necessary features.

**Hinglish:** User ko sirf wahi dikhao jo zaroori hai, andar ka complex logic chhupao.

```javascript
// User ko bas itna pata hai - sendOTP() call karo, ho jayega
class OTPService {
  sendOTP(phone) {
    this.#generateOTP();
    this.#connectToSMSGateway();
    this.#deliverSMS(phone);
    this.#logToDatabase(phone);
  }

  #generateOTP() { /* complex randomization */ }
  #connectToSMSGateway() { /* API auth, retries */ }
  #deliverSMS(phone) { /* SMS API call */ }
  #logToDatabase(phone) { /* DB write */ }
}

// User just does:
const otp = new OTPService();
otp.sendOTP("9876543210"); // andar kya ho raha, koi farak nahi
```

**Real example:** `Array.prototype.sort()` — tu use karta hai, par andar quicksort ya timsort kya chal raha, pata nahi. **That's abstraction.**

---

## 2. SOLID Principles

> **English Definition:** Five design principles by Robert C. Martin (Uncle Bob) that make software more maintainable, scalable, and flexible.

Interview mein 5+ years ke liye ye **must hai**.

### S — Single Responsibility Principle (SRP)

> **Definition:** A class should have only ONE reason to change.

**Hinglish:** Ek class ka ek hi kaam ho. Multitasking nahi.

```javascript
// ❌ Galat - User class bahut kuch kar rahi
class User {
  constructor(name, email) { this.name = name; this.email = email; }
  saveToDB() { /* DB logic */ }
  sendWelcomeEmail() { /* email logic */ }
  generateInvoicePDF() { /* PDF logic */ }
  validateEmail() { /* validation */ }
}

// ✅ Sahi - har class ka apna kaam
class User {
  constructor(name, email) { this.name = name; this.email = email; }
}

class UserRepository {
  save(user) { /* DB logic */ }
}

class EmailService {
  sendWelcome(user) { /* email logic */ }
}

class PDFGenerator {
  generateInvoice(user) { /* PDF logic */ }
}

class EmailValidator {
  validate(email) { /* validation logic */ }
}
```

**Tere code se connect:** Tera structure already SRP follow kar raha hai:
- `controller/` → sirf HTTP req/res handle karta
- `service/` → sirf business logic
- `validator/` → sirf input validation
- `db/` → sirf data access

Ye **textbook SRP example** hai. Interview mein ye bata sakta hai.

---

### O — Open/Closed Principle (OCP)

> **Definition:** Software entities should be OPEN for extension but CLOSED for modification.

**Hinglish:** Naya feature add karna ho toh nayi class banao, purani modify mat karo.

```javascript
// ❌ Galat - har naye payment ke liye if-else add karna padta
class PaymentProcessor {
  process(type, amount) {
    if (type === 'upi') { /* upi logic */ }
    else if (type === 'card') { /* card logic */ }
    else if (type === 'wallet') { /* wallet logic */ }
    // har naye method ke liye yahan code modify karna padega 😞
  }
}

// ✅ Sahi - Open for extension, Closed for modification
class PaymentMethod {
  pay(amount) { throw new Error("Must implement"); }
}

class UPIPayment extends PaymentMethod {
  pay(amount) { /* upi logic */ }
}

class CardPayment extends PaymentMethod {
  pay(amount) { /* card logic */ }
}

// Naya payment? Bas nayi class:
class CryptoPayment extends PaymentMethod {
  pay(amount) { /* crypto logic */ }
}

class PaymentProcessor {
  process(paymentMethod, amount) {
    paymentMethod.pay(amount); // ye function kabhi modify nahi hoga
  }
}
```

---

### L — Liskov Substitution Principle (LSP)

> **Definition:** Objects of a parent class should be replaceable with objects of its subclasses without breaking the application.

**Hinglish:** Child class, parent ki jagah bina toot-fhoot ke kaam karni chahiye.

```javascript
// ❌ Galat - LSP violation
class Bird {
  fly() { console.log("Flying"); }
}

class Penguin extends Bird {
  fly() { throw new Error("Penguins can't fly!"); } // 💥 Toot gaya
}

function makeBirdFly(bird) {
  bird.fly(); // Penguin pass karne pe crash
}

// ✅ Sahi - Hierarchy theek karo
class Bird {
  eat() {}
}

class FlyingBird extends Bird {
  fly() {}
}

class NonFlyingBird extends Bird {
  walk() {}
}

class Sparrow extends FlyingBird { fly() { /* fly */ } }
class Penguin extends NonFlyingBird { walk() { /* walk */ } }
```

---

### I — Interface Segregation Principle (ISP)

> **Definition:** Clients should not be forced to depend on interfaces they don't use. Make many small, specific interfaces instead of one large one.

**Hinglish:** Bade interface mat banao, chhote-chhote functional contracts banao.

JS mein technically interface nahi hota, par concept apply hota hai:

```javascript
// ❌ Galat - ek bada interface, sab kuch implement karna padta
class Worker {
  work() {}
  eat() {}
  sleep() {}
}

class RobotWorker extends Worker {
  work() { /* works */ }
  eat() { throw new Error("Robots don't eat"); } // 😞 forced
  sleep() { throw new Error("Robots don't sleep"); }
}

// ✅ Sahi - Chhote, focused contracts
class Workable { work() {} }
class Eatable { eat() {} }
class Sleepable { sleep() {} }

class HumanWorker {
  work() {}
  eat() {}
  sleep() {}
}

class RobotWorker {
  work() {} // bas itna chahiye
}
```

---

### D — Dependency Inversion Principle (DIP)

> **Definition:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Hinglish:** Concrete class pe depend mat ho, abstraction (interface) pe depend ho.

```javascript
// ❌ Galat - Service tightly coupled with MySQL
class WalletService {
  constructor() {
    this.db = new MySQLDatabase(); // hard dependency
  }
  getBalance(userId) {
    return this.db.query(`SELECT balance FROM wallets WHERE user_id = ${userId}`);
  }
}
// Kal ko Postgres pe shift karna ho? Pura code tootega.

// ✅ Sahi - Inject the dependency
class WalletService {
  constructor(database) {  // abstraction inject hoti hai
    this.db = database;
  }
  getBalance(userId) {
    return this.db.findBalance(userId);
  }
}

class MySQLDatabase {
  findBalance(userId) { /* mysql query */ }
}

class PostgresDatabase {
  findBalance(userId) { /* postgres query */ }
}

class MockDatabase {
  findBalance(userId) { return 1000; } // for testing
}

// Production
const service = new WalletService(new MySQLDatabase());

// Testing
const testService = new WalletService(new MockDatabase());
```

**Why important?** Testing easy hoti hai, swap-ability milti hai.

---

## 3. Design Patterns

> **English Definition:** Reusable, time-tested solutions to commonly occurring problems in software design.

Three categories hain — **Creational, Structural, Behavioral**.

### 🟢 Creational Patterns (Object banane ke tareeke)

#### 3.1 Singleton

> **Definition:** Ensures a class has only one instance throughout the application and provides a global access point to it.

**Use case:** DB connection, Logger, Config, Redis client.

```javascript
class DBConnection {
  static #instance = null;

  constructor() {
    if (DBConnection.#instance) {
      return DBConnection.#instance;
    }
    this.connection = "Connected to DB";
    DBConnection.#instance = this;
  }

  query(sql) {
    console.log(`Running: ${sql}`);
  }
}

const db1 = new DBConnection();
const db2 = new DBConnection();
console.log(db1 === db2); // true ✅ same instance
```

**Real Node.js example:** Sequelize/Mongoose ka connection — ek baar create hota hai, sab jagah reuse hota hai.

---

#### 3.2 Factory Pattern

> **Definition:** Provides an interface for creating objects without specifying their exact class.

**Hinglish:** Object creation ka logic ek jagah centralize karna.

```javascript
class EmailNotification {
  send(msg) { console.log(`Email: ${msg}`); }
}

class SMSNotification {
  send(msg) { console.log(`SMS: ${msg}`); }
}

class PushNotification {
  send(msg) { console.log(`Push: ${msg}`); }
}

class NotificationFactory {
  static create(type) {
    switch(type) {
      case 'email': return new EmailNotification();
      case 'sms':   return new SMSNotification();
      case 'push':  return new PushNotification();
      default: throw new Error('Unknown type');
    }
  }
}

// Usage
const notif = NotificationFactory.create('email');
notif.send('Hello!');
```

**Tere code mein use case:** Razorpay, Stripe, PayU — sab ke liye `PaymentGatewayFactory.create('razorpay')` use kar sakta hai.

---

#### 3.3 Builder Pattern

> **Definition:** Used to construct complex objects step-by-step. Same construction process can create different representations.

**Use case:** Jab ek object banane mein 10+ optional parameters hain.

```javascript
class Pizza {
  constructor(builder) {
    this.size = builder.size;
    this.cheese = builder.cheese;
    this.pepperoni = builder.pepperoni;
    this.mushrooms = builder.mushrooms;
    this.veggies = builder.veggies;
  }
}

class PizzaBuilder {
  setSize(size) { this.size = size; return this; }
  addCheese() { this.cheese = true; return this; }
  addPepperoni() { this.pepperoni = true; return this; }
  addMushrooms() { this.mushrooms = true; return this; }
  addVeggies() { this.veggies = true; return this; }
  build() { return new Pizza(this); }
}

// Clean, readable construction
const pizza = new PizzaBuilder()
  .setSize('large')
  .addCheese()
  .addMushrooms()
  .addVeggies()
  .build();
```

---

#### 3.4 Prototype Pattern

> **Definition:** Creates new objects by cloning an existing object (the prototype).

JS mein ye native hai — `Object.create()`.

```javascript
const carPrototype = {
  start() { console.log(`${this.brand} starting`); },
  stop() { console.log(`${this.brand} stopping`); }
};

const tata = Object.create(carPrototype);
tata.brand = "Tata";
tata.start(); // Tata starting
```

---

### 🟡 Structural Patterns (Classes ko jodne ke tareeke)

#### 3.5 Adapter Pattern

> **Definition:** Allows two incompatible interfaces to work together by acting as a translator.

**Hinglish:** Plug adapter jaisa — purana code XML deta hai, naya system JSON chahta hai. Beech mein adapter laga do.

```javascript
// Old library
class OldPaymentAPI {
  makePayment(xmlData) { console.log("Processing XML:", xmlData); }
}

// Naya code JSON expect karta hai
class PaymentAdapter {
  constructor(oldAPI) { this.oldAPI = oldAPI; }
  
  pay(jsonData) {
    const xml = this.#jsonToXML(jsonData);
    this.oldAPI.makePayment(xml);
  }
  
  #jsonToXML(json) {
    return `<payment>${JSON.stringify(json)}</payment>`;
  }
}

const adapter = new PaymentAdapter(new OldPaymentAPI());
adapter.pay({ amount: 500, user: 'Rahul' });
```

---

#### 3.6 Decorator Pattern

> **Definition:** Adds new behavior to objects dynamically without altering their structure.

```javascript
class Coffee {
  cost() { return 50; }
  description() { return "Coffee"; }
}

class MilkDecorator {
  constructor(coffee) { this.coffee = coffee; }
  cost() { return this.coffee.cost() + 20; }
  description() { return this.coffee.description() + ", Milk"; }
}

class SugarDecorator {
  constructor(coffee) { this.coffee = coffee; }
  cost() { return this.coffee.cost() + 10; }
  description() { return this.coffee.description() + ", Sugar"; }
}

let myCoffee = new Coffee();
myCoffee = new MilkDecorator(myCoffee);
myCoffee = new SugarDecorator(myCoffee);

console.log(myCoffee.description()); // Coffee, Milk, Sugar
console.log(myCoffee.cost());        // 80
```

**JS real example:** Express middleware exactly is hi pattern pe kaam karta hai. Har middleware request ko "decorate" karta hai.

---

#### 3.7 Facade Pattern

> **Definition:** Provides a simplified interface to a complex subsystem.

**Hinglish:** Andar 10 cheezein ho rahi, par bahar ek hi simple method dikhao.

```javascript
class OrderFacade {
  placeOrder(userId, items) {
    this.#validateUser(userId);
    this.#checkInventory(items);
    this.#processPayment(userId, items);
    this.#updateInventory(items);
    this.#sendConfirmationEmail(userId);
    this.#scheduleDelivery(userId, items);
  }
  // private methods...
}

// User just calls:
new OrderFacade().placeOrder(123, [{id: 1, qty: 2}]);
```

**Tera service layer literally facade hi hai** — controller ko sirf `walletService.transferMoney()` dikhta hai, andar kya ho raha — DB calls, queue jobs, validations — kuch nahi pata.

---

#### 3.8 Proxy Pattern

> **Definition:** Provides a placeholder/surrogate that controls access to another object.

**Use case:** Caching, lazy loading, access control.

```javascript
class APIService {
  fetchData(id) {
    console.log(`Fetching from API: ${id}`);
    return { id, data: "expensive data" };
  }
}

class CachedAPIService {
  constructor() {
    this.api = new APIService();
    this.cache = new Map();
  }
  
  fetchData(id) {
    if (this.cache.has(id)) {
      console.log(`Cache hit: ${id}`);
      return this.cache.get(id);
    }
    const result = this.api.fetchData(id);
    this.cache.set(id, result);
    return result;
  }
}

const proxy = new CachedAPIService();
proxy.fetchData(1); // API call
proxy.fetchData(1); // Cache hit
```

**JS bonus:** `Proxy` JavaScript ka ek native feature hai — `new Proxy(target, handler)`.

---

### 🔵 Behavioral Patterns (Objects communicate kaise karein)

#### 3.9 Observer Pattern

> **Definition:** Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically.

**Use case:** Event listeners, pub-sub, notifications.

```javascript
class EventEmitter {
  constructor() { this.listeners = {}; }
  
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }
}

const orderEvents = new EventEmitter();

orderEvents.on('order_placed', (order) => console.log('📧 Send email', order));
orderEvents.on('order_placed', (order) => console.log('📊 Update analytics', order));
orderEvents.on('order_placed', (order) => console.log('📦 Notify warehouse', order));

orderEvents.emit('order_placed', { id: 1, amount: 500 });
// All 3 observers notified
```

**Node.js native:** `EventEmitter` is built-in. Tere `queues/` folder bhi observer pattern hi hai — event hua, queue pe daal diya, consumers process karenge.

---

#### 3.10 Strategy Pattern

> **Definition:** Defines a family of algorithms, encapsulates each one, and makes them interchangeable.

**Hinglish:** Runtime pe algorithm/behavior switch kar sakte ho.

```javascript
class CreditCardStrategy {
  pay(amount) { console.log(`Card: ₹${amount}`); }
}

class UPIStrategy {
  pay(amount) { console.log(`UPI: ₹${amount}`); }
}

class CryptoStrategy {
  pay(amount) { console.log(`Crypto: ₹${amount}`); }
}

class PaymentContext {
  setStrategy(strategy) { this.strategy = strategy; }
  executePayment(amount) { this.strategy.pay(amount); }
}

const ctx = new PaymentContext();
ctx.setStrategy(new UPIStrategy());
ctx.executePayment(500);

ctx.setStrategy(new CryptoStrategy()); // runtime switch
ctx.executePayment(1000);
```

---

#### 3.11 Command Pattern

> **Definition:** Encapsulates a request as an object, allowing parameterization, queuing, and logging of requests.

**Use case:** Undo/redo, job queues.

```javascript
class AddItemCommand {
  constructor(cart, item) { this.cart = cart; this.item = item; }
  execute() { this.cart.add(this.item); }
  undo() { this.cart.remove(this.item); }
}

class Cart {
  constructor() { this.items = []; this.history = []; }
  add(item) { this.items.push(item); }
  remove(item) { this.items = this.items.filter(i => i !== item); }
  
  executeCommand(cmd) {
    cmd.execute();
    this.history.push(cmd);
  }
  
  undoLast() {
    const last = this.history.pop();
    if (last) last.undo();
  }
}
```

**Tere queue jobs literally Command pattern hain** — har job ek "command object" hai jo `execute()` karta hai.

---

#### 3.12 Chain of Responsibility

> **Definition:** Passes a request along a chain of handlers until one of them handles it.

```javascript
class AuthHandler {
  setNext(handler) { this.next = handler; return handler; }
  handle(req) {
    if (!req.token) throw new Error("No auth");
    if (this.next) this.next.handle(req);
  }
}

class ValidationHandler {
  setNext(handler) { this.next = handler; return handler; }
  handle(req) {
    if (!req.body) throw new Error("Empty body");
    if (this.next) this.next.handle(req);
  }
}

class LoggerHandler {
  handle(req) { console.log("Request:", req); }
}

const auth = new AuthHandler();
auth.setNext(new ValidationHandler()).setNext(new LoggerHandler());
auth.handle({ token: "abc", body: {} });
```

**Express middleware = Chain of Responsibility.** `app.use(auth)`, `app.use(validate)` — request chain mein flow karti hai.

---

#### 3.13 State Pattern

> **Definition:** Allows an object to alter its behavior when its internal state changes.

```javascript
class OrderPlacedState {
  next(order) { order.setState(new ShippedState()); console.log("→ Shipped"); }
}
class ShippedState {
  next(order) { order.setState(new DeliveredState()); console.log("→ Delivered"); }
}
class DeliveredState {
  next() { console.log("Already delivered"); }
}

class Order {
  constructor() { this.state = new OrderPlacedState(); }
  setState(state) { this.state = state; }
  next() { this.state.next(this); }
}

const o = new Order();
o.next(); // Shipped
o.next(); // Delivered
```

---

#### 3.14 Iterator Pattern

> **Definition:** Provides a way to access elements of a collection sequentially without exposing its underlying representation.

JS mein native — `Symbol.iterator`, `for...of`.

```javascript
class Range {
  constructor(start, end) { this.start = start; this.end = end; }
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end 
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
}

for (const num of new Range(1, 5)) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

---

## 4. Architectural Patterns

### 4.1 Layered Architecture (Tera Current Pattern! ✅)

> **Definition:** Organizes code into horizontal layers, each with a specific responsibility, where layers communicate only with adjacent ones.

Tera structure exactly ye hai:

```
src/
├── routes/      → URL → controller mapping (Routing Layer)
├── controller/  → HTTP layer (req/res, status codes)        ← Presentation Layer
├── validator/   → Joi schemas (Input validation)
├── service/     → Business logic                            ← Business Layer
├── db/          → Sequelize models                          ← Data Access Layer
├── queues/      → Async/background jobs
└── constants.js, utils.js, razorpay.js
```

**Flow:**
```
Request → Route → Validator → Controller → Service → DB
                                                ↓
                                            Queue (async work)
```

**Why this is good (interview answer):**

1. **Separation of Concerns** — Har layer ka apna kaam (SRP follow ho raha)
2. **Testability** — Service ko mock DB pass karke test kar sakte
3. **Maintainability** — UI change karna ho? Sirf controller. DB change ho? Sirf db layer.
4. **Reusability** — Same service multiple controllers se call kar sakte (HTTP + GraphQL + WebSocket)

**Real example explanation:**

```javascript
// routes/wallet-routes.js
router.post('/transfer', validate(transferSchema), walletController.transfer);

// validator/wallet-validator.js
const transferSchema = Joi.object({
  toUserId: Joi.string().required(),
  amount: Joi.number().positive().required()
});

// controller/wallet-controller.js  → HTTP layer only
async function transfer(req, res) {
  try {
    const result = await walletService.transferMoney(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// service/wallet-service.js  → Business logic
async function transferMoney(fromUserId, { toUserId, amount }) {
  const sender = await Wallet.findOne({ where: { userId: fromUserId } });
  if (sender.balance < amount) throw new Error("Insufficient funds");
  
  await sequelize.transaction(async (t) => {
    await sender.decrement('balance', { by: amount, transaction: t });
    await Wallet.increment('balance', { 
      by: amount, where: { userId: toUserId }, transaction: t 
    });
  });
  
  // Queue async job
  notificationQueue.add({ userId: toUserId, type: 'received', amount });
  
  return { success: true };
}
```

**Interview Pro Tip:** Bolna — "We follow strict layered architecture where the controller never touches the DB directly. All business rules live in the service layer, which makes the codebase highly testable and ready for protocol changes (REST → GraphQL)."

---

### 4.2 MVC (Model-View-Controller)

> **Definition:** Separates application into three components — Model (data), View (UI), Controller (handles input and updates Model/View).

Backend mein "View" ka role JSON response play karta hai.

- **Model** → DB models (Sequelize)
- **View** → JSON response
- **Controller** → request handler

Tera pattern basically MVC + Service layer hai (jo industry-standard hai).

---

### 4.3 Repository Pattern

> **Definition:** Mediates between the domain (service) and data mapping (DB) layers, acting like an in-memory collection of objects.

**Hinglish:** Service ko ye nahi pata ki DB MySQL hai ya Mongo. Wo bas `repository.findUser(id)` call karta hai.

```javascript
// repositories/wallet-repository.js
class WalletRepository {
  async findByUserId(userId) {
    return Wallet.findOne({ where: { userId } });
  }
  
  async updateBalance(userId, amount) {
    return Wallet.increment('balance', { by: amount, where: { userId } });
  }
}

// service/wallet-service.js
class WalletService {
  constructor(walletRepo) { this.walletRepo = walletRepo; }
  
  async getBalance(userId) {
    const wallet = await this.walletRepo.findByUserId(userId);
    return wallet.balance;
  }
}
```

**Benefit:** Service layer DB-agnostic ho jaati. Testing mein mock repo pass kar diya, done.

**Tera current code DB ko directly service mein touch kar raha hai** — agar tu Repository pattern add karega toh aur clean ho jayega. Interview mein bolna ye improvement plan hai.

---

### 4.4 Microservices vs Monolith

> **Microservices Definition:** Architectural style that structures an application as a collection of small, independently deployable services.

| Monolith | Microservices |
|----------|---------------|
| Ek hi codebase | Multiple services |
| Ek hi DB | Har service ka apna DB |
| Easy start | Complex orchestration |
| Tight coupling risk | Loose coupling |
| Scaling: whole app | Scaling: per service |

**Tera "payment-service"** name se lag raha ye microservice hai (probably auth-service, order-service alag hain).

---

## 5. DRY, KISS, YAGNI

### DRY — Don't Repeat Yourself

> **Definition:** Every piece of knowledge must have a single, unambiguous representation in the system.

```javascript
// ❌ Galat
function getUserEmail(id) { /* DB query */ }
function getUserName(id)  { /* same DB query */ }
function getUserPhone(id) { /* same DB query */ }

// ✅ Sahi
function getUser(id) { /* one query */ }
const { email, name, phone } = getUser(id);
```

### KISS — Keep It Simple, Stupid

> **Definition:** Most systems work best when kept simple rather than made complicated.

```javascript
// ❌ Over-engineered
const isEven = n => !((n & 1) === 1);

// ✅ Simple
const isEven = n => n % 2 === 0;
```

### YAGNI — You Aren't Gonna Need It

> **Definition:** Don't add functionality until it is actually needed.

Aaj hi 10 features mat banao "future mein chahiye hoga" — jab chahiye hoga tab banana. Most predicted features kabhi use nahi hote.

---

## 6. Coupling & Cohesion

### Coupling

> **Definition:** The degree of interdependence between software modules. **Lower is better.**

```javascript
// ❌ Tight coupling
class OrderService {
  placeOrder() {
    const email = new GmailEmailService(); // direct dependency
    email.send();
  }
}

// ✅ Loose coupling (DI)
class OrderService {
  constructor(emailService) { this.emailService = emailService; }
  placeOrder() { this.emailService.send(); }
}
```

### Cohesion

> **Definition:** The degree to which elements within a module belong together. **Higher is better.**

```javascript
// ❌ Low cohesion - random methods together
class Utils {
  sendEmail() {}
  calculateTax() {}
  formatDate() {}
  resizeImage() {}
}

// ✅ High cohesion - related stuff together
class EmailService {
  send() {}
  sendBulk() {}
  validateEmail() {}
}
```

**Mantra:** *Low Coupling, High Cohesion*. Interview mein ye line zaroor bolna.

---

## 7. Composition over Inheritance

> **Definition:** Favor object composition (using objects together) over class inheritance (extending classes) for code reuse.

**Why?** Inheritance rigid hota hai, composition flexible.

```javascript
// ❌ Inheritance hell
class Animal {}
class FlyingAnimal extends Animal {}
class SwimmingAnimal extends Animal {}
class FlyingAndSwimmingAnimal extends ??? // 😞 duck kya extend kare?

// ✅ Composition
const canFly = {
  fly() { console.log("Flying"); }
};

const canSwim = {
  swim() { console.log("Swimming"); }
};

const canWalk = {
  walk() { console.log("Walking"); }
};

function createDuck(name) {
  return { name, ...canFly, ...canSwim, ...canWalk };
}

function createFish(name) {
  return { name, ...canSwim };
}

const donald = createDuck("Donald");
donald.fly();   // Flying
donald.swim();  // Swimming
```

**Interview line:** *"Inheritance models 'is-a' relationships, composition models 'has-a' or 'can-do'. Composition gives runtime flexibility."*

---

## 8. Dependency Injection

> **Definition:** A technique where an object receives its dependencies from an external source rather than creating them itself.

**3 Types:**

1. **Constructor Injection** (most common)
2. **Setter Injection**
3. **Interface Injection**

```javascript
// Constructor Injection
class WalletService {
  constructor(db, logger, paymentGateway) {
    this.db = db;
    this.logger = logger;
    this.paymentGateway = paymentGateway;
  }
}

// Without DI - testing mushkil
const ws = new WalletService(); // creates real DB inside

// With DI - testing easy
const mockDB = { query: jest.fn() };
const mockLogger = { log: jest.fn() };
const mockGateway = { charge: jest.fn() };
const ws = new WalletService(mockDB, mockLogger, mockGateway);
```

**Node.js libraries:** `awilix`, `tsyringe`, `inversify` — DI containers banane ke liye.

---

## 9. UML Diagrams

> **Definition:** Unified Modeling Language — a standardized way to visualize the design of a system.

Interview mein ye **whiteboard pe banane ko bolte hain**.

### 9.1 Class Diagram (Most important)

Classes, attributes, methods, relationships dikhata hai.

```
┌──────────────────┐
│     Wallet       │
├──────────────────┤
│ - id: int        │   (- private, + public, # protected)
│ - balance: float │
│ - userId: int    │
├──────────────────┤
│ + deposit()      │
│ + withdraw()     │
│ + getBalance()   │
└──────────────────┘
```

**Relationships:**
- **Association** (uses): `─────►`
- **Aggregation** (has-a, weak): `◇─────►`
- **Composition** (has-a, strong): `◆─────►`
- **Inheritance** (is-a): `─────▷`
- **Realization** (implements): `┄┄┄┄▷`

### 9.2 Sequence Diagram

Time ke saath objects kaise communicate karte hain.

```
User    Controller    Service    DB
 │          │           │         │
 │─request─►│           │         │
 │          │──validate►│         │
 │          │           │──query─►│
 │          │           │◄──data──│
 │          │◄──result──│         │
 │◄response │           │         │
```

### 9.3 Use Case Diagram

System ka behavior user perspective se dikhata hai.

```
   User
    │
    ├──► Login
    ├──► Add Money
    ├──► Transfer
    └──► View History
```

---

## 10. Concurrency in JavaScript

> **Definition:** The ability to execute multiple tasks in overlapping time periods.

### 10.1 Event Loop

JS single-threaded hai but concurrent kaise hai? **Event Loop ke wajah se.**

```
┌─────────────────────────┐
│    Call Stack           │  ← sync code
└─────────────────────────┘
            ↓ (when empty)
┌─────────────────────────┐
│   Microtask Queue       │  ← Promises, queueMicrotask
└─────────────────────────┘
            ↓
┌─────────────────────────┐
│   Macrotask Queue       │  ← setTimeout, setInterval, I/O
└─────────────────────────┘
```

**Order:** Sync → Microtasks → Macrotasks

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// Output: 1, 4, 3, 2
```

### 10.2 Promise Patterns

```javascript
// Parallel execution
const [user, orders, wallet] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
  fetchWallet(id)
]);

// First one wins
const result = await Promise.race([
  fetchFromCDN(),
  fetchFromOrigin()
]);

// All settle (success or fail)
const results = await Promise.allSettled([api1(), api2(), api3()]);
```

### 10.3 Race Conditions

```javascript
// ❌ Race condition
async function transfer(from, to, amount) {
  const fromWallet = await Wallet.findOne({ id: from });
  // Yahan koi aur thread balance update kar sakta hai 😱
  if (fromWallet.balance >= amount) {
    await Wallet.update({ balance: fromWallet.balance - amount }, { where: { id: from } });
  }
}

// ✅ Use DB transactions
async function transfer(from, to, amount) {
  await sequelize.transaction(async (t) => {
    const fromWallet = await Wallet.findOne({ 
      where: { id: from }, 
      lock: t.LOCK.UPDATE,  // row lock
      transaction: t 
    });
    if (fromWallet.balance < amount) throw new Error("Insufficient");
    await fromWallet.decrement('balance', { by: amount, transaction: t });
    await Wallet.increment('balance', { by: amount, where: { id: to }, transaction: t });
  });
}
```

### 10.4 Worker Threads (CPU-heavy work)

```javascript
const { Worker } = require('worker_threads');
// CPU-heavy work alag thread mein, main thread free
```

---

## 11. Error Handling Patterns

### 11.1 Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message) { super(message, 400); }
}

class NotFoundError extends AppError {
  constructor(resource) { super(`${resource} not found`, 404); }
}

class InsufficientBalanceError extends AppError {
  constructor() { super("Insufficient balance", 402); }
}

// Usage
if (wallet.balance < amount) throw new InsufficientBalanceError();
```

### 11.2 Centralized Error Handler (Express)

```javascript
// Single place jahan saare errors handle hote
app.use((err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err); // log unexpected errors
  res.status(500).json({ error: "Something went wrong" });
});
```

### 11.3 Async Error Wrapper

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Controller mein try-catch likhne ki zaroorat nahi
router.post('/transfer', asyncHandler(async (req, res) => {
  const result = await walletService.transfer(req.body);
  res.json(result);
}));
```

---

## 12. Common LLD Interview Problems

5+ years mein ye actual problems milte hain. Har ek mein **classes, methods, relationships** design karne hote.

### Easy
1. **Tic-Tac-Toe** — Game state, players, board
2. **Snake & Ladder** — Dice, board, players
3. **Vending Machine** — States (idle, selecting, dispensing)
4. **ATM Machine** — Account, transactions, states

### Medium
5. **Parking Lot** — Multiple floors, vehicle types, payment
6. **Library Management** — Books, members, borrowing
7. **Splitwise** — Users, expenses, balance simplification
8. **Movie Booking (BookMyShow)** — Shows, seats, payments
9. **Logger** — Levels, sinks (console/file/DB), Singleton + Strategy

### Hard
10. **Uber / Ola** — Drivers, riders, matching, pricing strategy
11. **Food Delivery (Zomato)** — Restaurants, orders, delivery agents
12. **Inventory Management System** — Products, suppliers, stock
13. **Chess Game** — Pieces (polymorphism!), board, moves
14. **Elevator System** — Multiple lifts, scheduling algorithm
15. **Rate Limiter** — Token bucket, sliding window
16. **URL Shortener** — Encoding, DB, caching
17. **Notification System** (tere queues jaisa) — Multi-channel

### Sample: Parking Lot Skeleton

```javascript
class Vehicle {
  constructor(plateNumber, type) {
    this.plateNumber = plateNumber;
    this.type = type; // 'bike', 'car', 'truck'
  }
}

class ParkingSpot {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.vehicle = null;
  }
  isAvailable() { return this.vehicle === null; }
  park(v) { this.vehicle = v; }
  leave() { this.vehicle = null; }
}

class ParkingFloor {
  constructor(floorNo) {
    this.floorNo = floorNo;
    this.spots = [];
  }
  findAvailableSpot(vehicleType) {
    return this.spots.find(s => s.type === vehicleType && s.isAvailable());
  }
}

class ParkingLot {  // Singleton
  static #instance;
  constructor() {
    if (ParkingLot.#instance) return ParkingLot.#instance;
    this.floors = [];
    ParkingLot.#instance = this;
  }
  
  parkVehicle(vehicle) {
    for (const floor of this.floors) {
      const spot = floor.findAvailableSpot(vehicle.type);
      if (spot) {
        spot.park(vehicle);
        return new Ticket(vehicle, spot, new Date());
      }
    }
    throw new Error("Parking full");
  }
}

class Ticket {
  constructor(vehicle, spot, entryTime) {
    this.vehicle = vehicle;
    this.spot = spot;
    this.entryTime = entryTime;
  }
}

// Strategy pattern for pricing
class HourlyPricingStrategy {
  calculate(hours, type) { /* ... */ }
}
class DayPassPricingStrategy {
  calculate(days, type) { /* ... */ }
}
```

---

## 13. How to Approach an LLD Interview

5+ years ke level pe interviewer expect karta hai ki tu structured approach lega:

### Step-by-Step Framework

**Step 1: Requirements Gathering (2-3 mins)**
- Functional requirements clarify karo
- Non-functional (scale, latency) poochho
- Edge cases discuss karo
- "Should I support concurrent users?", "Multi-region?"

**Step 2: Identify Entities/Classes (5 mins)**
- Nouns nikaalo problem statement se
- Parking Lot → Vehicle, Spot, Floor, Ticket, Payment, etc.

**Step 3: Define Relationships**
- Has-a (composition/aggregation)
- Is-a (inheritance)
- Uses (association)

**Step 4: Identify Methods/Behaviors**
- Verbs nikaalo: park(), leave(), calculatePrice()
- Har class ko SRP follow karna

**Step 5: Apply Design Patterns**
- "Yahan Singleton lagega ParkingLot ke liye"
- "Pricing ke liye Strategy pattern"
- "Vehicle creation ke liye Factory"

**Step 6: Code (Skeleton)**
- Class structure dikhao
- Important methods ka pseudocode
- Concurrency issues address karo

**Step 7: Discuss Trade-offs**
- "Inheritance use kiya kyunki vehicle types ka clear hierarchy hai"
- "Singleton chuna kyunki ek hi parking lot instance global access ke liye"

### Communication Tips

✅ **Bolo while coding** — interviewer ko thought process pata chale
✅ **Trade-offs mention karo** — "We could also use X, but Y is better here because..."
✅ **Edge cases handle karo** — null checks, concurrency, failures
✅ **Extensibility discuss karo** — "Agar kal naya vehicle type aaya toh kya hoga?"

### Red Flags Avoid Karo

❌ Direct code likhne lagna bina design discuss kiye
❌ God classes banana (sab kuch ek class mein)
❌ Magic numbers/strings (constants use karo)
❌ Tightly coupled code likhna
❌ "It works" attitude — clean code matters

---

## 🎯 Final Interview Cheatsheet

| Topic | One-liner Answer |
|-------|------------------|
| OOP | A-PIE: Abstraction, Polymorphism, Inheritance, Encapsulation |
| SOLID | SRP, OCP, LSP, ISP, DIP — for maintainable code |
| Singleton | One instance globally — DB connection, Logger |
| Factory | Centralize object creation logic |
| Observer | Pub-sub, event-driven (Node EventEmitter) |
| Strategy | Swap algorithms at runtime |
| Decorator | Add behavior dynamically (Express middleware) |
| Coupling | Keep LOW (DI helps) |
| Cohesion | Keep HIGH (related code together) |
| Composition vs Inheritance | Prefer composition for flexibility |
| Layered Architecture | Route → Controller → Service → DB |
| DI | Inject dependencies, don't create them |

---

## 📚 Recommended Resources

- **Book:** "Head First Design Patterns" — easy and visual
- **Book:** "Clean Code" by Robert C. Martin
- **Book:** "Designing Data-Intensive Applications" by Martin Kleppmann
- **YouTube:** Gaurav Sen, Arpit Bhayani, ThinkSoftware
- **Website:** refactoring.guru (design patterns visually explained)
- **Practice:** github.com/prasadgujar/low-level-design-primer

---

## ✅ Practice Plan (4 Weeks)

**Week 1:** OOP + SOLID + 5 design patterns (Singleton, Factory, Observer, Strategy, Decorator)
**Week 2:** Remaining design patterns + UML practice
**Week 3:** Solve 5 LLD problems (Parking Lot, Splitwise, ATM, Logger, Rate Limiter)
**Week 4:** Mock interviews + revise + tere current codebase ko in patterns ke through analyze kar

---

> **Pro tip:** Tera current `payment-service` code already industry-standard layered architecture hai. Interview mein iska reference de sakta hai — *"In my current project, we use a strict layered architecture with Joi-based validation middleware, service layer for business logic, and BullMQ-style queues for async work — this gives us testability and clean separation of concerns."* 🔥

**Best of luck bhai! 💪**
