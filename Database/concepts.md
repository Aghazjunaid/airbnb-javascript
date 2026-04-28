# 🗄️ Database Interview Notes — 5+ Years Preparation
> **JavaScript Full Stack Developer**  
> Hinglish explanations + Code examples + Interview tips

---

## 📋 Table of Contents

### Part A — Core & Advanced SQL
1. [SQL Joins](#1-sql-joins)
2. [Normalization (1NF–3NF)](#2-normalization-1nf3nf)
3. [Indexes & B-Trees](#3-indexes--b-trees)
4. [Query Optimization](#4-query-optimization)
5. [N+1 Problem](#5-n1-problem)
6. [Pagination Strategies](#6-pagination-strategies)
7. [CTEs & Window Functions](#7-ctes--window-functions)
8. [Isolation Levels](#8-isolation-levels)
9. [Locking & Deadlocks](#9-locking--deadlocks)

### Part B — Databases & Architecture
10. [SQL vs NoSQL](#10-sql-vs-nosql)
11. [Redis / Caching](#11-redis--caching)
12. [MongoDB / Document DB](#12-mongodb--document-db)
13. [CAP Theorem](#13-cap-theorem)
14. [Replication](#14-replication)
15. [Sharding](#15-sharding)
16. [Connection Pooling](#16-connection-pooling)
17. [DB Migrations](#17-db-migrations)
18. [ORM Concepts](#18-orm-concepts)
19. [Partitioning](#19-partitioning)
20. [Time-Series DBs](#20-time-series-dbs)
21. [Vector DBs](#21-vector-dbs)

---

# Part A — Core & Advanced SQL

---

## 1. SQL Joins

> **Definition (English):** SQL JOIN combines rows from two or more tables based on a related column between them.

> **Hinglish:** Do ya zyada tables ka data ek saath dikhana ho — JOIN use karo. Jaise users table aur orders table ko milana. Har JOIN type alag situation ke liye hai.

---

### Setup — Sample Tables

```sql
-- users table
| id | name  | city      |
|----|-------|-----------|
| 1  | Rahul | Hyderabad |
| 2  | Priya | Mumbai    |
| 3  | Dev   | Bangalore |
| 4  | Aisha | Delhi     |

-- orders table
| id | user_id | total | status    |
|----|---------|-------|-----------|
| 1  | 1       | 599   | completed |
| 2  | 1       | 1299  | pending   |
| 3  | 2       | 899   | completed |
| 4  | 5       | 299   | completed |  ← user_id=5 doesn't exist in users!
```

---

### INNER JOIN — Dono mein match ho tabhi

> **Definition:** Returns only rows that have matching values in BOTH tables.

> **Hinglish:** Sirf woh rows aayengi jahan dono tables mein match ho. User ne order kiya ho — tabhi aayega. Koi bhi side mein match nahi = row skip.

```sql
SELECT u.name, o.total, o.status
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- Result:
-- Rahul  | 599  | completed   ← match mila (user_id=1)
-- Rahul  | 1299 | pending     ← match mila (user_id=1)
-- Priya  | 899  | completed   ← match mila (user_id=2)
-- Dev aur Aisha nahi aaye (unhone order nahi kiya)
-- order_id=4 (user_id=5) nahi aaya (user exist nahi karta)
```

---

### LEFT JOIN — Left table ke saare rows

> **Definition:** Returns ALL rows from the left table, and matching rows from the right table. No match = NULL.

> **Hinglish:** Left table (users) ke saare records aao — order ho ya na ho. Order nahi hai toh NULL aayega. "Saare users dikhao, order kiya ho ya nahi" — yahi LEFT JOIN hai.

```sql
SELECT u.name, o.total, o.status
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- Result:
-- Rahul  | 599   | completed
-- Rahul  | 1299  | pending
-- Priya  | 899   | completed
-- Dev    | NULL  | NULL        ← No order, still appears
-- Aisha  | NULL  | NULL        ← No order, still appears

-- Use case: Users jo kabhi order nahi kiye
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;  -- NULL = no order found
-- Result: Dev, Aisha
```

---

### RIGHT JOIN — Right table ke saare rows

> **Definition:** Returns ALL rows from the right table, and matching rows from the left table. No match = NULL.

> **Hinglish:** RIGHT JOIN = LEFT JOIN ka ulta. Right table (orders) ke saare records aao. Usually LEFT JOIN prefer karte hain — tables swap karke LEFT JOIN use kar lo.

```sql
SELECT u.name, o.total, o.status
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- Result:
-- Rahul  | 599   | completed
-- Rahul  | 1299  | pending
-- Priya  | 899   | completed
-- NULL   | 299   | completed   ← order_id=4, user_id=5 exist nahi karta

-- Same as:
SELECT u.name, o.total, o.status
FROM orders o
LEFT JOIN users u ON o.user_id = u.id;
```

---

### FULL OUTER JOIN — Dono tables ke saare rows

> **Definition:** Returns ALL rows from both tables. Where no match exists, NULLs are filled in.

> **Hinglish:** Dono tables ke saare records aao — match ho ya na ho. Dono sides ke orphan records bhi aate hain.

```sql
SELECT u.name, o.total, o.status
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;

-- Result:
-- Rahul  | 599   | completed
-- Rahul  | 1299  | pending
-- Priya  | 899   | completed
-- Dev    | NULL  | NULL        ← User without order
-- Aisha  | NULL  | NULL        ← User without order
-- NULL   | 299   | completed   ← Order without user
```

---

### CROSS JOIN — Cartesian Product

> **Definition:** Returns every combination of rows from both tables (M × N rows). No ON condition needed.

> **Hinglish:** Har row ko har doosri row se milao. 3 users × 4 orders = 12 rows. Rarely useful — size/color combinations jaise use cases ke liye.

```sql
-- T-shirt sizes aur colors combination
SELECT size, color
FROM sizes CROSS JOIN colors;

-- sizes: [S, M, L] × colors: [Red, Blue, Green]
-- Result: S-Red, S-Blue, S-Green, M-Red, M-Blue, M-Green, L-Red, L-Blue, L-Green
-- 3 × 3 = 9 rows

-- ❌ Accidental CROSS JOIN (missing ON condition)
SELECT * FROM users, orders;  -- 4 users × 4 orders = 16 rows! (bad)
-- ✅ Always use explicit JOIN with ON condition
```

---

### SELF JOIN — Table khud se join

> **Definition:** A table is joined with itself. Used for hierarchical data like employee-manager relationships.

```sql
-- employees table: (id, name, manager_id)
SELECT
  e.name        AS employee,
  m.name        AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Result:
-- Rahul    | Priya      ← Rahul ka manager Priya hai
-- Priya    | Aisha      ← Priya ka manager Aisha hai
-- Aisha    | NULL       ← CEO, no manager
```

---

### JOIN Performance Tips

```sql
-- ✅ Always index JOIN columns (ON clause mein jo column ho)
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- JOIN: users.id = orders.user_id → orders.user_id pe index zaroori

-- ✅ Filter pehle, join baad mein (subquery ya CTE se)
SELECT u.name, o.total
FROM users u
JOIN (
  SELECT * FROM orders WHERE status = 'completed'  -- Pehle filter
) o ON u.id = o.user_id;

-- ✅ EXPLAIN se verify karo
EXPLAIN ANALYZE
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;
-- Dekho: Hash Join, Merge Join, Nested Loop — plan type matter karta hai
```

> 💡 **Interview Tip:** "INNER JOIN most common — sirf matching rows. LEFT JOIN jab left table ke saare records chahiye (users without orders). FULL JOIN audit scenarios mein. CROSS JOIN combinations ke liye. Hamesha JOIN columns pe index rakho."

---

## 2. Normalization (1NF–3NF)

> **Definition (English):** Normalization is the process of organizing database tables to reduce data redundancy and improve data integrity by decomposing large tables into smaller, well-structured related tables.

> **Hinglish:** Ek hi data baar baar mat store karo. Rahul ka phone number ek jagah ho — agar 1000 orders mein repeat hai aur change karna ho toh sab jagah update karna padega. Normalization isko fix karta hai — ek jagah rakho, ek jagah update karo.

---

### Unnormalized Table — Problem

```sql
-- ❌ BAD: Sab kuch ek table mein
orders_bad:
| order_id | customer_name | customer_email    | customer_phone | product  | price | supplier     | supplier_phone |
|----------|---------------|-------------------|----------------|----------|-------|--------------|----------------|
| 1        | Rahul Sharma  | rahul@gmail.com   | 9876543210     | Laptop   | 55000 | TechCorp     | 1800-123-456   |
| 2        | Rahul Sharma  | rahul@gmail.com   | 9876543210     | Mouse    | 800   | TechCorp     | 1800-123-456   |
| 3        | Priya Singh   | priya@gmail.com   | 9988776655     | Keyboard | 1500  | PeriphCo     | 1800-789-012   |

-- Problems:
-- 1. Rahul ka data 2 baar repeat (Redundancy)
-- 2. Rahul ka phone change = multiple rows update (Update Anomaly)
-- 3. Product delete karo = customer data bhi jaata (Delete Anomaly)
-- 4. Naya customer tabhi add hoga jab order karega (Insert Anomaly)
```

---

### 1NF — First Normal Form

> **Definition (English):** Each column must contain atomic (indivisible) values. No repeating groups. Each row must be uniquely identifiable.

> **Rule:** Ek cell = ek value. Array ya comma-separated list nahi.

```sql
-- ❌ 1NF Violation: Multiple values in one cell
| order_id | customer | products                  | phones              |
|----------|----------|---------------------------|---------------------|
| 1        | Rahul    | 'Laptop, Mouse, Monitor'  | '9876, 9877'        |

-- ✅ 1NF Fix: Each product gets its own row
| order_id | customer | product | phone      |
|----------|----------|---------|------------|
| 1        | Rahul    | Laptop  | 9876543210 |
| 1        | Rahul    | Mouse   | 9876543210 |
| 1        | Rahul    | Monitor | 9876543210 |

-- Primary Key: Composite — (order_id, product)
-- Har row uniquely identifiable hai
```

---

### 2NF — Second Normal Form

> **Definition (English):** Must be in 1NF AND every non-key column must depend on the ENTIRE primary key — no partial dependencies.

> **Note:** 2NF sirf tab relevant hai jab composite primary key ho.

> **Hinglish:** Agar PK do columns ka hai (order_id, product_id) — toh koi column sirf ek column pe depend nahi karna chahiye. `product_name` sirf `product_id` pe depend karta hai = partial dependency = 2NF violation.

```sql
-- ❌ 2NF Violation: Partial dependency
-- Table: order_items(order_id, product_id, product_name, quantity)
--                        ↑PK       ↑PK         ↑ depends ONLY on product_id!
--                                              product_id pe dependent = partial!

-- ✅ 2NF Fix: Separate tables

CREATE TABLE products (
  product_id   SERIAL PRIMARY KEY,
  product_name TEXT    NOT NULL,
  price        DECIMAL NOT NULL
);

CREATE TABLE order_items (
  order_id    INT REFERENCES orders(id),
  product_id  INT REFERENCES products(id),
  quantity    INT NOT NULL,
  PRIMARY KEY (order_id, product_id)   -- Composite PK
);
-- quantity BOTH order_id AND product_id pe depend karta hai ✅
```

---

### 3NF — Third Normal Form

> **Definition (English):** Must be in 2NF AND no non-key column should depend on another non-key column (no transitive dependencies).

> **Hinglish:** Non-key column → non-key column dependency = transitive dependency = 3NF violation.
> `order_id → customer_city → city_pincode` — pincode city pe depend karta hai (non-key → non-key).

```sql
-- ❌ 3NF Violation: Transitive dependency
-- orders(order_id, customer_id, customer_city, city_pincode)
--                                     ↑               ↑
--                  city_pincode → customer_city (non-key → non-key)

-- ✅ 3NF Fix: Extract transitive dependency

CREATE TABLE cities (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  pincode TEXT NOT NULL
);

CREATE TABLE customers (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  email   TEXT UNIQUE NOT NULL,
  city_id INT REFERENCES cities(id)   -- city_pincode chain broken!
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  total       DECIMAL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Chain: cities ← customers ← orders
-- Har data point sirf ek jagah!
```

---

### Normalization Summary

| Normal Form | Rule | Fixes |
|---|---|---|
| **1NF** | Atomic values, no arrays in cells | Repeating groups, multi-valued cells |
| **2NF** | No partial dependency on composite PK | Duplicate data tied to part of PK |
| **3NF** | No transitive dependency (non-key → non-key) | Redundant chains |
| **BCNF** | Every determinant must be a candidate key | 3NF edge cases |

> ⚠️ **Real World Note:** Over-normalization se bachna! Reporting databases mein intentional denormalization karte hain expensive JOINs avoid karne ke liye.

> 💡 **Interview Tip:** Unnormalized table dikhao → step by step 1NF, 2NF, 3NF mein convert karo. Practical approach interviewers ko bahut pasand aata hai.

---

## 3. Indexes & B-Trees

> **Definition (English):** An index is a separate data structure (usually a B-Tree) that allows the database to find rows quickly without scanning the entire table — like the index at the back of a book.

> **Hinglish:** Dictionary mein 'serendipity' dhundho. Without index: page 1 se padhna shuru. With index (back of book): seedha 'S' section → instant! **Without index = O(n), With index = O(log n).**

---

### How B-Tree Index Works

```
B-Tree Structure (email index pe):

                    [ M ]
                   /     \
            [D, H]         [R, W]
           /  |   \       /  |   \
         [A] [E]  [J]  [N]  [S]  [X]
          ↑    ↑    ↑    ↑    ↑    ↑
       Leaf nodes → pointers to actual disk rows

Search 'J':
  Root [M]: J < M → go left
  Node [D,H]: J > H → go right child
  Leaf [J]: FOUND! → disk pointer → fetch row

1 Million rows mein:
  B-Tree  ≈ 20 comparisons   ✅ (O log n)
  Full Scan = 1,000,000 rows  ❌ (O n)
```

---

### Types of Indexes

#### Single Column Index

```sql
CREATE INDEX idx_users_email ON users(email);

-- Query jo use karegi:
SELECT * FROM users WHERE email = 'rahul@gmail.com';
-- EXPLAIN: "Index Scan using idx_users_email" ✅
```

#### Composite Index — Column Order Matters!

```sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- ✅ Index USE hoga (leftmost column present)
SELECT * FROM orders WHERE user_id = 5;
SELECT * FROM orders WHERE user_id = 5 AND created_at > '2024-01-01';

-- ❌ Index USE NAHI hoga (leftmost column absent!)
SELECT * FROM orders WHERE created_at > '2024-01-01';  -- Full scan!

-- RULE: Index (A, B, C):
-- A ✅ | A+B ✅ | A+B+C ✅ | B alone ❌ | C alone ❌
```

#### Partial Index

```sql
-- Sirf active records pe index
CREATE INDEX idx_active_posts ON posts(user_id)
WHERE deleted_at IS NULL;

-- Sirf premium users pe
CREATE INDEX idx_premium ON users(email)
WHERE plan = 'premium';
```

#### Expression Index

```sql
-- Function pe index (case-insensitive search ke liye)
CREATE INDEX idx_lower_email ON users(LOWER(email));

-- Ab yeh query index use karegi:
WHERE LOWER(email) = 'rahul@gmail.com';
```

#### Covering Index — Index-Only Scan

```sql
-- Query sirf index se answer ho — table touch hi nahi karna
CREATE INDEX idx_users_covering ON users(plan) INCLUDE (name, email);

-- Yeh query sirf index se answer hogi (table access nahi):
SELECT name, email FROM users WHERE plan = 'premium';
-- "Index Only Scan" in EXPLAIN → fastest possible!
```

---

### EXPLAIN ANALYZE — Most Important Tool

```sql
-- Full analysis
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM users WHERE email = 'rahul@gmail.com';

-- WITHOUT index:
-- Seq Scan on users  (cost=0.00..2891.00 rows=1 width=100)
--   Filter: (email = 'rahul@gmail.com')
--   Rows Removed by Filter: 99999
--   Actual time: 45.231 ms   ← SLOW!

-- WITH index:
-- Index Scan using idx_users_email on users
--   Index Cond: (email = 'rahul@gmail.com')
--   Actual time: 0.082 ms    ← 550x faster!

-- Key terms:
-- "Seq Scan"    → Full table scan — index nahi hai ❌
-- "Index Scan"  → Index use ho raha hai ✅
-- "Index Only Scan" → Sirf index se answer ✅✅
-- cost=X..Y     → Estimated cost (Y = total)
-- actual time   → Real execution time in ms
```

---

### Index Killer — Functions on Columns

```sql
-- ❌ Index destroy ho jaata hai jab column pe function lagao
WHERE YEAR(created_at) = 2024          -- MySQL: full scan!
WHERE DATE_TRUNC('year', created_at) = '2024-01-01'  -- PG: full scan!
WHERE LOWER(email) = 'rahul@gmail.com'               -- Full scan!
WHERE LENGTH(name) > 10                              -- Full scan!

-- ✅ Fix: Range condition use karo
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'

-- ✅ Fix: Expression index banao
CREATE INDEX idx_lower_email ON users(LOWER(email));
-- Ab LOWER(email) = '...' ka query index use karega
```

---

### When to Index vs Not

| Create Index ✅ | Avoid Index ❌ |
|---|---|
| WHERE mein frequently used column | Small tables (< 1000 rows) |
| JOIN ke ON columns | Rarely queried columns |
| ORDER BY, GROUP BY columns | High write frequency tables |
| Foreign key columns | Low cardinality (boolean, gender) |
| Unique constraints | Too many indexes on one table |

> 💡 **Interview Tip:** "Index ek double-edged sword hai — SELECT fast karta hai lekin INSERT/UPDATE/DELETE slow hoti hai (index bhi update hota hai). Composite index mein leftmost column rule yaad rakho. Function on indexed column = index wasted."

---

## 4. Query Optimization

> **Definition (English):** Query optimization is the process of rewriting SQL queries and using database tools to make them execute faster with less CPU and I/O usage.

> **Hinglish:** Application slow hai? 80% cases mein problem database queries mein hoti hai. EXPLAIN ANALYZE se problem dhundho, phir fix karo — ek optimized query 100x difference kar sakti hai.

---

### Step 1: Find Slow Queries

```sql
-- PostgreSQL slow query log enable karo
-- postgresql.conf mein:
log_min_duration_statement = 500  -- 500ms se slow queries log karo
log_statement = 'all'             -- Ya saari queries log karo (dev only)

-- Slow queries check karo:
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

### Optimization Techniques

#### 1. SELECT * Never Use Karo

```sql
-- ❌ BAD: Saare columns transfer — unnecessary load
SELECT * FROM users WHERE id = 1;

-- ✅ GOOD: Sirf needed columns
SELECT id, name, email, plan FROM users WHERE id = 1;

-- Node.js / Prisma:
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, name: true, email: true }  // ✅
});
```

#### 2. Function on Column Avoid Karo

```sql
-- ❌ Index bypass hota hai
WHERE YEAR(created_at) = 2024
WHERE LOWER(email) = 'rahul@gmail.com'

-- ✅ Range condition
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'

-- ✅ Expression index (agar function zaroori hai)
CREATE INDEX idx_lower_email ON users(LOWER(email));
```

#### 3. Subquery ki Jagah JOIN ya EXISTS

```sql
-- ❌ SLOWER: Correlated subquery (har row ke liye execute)
SELECT name FROM users
WHERE id IN (
  SELECT DISTINCT user_id FROM orders WHERE total > 1000
);

-- ✅ FASTER: JOIN
SELECT DISTINCT u.name
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.total > 1000;

-- ✅ EVEN BETTER: EXISTS (first match pe stop)
SELECT name FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.user_id = u.id AND o.total > 1000
);
```

#### 4. Batch Operations

```javascript
// ❌ BAD: 1000 individual inserts = 1000 DB round trips!
for (const item of items) {
  await db.query('INSERT INTO logs (msg) VALUES ($1)', [item.msg]);
}

// ✅ GOOD: Single bulk insert
const placeholders = items.map((_, i) => `($${i + 1})`).join(', ');
await db.query(
  `INSERT INTO logs (msg) VALUES ${placeholders}`,
  items.map(i => i.msg)
);

// Prisma:
await prisma.log.createMany({ data: items });
```

#### 5. Index for Sorting

```sql
-- Index with correct sort order
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Composite index: filter + sort (very common pattern)
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);

-- This query now uses index entirely:
SELECT * FROM orders
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 20;
```

#### 6. Query Plan Reading

```sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as order_count
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id
ORDER BY order_count DESC
LIMIT 10;

-- Things to check in output:
-- "Seq Scan"         → ❌ No index — add one!
-- "Index Scan"       → ✅ Good
-- "Hash Join"        → Large tables ke liye
-- "Nested Loop"      → Small datasets ke liye good
-- "Sort"             → ❌ Memory sort — add index with ORDER
-- "rows=" mismatch   → Stale statistics → ANALYZE table run karo
```

> 💡 **Interview Workflow:** EXPLAIN ANALYZE → Seq Scan dhundho → Index add karo → Re-verify. Slow query log enable rakho production mein.

---

## 5. N+1 Problem

> **Definition (English):** The N+1 problem is a performance anti-pattern where 1 query fetches N items, then N additional queries are fired for each item — resulting in N+1 total database round trips instead of 1–2.

> **Hinglish:** 100 users fetch karo (1 query) → phir har user ke orders ke liye alag query (100 queries) = **101 total queries!** ORM use karne waalon ka sabse common galti.

---

### N+1 in Action

```javascript
// ❌ CLASSIC N+1 — Very Bad!
app.get('/users-with-orders', async (req, res) => {
  // Query 1: All users
  const users = await db.query('SELECT * FROM users');

  // Queries 2 to 101: ONE per user!
  for (const user of users.rows) {
    const orders = await db.query(
      'SELECT * FROM orders WHERE user_id = $1',
      [user.id]
    );
    user.orders = orders.rows;
  }
  // 100 users = 101 DB round trips! 😱
  res.json(users.rows);
});
```

---

### Solutions

#### Solution 1: JOIN — 1 Query Mein Sab

```javascript
// ✅ Single JOIN query
const result = await db.query(`
  SELECT
    u.id, u.name, u.email,
    json_agg(
      json_build_object('id', o.id, 'total', o.total)
    ) FILTER (WHERE o.id IS NOT NULL) AS orders
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  GROUP BY u.id
`);
// Total: 1 query ✅
```

#### Solution 2: 2-Query Batch

```javascript
// ✅ 2 queries total (not N+1)
const users = (await db.query('SELECT * FROM users')).rows;
const userIds = users.map(u => u.id);

// ALL users ke orders ek saath
const orders = (await db.query(
  'SELECT * FROM orders WHERE user_id = ANY($1)',
  [userIds]   // PostgreSQL ANY() with array
)).rows;

// JavaScript mein group karo
const ordersByUser = {};
for (const order of orders) {
  if (!ordersByUser[order.user_id]) ordersByUser[order.user_id] = [];
  ordersByUser[order.user_id].push(order);
}

const result = users.map(u => ({
  ...u,
  orders: ordersByUser[u.id] || []
}));
// Total: 2 queries ✅
```

#### Solution 3: Prisma Eager Loading

```javascript
// ❌ N+1 in Prisma (manual loop)
const users = await prisma.user.findMany();
for (const user of users) {
  const orders = await prisma.order.findMany({ where: { userId: user.id } });
}

// ✅ Eager loading with include
const users = await prisma.user.findMany({
  include: {
    orders: {
      select: { id: true, total: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    },
    profile: true
  }
});
// Prisma: 1-2 queries internally ✅
```

#### Solution 4: DataLoader (GraphQL ke liye)

```javascript
import DataLoader from 'dataloader';

const orderLoader = new DataLoader(async (userIds) => {
  // Sabke userIds ek saath batched!
  const orders = await db.query(
    'SELECT * FROM orders WHERE user_id = ANY($1)',
    [userIds]
  );
  // Must return in same order as userIds
  return userIds.map(id => orders.rows.filter(o => o.user_id === id));
});

// GraphQL resolver — auto-batched!
const resolvers = {
  User: {
    orders: (user) => orderLoader.load(user.id)
  }
};
```

---

### Detection

```javascript
// Prisma logging se detect karo
const prisma = new PrismaClient({
  log: ['query']  // Console pe saari queries dikhegi
});
// Ek request pe 50+ queries? N+1 hai pakka!
```

| Approach | Queries | Best For |
|---|---|---|
| N+1 (bad) | 1 + N | Never! |
| JOIN | 1 | Simple 1:N |
| 2-query batch | 2 | Complex outputs |
| Prisma include | 1-2 | ORM projects |
| DataLoader | 2 + cache | GraphQL APIs |

---

## 6. Pagination Strategies

> **Definition (English):** Pagination is the technique of retrieving large datasets in smaller chunks/pages instead of fetching everything at once.

> **Hinglish:** 10 million products ek saath mat laao — page by page laao. Do main strategies hain: OFFSET/LIMIT (simple but slow) aur Cursor-based (fast, production-ready).

---

### Strategy 1: OFFSET/LIMIT — Simple but Slow

```sql
-- Basic pagination
SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 0;   -- Page 1
SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 20;  -- Page 2
SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 40;  -- Page 3

-- ❌ Problem: OFFSET bahut slow hai large pages pe!
SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 100000;
-- DB ko 100,000 rows skip karni padti hain pehle, THEN 20 return karta hai!
-- 10 million rows mein: Very slow!
```

```javascript
// Node.js OFFSET/LIMIT
app.get('/posts', async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const posts = await db.query(
    'SELECT * FROM posts ORDER BY id DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const total = await db.query('SELECT COUNT(*) FROM posts');

  res.json({
    data: posts.rows,
    page,
    totalPages: Math.ceil(total.rows[0].count / limit),
    total: total.rows[0].count
  });
});
```

---

### Strategy 2: Cursor-Based Pagination — Production Ready

> **Definition (English):** Instead of skipping rows, use the last seen item's ID or timestamp as a cursor to fetch the next page. Always fast regardless of page number.

> **Hinglish:** "Last item ka ID yaad rakho, next request mein us ID ke baad wale lo." Skip karna nahi padta — always fast!

```sql
-- ✅ Cursor-based: Last seen id ke baad wale lo
-- First page:
SELECT * FROM posts ORDER BY id DESC LIMIT 20;
-- Returns: ids 1000, 999, 998...981

-- Next page (cursor = 981):
SELECT * FROM posts
WHERE id < 981          -- Last seen id
ORDER BY id DESC
LIMIT 20;
-- Returns: 980, 979...961

-- Hamesha fast! Skip karna nahi — seedha jump karta hai index se
```

```javascript
// Node.js Cursor-based pagination
app.get('/posts', async (req, res) => {
  const limit  = parseInt(req.query.limit)  || 20;
  const cursor = req.query.cursor;  // Last seen post id

  let query, params;

  if (cursor) {
    query  = 'SELECT * FROM posts WHERE id < $1 ORDER BY id DESC LIMIT $2';
    params = [cursor, limit];
  } else {
    query  = 'SELECT * FROM posts ORDER BY id DESC LIMIT $1';
    params = [limit];
  }

  const posts = await db.query(query, params);
  const lastPost = posts.rows[posts.rows.length - 1];

  res.json({
    data: posts.rows,
    nextCursor: lastPost ? lastPost.id : null,  // Client next request mein bhejega
    hasMore: posts.rows.length === limit
  });
});

// Frontend:
// GET /posts → {data: [...], nextCursor: "981"}
// GET /posts?cursor=981 → {data: [...], nextCursor: "961"}
// GET /posts?cursor=961 → {data: [...], nextCursor: null}  ← End!
```

---

### Timestamp-Based Cursor (created_at pe)

```javascript
// Timestamps ke saath cursor pagination
app.get('/feed', async (req, res) => {
  const cursor = req.query.cursor
    ? new Date(req.query.cursor)
    : new Date();  // Default: from now

  const posts = await db.query(`
    SELECT * FROM posts
    WHERE created_at < $1
    ORDER BY created_at DESC
    LIMIT $2
  `, [cursor, 20]);

  const last = posts.rows[posts.rows.length - 1];

  res.json({
    data: posts.rows,
    nextCursor: last ? last.created_at.toISOString() : null
  });
});
```

---

### Comparison

| Feature | OFFSET/LIMIT | Cursor-based |
|---|---|---|
| **Simplicity** | Simple ✅ | Slightly complex |
| **Performance at page 1** | Fast | Fast |
| **Performance at page 1000** | Slow ❌ | Always fast ✅ |
| **Random page access** | Yes ✅ | No ❌ |
| **Consistent results** | No (new data shifts pages) | Yes ✅ |
| **Best for** | Admin panels, small data | Feeds, infinite scroll |

> 💡 **Interview Tip:** "OFFSET/LIMIT deep pages pe slow hai — DB rows skip karta hai. Cursor-based production ke liye better — Instagram, Twitter, Facebook sab cursor pagination use karte hain. Tradeoff: Random page access nahi hota cursor mein."

---

## 7. CTEs & Window Functions

> **Definition (English):** CTEs (Common Table Expressions) let you define named temporary result sets using the WITH clause. Window Functions perform calculations across related rows without collapsing them.

> **Hinglish:** CTE = SQL ke andar ek named temporary query. Window Function = GROUP BY ki tarah calculations karo lekin rows collapse mat karo. GROUP BY: 100 rows → 5 rows. Window: 100 rows → 100 rows (extra column add hota hai).

---

### CTEs — WITH Clause

#### Basic CTE

```sql
-- Syntax:
WITH cte_name AS (
  SELECT ...
)
SELECT * FROM cte_name WHERE ...;

-- Example: Monthly revenue > 10000
WITH monthly_revenue AS (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(total)                       AS revenue,
    COUNT(*)                         AS order_count
  FROM orders
  WHERE status = 'completed'
  GROUP BY 1
)
SELECT month, revenue, order_count
FROM monthly_revenue
WHERE revenue > 10000
ORDER BY month;
```

#### Multiple CTEs — Step by Step

```sql
-- Business problem: Top 5 cities by revenue, last 6 months
WITH
  recent_orders AS (
    SELECT o.id, o.total, c.city
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.created_at >= NOW() - INTERVAL '6 months'
      AND o.status = 'completed'
  ),

  city_revenue AS (
    SELECT city, SUM(total) AS revenue, COUNT(*) AS orders
    FROM recent_orders
    GROUP BY city
  ),

  ranked_cities AS (
    SELECT city, revenue, orders,
           RANK() OVER (ORDER BY revenue DESC) AS rank
    FROM city_revenue
  )

SELECT * FROM ranked_cities WHERE rank <= 5;
```

#### Recursive CTE — Hierarchy/Tree Data

```sql
-- Org chart: employee → manager hierarchy
WITH RECURSIVE org_tree AS (
  -- Base case: CEO (no manager)
  SELECT id, name, manager_id, 0 AS level, name::TEXT AS path
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- Recursive: Each employee's reports
  SELECT e.id, e.name, e.manager_id,
         ot.level + 1,
         ot.path || ' → ' || e.name
  FROM employees e
  JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT name, level, path FROM org_tree ORDER BY path;

-- Result:
-- Aakash (CEO)           | level 0
-- Aakash → Priya         | level 1
-- Aakash → Priya → Dev   | level 2
```

---

### Window Functions

```sql
-- Syntax:
SELECT
  column1,
  WINDOW_FUNCTION() OVER (
    PARTITION BY group_col   -- Optional: GROUP BY jaisa
    ORDER BY sort_col        -- Optional: Sort within partition
    ROWS BETWEEN n PRECEDING AND CURRENT ROW  -- Optional: Frame
  ) AS computed_col
FROM table;
```

#### ROW_NUMBER, RANK, DENSE_RANK

```sql
SELECT
  name, department, salary,
  ROW_NUMBER()  OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
  RANK()        OVER (PARTITION BY department ORDER BY salary DESC) AS rank,
  DENSE_RANK()  OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rank
FROM employees;

-- Result (Engineering dept):
-- Name    | Salary | ROW_NUM | RANK | DENSE_RANK
-- Rahul   | 90000  |    1    |  1   |     1
-- Priya   | 80000  |    2    |  2   |     2
-- Dev     | 80000  |    3    |  2   |     2     ← Tie!
-- Aakash  | 70000  |    4    |  4   |     3     ← RANK skips 3, DENSE_RANK nahi

-- Common Interview Question: "Top earner per department"
SELECT * FROM (
  SELECT *,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk
  FROM employees
) ranked
WHERE rnk = 1;
```

#### LAG and LEAD — Previous/Next Row

```sql
-- Month-over-month revenue growth
SELECT
  month,
  revenue,
  LAG(revenue)  OVER (ORDER BY month) AS prev_month,
  revenue - LAG(revenue) OVER (ORDER BY month) AS growth,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month))
    / LAG(revenue) OVER (ORDER BY month) * 100, 2
  ) AS growth_pct
FROM monthly_revenue;

-- LEAD: Next row ka value
SELECT
  order_id, customer_id, created_at,
  LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at)
    AS next_order_date
FROM orders;
-- Use: Days between consecutive orders (retention analysis)
```

#### Running Total & Moving Average

```sql
-- Running total
SELECT
  order_date, daily_revenue,
  SUM(daily_revenue) OVER (ORDER BY order_date) AS running_total
FROM daily_stats;

-- 7-day moving average
SELECT
  order_date, daily_revenue,
  AVG(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d
FROM daily_stats;

-- % of total per row
SELECT
  product_name, revenue,
  ROUND(revenue / SUM(revenue) OVER () * 100, 2) AS pct_of_total
FROM product_revenue;
```

> 💡 **Interview Tip:** "Har user ka latest order nikalo" → `ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)` then `WHERE row_num = 1`. CTE ke saath combine karo complex analytics ke liye.

---

## 8. Isolation Levels

> **Definition (English):** Isolation levels define how much of one transaction's intermediate state is visible to other concurrent transactions. Higher isolation = safer but slower.

> **Hinglish:** ACID ka 'I' (Isolation) ek spectrum hai. Strict isolation = safe but slow. Loose isolation = fast but dirty data ka risk. Teen anomalies samjhna zaroori hai.

---

### 3 Read Anomalies

#### Dirty Read

```sql
-- Transaction A:
BEGIN;
UPDATE accounts SET balance = 5000 WHERE id = 1;  -- NOT committed!

-- Transaction B (same time):
SELECT balance FROM accounts WHERE id = 1;
-- Dirty Read: 5000 dikhega (A ka uncommitted value)
-- But A will ROLLBACK → balance kabhi 5000 tha hi nahi!
-- B ne wrong data pe decision liya!
```

#### Non-Repeatable Read

```sql
-- Transaction A:
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Returns 1000
-- (Meanwhile B commits: UPDATE balance = 2000)
SELECT balance FROM accounts WHERE id = 1;  -- Returns 2000!
-- Same transaction, same query, DIFFERENT result!
COMMIT;
```

#### Phantom Read

```sql
-- Transaction A:
BEGIN;
SELECT COUNT(*) FROM orders WHERE user_id = 1;  -- Returns 5
-- (Meanwhile B inserts new order for user_id=1 and commits)
SELECT COUNT(*) FROM orders WHERE user_id = 1;  -- Returns 6! (Phantom!)
COMMIT;
```

---

### 4 Isolation Levels

| Level | Dirty Read | Non-Repeatable | Phantom | Speed |
|---|---|---|---|---|
| **Read Uncommitted** | Possible ❌ | Possible ❌ | Possible ❌ | Fastest |
| **Read Committed** *(PG default)* | Prevented ✅ | Possible ❌ | Possible ❌ | Fast |
| **Repeatable Read** *(MySQL default)* | Prevented ✅ | Prevented ✅ | Possible ❌ | Medium |
| **Serializable** | Prevented ✅ | Prevented ✅ | Prevented ✅ | Slowest |

```sql
-- Set isolation level:
BEGIN;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;    -- PG default
-- SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- your queries...
COMMIT;
```

```javascript
// Node.js with Prisma
const result = await prisma.$transaction(
  async (tx) => {
    // your operations
  },
  {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable
  }
);

// pg (node-postgres)
const client = await pool.connect();
await client.query('BEGIN');
await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
// operations...
await client.query('COMMIT');
```

---

### When to Use Which Level

```
Read Uncommitted: Almost never in production
  (Only approximate analytics dashboards)

Read Committed: Most web apps — e-commerce, social media, APIs
  (PostgreSQL default — good balance)

Repeatable Read: Financial reports, inventory checks
  ("Same query same result throughout transaction")

Serializable: Banking, critical financial transfers
  ("Full isolation — no anomalies at all")
```

> 💡 **Interview Tip:** "Dirty reads, phantom reads, non-repeatable reads examples ke saath explain karo. PostgreSQL default = Read Committed. Bank transfers = Serializable. Table yaad rakho aur real use case bolo har level ke liye."

---

## 9. Locking & Deadlocks

> **Definition (English):** Locks prevent concurrent transactions from interfering with each other. A deadlock occurs when two transactions wait for each other to release locks — indefinitely.

> **Hinglish:** Transaction A ne Row1 lock kiya, Row2 ka wait kar raha hai. Transaction B ne Row2 lock kiya, Row1 ka wait kar raha hai. Dono forever wait karenge — yahi Deadlock. DB detect karta hai aur ek ko kill kar deta hai.

---

### Types of Locks

```sql
-- Shared Lock (Read Lock): Multiple readers ok
SELECT * FROM products WHERE id = 1;  -- Implicit shared lock

-- Exclusive Lock (Write Lock): Sirf ek writer
UPDATE products SET price = 999 WHERE id = 1;  -- Exclusive lock

-- Row-level vs Table-level:
UPDATE products SET qty = qty - 1 WHERE id = 5;  -- Row 5 only lock ✅
LOCK TABLE products IN EXCLUSIVE MODE;           -- Entire table ❌ (avoid)
```

---

### Pessimistic Locking — "Pehle Lock Karo"

> **Definition:** Assume karo conflict hoga — pehle lock karo, phir kaam karo. `SELECT FOR UPDATE` use karta hai.

> **Hinglish:** "Mujhe sure pata hai doosra bhi yeh row change karna chahega — toh main pehle lock kar leta hoon." Inventory systems mein common.

```sql
-- SELECT FOR UPDATE
BEGIN;

SELECT * FROM inventory
WHERE product_id = 1
FOR UPDATE;   -- Row locked! Koi aur ab lock nahi kar sakta

UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 1;

COMMIT;  -- Lock release
```

```javascript
// Node.js pessimistic locking
const client = await pool.connect();
try {
  await client.query('BEGIN');

  const { rows } = await client.query(
    'SELECT * FROM inventory WHERE product_id = $1 FOR UPDATE',
    [productId]
  );

  if (rows[0].quantity < 1) throw new Error('Out of stock');

  await client.query(
    'UPDATE inventory SET quantity = quantity - 1 WHERE product_id = $1',
    [productId]
  );

  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

---

### Optimistic Locking — "Assume No Conflict"

> **Definition:** Assume karo conflict nahi hoga — directly update karo, lekin save karte waqt version check karo.

> **Hinglish:** "Mujhe nahi lagta koi change karega — but save karte waqt version check karo. Mismatch? Retry karo." Low contention scenarios ke liye fast.

```sql
-- Version column add karo
ALTER TABLE products ADD COLUMN version INT DEFAULT 1;

-- Update with version check
UPDATE products
SET price = 999, version = version + 1
WHERE id = 1 AND version = 5;  -- Version match zaroori!

-- 0 rows updated → conflict! Someone else changed it → retry
```

```javascript
// Node.js optimistic locking with retry
async function updatePrice(productId, newPrice, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const { rows } = await db.query(
      'SELECT id, price, version FROM products WHERE id = $1',
      [productId]
    );
    const product = rows[0];

    const result = await db.query(
      `UPDATE products
       SET price = $1, version = version + 1
       WHERE id = $2 AND version = $3`,
      [newPrice, productId, product.version]
    );

    if (result.rowCount === 1) return { success: true };

    console.log(`Conflict on attempt ${attempt + 1}, retrying...`);
  }
  throw new Error('Could not update after retries');
}
```

---

### Deadlock — Kaise Hota Hai

```
Transaction A:                    Transaction B:
LOCK Row(id=1)                   LOCK Row(id=2)
  ↓                                 ↓
Wait for Row(id=2) ←→ Wait for Row(id=1)
         ↑_________Deadlock!_________↑

PostgreSQL auto-detect karta hai:
ERROR: deadlock detected
DETAIL: Process 1234 waits for ShareLock on transaction 5678
```

---

### Deadlock Prevention

```javascript
// ✅ Fix 1: Always same order mein lock karo (most important!)
async function transfer(fromId, toId, amount) {
  // Always lock smaller ID first — consistent order!
  const ids = [fromId, toId].sort((a, b) => a - b);

  await client.query('BEGIN');

  // Dono rows ek saath, same order mein lock karo
  await client.query(
    'SELECT * FROM accounts WHERE id = ANY($1) ORDER BY id FOR UPDATE',
    [ids]
  );

  await client.query(
    'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
    [amount, fromId]
  );
  await client.query(
    'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
    [amount, toId]
  );

  await client.query('COMMIT');
}
```

```sql
-- ✅ Fix 2: Lock timeout set karo
SET lock_timeout = '5s';  -- 5s mein lock nahi mila → error

-- ✅ Fix 3: NOWAIT — immediately fail
SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;
-- Agar locked → immediately ERROR (wait nahi karega)

-- ✅ Fix 4: SKIP LOCKED — job queues ke liye
SELECT * FROM job_queue
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;  -- Locked rows skip karo, next available lo
-- Multiple workers ek hi job pe nahi ladenge!
```

```sql
-- Deadlock detect karo
SELECT
  blocked.pid         AS blocked_pid,
  blocked.query       AS blocked_query,
  blocking.pid        AS blocking_pid,
  blocking.query      AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid));
```

---

### Pessimistic vs Optimistic

| | Pessimistic | Optimistic |
|---|---|---|
| **Approach** | Lock first, then work | Work first, check on save |
| **Performance** | Slow (waiting) | Fast (no waiting) |
| **Best for** | High contention | Low contention |
| **Risk** | Deadlocks | Retry storms |
| **Use case** | Bank transfers, inventory | Profile updates, posts |

> 💡 **Interview Tip:** "Deadlock prevent karne ka best answer: Always acquire locks in consistent order. SKIP LOCKED job queues ke liye. Optimistic locking low-contention scenarios mein faster hai — version column use karo."

---

# Part B — Databases & Architecture

---

## 10. SQL vs NoSQL

> **Definition (English):** SQL databases store data in structured tables with fixed schemas and support complex relationships. NoSQL databases use flexible data models (documents, key-value, graph) optimized for specific access patterns.

> **Hinglish:** SQL = Excel ki tarah — rows, columns, fixed structure, relationships. NoSQL = JSON ki tarah — flexible, schema-less. Dono tools hain — use case dekho, right tool choose karo.

---

### SQL — PostgreSQL, MySQL

```sql
-- Structured, relational, ACID guarantees
CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE orders (
  id      SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),  -- Foreign key relationship
  total   DECIMAL,
  status  TEXT
);

-- Complex queries with JOINs
SELECT u.name, SUM(o.total) as lifetime_value
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
GROUP BY u.id
HAVING SUM(o.total) > 10000;
```

**Kab use karo SQL:**
- Relationships hain (users → orders → products)
- ACID transactions chahiye (banking, payments)
- Complex queries, JOINs, aggregations
- Schema well-defined aur stable hai

---

### NoSQL — MongoDB, Redis, Cassandra

```javascript
// MongoDB — Flexible JSON documents
{
  _id: ObjectId("..."),
  name: "Rahul",
  address: { city: "Hyderabad", pin: "500001" },  // Nested!
  tags: ["premium", "active"],                      // Array!
  orders: [...]                                     // Embedded!
}

// Redis — Ultra-fast key-value
await redis.setex('session:user123', 3600, JSON.stringify(data));
await redis.zadd('leaderboard', { score: 1000, member: 'Rahul' });
```

**Kab use karo NoSQL:**
- Flexible/dynamic schema chahiye
- Horizontal scaling important hai
- Specific access patterns ke liye optimize (time-series, graphs)
- High write throughput (logs, events, metrics)

---

### When to Use What

```
PostgreSQL:
  ✅ Financial data, banking, payments
  ✅ User accounts, orders, products
  ✅ Complex relationships and JOINs
  ✅ Data integrity critical
  ✅ Reporting and analytics

MongoDB:
  ✅ Product catalogs (varying attributes)
  ✅ CMS, blogs, content
  ✅ User activity logs
  ✅ Real-time analytics
  ✅ Hierarchical/nested data

Redis:
  ✅ Session storage
  ✅ API response caching
  ✅ Rate limiting
  ✅ Leaderboards (sorted sets)
  ✅ Pub/Sub messaging
  ✅ Job queues
```

```javascript
// Real-world: Teen dono saath use karo!
// E-commerce app:

// PostgreSQL: Users, Orders, Payments (ACID needed)
const order = await postgresPool.query(
  'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
  [userId, total]
);

// MongoDB: Product catalog (flexible — products vary a lot)
const product = await mongoDb.collection('products').findOne({
  _id: productId,
  category: 'electronics'
});
// Electronics: {specs: {ram: '16GB', storage: '512GB'}}
// Clothing: {specs: {size: 'M', material: 'Cotton'}}
// Different attributes → MongoDB perfect!

// Redis: Cart, Sessions, Cache
await redis.setex(`cart:${userId}`, 86400, JSON.stringify(cartItems));
await redis.setex(`session:${token}`, 3600, JSON.stringify(user));
```

| Feature | PostgreSQL | MongoDB | Redis |
|---|---|---|---|
| Data Model | Relational tables | JSON documents | Key-Value |
| Schema | Fixed (strict) | Flexible | None |
| ACID | Full ✅ | Single-doc only | No |
| JOINs | Yes ✅ | $lookup (limited) | No |
| Speed | Fast | Fast | Ultra-fast ⚡ |
| Best For | Core app data | Catalogs, CMS | Cache, sessions |

> 💡 **Interview Answer:** "Use case pe depend karta hai. PostgreSQL for transactional/relational data, MongoDB for flexible document storage, Redis for caching and sessions. Production mein typically sab teeno saath use karte hain."

---

## 11. Redis / Caching

> **Definition (English):** Redis is an in-memory data structure store used for caching, sessions, pub/sub, and rate limiting. Caching stores frequently accessed data in fast memory to reduce database load.

> **Hinglish:** DB pe baar baar mat ja — answer Redis mein cache kar do. Ghar mein fridge hai (Redis), bazaar hai (DB). Pehle fridge check karo. Nahi mila toh bazaar jao, wapas aakar fridge mein rakh do.

---

### Cache-Aside (Lazy Loading) — Most Common

```javascript
async function getUserById(userId) {
  const cacheKey = `user:${userId}`;

  // Step 1: Redis check karo
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);  // Cache HIT ✅
  }

  // Step 2: Cache miss → DB se lo
  const user = await db.query(
    'SELECT * FROM users WHERE id = $1', [userId]
  );

  // Step 3: Cache mein daalo (TTL = 1 hour)
  await redis.setex(cacheKey, 3600, JSON.stringify(user.rows[0]));

  return user.rows[0];
}
```

---

### Write-Through — Write Cache + DB Together

```javascript
async function updateUser(userId, data) {
  // Step 1: DB update karo
  const updatedUser = await db.query(
    'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *',
    [data.name, data.email, userId]
  );

  // Step 2: Cache bhi immediately update karo
  await redis.setex(
    `user:${userId}`,
    3600,
    JSON.stringify(updatedUser.rows[0])
  );

  return updatedUser.rows[0];
}
// Pros: Cache always fresh
// Cons: Write thodi slow, unnecessary data cache ho sakta hai
```

---

### Write-Behind (Async DB Write)

```javascript
async function updateUserAsync(userId, data) {
  // Cache mein immediately likho (fast response!)
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(data));

  // DB update queue mein daalo (async)
  await messageQueue.publish('user-updates', { userId, data });

  return data;
}

// Background worker:
messageQueue.subscribe('user-updates', async ({ userId, data }) => {
  await db.query('UPDATE users SET name=$1 WHERE id=$2', [data.name, userId]);
});
// Pros: Fastest writes
// Cons: Data loss risk if cache fails before DB write
```

---

### TTL (Time-To-Live)

```javascript
// Different TTLs for different data
await redis.setex('user:1',            3600,  userData);     // 1 hour
await redis.setex('session:abc',       86400, sessionData);  // 24 hours
await redis.setex('otp:9876543210',    300,   '456789');      // 5 minutes
await redis.setex('rate:ip:1.2.3.4',  60,    '10');          // 1 minute
await redis.setex('product:catalog',  86400, products);      // 24 hours

// TTL check karo
const ttl = await redis.ttl('user:1');
console.log(`Expires in ${ttl} seconds`);

// Reset TTL (sliding expiry — active sessions ke liye)
await redis.expire('session:abc', 86400);
```

---

### Cache Invalidation

> **Definition (English):** Removing or updating stale cache entries when underlying data changes. One of the hardest problems in computing.

```javascript
// Strategy 1: Delete on Update (simplest, most common)
async function updateUserProfile(userId, data) {
  await db.query('UPDATE users SET ... WHERE id = $1', [userId]);
  await redis.del(`user:${userId}`);  // Cache delete → next request fresh data fetch karega
}

// Strategy 2: Pattern-based invalidation (SCAN use karo, not KEYS!)
async function invalidateUserCache(userId) {
  let cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(
      cursor, 'MATCH', `user:${userId}:*`, 'COUNT', 100
    );
    cursor = newCursor;
    if (keys.length > 0) await redis.del(...keys);
  } while (cursor !== '0');
}

// Strategy 3: Cache versioning
// user:v3:123 → version bump = automatic invalidation
async function invalidateByVersion(entityId) {
  const version = await redis.incr(`version:user:${entityId}`);
  // Next read: new key = user:v4:123 → cache miss → fresh data
}
```

---

### Redis Data Structures

```javascript
// String — Simple cache
await redis.set('config:feature_flag', 'true');
await redis.setex('token:abc', 3600, 'user_data');

// Hash — Object efficiently store karo
await redis.hset('user:1', { name: 'Rahul', email: 'r@g.com', plan: 'premium' });
const name = await redis.hget('user:1', 'name');
const user = await redis.hgetall('user:1');

// List — Queue, recent activity
await redis.lpush('recent:user:1', 'product:5');
await redis.ltrim('recent:user:1', 0, 9);  // Last 10 only
const recent = await redis.lrange('recent:user:1', 0, -1);

// Set — Unique values
await redis.sadd('online:users', userId);
const isOnline = await redis.sismember('online:users', userId);

// Sorted Set — Leaderboards
await redis.zadd('leaderboard', { score: 1000, member: 'Rahul' });
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');

// Rate Limiting
async function rateLimiter(ip, limit = 100, windowSecs = 60) {
  const key = `rate:${ip}`;
  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, windowSecs);
  if (current > limit) throw new Error('Rate limit exceeded');
  return current;
}
```

| Strategy | Pros | Cons | Use When |
|---|---|---|---|
| **Cache-Aside** | Simple, cache only needed data | Cold start slow, stale possible | Most use cases |
| **Write-Through** | Always fresh | Slower writes, extra cache | High read consistency needed |
| **Write-Behind** | Fastest writes | Data loss risk | High write throughput |

> 💡 **Interview Tip:** "Cache invalidation is one of the hardest problems. Delete-on-write pattern use karta hoon. TTL as safety net (even stale cache eventually expires). Sensitive data like passwords kabhi cache mat karo."

---

## 12. MongoDB / Document DB

> **Definition (English):** MongoDB is a NoSQL document database storing data as BSON (Binary JSON) documents. Schema-less, horizontally scalable, great for hierarchical and nested data.

> **Hinglish:** MongoDB = JSON wala database. Har row ek JSON document hai. Schema fix nahi — ek document mein 5 fields, doosre mein 20 — koi problem nahi. Product catalogs, CMS, user activity logs ke liye perfect.

---

### Embedding vs Referencing

#### Embedding — Ek Document Mein Sab

```javascript
// ✅ Good for: 1:1, 1:few, data ek saath access hota hai
{
  _id: ObjectId("u1"),
  name: "Rahul Sharma",
  email: "rahul@gmail.com",
  // Address embedded — hamesha user ke saath access hota hai
  address: {
    street: "123 MG Road",
    city: "Hyderabad",
    pincode: "500001"
  },
  // Social links embedded — few items, rarely change
  social: { twitter: "@rahul", linkedin: "rahul-sharma" }
}

// Single query mein sab:
const user = await db.collection('users').findOne({ _id: userId });
console.log(user.address.city);  // Direct access, no JOIN!
```

#### Referencing — Alag Collections, IDs se Link

```javascript
// ✅ Good for: 1:Many, data independently accessed, documents unbounded grow kar sakte
// users collection
{ _id: ObjectId("u1"), name: "Rahul" }

// orders collection (separate)
{
  _id: ObjectId("o1"),
  userId: ObjectId("u1"),   // Reference to user
  total: 1299,
  status: "completed",
  createdAt: new Date()
}

// Manual populate (2 queries)
const user = await db.collection('users').findOne({ _id: userId });
const orders = await db.collection('orders')
  .find({ userId: userId }).toArray();
```

#### Decision Guide

```
Embed karo jab:                      Reference karo jab:
✅ Ek saath read hota hai             ✅ Alag alag access hota hai
✅ 1:1 ya 1:few relationship          ✅ 1:Many ya Many:Many
✅ Data rarely update hota hai        ✅ Data frequently update hota hai
✅ Sub-documents < handful            ✅ Documents unlimited grow kar sakte
✅ Read performance priority          ✅ Write performance priority

Rule: "Ek saath read? Embed. Alag access? Reference."
MongoDB 16MB per document limit — unbounded arrays ke liye reference!
```

---

### Aggregation Pipeline

> **Definition (English):** A sequence of stages where each stage transforms documents. Combines SQL's GROUP BY, JOIN, WHERE, and ORDER BY in a pipeline format.

```javascript
// Common stages:
// $match   → SQL WHERE
// $group   → SQL GROUP BY + aggregation
// $sort    → SQL ORDER BY
// $limit   → SQL LIMIT
// $project → SQL SELECT (field selection)
// $lookup  → SQL JOIN
// $unwind  → Array ko individual docs mein todna
// $addFields → New computed fields add karna
```

#### Example 1: Sales Analytics

```javascript
const salesReport = await db.collection('orders').aggregate([

  // Stage 1: Last 30 days ke completed orders
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status: 'completed'
    }
  },

  // Stage 2: items array unwind karo
  { $unwind: '$items' },

  // Stage 3: Product details join karo
  {
    $lookup: {
      from: 'products',
      localField: 'items.productId',
      foreignField: '_id',
      as: 'product'
    }
  },
  { $unwind: '$product' },

  // Stage 4: Category se group karo
  {
    $group: {
      _id: '$product.category',
      totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
      totalOrders:  { $sum: 1 }
    }
  },

  // Stage 5: Sort + limit
  { $sort: { totalRevenue: -1 } },
  { $limit: 5 },

  // Stage 6: Output format
  {
    $project: {
      category: '$_id',
      totalRevenue: { $round: ['$totalRevenue', 2] },
      totalOrders: 1,
      _id: 0
    }
  }

]).toArray();
```

#### Example 2: Top Spenders

```javascript
const loyalCustomers = await db.collection('orders').aggregate([
  { $match: { status: 'completed' } },
  {
    $group: {
      _id: '$userId',
      orderCount: { $sum: 1 },
      totalSpent: { $sum: '$total' },
      lastOrder: { $max: '$createdAt' }
    }
  },
  { $match: { orderCount: { $gte: 2 } } },
  {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user'
    }
  },
  { $unwind: '$user' },
  { $sort: { totalSpent: -1 } },
  { $limit: 10 }
]).toArray();
```

---

### MongoDB Indexes

```javascript
// Single field
await db.collection('users').createIndex({ email: 1 });

// Compound
await db.collection('orders').createIndex({ userId: 1, createdAt: -1 });

// Text search
await db.collection('products').createIndex({ name: 'text', description: 'text' });
const results = await db.collection('products').find({
  $text: { $search: "laptop gaming" }
});

// TTL index — auto delete documents
await db.collection('sessions').createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }  // Delete after 24 hours
);

// Sparse index — only index non-null values
await db.collection('users').createIndex(
  { phoneNumber: 1 },
  { sparse: true }  // Users without phone nahi aayenge index mein
);
```

> 💡 **Interview Tip:** "Embed vs Reference ka decision access pattern pe — ek saath read? Embed. Alag access? Reference. 16MB limit hai — unbounded arrays reference karo. Aggregation pipeline = MongoDB ka superpower for analytics."

---

## 13. CAP Theorem

> **Definition (English):** CAP Theorem states that a distributed database can only guarantee 2 out of 3 properties: Consistency, Availability, and Partition Tolerance — never all three simultaneously.

> **Hinglish:** Distributed system mein network failures hoti HAIN — Partition Tolerance compulsory hai. Toh real choice sirf C ya A ke beech hai. Teen mein se sirf do — yahi CAP Theorem hai.

---

### The 3 Properties

```
C — Consistency:
  Har node pe same time pe same data dikhega.
  Read = Latest committed write ka data.
  Example: Rahul ne balance 2000 kiya → Priya turant 2000 dekhe (not 1000).

A — Availability:
  Har request ka response milega — chahe kuch nodes down hon.
  System kabhi "503 Service Unavailable" nahi dega.
  Response data thoda purana (stale) ho sakta hai.

P — Partition Tolerance:
  Network partition (nodes communicate nahi kar pa rahe) ke bawajood
  system kaam karta rahe.
  Real world mein network failures HOTI HAIN — P is NOT optional!
```

---

### Why P is Mandatory

```
Distributed system = Multiple servers/data centers
Network kabhi 100% reliable nahi → Partitions hote HAIN:
  - Network cable cuts
  - Router failures
  - Data center outages
  - Cross-region drops

Agar P choose nahi kiya → network failure pe poora system down!
Practical distributed system = P always included.

Real choice: CP (Consistent) OR AP (Available)
```

---

### CP vs AP

```javascript
// CP Systems — Consistency + Partition Tolerance
// Bank, inventory, auth systems
// Network partition pe: system UNAVAILABLE ho sakta hai
// But: Data consistent guarantee

// MongoDB (strong consistency)
await db.collection('accounts').updateOne(
  { _id: accountId },
  { $set: { balance: newBalance } },
  { writeConcern: { w: 'majority', j: true } }
  // Most replicas confirm karo → consistent
);

// PostgreSQL (always CP — single node or sync replication)
await client.query('BEGIN');
await client.query('UPDATE accounts SET balance=$1 WHERE id=$2', [2000, 1]);
await client.query('COMMIT');
```

```javascript
// AP Systems — Availability + Partition Tolerance
// Social media, analytics, recommendations
// Network partition pe: system still responds
// But: Data thoda stale ho sakta hai (eventually consistent)

// Cassandra — AP (eventual consistency)
await cassandraClient.execute(
  'UPDATE user_feeds SET posts = posts + ? WHERE user_id = ?',
  [newPost, userId],
  { consistency: cassandra.types.consistencies.one }
  // ONE node confirm kare — fast but less consistent
);
```

---

### Real Database Choices

| Database | Type | Why |
|---|---|---|
| PostgreSQL | CA (single) / CP (distributed) | Full consistency |
| MongoDB | CP (default) | Consistent reads, flexible schema |
| Cassandra | AP | Always available, eventually consistent |
| Redis (cluster) | CP | Consistent cache |
| DynamoDB | AP (configurable) | Always available, global scale |

```
Use CP when:
  ✅ Financial data (bank balance, payments)
  ✅ Inventory (prevent overselling)
  ✅ Authentication/authorization

Use AP when:
  ✅ Social media feeds (few seconds stale = okay)
  ✅ Analytics dashboards (approximate fine)
  ✅ Product recommendations
  ✅ Shopping cart (availability > perfect consistency)
```

> 💡 **Interview Tip:** "P is mandatory in distributed systems — real choice is C vs A. Banks need CP, social media can use AP (eventual consistency). PACELC theorem bhi mention kar sakte ho — latency vs consistency tradeoff even without partition."

---

## 14. Replication

> **Definition (English):** Replication is copying and maintaining database data across multiple servers to improve availability, fault tolerance, and read performance.

> **Hinglish:** DB ki copy banao multiple servers pe. Primary pe sab kuch hota hai (reads + writes). Replicas mein copy rehti hai (sirf reads). Primary down? Replica promote ho jaata hai. Zyada read traffic? Replicas pe baanto.

---

### Architecture

```
                    ┌─────────────────┐
  All WRITES  ───→  │    PRIMARY       │ ──→ WAL (change log)
                    └─────────────────┘         ↓
                                          ┌─────┴──────┐
                                          ↓            ↓
                                   ┌──────────┐  ┌──────────┐
           READS (distributed) ──→ │ REPLICA 1│  │ REPLICA 2│
                                   └──────────┘  └──────────┘
```

---

### Synchronous vs Asynchronous Replication

```sql
-- Synchronous: Primary waits for replica confirm (zero data loss, slower writes)
-- postgresql.conf:
synchronous_commit = on
synchronous_standby_names = 'replica1'

-- Asynchronous: Primary doesn't wait (faster writes, small replication lag)
synchronous_commit = off  -- default

-- Replication lag check:
SELECT
  client_addr,
  state,
  (sent_lsn - replay_lsn) AS replication_lag_bytes
FROM pg_stat_replication;
```

---

### Read/Write Split — Node.js

```javascript
// TypeORM read/write split
const dataSource = new DataSource({
  type: 'postgres',
  replication: {
    master: { host: 'primary-db.internal', ... },
    slaves: [
      { host: 'replica1.internal', ... },
      { host: 'replica2.internal', ... }
    ]
  }
});

// Writes → primary automatically
await userRepository.save(newUser);

// Reads → replica automatically
const users = await userRepository.find({ where: { plan: 'premium' } });

// Manual split:
const writePool = new Pool({ host: 'primary-db.internal', ...config });
const readPool  = new Pool({ host: 'replica-db.internal', ...config });

async function createUser(data) {
  return writePool.query('INSERT INTO users ... RETURNING *', [...]);
}
async function getUsers() {
  return readPool.query('SELECT * FROM users WHERE ...', [...]);
}
```

---

### Replication Lag Problem & Solution

```javascript
// Problem: Write kiya primary pe → immediately replica se padha → PURANA DATA!

// Solution: Read-your-writes pattern
async function updateAndRead(userId, data) {
  await writePool.query('UPDATE users SET name=$1 WHERE id=$2', [data.name, userId]);

  // Flag: "yeh user abhi abhi write kiya"
  await redis.setex(`read-primary:${userId}`, 10, '1');  // 10 seconds
}

async function getUser(userId) {
  const justWrote = await redis.get(`read-primary:${userId}`);
  const pool = justWrote ? writePool : readPool;  // Primary ya replica
  return pool.query('SELECT * FROM users WHERE id=$1', [userId]);
}
```

---

### Failover

```sql
-- Manual failover: Replica ko primary banao
SELECT pg_promote();  -- PostgreSQL command on replica

-- Health check
SELECT pg_is_in_recovery();  -- false = primary, true = replica
SELECT * FROM pg_stat_replication;  -- Primary pe replica status

-- Automatic failover: Patroni (PostgreSQL), MHA (MySQL), RDS Multi-AZ (AWS)
```

> 💡 **Interview Tip:** "Read replicas se read load baantna, primary pe sirf writes. Replication lag ke liye read-your-writes pattern. Failover ke liye Patroni ya AWS RDS Multi-AZ use karta hoon. Synchronous replication — zero data loss but slower writes."

---

## 15. Sharding

> **Definition (English):** Sharding is horizontal partitioning where data is split across multiple database servers (shards) based on a shard key. Each shard holds a subset of the total data.

> **Hinglish:** Ek machine pe bahut zyada data — kya karo? Data ko cut karo aur alag alag machines pe rakho. Machine 1: Users A-M, Machine 2: Users N-Z. Yahi Sharding hai. Vertical scaling (bigger machine) ka limit hai — horizontal scaling (more machines) unlimited hai.

---

### Sharding Strategies

#### Range-Based Sharding

```javascript
// User ID range pe shard karo
// Shard 1: user_id 1–1,000,000
// Shard 2: user_id 1,000,001–2,000,000
// Shard 3: user_id 2,000,001+

function getShardForUser(userId) {
  if (userId <= 1_000_000) return 'shard1';
  if (userId <= 2_000_000) return 'shard2';
  return 'shard3';
}

// Pros: Range queries fast (WHERE id BETWEEN 1 AND 1000)
// Cons: Hotspot! Naye users sab last shard pe → uneven load
```

#### Hash-Based Sharding

```javascript
const crypto = require('crypto');

function getShardByHash(userId, totalShards = 3) {
  const hash = crypto.createHash('md5').update(String(userId)).digest('hex');
  return `shard${parseInt(hash.substring(0, 8), 16) % totalShards}`;
}

// user_id 1 → shard2
// user_id 2 → shard0
// user_id 3 → shard1
// Even distribution! No hotspot ✅

// Cons: Range queries expensive (WHERE id BETWEEN → all shards!)
```

---

### MongoDB Sharding — Built-in

```javascript
// MongoDB sharding setup
sh.enableSharding("ecommerce");

sh.shardCollection(
  "ecommerce.orders",
  { userId: 1, createdAt: 1 }  // Compound shard key
);

// Application change nahi chahiye!
// mongos (query router) automatically routes to correct shard
const orders = await db.collection('orders').find({
  userId: userId,      // Shard key present → single shard query ✅
  status: 'completed'
});
```

---

### Sharding Pitfalls

```javascript
// ❌ Bad: No shard key in query → all shards scan!
const orders = await db.collection('orders').find({
  status: 'completed'  // No shard key → broadcasts to ALL shards
});

// ✅ Good: Shard key include karo
const orders = await db.collection('orders').find({
  userId: userId,      // Shard key → single shard ✅
  status: 'completed'
});

// ❌ Hotspot shard key: created_at
// Naye data sab latest shard pe → last shard always hot!

// ✅ Good shard key criteria:
// 1. High cardinality (many unique values)
// 2. Even distribution (no hotspot)
// 3. Query-friendly (frequently used in WHERE)
```

---

### Cross-Shard Operations

```javascript
// Cross-shard JOIN (application layer pe merge karna)
async function getUserWithOrdersSharded(userId) {
  const shard = getShardForUser(userId);

  // Same shard pe (userId based sharding — user aur orders same shard pe)
  const user = await shardConnections[shard].query(
    'SELECT * FROM users WHERE id = $1', [userId]
  );
  const orders = await shardConnections[shard].query(
    'SELECT * FROM orders WHERE user_id = $1', [userId]
  );

  return { ...user.rows[0], orders: orders.rows };
}
```

> 💡 **Interview Tip:** "Shard key choice sabse critical decision. High cardinality, evenly distributed, frequently used in queries. Hotspot problem aur cross-shard queries ka complexity mention karo. MongoDB mein mongos transparent routing deta hai."

---

## 16. Connection Pooling

> **Definition (English):** Connection pooling maintains a pool of pre-established database connections that are reused across requests, eliminating the overhead of creating a new connection for every operation.

> **Hinglish:** Har HTTP request pe naya DB connection banana = expensive (50ms+). Restaurant analogy: Har customer ke liye naya chef hire mat karo — fixed staff rakho, reuse karo. Connection pool = ready connections ka group.

---

### Without vs With Pool

```
Without Pool:
  Request 1 → Create Connection (50ms) → Query (10ms) → Close (10ms)
  Request 2 → Create Connection (50ms) → Query (10ms) → Close (10ms)
  Overhead = 60ms per request × 1000 requests = 60 seconds wasted!

With Pool:
  Startup → Create 20 Connections (one time, 1 second total)
  Request 1 → Borrow Connection (0ms) → Query (10ms) → Return
  Request 2 → Borrow Connection (0ms) → Query (10ms) → Return
  Overhead ≈ 0ms per request!
```

---

### Node.js — pg Pool

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     5432,

  max:                    20,   // Max connections in pool
  min:                     5,   // Keep minimum alive
  idleTimeoutMillis:   30000,   // 30s idle → close connection
  connectionTimeoutMillis: 2000, // 2s wait for connection → error
  maxUses:              7500,   // After N uses, recreate connection
});

// Pool events
pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

// Simple query — pool auto-manages
async function getUser(userId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1', [userId]
  );
  return result.rows[0];
}

// Transaction — manual borrow/release
async function transferMoney(fromId, toId, amount) {
  const client = await pool.connect();  // Explicitly borrow
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();  // ← ALWAYS release! Otherwise connection leak!
  }
}

// Pool health check
setInterval(() => {
  console.log({
    total:   pool.totalCount,    // All connections
    idle:    pool.idleCount,     // Available connections
    waiting: pool.waitingCount   // Requests waiting for connection
  });
}, 30000);
```

---

### Pool Size Formula

```javascript
// Formula: (2 × CPU cores) + effective spindle count
// 4-core machine: 2×4 + 1 = 9 connections

// Multiple app instances (e.g., 10 Kubernetes pods):
// PostgreSQL max_connections = 100 (default)
// Pool per instance = 100 / 10 instances = 10 connections

const pool = new Pool({
  max: Math.floor(
    parseInt(process.env.PG_MAX_CONNECTIONS) /
    parseInt(process.env.APP_INSTANCES)
  )
});

// ❌ Common mistake: Too many connections
const pool = new Pool({ max: 1000 });
// PostgreSQL: 1000 connections × 10MB RAM = 10GB! Crash!
```

---

### PgBouncer — External Connection Pooler

> **Definition:** PgBouncer is a lightweight proxy that sits between application and PostgreSQL, allowing thousands of application connections to share a small number of actual database connections.

```ini
# pgbouncer.ini
[databases]
myapp = host=postgres port=5432 dbname=myapp

[pgbouncer]
pool_mode = transaction     # Recommended for stateless Node.js apps
                            # transaction = connection held only during transaction

max_client_conn = 10000     # App se max connections accept karo
default_pool_size = 50      # Actual PostgreSQL connections

listen_port = 6432          # PgBouncer port (not 5432!)
```

```javascript
// App mein PgBouncer ka address use karo
const pool = new Pool({
  host: 'pgbouncer-server',  // PgBouncer host
  port: 6432,                // PgBouncer port!
  database: 'myapp',
  max: 25                    // PgBouncer actual DB connections manage karega
});

// 10,000 app connections → PgBouncer → 50 actual DB connections ✅
```

---

### Prisma Connection Pooling

```javascript
// DATABASE_URL mein pool config:
// postgresql://user:pass@host:5432/myapp?connection_limit=20&pool_timeout=30

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Serverless (Lambda, Vercel Functions) ke liye:
// Har invocation = new connection problem!
// Solution: Prisma Accelerate ya PgBouncer
// DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

> 💡 **Interview Tip:** "Pool size = 2×CPU cores +1 per instance, divide by number of app instances. Serverless mein connection pooling problem hoti hai — Prisma Accelerate ya PgBouncer use karo. Connection leak prevent karo — always release in finally block."

---

## 17. DB Migrations

> **Definition (English):** Database migrations are version-controlled scripts that describe incremental changes to the database schema — like Git for your database schema.

> **Hinglish:** Git code ke liye kya karta hai — track karta hai kya change hua, kab, kisne kiya. Migration DB schema ke liye same kaam karta hai. Team mein sab ka DB same state mein rehta hai. Production pe carefully aur safely deploy hota hai.

---

### Why Migrations?

```
Without Migrations (Chaos!):
  Dev1: "Users table mein phone column add kiya"
  Dev2: "Mujhe pata nahi tha... API crash kar rahi hai!"
  Prod: "Manually ALTER TABLE karun? Risky!"

With Migrations (Organized!):
  migrations/
    001_create_users.sql
    002_add_phone_to_users.sql
    003_create_orders.sql
    004_add_email_index.sql
  
  Dev2 ne git pull kiya → migration run kiya → Same state ✅
  Prod pe: npx prisma migrate deploy → Tracked, versioned, safe ✅
```

---

### Prisma Migrate — Modern Way

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  phone     String?
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())
  orders    Order[]
}

enum Plan { FREE PREMIUM ENTERPRISE }

model Order {
  id         Int      @id @default(autoincrement())
  userId     Int
  user       User     @relation(fields: [userId], references: [id])
  total      Decimal
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}
```

```bash
# Development
npx prisma migrate dev --name add_phone_to_users
# Kya karta hai:
#   1. schema.prisma mein diff detect karta hai
#   2. SQL migration file generate karta hai
#   3. Migration run karta hai on dev DB
#   4. Prisma Client regenerate karta hai

# Generated file: prisma/migrations/20240115_add_phone_to_users/migration.sql
# ALTER TABLE "User" ADD COLUMN "phone" TEXT;

# Production
npx prisma migrate deploy    # Saari pending migrations run karo

# Status check
npx prisma migrate status    # Kaunsi ran, kaunsi pending

# Reset dev DB (never on production!)
npx prisma migrate reset
```

---

### Manual Up/Down Scripts

```sql
-- migrations/004_add_user_roles.sql

-- ====== UP (apply change) ======
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
CREATE INDEX idx_users_role ON users(role);

-- ====== DOWN (rollback) ======
DROP INDEX IF EXISTS idx_users_role;
ALTER TABLE users DROP COLUMN IF EXISTS permissions;
ALTER TABLE users DROP COLUMN IF EXISTS role;
```

```javascript
// Custom migration runner
const migrations = [
  {
    version: 1, name: 'create_users',
    up: `CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, created_at TIMESTAMP DEFAULT NOW())`,
    down: `DROP TABLE users`
  },
  {
    version: 2, name: 'add_phone',
    up: `ALTER TABLE users ADD COLUMN phone TEXT`,
    down: `ALTER TABLE users DROP COLUMN phone`
  }
];

async function runMigrations(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INT PRIMARY KEY,
      name    TEXT NOT NULL,
      ran_at  TIMESTAMP DEFAULT NOW()
    )
  `);

  const { rows } = await db.query('SELECT version FROM _migrations');
  const ran = new Set(rows.map(r => r.version));

  for (const m of migrations) {
    if (ran.has(m.version)) continue;

    await db.query('BEGIN');
    try {
      await db.query(m.up);
      await db.query('INSERT INTO _migrations (version, name) VALUES ($1, $2)', [m.version, m.name]);
      await db.query('COMMIT');
      console.log(`✅ Migration ${m.version}: ${m.name}`);
    } catch (err) {
      await db.query('ROLLBACK');
      throw new Error(`❌ Migration ${m.version} failed: ${err.message}`);
    }
  }
}
```

---

### Zero-Downtime Migrations — Production Critical

> **Definition (English):** Zero-downtime migration means changing the database schema without taking the application offline or causing errors for live users. Uses expand-and-contract pattern.

```sql
-- ❌ DANGEROUS: Seedha NOT NULL column add mat karo
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;
-- PostgreSQL pe: Full table lock! Millions rows → minutes of downtime!

-- ✅ SAFE Zero-Downtime Approach:

-- Phase 1: Column add karo WITHOUT NOT NULL (no lock)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN;
-- Fast, no lock!

-- Phase 2: Existing rows backfill karo (batches mein)
DO $$
DECLARE
  batch_size INT := 1000;
  offset_val INT := 0;
BEGIN
  LOOP
    UPDATE users
    SET email_verified = false
    WHERE id IN (
      SELECT id FROM users
      WHERE email_verified IS NULL
      LIMIT batch_size
    );
    EXIT WHEN NOT FOUND;
    PERFORM pg_sleep(0.05);  -- DB ko breathe karne do
  END LOOP;
END $$;

-- Phase 3: Code deploy karo (naya column use kare WITH null handling)

-- Phase 4: Verify backfill complete
SELECT COUNT(*) FROM users WHERE email_verified IS NULL;  -- Should be 0

-- Phase 5: Ab safely NOT NULL add karo
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
```

```javascript
// Zero-downtime column rename — Expand-and-Contract pattern
// Phase 1: New column add karo
await db.query('ALTER TABLE users ADD COLUMN full_name TEXT');

// Phase 2: Code deploy — DONO columns write karo
// app.js: write to both name AND full_name
await db.query(
  'UPDATE users SET full_name = name WHERE full_name IS NULL'
);

// Phase 3: Code update — sirf full_name use karo, name nahi

// Phase 4: Weeks baad verify karke old column drop karo
await db.query('ALTER TABLE users DROP COLUMN name');
```

> 💡 **Interview Tip:** "3 golden rules: Never add NOT NULL without backfill, never rename directly (expand-contract), never drop without verifying code nahi use karta. Production mein always batched updates, never single large UPDATE."

---

## 18. ORM Concepts

> **Definition (English):** ORM (Object-Relational Mapper) maps database rows to programming language objects, allowing developers to work with objects instead of writing raw SQL queries.

> **Hinglish:** SQL likhna boring lagta hai? ORM tumhare liye SQL generate karta hai — objects ke saath kaam karo. Lekin ORM ke pitfalls bhi jaanna zaroori hai — N+1, lazy loading, complex queries. Tabhi senior developer bologe.

---

### Prisma — Modern TypeScript ORM

```javascript
// schema.prisma define karo
// npx prisma migrate dev → Tables create
// npx prisma generate → TypeScript client generate

// CREATE
const user = await prisma.user.create({
  data: {
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    plan: 'PREMIUM',
    profile: {
      create: { bio: 'Full Stack Dev', avatar: 'https://...' }
    }
  },
  include: { profile: true }
});

// READ — Filters, select, pagination
const users = await prisma.user.findMany({
  where: {
    plan: 'PREMIUM',
    createdAt: { gte: new Date('2024-01-01') },
    name: { contains: 'rahul', mode: 'insensitive' }
  },
  select: {
    id: true, name: true, email: true,
    _count: { select: { orders: true } }
  },
  orderBy: { createdAt: 'desc' },
  skip: 0, take: 20
});

// UPDATE
await prisma.user.update({
  where: { id: userId },
  data: { plan: 'ENTERPRISE' }
});

// UPSERT
await prisma.user.upsert({
  where: { email: 'rahul@gmail.com' },
  update: { name: 'Rahul Updated' },
  create: { name: 'Rahul', email: 'rahul@gmail.com' }
});

// Soft delete
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() }
});
```

---

### Lazy vs Eager Loading — Critical!

> **Definition (English):**
> - **Lazy Loading:** Related data is loaded ON DEMAND when you access it (causes N+1)
> - **Eager Loading:** Related data is loaded UPFRONT with the main query (efficient)

```javascript
// ❌ LAZY LOADING — N+1 trap!
const users = await prisma.user.findMany();
for (const user of users) {
  // Yeh har user ke liye ALAG query fire karega!
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
}
// 100 users = 101 queries ❌

// ✅ EAGER LOADING — include use karo
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true },
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    },
    profile: true,
    _count: { select: { posts: true } }
  }
});
// 1-2 queries internally ✅
```

```javascript
// TypeORM
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

// Eager loading via relations option
const users = await userRepo.find({
  relations: {
    orders: true,
    profile: true
  }
});

// Query builder — complex queries
const users = await userRepo
  .createQueryBuilder('user')
  .select(['user.id', 'user.name'])
  .leftJoinAndSelect('user.orders', 'order')
  .where('order.total > :min', { min: 500 })
  .andWhere('user.plan = :plan', { plan: 'premium' })
  .orderBy('user.createdAt', 'DESC')
  .skip(offset).take(limit)
  .getMany();
```

---

### Raw SQL When ORM is Not Enough

```javascript
// Prisma raw queries — complex analytics ke liye
const result = await prisma.$queryRaw`
  SELECT
    u.id, u.name,
    COUNT(o.id)::int AS order_count,
    SUM(o.total)     AS total_spent,
    RANK() OVER (ORDER BY SUM(o.total) DESC) AS spending_rank
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
    AND o.status = 'completed'
    AND o.created_at >= ${new Date('2024-01-01')}
  GROUP BY u.id, u.name
  HAVING COUNT(o.id) >= 2
  ORDER BY total_spent DESC
  LIMIT ${limit}
`;
// Prisma automatically handles SQL injection protection!

// TypeORM raw query
const result = await dataSource.query(
  `SELECT * FROM users WHERE created_at > $1`,
  [new Date('2024-01-01')]
);
```

---

### ORM Pros and Cons

```
Pros:
  ✅ Less boilerplate code
  ✅ Type safety (Prisma + TypeScript = excellent DX)
  ✅ Migration generation
  ✅ SQL injection prevention
  ✅ Database agnostic

Cons:
  ❌ N+1 easy ho jaata hai (lazy loading trap)
  ❌ Complex queries mein raw SQL better
  ❌ ORM-generated SQL sometimes suboptimal
  ❌ Magic = less control
  ❌ Learning curve
```

> 💡 **Interview Tip:** "ORM use karta hoon CRUD aur simple queries ke liye. Complex analytics, reporting, ya performance-critical queries mein raw SQL. ORM generated queries EXPLAIN ANALYZE se verify karta hoon. N+1 hamesha avoid karo — always explicit eager loading."

---

## 19. Partitioning

> **Definition (English):** Partitioning divides a single large table into smaller physical pieces (partitions) within the SAME database server, based on a partition key — improving query performance and data management.

> **Hinglish:** Ek badi table ko logically aur physically chhoti chunks mein todo — same machine pe. Sharding alag machines pe hota hai, partitioning same machine pe. Application ke liye transparent hai!

---

### Partitioning vs Sharding

```
Partitioning:                      Sharding:
Same Database Server               Multiple Database Servers
  orders (parent)                    Server 1   Server 2   Server 3
  ├── orders_2022 (partition)        [Shard 1]  [Shard 2]  [Shard 3]
  ├── orders_2023 (partition)
  └── orders_2024 (partition)
  
Transparent to application ✅      Application routing needed ⚠️
```

---

### Range Partitioning — Date/Number Range

```sql
-- Range partitioning by date (most common)
CREATE TABLE orders (
  id         BIGSERIAL,
  created_at DATE NOT NULL,
  user_id    INT,
  total      DECIMAL,
  status     TEXT
) PARTITION BY RANGE (created_at);

-- Partitions create karo
CREATE TABLE orders_2022 PARTITION OF orders
  FOR VALUES FROM ('2022-01-01') TO ('2023-01-01');

CREATE TABLE orders_2023 PARTITION OF orders
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Default partition (out-of-range data ke liye)
CREATE TABLE orders_default PARTITION OF orders DEFAULT;

-- Query — application same hi likhta hai!
SELECT * FROM orders WHERE created_at = '2024-06-15';
-- PostgreSQL internally: sirf orders_2024 scan karega (partition pruning!)

-- Old data delete — INSTANT!
DROP TABLE orders_2022;  -- Millions of rows, 0ms! (vs DELETE = hours)
```

---

### List Partitioning — Specific Values

```sql
-- List partitioning by region
CREATE TABLE users (
  id      BIGSERIAL,
  name    TEXT,
  email   TEXT,
  region  TEXT NOT NULL
) PARTITION BY LIST (region);

CREATE TABLE users_india  PARTITION OF users FOR VALUES IN ('IN', 'IN-MH', 'IN-TG');
CREATE TABLE users_usa    PARTITION OF users FOR VALUES IN ('US', 'US-CA', 'US-NY');
CREATE TABLE users_europe PARTITION OF users FOR VALUES IN ('UK', 'DE', 'FR');
CREATE TABLE users_others PARTITION OF users DEFAULT;

-- Automatically correct partition mein jaata hai:
INSERT INTO users (name, region) VALUES ('Rahul', 'IN');  -- → users_india

-- Query — sirf relevant partition scan:
SELECT * FROM users WHERE region = 'IN';  -- Sirf users_india!
```

---

### Hash Partitioning — Even Distribution

```sql
-- Hash partitioning for even distribution
CREATE TABLE events (
  id         BIGSERIAL,
  user_id    INT NOT NULL,
  event_type TEXT,
  data       JSONB,
  created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY HASH (user_id);

CREATE TABLE events_p0 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE events_p1 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE events_p2 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE events_p3 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- user_id 1: hash(1) % 4 = 1 → events_p1
-- Even distribution, no hotspot!
```

---

### JOINs with Partitioned Tables — Haan, Works Perfectly!

> **Hinglish:** Partitioned table ko normal table ki tarah treat karo — JOINs, filters, aggregations sab normal kaam karta hai. Application ko pata bhi nahi hota ki table partitioned hai!

```sql
-- Partitioned table (orders) + normal table (users) JOIN
SELECT
  u.name, u.email,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS total_spent
FROM users u                          -- Normal table
JOIN orders o ON u.id = o.user_id    -- Partitioned table!
WHERE
  o.created_at >= '2024-01-01'       -- Partition pruning happens here!
  AND o.status = 'completed'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;

-- PostgreSQL internally:
--   orders WHERE created_at >= 2024 → sirf orders_2024 scan
--   users → full table (ya index scan)
--   JOIN results combine karo
-- Application ko NO difference!

-- Partition-wise JOIN (optimization):
SET enable_partitionwise_join = on;
-- Matching partitions directly join karti hain — even faster!
```

```javascript
// Node.js — partitioned table, koi change nahi!
const result = await db.query(`
  SELECT u.name, COUNT(o.id) as orders, SUM(o.total) as revenue
  FROM users u
  JOIN orders o ON u.id = o.user_id
  WHERE o.created_at >= $1 AND o.status = 'completed'
  GROUP BY u.id
  ORDER BY revenue DESC
  LIMIT 10
`, ['2024-01-01']);
// Application ko pata bhi nahi ki orders partitioned hai ✅
```

---

### Partitioning Benefits Summary

```sql
-- 1. Partition Pruning — Query sirf relevant partition scan kare
EXPLAIN SELECT * FROM orders WHERE created_at = '2024-06-15';
-- Output: "orders_2024" only, not 2022/2023!

-- 2. Faster data deletion — Drop entire partition (instant!)
DROP TABLE orders_2022;  -- Instant vs DELETE = hours

-- 3. Smaller indexes per partition — faster B-tree
CREATE INDEX idx_2024_user ON orders_2024(user_id);
-- Smaller index → faster lookups

-- 4. Parallel query execution
SET max_parallel_workers_per_gather = 4;
-- Different partitions parallel mein process ho sakte hain!
```

> 💡 **Interview Tip:** "Partitioned table JOIN mein normal table ki tarah hi kaam karta hai — application transparent hai. Partition key WHERE clause mein include karo for partition pruning. Best use: date-based partitioning for time-series data, logs, financial records."

---

## 20. Time-Series DBs

> **Definition (English):** Time-series databases are specialized databases optimized for storing and querying time-stamped data points — like metrics, logs, sensor readings, and financial ticks.

> **Hinglish:** Normal DB pe 100 million rows of server metrics store karo — query slow ho jaayegi, disk space bahut lagega. Time-series DB specifically time-stamped data ke liye banaya gaya hai — fast writes, fast time-range queries, automatic compression aur data retention.

---

### Why Not Normal SQL for Time-Series?

```
Normal PostgreSQL:
  Table: server_metrics (timestamp, server_id, cpu, memory)
  100M rows after 6 months → Queries slow
  10,000 inserts/sec → Index fragmentation
  Old data cleanup → Expensive full scans
  Compression → None by default

TimescaleDB (PostgreSQL extension):
  Same SQL! No new query language to learn!
  1,000,000+ inserts/sec
  Automatic time-based chunking (like partitioning internally)
  Retention policies — auto delete old data
  Compression → 90%+ on old chunks
```

---

### TimescaleDB Setup

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Normal table banao
CREATE TABLE server_metrics (
  time       TIMESTAMPTZ NOT NULL,
  server_id  TEXT        NOT NULL,
  cpu_usage  DOUBLE PRECISION,
  memory_mb  DOUBLE PRECISION,
  disk_io    DOUBLE PRECISION
);

-- Hypertable mein convert karo (magic!)
SELECT create_hypertable(
  'server_metrics',
  'time',
  chunk_time_interval => INTERVAL '1 day'  -- Daily chunks
);

-- Index
CREATE INDEX idx_metrics_server ON server_metrics(server_id, time DESC);

-- Normal INSERT — same SQL!
INSERT INTO server_metrics VALUES
  (NOW(), 'web-01', 45.2, 8192, 120.5),
  (NOW(), 'web-02', 67.8, 12288, 89.3);
```

---

### Time-Series Queries

```sql
-- time_bucket — Group by time intervals (like DATE_TRUNC but more powerful)
SELECT
  time_bucket('5 minutes', time) AS bucket,
  server_id,
  AVG(cpu_usage) AS avg_cpu,
  MAX(cpu_usage) AS peak_cpu,
  MIN(cpu_usage) AS min_cpu
FROM server_metrics
WHERE
  time > NOW() - INTERVAL '1 hour'
  AND server_id = 'web-01'
GROUP BY bucket, server_id
ORDER BY bucket DESC;

-- Last 15 minutes average per server
SELECT
  server_id,
  AVG(cpu_usage) AS avg_cpu_15min,
  MAX(memory_mb) AS peak_memory
FROM server_metrics
WHERE time > NOW() - INTERVAL '15 minutes'
GROUP BY server_id;

-- Continuous Aggregates (pre-computed — very fast for dashboards!)
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS bucket,
  server_id,
  AVG(cpu_usage)  AS avg_cpu,
  AVG(memory_mb)  AS avg_memory,
  COUNT(*)        AS sample_count
FROM server_metrics
GROUP BY bucket, server_id
WITH NO DATA;

-- Auto-refresh policy
SELECT add_continuous_aggregate_policy('metrics_hourly',
  start_offset     => INTERVAL '3 hours',
  end_offset       => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour'
);

-- Query pre-computed view (very fast!):
SELECT * FROM metrics_hourly
WHERE bucket > NOW() - INTERVAL '24 hours'
ORDER BY bucket DESC;
```

---

### Data Retention & Compression

```sql
-- Auto-delete old data
SELECT add_retention_policy('server_metrics', INTERVAL '90 days');
-- 90 din baad automatically delete!

-- Compress old chunks (saves 90%+ space!)
SELECT add_compression_policy('server_metrics', INTERVAL '7 days');
-- 7 din se purana data compress karo

-- Check compression savings
SELECT
  chunk_name,
  pg_size_pretty(before_compression_total_bytes) AS before,
  pg_size_pretty(after_compression_total_bytes)  AS after,
  compression_ratio
FROM chunk_compression_stats('server_metrics');
```

---

### InfluxDB — Purpose-Built Time-Series

```javascript
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const client = new InfluxDB({ url: 'http://localhost:8086', token: process.env.INFLUX_TOKEN });

// Write
const writeApi = client.getWriteApi('my-org', 'my-bucket');
const point = new Point('server_metrics')
  .tag('server_id', 'web-01')          // Tags = indexed dimensions
  .tag('region', 'india')
  .floatField('cpu_usage', 45.2)       // Fields = measurements
  .floatField('memory_mb', 8192)
  .timestamp(new Date());

await writeApi.writePoint(point);
await writeApi.close();

// Query (Flux language)
const queryApi = client.getQueryApi('my-org');
const query = `
  from(bucket: "my-bucket")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "server_metrics")
    |> filter(fn: (r) => r.server_id == "web-01")
    |> filter(fn: (r) => r._field == "cpu_usage")
    |> aggregateWindow(every: 5m, fn: mean)
`;
const result = [];
await queryApi.collectRows(query, (row, meta) => result.push(meta.toObject(row)));
```

---

### Use Cases

```
Time-Series DBs:
  ✅ Server/application metrics (CPU, memory, requests/sec)
  ✅ IoT sensor data (temperature, humidity, pressure)
  ✅ Financial tick data (stock prices)
  ✅ User activity logs (page views, clicks)
  ✅ APM (Application Performance Monitoring)
  ✅ Grafana dashboards

Normal DB:
  ✅ User profiles, orders, products
  ✅ Data without time as primary dimension
```

> 💡 **Interview Tip:** "TimescaleDB PostgreSQL ka extension hai — same SQL, dramatic performance improvement. Production mein Grafana + TimescaleDB for server monitoring. Key features: time_bucket, continuous aggregates, retention policies, compression."

---

## 21. Vector DBs

> **Definition (English):** Vector databases store high-dimensional numerical vectors (embeddings) and efficiently find similar vectors using distance metrics — foundational for AI/LLM applications, semantic search, and recommendations.

> **Hinglish:** AI ka zamana hai! Text, images ko numbers (vectors) mein convert karo. "Laptop dhundho" search karo — "MacBook", "gaming notebook" bhi mile. Exact match nahi — semantic similarity. Yahi vector DB karta hai.

---

### What are Embeddings?

```
Text → Embedding Model → Vector (array of numbers)

"King"   → [0.23, 0.81, -0.34, 0.12, ...]  (1536 dimensions)
"Queen"  → [0.22, 0.79, -0.35, 0.13, ...]  ← Similar! Vectors close hain
"Apple"  → [0.91, -0.12, 0.72, -0.54, ...] ← Very different!

Similarity = Cosine distance between vectors
Close vectors = Semantically similar content
```

---

### pgvector — Postgres Extension

```sql
-- Enable
CREATE EXTENSION vector;

-- Table with embedding column
CREATE TABLE documents (
  id        SERIAL PRIMARY KEY,
  title     TEXT NOT NULL,
  content   TEXT NOT NULL,
  embedding vector(1536),   -- OpenAI ada-002 = 1536 dimensions
  metadata  JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- HNSW Index (best accuracy + speed)
CREATE INDEX ON documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Distance operators:
-- <=>  Cosine distance (text ke liye best)
-- <->  Euclidean distance (image ke liye)
-- <#>  Negative inner product (dot product)
```

```javascript
const { OpenAI } = require('openai');
const { Pool } = require('pg');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Document index karo
async function indexDocument(title, content) {
  const { data } = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: content
  });
  const embedding = data[0].embedding;  // 1536 numbers

  await pool.query(
    'INSERT INTO documents (title, content, embedding) VALUES ($1, $2, $3)',
    [title, content, JSON.stringify(embedding)]
  );
}

// Semantic search
async function semanticSearch(query, topK = 5) {
  const { data } = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query
  });
  const queryVector = data[0].embedding;

  const results = await pool.query(
    `SELECT
       id, title, content,
       1 - (embedding <=> $1) AS similarity
     FROM documents
     ORDER BY embedding <=> $1    -- <=> = cosine distance
     LIMIT $2`,
    [JSON.stringify(queryVector), topK]
  );

  return results.rows;
}

// Usage:
await indexDocument('JS Basics', 'JavaScript is a programming language...');
await indexDocument('Node.js', 'Node.js is a JS runtime for server-side...');
await indexDocument('Python', 'Python is an interpreted language...');

const results = await semanticSearch('How to code in JavaScript?');
// Returns: JS Basics (0.92), Node.js (0.87), Python (0.45)
// "JavaScript" query ne relevant docs find kiye without exact match!
```

---

### RAG — Retrieval Augmented Generation

> **Definition (English):** RAG is a pattern where relevant documents are retrieved from a vector database and provided as context to an LLM to generate accurate, grounded responses.

> **Hinglish:** LLM ko limited knowledge hoti hai. RAG mein: user question → related documents vector DB se dhundho → documents + question LLM ko do → LLM context ke saath accurate answer de. Company-specific chatbots is tarah bante hain.

```javascript
const { Anthropic } = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function ragChatbot(userQuestion) {
  // Step 1: Question embed karo
  const { data } = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: userQuestion
  });

  // Step 2: Relevant docs vector DB se fetch karo
  const docs = await pool.query(
    `SELECT title, content, 1 - (embedding <=> $1) AS similarity
     FROM knowledge_base
     WHERE 1 - (embedding <=> $1) > 0.75    -- Min similarity threshold
     ORDER BY embedding <=> $1
     LIMIT 3`,
    [JSON.stringify(data[0].embedding)]
  );

  // Step 3: Context build karo
  const context = docs.rows
    .map(d => `[${d.title}]\n${d.content}`)
    .join('\n\n---\n\n');

  // Step 4: LLM ko context ke saath bhejo
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Answer based on this context only:

${context}

Question: ${userQuestion}`
    }]
  });

  return {
    answer: response.content[0].text,
    sources: docs.rows.map(d => ({ title: d.title, similarity: d.similarity }))
  };
}
```

---

### Hybrid Search — SQL Filter + Vector

```sql
-- pgvector: SQL filters + vector similarity (only possible with pgvector!)
SELECT
  d.id, d.title, d.content,
  u.name AS author,            -- SQL JOIN with users
  1 - (d.embedding <=> $1) AS similarity
FROM documents d
JOIN users u ON d.author_id = u.id
WHERE
  u.department = 'engineering'   -- SQL filter
  AND d.created_at > '2024-01-01'  -- Date filter
  AND 1 - (d.embedding <=> $1) > 0.7  -- Minimum similarity
ORDER BY d.embedding <=> $1
LIMIT 10;
```

---

### pgvector vs Pinecone

```javascript
// Pinecone — Managed cloud vector DB
const { Pinecone } = require('@pinecone-database/pinecone');
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index('my-knowledge-base');

// Upsert
await index.upsert([{
  id: 'doc-001',
  values: embedding,    // 1536-dim vector
  metadata: { title: 'JS Basics', category: 'programming' }
}]);

// Query
const results = await index.query({
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true,
  filter: { category: { $eq: 'programming' } }
});
```

| | pgvector | Pinecone |
|---|---|---|
| Setup | PostgreSQL extension | Managed cloud |
| Scale | < 10M vectors | Billions |
| SQL JOINs | Yes ✅ | No |
| Cost | PostgreSQL cost | Pay per use |
| Best for | < 10M vectors, SQL needed | Large scale production AI |

> 💡 **Interview Tip:** "pgvector existing PostgreSQL projects mein add karna easy — SQL JOINs ke saath vector search possible. Large scale ke liye Pinecone. RAG pattern: user question → embed → find similar docs → LLM ko context ke saath do → accurate answer."

---

## 📚 Complete Summary

| # | Topic | One-Line Definition | Must-Know Interview Point |
|---|---|---|---|
| 1 | **SQL Joins** | Combine rows from multiple tables | INNER=match only, LEFT=all left+nulls, FULL=both sides |
| 2 | **Normalization** | Remove data redundancy | 1NF=atomic, 2NF=no partial dep, 3NF=no transitive dep |
| 3 | **Indexes & B-Trees** | Fast lookup data structure (O log n) | Function on column kills index, composite column order |
| 4 | **Query Optimization** | Make queries faster with less resources | EXPLAIN ANALYZE, avoid SELECT *, batch operations |
| 5 | **N+1 Problem** | 1+N queries instead of 1-2 | Use include/eager loading, 2-query batch, DataLoader |
| 6 | **Pagination** | Fetch large data in chunks | OFFSET slow at scale, cursor-based for production |
| 7 | **CTEs & Window Functions** | Named temp queries + row-level calculations | ROW_NUMBER PARTITION BY, LAG/LEAD, running totals |
| 8 | **Isolation Levels** | How much transactions see each other | 4 levels, 3 anomalies (dirty/phantom/non-repeatable) |
| 9 | **Locking & Deadlocks** | Prevent concurrent interference | Consistent lock order, SKIP LOCKED, optimistic vs pessimistic |
| 10 | **SQL vs NoSQL** | Structured tables vs flexible documents | Use all 3: Postgres+Mongo+Redis together |
| 11 | **Redis / Caching** | Fast in-memory store | Cache-aside pattern, TTL, delete-on-write invalidation |
| 12 | **MongoDB** | JSON document database | Embed vs Reference by access pattern, aggregation pipeline |
| 13 | **CAP Theorem** | Only 2 of 3 guarantees possible | P mandatory, real choice = C vs A |
| 14 | **Replication** | Data copy across servers | Read replicas, replication lag, failover |
| 15 | **Sharding** | Data split across machines | Shard key choice critical, hotspot problem |
| 16 | **Connection Pooling** | Reuse DB connections | Pool size=2×cores, PgBouncer for millions |
| 17 | **DB Migrations** | Version-controlled schema changes | Zero-downtime: expand-contract pattern |
| 18 | **ORM Concepts** | Objects instead of raw SQL | Lazy vs eager, raw SQL for complex queries |
| 19 | **Partitioning** | Logical split in same DB | JOINs work normally, partition pruning key |
| 20 | **Time-Series DBs** | Optimized for timestamped data | time_bucket, retention policies, 90% compression |
| 21 | **Vector DBs** | Store embeddings, find similar | RAG pattern, cosine similarity, pgvector+SQL JOINs |

---

## 🎯 Quick Interview Cheatsheet

```
ACID → Bank transfer example (Atomicity=all or nothing, Consistency=rules intact,
        Isolation=transactions separate, Durability=committed = permanent)

N+1  → "ORM mein include karo, loop mein query mat karo"

Index → "Double-edged sword: SELECT fast, INSERT/UPDATE slow"

CAP  → "P mandatory, real choice C vs A. Banks=CP, Social=AP"

Deadlock → "Always same order mein lock karo"

Migration → "Zero-downtime: expand-contract, never add NOT NULL directly"

Cache → "Cache-aside pattern, delete-on-write invalidation, TTL as safety net"

Sharding → "Shard key = high cardinality + even distribution + query-friendly"
```

---

*Notes by: Full Stack JS Developer | 5+ Years Interview Prep*  
*Database: PostgreSQL, MongoDB, Redis | ORM: Prisma, TypeORM*
