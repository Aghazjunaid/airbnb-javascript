
let arr : number[] = [1,2,3];
let arr_str : string[] = ['1','2','3'];

type Status = "SUCCESS" | "FAILED" | "PENDING";
interface ApiResponse2 {
  status: Status;
}

type User = { name: string };
// type User = { age: number }; ❌ duplicate identifier


type Obj = {
    name : string;
    age : number;
}

const obj : Obj = {
    name : 'aj',
    age: 29
}

interface Obj2 {
    name : string,
    age: 29
}

const obj2 : Obj2 = {
    name : 'aj',
    age: 29
}

let obj3 : Obj3 = {
  "id": 101,
  "name": "Aghaz",
  "email": "aghaz@gmail.com",
  "isActive": true
}

interface Obj3 {
    id : number,
    name : string,
    email : string,
    isActive : boolean
}

let obj4 : Obj4 = {
  "id": 1,
  "name": "Order 1",
  "user": {
    "id": 10,
    "email": "user@test.com"
  }
}

interface Obj4 {
    id : number,
    name : string,
    user : User
}

interface User {
    id : number,
    email : string,
}

let obj5 = {
  "id": 1,
  "name": "Aghaz",
  "phone": null,
  "age": 25
}

interface Obj5{
    id: number;
  name: string;
  phone: string | null; // | for nullable or string
  age?: number; //? for optional
}

let arr1 : Arr1 = {
  "users": [
    { "id": 1, "name": "A" },
    { "id": 2, "name": "B" }
  ]
}

interface Arr1 {
    users : Arr1Obj[]
}

interface Arr1Obj {
    id : number,
    name : string,
}

let obj6 : Obj6 = {
  "orderId": "ORD123",
  "amount": 500,
  "items": [
    {
      "productId": 1,
      "price": 200,
      "qty": 2
    }
  ],
  "payment": {
    "mode": "CARD",
    "status": "SUCCESS"
  }
}

interface Obj6 {
    orderId : string,
    amount : number,
    items : Items[],
    payment : Payment
}

interface Items {
      "productId": number,
      "price": number
      "qty": number
}

type PaymentStatus = "SUCCESS" | "FAILED";

interface Payment {
    mode : string,
    status : PaymentStatus
}

let obj7 : Obj7 = {
  "id": 1,
  "createdAt": "2025-01-01"
}

interface Obj7 {
  readonly id: number;
  readonly createdAt: string;
}

enum ApiStatus {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

interface ApiResponse1 {
  status: ApiStatus;
  data: any;
}

// “I use interface for object shapes and type for unions, utility types, and complex compositions.”

function add(a: number, b: number): number {
  return a + b;
}

//“Generics allow me to write reusable, type-safe code where the type is decided at usage time.”
//Generics TypeScript ka feature hai jisse hum type ko parameter bana sakte hain, taaki reusable aur type-safe code likh saken.
function identity<T>(value: T): T {
  return value;
}

identity<number>(10);
identity<string>("Hello");
// 👉 T ek placeholder type hai
// 👉 Jo type doge, wahi return hoga

function getFirst<T>(arr: T[]): T {
  return arr[0];
}

getFirst([1, 2, 3]);
getFirst(["a", "b"]);


interface ApiResponse<T> {
  data: T;
  status: number;
}

const userRes: ApiResponse<{ id: number; name: string }> = {
  data: { id: 1, name: "Aghaz" },
  status: 200
};

