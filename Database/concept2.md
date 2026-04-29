# 🗄️ Database Advanced Topics — Interview Notes
> **Stack:** JavaScript Full Stack | PostgreSQL, MongoDB, Redis  
> **Level:** 5+ Years Interview Preparation  
> **Format:** Hinglish Theory + English Definitions + Code Examples

---

## 📋 Table of Contents

1. [Database Scaling](#1-database-scaling)
2. [Stored Procedures](#2-stored-procedures)
3. [Triggers](#3-triggers)
4. [Views & Types](#4-views--types)
5. [Replication](#5-replication)
6. [Consistency Models](#6-consistency-models)
7. [Backup & Recovery](#7-backup--recovery)
8. [High Availability](#8-high-availability)
9. [Avoid Full Table Scan & MVCC](#9-avoid-full-table-scan--mvcc)

---

## 1. Database Scaling

> **Definition (English):** Database scaling is the process of increasing a database's capacity to handle more data, more users, and more concurrent requests — either by upgrading hardware (vertical) or adding more servers (horizontal).

> **Hinglish:** Jab traffic badhe, DB slow ho jaaye — tab scaling karte hain. Do main tarike hain: ek bada machine le lo (vertical) ya aur machines add karo (horizontal). Scaling ka sahi order follow karna zaroori hai — seedha sharding mat karo!

---

### Vertical Scaling (Scale Up)

> **Definition:** Existing server ko powerful banao — more CPU, RAM, faster storage.

```
Before Scaling:          After Vertical Scaling:
┌──────────────┐         ┌────────────────────────┐
│  4 Core CPU  │  ─────► │  32 Core CPU           │
│  16 GB RAM   │         │  256 GB RAM            │
│  500 GB SSD  │         │  4 TB NVMe SSD         │
└──────────────┘         └────────────────────────┘

Fayda:   Simple — sirf upgrade karo
Problem: Hardware ka ceiling hai, bahut expensive,
         Single point of failure!
```

```sql
-- PostgreSQL: Vertical scaling ke baad config tune karo
-- File: postgresql.conf

-- Zyada RAM mili → Buffer pool badho
shared_buffers = 8GB                    -- Total RAM ka 25%
effective_cache_size = 24GB            -- OS cache estimate
work_mem = 256MB                       -- Per-query sort memory

-- Zyada CPU cores → Parallel queries enable karo
max_parallel_workers_per_gather = 8
max_parallel_workers = 16
max_worker_processes = 16

-- Fast NVMe SSD mila → I/O cost tune karo
random_page_cost = 1.1                 -- SSD ke liye (HDD default = 4.0)
seq_page_cost = 1.0

-- Connections
max_connections = 500
```

---

### Horizontal Scaling (Scale Out)

> **Definition:** Adding more servers/nodes to distribute load — no hardware ceiling.

> **Hinglish:** Ek bada server lene ki jagah — aur servers add karo. Load baanto. Theoretically unlimited scale!

```
Horizontal Scaling Architecture:

              ┌─────────────────────────┐
              │   Load Balancer          │
              │   (HAProxy / AWS ALB)    │
              └───────┬─────────────────┘
                      │
        ┌─────────────┼──────────────┐
        ↓             ↓              ↓
  [Primary DB]   [Replica 1]   [Replica 2]
   Writes + Reads  Read Only     Read Only
```

---

### Complete Scaling Strategy — Step by Step

#### Step 1: Redis Cache Add Karo (Sabse Pehle, Sabse Zyada Impact)

```javascript
// Cache-Aside Pattern — DB pe 80-90% load kam ho jaata hai!
const redis  = require('redis');
const { Pool } = require('pg');

const cache  = redis.createClient({ url: process.env.REDIS_URL });
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getProduct(productId) {
  const key = `product:${productId}`;

  // 1. Cache check karo pehle
  const cached = await cache.get(key);
  if (cached) {
    console.log('✅ Cache HIT — DB touch nahi hua!');
    return JSON.parse(cached);
  }

  // 2. Cache miss → DB se lo
  console.log('❌ Cache MISS → DB se fetch kar raha hoon');
  const { rows } = await pgPool.query(
    'SELECT * FROM products WHERE id = $1', [productId]
  );

  // 3. Cache mein daalo — 1 hour TTL
  await cache.setEx(key, 3600, JSON.stringify(rows[0]));
  return rows[0];
}
// Result: Same data bar bar maangein → sirf pehli baar DB hit!
```

#### Step 2: Read Replicas — Reads ko Distribute Karo

```javascript
const { Pool } = require('pg');

// Primary: Sirf writes
const primaryPool = new Pool({ host: process.env.PRIMARY_HOST, max: 20 });

// Replicas: Load balanced reads
const replicaPools = [
  process.env.REPLICA1_HOST,
  process.env.REPLICA2_HOST,
].map(host => new Pool({ host, max: 20 }));

let replicaIndex = 0;
function getReplicaPool() {
  // Round-robin across replicas
  return replicaPools[replicaIndex++ % replicaPools.length];
}

// Writes → Primary
async function createUser(data) {
  return primaryPool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [data.name, data.email]
  );
}

// Reads → Replica (fast, distributed)
async function getUsers(filter) {
  return getReplicaPool().query(
    'SELECT * FROM users WHERE plan = $1', [filter.plan]
  );
}

// Transactions → Always Primary
async function runTransaction(fn) {
  const client = await primaryPool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release(); // ← HAMESHA release karo!
  }
}
```

#### Step 3: Connection Pooling — PgBouncer

```ini
# pgbouncer.ini — Application aur PostgreSQL ke beech baith ke connections manage kare

[databases]
myapp = host=primary-db port=5432 dbname=myapp

[pgbouncer]
pool_mode = transaction        # Best for stateless Node.js apps
                               # Connection sirf transaction ke liye hold hoti hai

max_client_conn  = 10000       # App se max connections accept karo
default_pool_size = 50         # Actual PostgreSQL connections

listen_port = 6432             # PgBouncer port (5432 nahi!)
listen_addr = *

# Result:
# 10,000 app connections → PgBouncer → 50 actual DB connections
# PostgreSQL RAM save, performance dramatically up!
```

```javascript
// App mein PgBouncer ka address use karo — normal Pool hi banao
const pool = new Pool({
  host: 'pgbouncer-server',   // PgBouncer host
  port: 6432,                 // PgBouncer port!
  database: 'myapp',
  max: 25                     // PgBouncer actual DB connections manage karega
});
```

#### Step 4: Table Partitioning — Large Tables Split Karo

```sql
-- Time-based partitioning (100M+ rows ke liye)
CREATE TABLE user_events (
  id         BIGSERIAL,
  user_id    INT,
  event_type TEXT,
  data       JSONB,
  created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

-- Quarterly partitions
CREATE TABLE user_events_2024_q1
  PARTITION OF user_events
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE user_events_2024_q2
  PARTITION OF user_events
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

CREATE TABLE user_events_2024_q3
  PARTITION OF user_events
  FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

CREATE TABLE user_events_2024_q4
  PARTITION OF user_events
  FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

-- Query: Application same SQL likhta hai, DB sirf relevant partition scan kare!
SELECT * FROM user_events WHERE created_at = '2024-06-15';
-- PostgreSQL internally: sirf user_events_2024_q2 scan hoga!

-- Old data delete — INSTANT! (vs DELETE = hours!)
DROP TABLE user_events_2023_q1; -- Millions of rows, 0ms!
```

#### Step 5: Sharding — Last Resort

```javascript
// User ID based consistent sharding
const shardDbs = {
  shard0: new Pool({ host: 'shard0.db.internal' }),
  shard1: new Pool({ host: 'shard1.db.internal' }),
  shard2: new Pool({ host: 'shard2.db.internal' }),
  shard3: new Pool({ host: 'shard3.db.internal' }),
};

function getShard(userId) {
  // Modulo hashing — even distribution
  return shardDbs[`shard${userId % 4}`];
}

async function getUser(userId) {
  const shard = getShard(userId);
  const { rows } = await shard.query(
    'SELECT * FROM users WHERE id = $1', [userId]
  );
  return rows[0];
}
// userId=1 → shard1, userId=2 → shard2, etc.
```

---

### Scaling Decision Tree

```
Traffic badhne laga? Sahi order follow karo:

Step 1: Redis Cache Add Karo
  → DB queries 80-90% kam ho jaati hain
  → Sabse zyada ROI, least complexity

Step 2: Read Replicas + Read/Write Split
  → Read load distribute karo
  → Write still on primary

Step 3: PgBouncer Connection Pooling
  → Connection overhead khatam
  → Thousands of app instances support karo

Step 4: Query Optimization (EXPLAIN ANALYZE)
  → Slow queries fix karo
  → Missing indexes add karo

Step 5: Table Partitioning
  → Huge tables (100M+ rows) ke liye
  → Range/List/Hash partitioning

Step 6: Sharding
  → Last resort! Most complex.
  → Multiple DB servers pe data split
```

| Strategy | Complexity | Impact | When to Use |
|---|---|---|---|
| **Caching** | Low | Very High ⭐⭐⭐ | Always first! |
| **Read Replicas** | Medium | High ⭐⭐⭐ | Read-heavy apps |
| **PgBouncer** | Low | Medium ⭐⭐ | Many app instances |
| **Partitioning** | Medium | High ⭐⭐⭐ | 100M+ rows |
| **Sharding** | Very High | Extreme ⭐ | Absolute last resort |

> 💡 **Interview Tip:** "Premature sharding ek anti-pattern hai. Scaling ka sahi order: Cache → Read Replicas → Connection Pool → Query Optimization → Partitioning → Sharding. 90% problems pehle do steps mein solve ho jaati hain."

---

## 2. Stored Procedures

> **Definition (English):** A stored procedure is a named, pre-compiled set of SQL statements stored in the database that can be called by name. It executes server-side, reducing network round trips for complex operations.

> **Hinglish:** Ek SQL function jo database ke andar store hota hai — jaise application mein function hota hai. Ek baar define karo, baar baar call karo. Complex business logic DB ke andar hi run hoti hai — network trips zero, performance better.

---

### Function vs Procedure — Difference

```sql
-- FUNCTION: Value return karta hai
--           SELECT mein use ho sakta hai
--           Transactions nahi kar sakta (mostly)

-- PROCEDURE: Value return nahi karta (OUT params use karo)
--            CALL se invoke karte hain
--            Full transaction control hai
```

---

### Basic Stored Procedure — Bank Transfer

```sql
-- Transfer money between accounts
CREATE OR REPLACE PROCEDURE transfer_money(
  p_from_id INT,
  p_to_id   INT,
  p_amount  DECIMAL,
  OUT p_status TEXT    -- Output parameter
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  -- Step 1: Balance check + Row Lock
  SELECT balance INTO v_balance
  FROM accounts
  WHERE id = p_from_id
  FOR UPDATE;  -- Lock karo race condition ke liye

  -- Step 2: Validation
  IF v_balance IS NULL THEN
    p_status := 'ERROR: Account not found';
    RETURN;
  END IF;

  IF v_balance < p_amount THEN
    p_status := 'ERROR: Insufficient funds. Balance: ' || v_balance;
    RETURN;
  END IF;

  -- Step 3: Debit
  UPDATE accounts
  SET balance    = balance - p_amount,
      updated_at = NOW()
  WHERE id = p_from_id;

  -- Step 4: Credit
  UPDATE accounts
  SET balance    = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_to_id;

  -- Step 5: Audit log
  INSERT INTO transaction_log (from_id, to_id, amount, status, created_at)
  VALUES (p_from_id, p_to_id, p_amount, 'completed', NOW());

  p_status := 'SUCCESS: Transfer completed';

EXCEPTION
  WHEN OTHERS THEN
    -- Error log
    INSERT INTO error_log (procedure_name, error_msg, created_at)
    VALUES ('transfer_money', SQLERRM, NOW());

    p_status := 'ERROR: ' || SQLERRM;
    RAISE;  -- Re-throw karo
END;
$$;

-- Call karo:
DO $$
DECLARE v_status TEXT;
BEGIN
  CALL transfer_money(1, 2, 500.00, v_status);
  RAISE NOTICE 'Result: %', v_status;
END;
$$;
```

---

### Stored Function — Return Value

```sql
-- User stats return karne wala function
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id INT)
RETURNS TABLE (
  total_orders   INT,
  total_spent    DECIMAL,
  avg_order      DECIMAL,
  member_since   DATE,
  customer_tier  TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_spent DECIMAL;
BEGIN
  RETURN QUERY
  SELECT
    COUNT(o.id)::INT              AS total_orders,
    COALESCE(SUM(o.total), 0)    AS total_spent,
    COALESCE(AVG(o.total), 0)   AS avg_order,
    u.created_at::DATE           AS member_since,
    CASE
      WHEN SUM(o.total) > 100000 THEN 'Platinum'
      WHEN SUM(o.total) > 50000  THEN 'Gold'
      WHEN SUM(o.total) > 10000  THEN 'Silver'
      ELSE 'Bronze'
    END                          AS customer_tier
  FROM users u
  LEFT JOIN orders o
    ON u.id = o.user_id
    AND o.status = 'completed'
  WHERE u.id = p_user_id
  GROUP BY u.id, u.created_at;
END;
$$;

-- SELECT mein use karo (function!):
SELECT * FROM get_user_stats(42);
-- Returns: total_orders=15, total_spent=75000, tier='Gold'
```

---

### Real-World: Order Processing Procedure

```sql
CREATE OR REPLACE PROCEDURE process_order(
  p_user_id   INT,
  p_items     JSONB,   -- [{"product_id": 1, "qty": 2}, ...]
  p_payment   TEXT,
  OUT p_order_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_item      JSONB;
  v_product   RECORD;
  v_total     DECIMAL := 0;
BEGIN
  -- Step 1: Validate + Lock all products
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::INT
    FOR UPDATE;  -- Lock to prevent overselling

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item->>'product_id';
    END IF;

    IF v_product.stock < (v_item->>'qty')::INT THEN
      RAISE EXCEPTION 'Insufficient stock: % (available: %, required: %)',
        v_product.name, v_product.stock, v_item->>'qty';
    END IF;

    -- Running total
    v_total := v_total + (v_product.price * (v_item->>'qty')::INT);
  END LOOP;

  -- Step 2: Create order
  INSERT INTO orders (user_id, total, status, payment_method, created_at)
  VALUES (p_user_id, v_total, 'confirmed', p_payment, NOW())
  RETURNING id INTO p_order_id;

  -- Step 3: Order items + Inventory deduct
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM products WHERE id = (v_item->>'product_id')::INT;

    -- Order item insert
    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES (
      p_order_id,
      (v_item->>'product_id')::INT,
      (v_item->>'qty')::INT,
      v_product.price
    );

    -- Stock deduct
    UPDATE products
    SET stock = stock - (v_item->>'qty')::INT, updated_at = NOW()
    WHERE id = (v_item->>'product_id')::INT;
  END LOOP;

  -- Step 4: Notification queue
  INSERT INTO notification_queue (user_id, type, data)
  VALUES (p_user_id, 'order_confirmed',
          jsonb_build_object('order_id', p_order_id, 'total', v_total));

END;
$$;
```

---

### Node.js se Call Karna

```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Procedure call karo
async function transferMoney(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    // CALL syntax for procedures
    const result = await client.query(
      'CALL transfer_money($1, $2, $3, NULL)',
      [fromId, toId, amount]
    );
    console.log('Transfer result:', result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('Transfer failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Function call karo (SELECT mein)
async function getUserStats(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM get_user_stats($1)', [userId]
  );
  return rows[0];
}

// Order process karo
async function placeOrder(userId, items, paymentMethod) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'CALL process_order($1, $2, $3, NULL)',
      [userId, JSON.stringify(items), paymentMethod]
    );

    await client.query('COMMIT');
    return { orderId: result.rows[0].p_order_id };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Express routes
app.post('/api/transfer', async (req, res) => {
  try {
    const { fromId, toId, amount } = req.body;
    const result = await transferMoney(fromId, toId, amount);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

---

### When to Use Stored Procedures

```
✅ USE KARO:
  - Complex multi-step transactions (bank transfers, order processing)
  - Batch operations (monthly reports, data archival)
  - Security: Direct table access nahi dena, sirf SP expose karna
  - Heavy computation jo DB pe better run hoti hai

❌ AVOID KARO:
  - Simple CRUD operations (ORM better hai)
  - Business logic jo frequently change hoti hai
  - Modern microservices (application layer pe rakhna better)
  - Team mein SQL expertise kam ho
```

| Aspect | Stored Procedure | Application Code |
|---|---|---|
| Network Trips | Minimal ✅ | Multiple ❌ |
| Debugging | Hard ❌ | Easy ✅ |
| Version Control | DB mein ❌ | Git mein ✅ |
| Testing | Hard ❌ | Easy ✅ |
| Performance | Faster ✅ | Depends |

> 💡 **Interview Tip:** "Bank transfers aur critical multi-step transactions ke liye stored procedures use karta hoon — network round trips zero. Lekin modern apps mein business logic application layer pe rakhna prefer karta hoon — better testability, version control. Trade-off clearly explain karo."

---

## 3. Triggers

> **Definition (English):** A trigger is a database object that automatically executes a specified function in response to a database event (INSERT, UPDATE, DELETE, TRUNCATE) on a table — without any explicit call from the application.

> **Hinglish:** Trigger = Automatic reaction. "Jab bhi yeh kaam ho → woh kaam khud ho jaaye." Jaise: order insert ho → inventory automatically deduct ho. App ko kuch nahi karna — DB khud handle kar leta hai.

---

### Trigger Types

```
TIMING:
  BEFORE  → Event se PEHLE fire hota hai (data modify kar sakte ho)
  AFTER   → Event ke BAAD fire hota hai (side effects ke liye)
  INSTEAD OF → View pe actual operation replace karo

EVENT:
  INSERT | UPDATE | DELETE | TRUNCATE

LEVEL:
  FOR EACH ROW       → Har affected row ke liye ek baar
  FOR EACH STATEMENT → Poori statement ke liye ek baar
```

---

### Trigger Anatomy

```sql
-- Step 1: Trigger Function banao
CREATE OR REPLACE FUNCTION my_trigger_fn()
RETURNS TRIGGER    -- ← Return type TRIGGER hona chahiye
LANGUAGE plpgsql
AS $$
BEGIN
  -- Special Variables:
  -- TG_OP       → 'INSERT', 'UPDATE', 'DELETE'
  -- TG_TABLE_NAME → Table ka naam
  -- NEW         → INSERT/UPDATE ke baad ki row
  -- OLD         → UPDATE/DELETE se pehle ki row

  RETURN NEW;  -- INSERT/UPDATE ke liye (BEFORE mein modify bhi ho sakta hai)
  -- RETURN NULL;  -- Operation CANCEL karo (BEFORE trigger mein)
  -- RETURN OLD;   -- DELETE ke liye
END;
$$;

-- Step 2: Trigger attach karo table pe
CREATE TRIGGER my_trigger
  AFTER INSERT OR UPDATE OR DELETE  -- Kab fire ho
  ON my_table                       -- Kahan
  FOR EACH ROW                      -- Kitni baar
  EXECUTE FUNCTION my_trigger_fn(); -- Kya kare
```

---

### Trigger 1: Audit Log — Data Change Track Karo

```sql
-- Audit table — kab, kisne, kya change kiya
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  table_name  TEXT      NOT NULL,
  operation   TEXT      NOT NULL,  -- INSERT, UPDATE, DELETE
  record_id   INT,
  old_data    JSONB,               -- Pehle ka data
  new_data    JSONB,               -- Baad ka data
  changed_by  TEXT      DEFAULT current_user,
  changed_at  TIMESTAMP DEFAULT NOW()
);

-- Universal audit function — har table pe laga sakte ho
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, operation, record_id, new_data)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, row_to_json(NEW)::JSONB);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, operation, record_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id,
            row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, record_id, old_data)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, row_to_json(OLD)::JSONB);
    RETURN OLD;
  END IF;
END;
$$;

-- Kisi bhi table pe attach karo:
CREATE TRIGGER users_audit
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER orders_audit
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Test:
UPDATE users SET email = 'new@gmail.com' WHERE id = 1;
-- audit_log mein auto:
-- operation=UPDATE, old_data={email:'old@gmail.com'}, new_data={email:'new@gmail.com'}

SELECT * FROM audit_log WHERE table_name = 'users' ORDER BY changed_at DESC;
```

---

### Trigger 2: Auto Updated_at — Timestamp Auto-Set

```sql
-- Most common trigger — har table pe chahiye!
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();  -- BEFORE trigger mein NEW modify kar sakte hain!
  RETURN NEW;
END;
$$;

-- Saari tables pe lagao
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Test:
UPDATE users SET name = 'New Name' WHERE id = 1;
-- updated_at automatically NOW() ho gaya — manually set karne ki zaroorat nahi!
SELECT name, updated_at FROM users WHERE id = 1;
```

---

### Trigger 3: Inventory Auto-Update

```sql
-- Jab order_item insert ho → stock automatically deduct karo
CREATE OR REPLACE FUNCTION deduct_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock INT;
BEGIN
  -- Current stock lo aur lock karo
  SELECT stock INTO v_stock
  FROM products
  WHERE id = NEW.product_id
  FOR UPDATE;

  -- Validation
  IF v_stock < NEW.quantity THEN
    RAISE EXCEPTION
      'Insufficient stock for product %. Available: %, Required: %',
      NEW.product_id, v_stock, NEW.quantity;
  END IF;

  -- Stock deduct karo
  UPDATE products
  SET stock      = stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;

  -- Low stock alert
  IF (v_stock - NEW.quantity) < 10 THEN
    INSERT INTO alerts (type, message, created_at)
    VALUES (
      'low_stock',
      format('Product %s low stock: %s remaining',
             NEW.product_id, v_stock - NEW.quantity),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER inventory_auto_deduct
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION deduct_inventory();

-- App mein normal INSERT karo — inventory khud update ho jaayega!
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (101, 5, 2, 599.00);
-- ↑ Ye INSERT automatically inventory deduct karega aur low stock alert bhi!
```

---

### Trigger 4: Soft Delete

```sql
-- DELETE ko soft-delete mein convert karo
CREATE OR REPLACE FUNCTION soft_delete_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Actual delete mat karo — sirf flag set karo
  UPDATE users
  SET deleted_at = NOW()
  WHERE id = OLD.id;

  RETURN NULL;  -- NULL = actual DELETE cancel ho jaata hai!
END;
$$;

CREATE TRIGGER users_soft_delete
  BEFORE DELETE ON users
  FOR EACH ROW
  WHEN (OLD.deleted_at IS NULL)  -- Sirf if not already deleted
  EXECUTE FUNCTION soft_delete_user();

-- App DELETE likhti hai → Actually soft-delete hota hai!
DELETE FROM users WHERE id = 42;
-- Row delete nahi hua! deleted_at = NOW() set ho gaya.

-- Active users fetch:
SELECT * FROM users WHERE deleted_at IS NULL;
```

---

### Trigger 5: Denormalized Counter Sync

```sql
-- orders table pe order_count maintain karo (no JOIN needed for count!)
ALTER TABLE users ADD COLUMN IF NOT EXISTS order_count INT DEFAULT 0;

CREATE OR REPLACE FUNCTION sync_order_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET order_count = order_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET order_count = order_count - 1 WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER maintain_order_count
  AFTER INSERT OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION sync_order_count();

-- Ab kisi bhi user ka order count instant milega — no JOIN!
SELECT name, order_count FROM users WHERE id = 42;
-- join nahi karna, count query nahi karna, sirf ek column!
```

---

### Node.js — Trigger Transparent Hai

```javascript
// Triggers DB pe fire hote hain — app mein koi change nahi chahiye!
// Normal INSERT/UPDATE/DELETE karo — trigger khud fire hoga

async function createOrderItem(orderId, productId, qty, price) {
  // Yeh INSERT fire karega:
  //   → inventory_auto_deduct trigger (stock deduct)
  //   → audit_trigger_fn (audit log)
  //   → maintain_order_count (counter update)
  const { rows } = await pool.query(
    `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [orderId, productId, qty, price]
  );
  return rows[0];
  // 3 side effects, 0 extra code!
}

async function deleteUser(userId) {
  // Yeh DELETE actually soft-delete trigger fire karega!
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  // Row delete nahi hua — deleted_at set ho gaya — app ko pata bhi nahi!
}

// Audit trail check karo
async function getUserHistory(userId) {
  const { rows } = await pool.query(
    `SELECT operation, old_data, new_data, changed_at
     FROM audit_log
     WHERE table_name = 'users' AND record_id = $1
     ORDER BY changed_at DESC`,
    [userId]
  );
  return rows;
}
```

---

### Triggers — Do's & Don'ts

```
✅ USE TRIGGERS FOR:
  - Audit logging (data change tracking)
  - Auto-updating timestamps (updated_at)
  - Maintaining denormalized counters
  - Business rule validation (simple)
  - Soft deletes
  - Cross-table sync (inventory, counters)

❌ AVOID TRIGGERS FOR:
  - Complex business logic (debugging nightmare)
  - Heavy computation (trigger slow = every query slow)
  - Sending emails/notifications (side effect anpredictable)
  - Chain triggers (trigger triggers another trigger)
  - High-write-volume tables (overhead significant)
```

> 💡 **Interview Tip:** "Production mein audit log aur updated_at ke liye triggers use karta hoon — transparent, automatic. Complex logic triggers mein avoid karta hoon — debugging bahut hard hai aur failures quietly query ko break kar deti hain. Trigger failures silent hoti hain — EXCEPTION handling zaroori hai."

---

## 4. Views & Types

> **Definition (English):** A view is a virtual table based on a stored SQL query. It doesn't store data itself (usually) — it's a named query that you can use like a table. Simplifies complex queries, provides security layer, and abstracts data structure.

> **Hinglish:** View = Saved SQL query jisko table ki tarah use karo. Complex 5-table JOINs baar baar likhne ki zaroorat nahi — ek baar view banao, phir `SELECT * FROM my_view` — seedha simple!

---

### 4 Types of Views

```
1. Simple View          → Single table, basic filter
2. Complex View         → Multiple tables, JOINs, aggregations
3. Materialized View    → Data actually disk pe store hoti hai (cached!)
4. Updatable View       → INSERT/UPDATE through view possible
```

---

### Simple View

```sql
-- Active users — deleted aur inactive filter ho jaaye automatically
CREATE OR REPLACE VIEW active_users AS
SELECT
  id,
  name,
  email,
  plan,
  created_at
FROM users
WHERE deleted_at IS NULL
  AND is_active = true;

-- Use:
SELECT * FROM active_users WHERE plan = 'premium';
SELECT COUNT(*) FROM active_users;

-- WHERE deleted_at IS NULL AND is_active = true → hamesha apply hoga
-- Har query mein manually likhna nahi padega!

DROP VIEW IF EXISTS active_users;  -- Remove karo
```

---

### Complex View — Multiple Tables

```sql
-- User dashboard — ek view mein sab info
CREATE OR REPLACE VIEW user_dashboard AS
SELECT
  u.id,
  u.name,
  u.email,
  u.plan,
  u.created_at                              AS member_since,

  -- Order statistics
  COUNT(DISTINCT o.id)                      AS total_orders,
  COALESCE(SUM(o.total), 0)               AS lifetime_value,
  COALESCE(AVG(o.total), 0)              AS avg_order_value,
  MAX(o.created_at)                         AS last_order_date,

  -- Profile
  p.avatar_url,
  p.city,
  p.bio,

  -- Computed status
  CASE
    WHEN SUM(o.total) > 100000 THEN 'Platinum'
    WHEN SUM(o.total) > 50000  THEN 'Gold'
    WHEN SUM(o.total) > 10000  THEN 'Silver'
    ELSE 'Bronze'
  END                                       AS tier

FROM users u
LEFT JOIN orders o
  ON u.id = o.user_id
  AND o.status = 'completed'
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email, u.plan, u.created_at,
         p.avatar_url, p.city, p.bio;

-- Use karo — ek simple SELECT!
SELECT * FROM user_dashboard WHERE id = 42;
-- Returns: name, email, total_orders, lifetime_value, tier, etc.
-- Behind the scenes: 3-table JOIN + GROUP BY — lekin app ko simple lagta hai!

-- Top spenders
SELECT id, name, lifetime_value, tier
FROM user_dashboard
WHERE lifetime_value > 50000
ORDER BY lifetime_value DESC
LIMIT 10;
```

---

### Materialized View — Performance Critical!

> **Definition (English):** A materialized view physically stores the query result on disk. Unlike regular views (which re-execute the query each time), it returns pre-computed data instantly. Must be manually refreshed when underlying data changes.

> **Hinglish:** Regular view = Har query pe JOIN execute hoti hai (slow for large data). Materialized view = Result disk pe store hai, instantly return hota hai! Dashboard analytics ke liye perfect. Tradeoff: Refresh karna padta hai.

```sql
-- Product sales summary — heavy aggregation, pre-compute karo!
CREATE MATERIALIZED VIEW product_sales_summary AS
SELECT
  p.id,
  p.name,
  p.category,
  p.price,
  COALESCE(COUNT(oi.id), 0)                            AS total_orders,
  COALESCE(SUM(oi.quantity), 0)                        AS total_units_sold,
  COALESCE(SUM(oi.quantity * oi.unit_price), 0)        AS total_revenue,
  COALESCE(AVG(oi.unit_price), 0)                      AS avg_selling_price,
  MAX(o.created_at)                                    AS last_sold_at
FROM products p
LEFT JOIN order_items oi ON p.id  = oi.product_id
LEFT JOIN orders o      ON oi.order_id = o.id AND o.status = 'completed'
GROUP BY p.id, p.name, p.category, p.price;

-- Index zaroori hai (especially for CONCURRENTLY refresh)!
CREATE UNIQUE INDEX ON product_sales_summary(id);
CREATE INDEX ON product_sales_summary(total_revenue DESC);
CREATE INDEX ON product_sales_summary(category);

-- Query — instant! (Pre-computed data)
SELECT *
FROM product_sales_summary
WHERE category = 'electronics'
ORDER BY total_revenue DESC
LIMIT 10;
-- No joins, no aggregation at query time → milliseconds!
```

---

### Materialized View — Refresh

```sql
-- Option 1: Blocking refresh (reads block hoti hain during refresh)
REFRESH MATERIALIZED VIEW product_sales_summary;

-- Option 2: Non-blocking (production ke liye!) — UNIQUE INDEX required
REFRESH MATERIALIZED VIEW CONCURRENTLY product_sales_summary;
-- Users query karte rahte hain refresh ke dauran ✅

-- Check last refresh time:
SELECT
  matviewname,
  pg_size_pretty(pg_total_relation_size(matviewname::text)) AS size,
  ispopulated
FROM pg_matviews
WHERE schemaname = 'public';
```

```javascript
// Node.js se scheduled refresh
const cron = require('node-cron');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function refreshMaterializedViews() {
  const views = ['product_sales_summary', 'user_dashboard_cache'];
  
  for (const view of views) {
    const start = Date.now();
    await pool.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`);
    console.log(`✅ Refreshed ${view} in ${Date.now() - start}ms`);
  }
}

// Har raat 2 baje refresh karo
cron.schedule('0 2 * * *', refreshMaterializedViews);

// After bulk data import bhi refresh karo
async function importProductsAndRefresh(data) {
  await importProducts(data);        // Bulk import
  await refreshMaterializedViews();  // Refresh views
  console.log('Import + refresh done!');
}
```

---

### Security View — Sensitive Data Hide Karo

```sql
-- users table mein sensitive columns hain:
-- password_hash, ssn, credit_card, internal_notes

-- Public API ke liye safe view
CREATE OR REPLACE VIEW public_users AS
SELECT
  id,
  name,
  -- Email mask karo: rahul@gmail.com → rah***@gmail.com
  SUBSTRING(email, 1, 3) || '***@' ||
    SPLIT_PART(email, '@', 2)     AS email_masked,
  plan,
  -- Avatar only, no other personal info
  avatar_url,
  created_at
FROM users
WHERE deleted_at IS NULL;
-- password_hash, ssn, credit_card → nahi hai is view mein!

-- Permissions:
REVOKE SELECT ON users FROM api_role;        -- Direct table access band!
GRANT  SELECT ON public_users TO api_role;   -- Sirf view access

-- API se query:
SELECT * FROM public_users WHERE id = 1;
-- {id: 1, name: 'Rahul', email_masked: 'rah***@gmail.com', plan: 'premium'}
-- Sensitive data visible nahi!
```

---

### Updatable View

```sql
-- Simple views pe INSERT/UPDATE/DELETE possible hai
CREATE OR REPLACE VIEW active_products AS
SELECT id, name, price, stock, category
FROM products
WHERE is_active = true;

-- Update through view — actually products table update hoga!
UPDATE active_products SET price = 999 WHERE id = 5;

-- WITH CHECK OPTION — view ki conditions enforce karo
CREATE OR REPLACE VIEW premium_products AS
SELECT * FROM products WHERE price > 1000
WITH CHECK OPTION;

-- Yeh fail hoga (price < 1000):
INSERT INTO premium_products (name, price) VALUES ('Cheap', 50);
-- ERROR: new row violates check option for view "premium_products"

-- Non-updatable hoti hai jab:
-- GROUP BY, HAVING, DISTINCT, UNION, aggregate functions, multiple base tables
```

---

### Node.js se Views Use Karna

```javascript
// Views normal tables ki tarah query karo!
async function getUserDashboard(userId) {
  // Complex JOIN view ke andar — yahan seedha query
  const { rows } = await pool.query(
    'SELECT * FROM user_dashboard WHERE id = $1', [userId]
  );
  return rows[0];
  // Returns: all stats, tier, profile — no extra joins in code!
}

async function getTopProducts(category) {
  // Materialized view — instant response
  const { rows } = await pool.query(
    `SELECT name, total_revenue, total_units_sold
     FROM product_sales_summary
     WHERE category = $1
     ORDER BY total_revenue DESC
     LIMIT 10`,
    [category]
  );
  return rows;
}

// Prisma ke saath raw query se view use karo
const result = await prisma.$queryRaw`
  SELECT id, name, lifetime_value, tier
  FROM user_dashboard
  WHERE plan = 'premium'
  ORDER BY lifetime_value DESC
`;
```

---

### Views — Summary Table

| View Type | Data Stored? | Re-executes? | Refresh? | Best For |
|---|---|---|---|---|
| **Simple View** | No | Yes (every query) | N/A | Filter/security |
| **Complex View** | No | Yes (every query) | N/A | Simplify JOINs |
| **Materialized View** | Yes (disk) | No (pre-computed) | Manual/Scheduled | Heavy aggregations |
| **Updatable View** | No | Yes | N/A | Controlled writes |

> 💡 **Interview Tip:** "Materialized views dashboard ke liye game-changer — complex aggregations pre-compute karo, milliseconds mein serve karo. Regular views security ke liye — API sensitive columns nahi dekhti. Key difference: Regular view = virtual query jo baar baar execute hoti hai. Materialized view = physically stored result jo refresh karna padta hai."

---

## 5. Replication

> **Definition (English):** Replication is the process of automatically copying and synchronizing data from one database server (primary/master) to one or more servers (replicas/slaves) — ensuring data redundancy, high availability, and read scalability.

> **Hinglish:** DB ki exact copy banao multiple servers pe aur automatically sync mein rakho. Primary pe sab kuch hota hai (writes). Replicas automatic copy receive karte hain. Primary crash kare → replica takeover kar leta hai.

---

### Master → Replica Architecture

```
Write Flow:
  App → INSERT/UPDATE/DELETE → Primary (Master)
                                     ↓
                              WAL log generate hota hai
                              (Write-Ahead Log — change record)
                                     ↓
                    ┌────────────────┼────────────────┐
                    ↓                ↓                ↓
                Replica 1        Replica 2        Replica 3
              WAL apply karo   WAL apply karo   WAL apply karo
              (Sync ya Async)

Read Flow:
  App → SELECT query → Replica 1 (ya 2 ya 3 — load balanced)
```

---

### PostgreSQL Replication Setup

```bash
# ── PRIMARY SERVER ───────────────────────────────────────────────

# postgresql.conf:
wal_level = replica           # WAL detail level for replication
max_wal_senders = 5           # Max replica connections allowed
wal_keep_size = 256           # MB of WAL to retain

# pg_hba.conf — Replica ko connect karne do:
# host  replication  repl_user  replica_ip/32  md5


# ── REPLICA SERVER ───────────────────────────────────────────────

# Step 1: Primary se base copy lo
pg_basebackup \
  --host=primary-ip \
  --username=repl_user \
  --pgdata=/var/lib/postgresql/data \
  --format=plain \
  --wal-method=stream \
  --progress

# Step 2: postgresql.conf pe replica:
primary_conninfo = 'host=primary-ip port=5432 user=repl_user password=secret'
hot_standby = on              # Reads allow karo replica pe

# Step 3: Standby signal file banao
touch /var/lib/postgresql/data/standby.signal
```

```sql
-- ── STATUS CHECK ─────────────────────────────────────────────────

-- Primary pe — replica status dekho:
SELECT
  client_addr                                       AS replica_ip,
  state,                                            -- streaming/catchup
  sync_state,                                       -- async/sync
  pg_size_pretty(sent_lsn - replay_lsn)            AS replication_lag,
  EXTRACT(EPOCH FROM (now() - reply_time))::INT    AS seconds_behind
FROM pg_stat_replication;

-- Is this primary or replica?
SELECT pg_is_in_recovery();
-- false = Primary ✅ | true = Replica

-- Replica pe — lag dekho:
SELECT
  now() - pg_last_xact_replay_timestamp() AS replication_delay;
```

---

### Synchronous vs Asynchronous

```sql
-- ── SYNCHRONOUS — Zero Data Loss ──────────────────────────────
-- Primary WAITS for replica to confirm before returning success
-- Slower writes, but guaranteed no data loss

-- postgresql.conf (Primary):
synchronous_commit = on
synchronous_standby_names = 'replica1'  -- Ya 'ANY 1 (replica1, replica2)'

-- Transaction behavior:
BEGIN;
  INSERT INTO payments (amount, user_id) VALUES (5000, 1);
COMMIT;
-- ↑ Ye tabhi complete hoga jab replica ne WAL receive karke confirm kiya
-- Guarantee: Even if primary crashes right after, replica has the data!

-- ── ASYNCHRONOUS — High Performance ──────────────────────────
-- Primary commits immediately, replica catches up in background
-- Slightly faster writes, tiny risk of data loss on crash

-- postgresql.conf:
synchronous_commit = off   -- Default PostgreSQL setting

-- Replication lag acceptable hai jab:
-- Social media, analytics, content platforms
```

---

### Read Replicas — Load Distribution

```javascript
const { Pool } = require('pg');

// ── Connection Setup ──────────────────────────────────────────
const primary = new Pool({
  host: process.env.PRIMARY_HOST,
  port: 5432, database: 'myapp', max: 20
});

const replicas = [
  process.env.REPLICA1_HOST,
  process.env.REPLICA2_HOST,
  process.env.REPLICA3_HOST,
].filter(Boolean).map(host => new Pool({
  host, port: 5432, database: 'myapp', max: 15
}));

let rr = 0;  // Round-robin counter
const getReadPool = () => replicas[rr++ % replicas.length];

// ── Usage Patterns ────────────────────────────────────────────

// Writes → Primary
async function createProduct(data) {
  return primary.query(
    'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *',
    [data.name, data.price, data.stock]
  );
}

// Reads → Replica (load balanced)
async function listProducts(category) {
  return getReadPool().query(
    'SELECT * FROM products WHERE category = $1 AND is_active = true',
    [category]
  );
}

// Transactions → Always Primary
async function purchaseProduct(userId, productId, qty) {
  const client = await primary.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT stock FROM products WHERE id = $1 FOR UPDATE', [productId]
    );
    if (rows[0].stock < qty) throw new Error('Out of stock');

    await client.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2', [qty, productId]
    );
    const order = await client.query(
      'INSERT INTO orders (user_id, product_id, qty) VALUES ($1, $2, $3) RETURNING *',
      [userId, productId, qty]
    );

    await client.query('COMMIT');
    return order.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

### Replication Lag Problem — Solutions

```javascript
// Problem: User ne profile update kiya → Immediately same page pe gaya
//          Replica se read hua → PURANA DATA! 😱

// ── Solution: Read-Your-Writes Pattern ───────────────────────
const redis = require('redis');
const cache = redis.createClient({ url: process.env.REDIS_URL });

async function updateUser(userId, data) {
  // Primary pe write karo
  await primary.query(
    'UPDATE users SET name=$1, email=$2 WHERE id=$3',
    [data.name, data.email, userId]
  );

  // Flag set karo: "yeh user abhi likh ke gaya hai"
  await cache.setEx(`recent_write:${userId}`, 15, '1');  // 15 seconds
}

async function getUser(userId) {
  // Kya is user ne recently write kiya?
  const recentWrite = await cache.get(`recent_write:${userId}`);

  if (recentWrite) {
    // Haan → Primary se padho (guaranteed latest)
    const { rows } = await primary.query(
      'SELECT * FROM users WHERE id = $1', [userId]
    );
    return rows[0];
  }

  // Nahi → Replica se padho (fast, possibly slightly stale — acceptable)
  const { rows } = await getReadPool().query(
    'SELECT * FROM users WHERE id = $1', [userId]
  );
  return rows[0];
}
```

---

### Failover — Primary Down!

#### Manual Failover

```bash
# ── Emergency: Primary crashed! ──────────────────────────────

# Step 1: Best replica identify karo (least lag wala)
# Replicas pe run karo:
psql -c "SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();"
# Jo sabse zyada replay_lsn wala hai → wo best candidate!

# Step 2: Best replica ko promote karo
# Replica server pe:
pg_ctl promote -D /var/lib/postgresql/data
# Ya:
touch /var/lib/postgresql/data/promote.signal

# Step 3: Verify promotion
psql -c "SELECT pg_is_in_recovery();"
# false → Successfully promoted to Primary! ✅

# Step 4: Doosre replicas ko new primary ke peeche lagao
# Other replicas pe postgresql.conf update karo:
primary_conninfo = 'host=new-primary-ip port=5432 user=repl_user ...'

# Step 5: App config update karo
# .env:
PRIMARY_HOST=replica1.internal  # Old replica ab primary hai

# Step 6: Old primary recover karo (agar possible)
# Old primary → Replica banao new primary ke peeche
pg_basebackup --host=new-primary-ip ...  # Fresh copy lo
```

#### Automatic Failover — Patroni (Production Standard)

```yaml
# patroni.yml — Automatic leader election + failover
scope: myapp-cluster
name: node1  # Unique per server

restapi:
  listen: 0.0.0.0:8008
  connect_address: node1.internal:8008

etcd3:  # Distributed consensus store
  hosts: etcd1:2379,etcd2:2379,etcd3:2379

bootstrap:
  dcs:
    ttl: 30              # Leader lease seconds
    loop_wait: 10        # Heartbeat interval
    retry_timeout: 10
    maximum_lag_on_failover: 1048576  # 1MB max lag allowed

  initdb:
    - encoding: UTF8
    - data-checksums

postgresql:
  listen: 0.0.0.0:5432
  connect_address: node1.internal:5432
  data_dir: /var/lib/postgresql/data
  parameters:
    max_connections: 200
    shared_buffers: 4GB
    wal_level: replica
    hot_standby: on
```

```bash
# Patroni cluster status:
patronictl -c /etc/patroni.yml list

# Output:
# + Cluster: myapp-cluster ─────────────────────────────+
# | Member | Host   | Role    | State   | TL | Lag in MB |
# |--------|--------|---------|---------|----|-----------|
# | node1  | host1  | Leader  | running | 3  |           |
# | node2  | host2  | Replica | running | 3  |   0       |
# | node3  | host3  | Replica | running | 3  |   0       |

# Failover test (graceful):
patronictl -c /etc/patroni.yml failover myapp-cluster --master node1

# Manual switchover:
patronictl -c /etc/patroni.yml switchover myapp-cluster
```

```javascript
// App mein HAProxy use karo — transparent failover!
const pools = {
  write: new Pool({ host: 'haproxy.internal', port: 5000 }),  // → Leader
  read:  new Pool({ host: 'haproxy.internal', port: 5001 }),  // → Replicas
};

// Failover transparent hai:
// Primary fail → Patroni promotes replica → HAProxy routes to new primary
// App kuch nahi karta!
```

---

### AWS RDS — Managed Replication

```javascript
// AWS RDS Multi-AZ: Automatic failover in ~60 seconds
// Cluster endpoint same rehta hai — no app config change!

const { Pool } = require('pg');

const config = {
  // Writer endpoint — automatically points to current Primary
  write: new Pool({
    host: 'myapp.cluster-xyz.us-east-1.rds.amazonaws.com',
    port: 5432
  }),
  // Reader endpoint — automatically load balances across replicas
  read: new Pool({
    host: 'myapp.cluster-ro-xyz.us-east-1.rds.amazonaws.com',
    port: 5432
  })
};

// Failover pe: AWS DNS update karta hai
// Same hostname → new IP → App auto-reconnects ✅
```

> 💡 **Interview Tip:** "Production mein Patroni + HAProxy ya AWS RDS Multi-AZ use karta hoon — automatic failover, ~30-60 second recovery, application transparent. Replication lag ke liye read-your-writes pattern with Redis flag. Banking ke liye synchronous, normal apps ke liye asynchronous."

---

## 6. Consistency Models

> **Definition (English):** Consistency models define what data a client is guaranteed to see when reading from a distributed database — especially after writes have occurred on one or more nodes.

> **Hinglish:** Distributed system mein multiple servers hote hain. Server A pe write karo → Server B se read karo — kya latest data milega? Ya thoda purana? Yahi consistency model decide karta hai. CAP theorem se directly connected hai.

---

### Strong Consistency

> **Definition (English):** After a write completes, ALL subsequent reads from ANY node will immediately return that written value. No stale data ever.

> **Hinglish:** Write kiya → Done. Ab koi bhi server se padho → Same (latest) data milega. 100% guarantee! Bank balance update hua → Turant saare servers pe same value.

```
Strong Consistency Flow:

Client → Write "balance = ₹2000" → Primary
                                         ↓
                              WAIT for ALL replicas
                               ↓           ↓
                          Replica1     Replica2
                         confirms     confirms
                                         ↓
                              Client ← SUCCESS

Now:
  Any client reads from ANY node:
    Replica1 → ₹2000 ✅
    Replica2 → ₹2000 ✅
    Primary  → ₹2000 ✅
  GUARANTEED! No stale data.
```

```javascript
// PostgreSQL — Strong Consistency with Synchronous Replication

// postgresql.conf:
// synchronous_commit = on
// synchronous_standby_names = '*'  (all replicas must confirm)

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

  // Lock + read
  const { rows } = await client.query(
    'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [accountId]
  );

  if (rows[0].balance < amount) throw new Error('Insufficient funds');

  // Write
  await client.query(
    'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
    [amount, accountId]
  );

  await client.query('COMMIT');
  // ← Commit tabhi complete hoga jab saare replicas ne confirm kiya
  // Ab kisi bhi replica se padho → Updated balance milega!
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}

// MongoDB Strong Consistency:
const result = await db.collection('accounts').findOneAndUpdate(
  { _id: accountId },
  { $inc: { balance: -amount } },
  {
    writeConcern: { w: 'majority', j: true },  // Majority confirm kare
    readConcern:  { level: 'majority' },        // Latest committed read
    returnDocument: 'after'
  }
);
```

---

### Eventual Consistency

> **Definition (English):** After a write, all replicas will EVENTUALLY converge to the same value — but during a brief window, different nodes may return different (stale) values. The system guarantees convergence, not immediacy.

> **Hinglish:** Write kiya → Kuch milliseconds/seconds ke baad saare servers pe update ho jaayega. Lekin beech ke waqt koi purana data dekh sakta hai. "Eventually" matlab guaranteed convergence, not immediate. Social media likes ke liye yeh acceptable hai!

```
Eventual Consistency Flow:

t=0ms:  Client writes "likes = 1000" → Node1
        Node1=1000, Node2=999, Node3=999 (replication pending)

t=10ms: User A reads from Node1 → likes=1000 ✅
        User B reads from Node2 → likes=999  ← STALE! But acceptable.

t=200ms: Replication completes
         Node1=1000, Node2=1000, Node3=1000

Eventually all nodes agree! "Converged" ✅
```

```javascript
// Cassandra — Classic Eventual Consistency (AP system)
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({
  contactPoints: ['node1:9042', 'node2:9042', 'node3:9042'],
  localDataCenter: 'datacenter1'
});

// Write ONE consistency — fastest (single node confirm kare)
await client.execute(
  'UPDATE post_stats SET likes = likes + 1 WHERE post_id = ?',
  [postId],
  { consistency: cassandra.types.consistencies.one }
  // Sirf ek node confirm kare → very fast, eventual propagation
);

// Write QUORUM — balanced (majority confirm kare)
await client.execute(
  'UPDATE post_stats SET likes = likes + 1 WHERE post_id = ?',
  [postId],
  { consistency: cassandra.types.consistencies.quorum }
  // 2/3 nodes confirm → more consistent, slightly slower
);

// Read (might be slightly stale — acceptable for social features)
const result = await client.execute(
  'SELECT likes FROM post_stats WHERE post_id = ?',
  [postId],
  { consistency: cassandra.types.consistencies.one }
);
```

---

### Consistency Levels — Full Spectrum

```
Weakest ←──────────────────────────────────────────→ Strongest

Eventual     Read-Your-   Session    Bounded        Strong
Consistency  Writes       Consistency Staleness    Consistency

Max Speed                                          Min Speed
Max Availability                            Min Availability
```

#### Read-Your-Writes

```javascript
// Guarantee: Tum apna khud ka write ZAROOR dekhoge
// Doosron ka update stale ho sakta hai — theek hai

const redis = require('redis').createClient();

async function updateProfile(userId, data) {
  await primaryPool.query('UPDATE users SET bio=$1 WHERE id=$2', [data.bio, userId]);
  await redis.setEx(`my_write:${userId}`, 30, '1');  // 30 second window
}

async function getProfile(userId) {
  const myWrite = await redis.get(`my_write:${userId}`);
  // Agar tumne recently likha hai → Primary se padho (consistent)
  const pool = myWrite ? primaryPool : replicaPool;
  const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
  return rows[0];
}
```

#### Bounded Staleness

```javascript
// Guarantee: Data maximum X milliseconds purana hoga, us se zyada nahi

async function readWithBoundedStaleness(query, params, maxStaleMs = 5000) {
  // Replica ka lag check karo
  const { rows } = await primaryPool.query(`
    SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))
           * 1000 AS lag_ms
    FROM pg_stat_replication LIMIT 1
  `);

  const lagMs = parseFloat(rows[0]?.lag_ms || 0);

  if (lagMs > maxStaleMs) {
    console.log(`Replica lag ${Math.round(lagMs)}ms > ${maxStaleMs}ms → Primary`);
    return primaryPool.query(query, params);
  }

  return replicaPool.query(query, params);
}
```

---

### Real World: Banking vs Social Media

```javascript
// ── BANKING — Strong Consistency MUST ────────────────────────
async function bankTransfer(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const { rows: [from] } = await client.query(
      'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromId]
    );
    const { rows: [to] } = await client.query(
      'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [toId]
    );

    if (from.balance < amount) throw new Error('Insufficient funds');

    await client.query('UPDATE accounts SET balance=balance-$1 WHERE id=$2', [amount, fromId]);
    await client.query('UPDATE accounts SET balance=balance+$1 WHERE id=$2', [amount, toId]);

    await client.query('COMMIT');
    // Strong consistency: Every node sees updated balances immediately ✅
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── SOCIAL MEDIA — Eventual Consistency OK ────────────────────
async function likePost(postId, userId) {
  // Redis mein instantly update (in-memory, ultra-fast)
  const newCount = await redis.incr(`post:${postId}:likes`);

  // Async queue mein daal do — DB eventually persist karega
  await messageQueue.publish('likes', { postId, userId, timestamp: Date.now() });

  // User ko turant updated count dikhao (from Redis — fast!)
  return { likes: newCount };
  // DB update slight delay se hoga — acceptable for likes!
}

// Background worker DB mein persist karta hai:
queue.process('likes', async ({ data: { postId, userId } }) => {
  await db.query(
    'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [postId, userId]
  );
  await db.query(
    'UPDATE posts SET like_count = like_count + 1 WHERE id = $1', [postId]
  );
});
```

---

### Consistency Model Comparison

| Model | Speed | Consistency | Use Case |
|---|---|---|---|
| **Strong** | Slowest | Perfect ✅ | Banking, inventory, auth |
| **Eventual** | Fastest | Stale possible | Likes, views, recommendations |
| **Read-Your-Writes** | Fast | Self-consistent | Profile updates, user feeds |
| **Bounded Staleness** | Fast | Max X ms stale | Analytics dashboards |

> 💡 **Interview Tip:** "Strong consistency = CP in CAP theorem. Eventual consistency = AP. Business requirement se decide karo — bank balance ke liye strong consistency nahi toh disaster. Social media likes ke liye eventual consistency sufficient hai aur much faster. Explain karo: P is mandatory in distributed systems, real choice is C vs A."

---

## 7. Backup & Recovery

> **Definition (English):** Backup is creating copies of database data so it can be restored after data loss, corruption, or disaster. Recovery is the process of restoring a database to a working state from those backups.

> **Hinglish:** Disaster aane se pehle backup lo, disaster aane ke baad recover karo. Production mein backup strategy must-have hai. Tested backup = real backup. Untested backup = false security!

---

### WAL Logs (Write-Ahead Logging)

> **Definition (English):** WAL is a durability mechanism where every change is first written to a sequential log file before being applied to data files. It enables crash recovery and point-in-time restore.

> **Hinglish:** Pehle log file mein likho, phir actual data mein. Server crash ho jaaye — WAL replay karo — last committed state restore ho jaata hai. ACID ka D (Durability) yahi implement karta hai.

```
WAL Flow:
  Transaction COMMIT
       ↓
  WAL file mein sequentially likho (fast!)
       ↓
  Client ko SUCCESS return karo
       ↓ (background)
  Actual data pages disk pe update karo

Crash Recovery:
  DB restart → WAL replay → Last committed state restored ✅

Replication:
  WAL streaming → Replica → Apply → Synchronized!
  (Same WAL, dual purpose: durability + replication)
```

```sql
-- WAL Configuration (postgresql.conf):
wal_level = replica        -- Replication ke liye enough detail
wal_buffers = 64MB         -- WAL write buffer
checkpoint_timeout = 15min -- Checkpoint frequency
checkpoint_completion_target = 0.9

-- WAL Archiving — Backup ke liye WAL files save karo:
archive_mode = on
archive_command = 'cp %p /mnt/wal-archive/%f'
-- Cloud mein:
-- archive_command = 'aws s3 cp %p s3://my-wal-archive/pg/%f'

-- WAL status check:
SELECT
  pg_walfile_name(pg_current_wal_lsn()) AS current_wal_file,
  pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) AS total_wal_written;

-- WAL directory size:
SELECT pg_size_pretty(SUM(size)) FROM pg_ls_waldir();
```

---

### Snapshots — Full Backup

#### pg_dump — Logical Backup

```bash
# ── Single Database Backup ────────────────────────────────────

pg_dump \
  --host=localhost \
  --port=5432 \
  --username=postgres \
  --dbname=myapp \
  --format=custom \          # Compressed + parallel restore possible
  --file=myapp_20240115.dump \
  --verbose

# Restore:
pg_restore \
  --host=localhost \
  --username=postgres \
  --dbname=myapp_restored \
  --jobs=4 \                 # Parallel restore — faster!
  --verbose \
  myapp_20240115.dump

# ── Selective Backup ──────────────────────────────────────────

# Specific tables:
pg_dump --table=users --table=orders myapp > critical_tables.sql

# Schema only (no data):
pg_dump --schema-only myapp > schema_only.sql

# Data only (no schema):
pg_dump --data-only myapp > data_only.sql

# Single table with condition:
pg_dump --table=orders \
        --where="created_at > '2024-01-01'" \
        myapp > recent_orders.sql
```

#### pg_basebackup — Physical Backup (Large DBs)

```bash
# Physical backup — much faster than pg_dump for large databases

pg_basebackup \
  --host=localhost \
  --username=replication_user \
  --pgdata=/backup/base_20240115 \
  --format=tar \             # Compressed tar files
  --compress=9 \             # Max compression
  --wal-method=stream \      # Include WAL files in backup
  --checkpoint=fast \        # Don't wait for next checkpoint
  --progress \
  --verbose

# Output: base.tar.gz + pg_wal.tar.gz
# Total time: Minutes (vs pg_dump hours for large DBs)
```

---

### Automated Backup Script

```bash
#!/bin/bash
# ── daily_backup.sh ───────────────────────────────────────────

set -e  # Exit on any error

DB_NAME="myapp"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.dump"
S3_BUCKET="s3://my-db-backups"
RETENTION_DAYS=30

echo "Starting backup: ${DATE}"

# 1. Create backup
pg_dump \
  --format=custom \
  --file="${BACKUP_FILE}" \
  --dbname="${DATABASE_URL}"

echo "✅ Backup created: $(du -sh ${BACKUP_FILE} | cut -f1)"

# 2. Upload to S3
aws s3 cp "${BACKUP_FILE}" "${S3_BUCKET}/${DB_NAME}/${DATE}.dump" \
  --storage-class STANDARD_IA  # Cheaper for infrequent access

echo "✅ Uploaded to S3"

# 3. Verify backup integrity
pg_restore --list "${BACKUP_FILE}" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ BACKUP VERIFICATION FAILED!"
  curl -X POST "${SLACK_WEBHOOK}" \
    -d '{"text":"🚨 DB Backup FAILED for myapp!"}'
  exit 1
fi

echo "✅ Backup verified successfully"

# 4. Old local backups cleanup
find "${BACKUP_DIR}" -name "*.dump" -mtime "+${RETENTION_DAYS}" -delete
echo "✅ Old backups cleaned up (>30 days)"

echo "Backup completed: ${BACKUP_FILE}"
```

```javascript
// Node.js Automated Backup
const { exec }  = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const cron      = require('node-cron');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs        = require('fs');
const path      = require('path');

const s3 = new S3Client({ region: 'ap-south-1' });

async function createAndUploadBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename  = `backup_${timestamp}.dump`;
  const localPath = path.join('/tmp', filename);

  try {
    console.log(`🔄 Starting backup: ${filename}`);

    // pg_dump
    await execAsync(
      `pg_dump --format=custom --file=${localPath} "${process.env.DATABASE_URL}"`
    );

    const stats = fs.statSync(localPath);
    console.log(`✅ Backup created: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);

    // S3 upload
    const fileBuffer = fs.readFileSync(localPath);
    await s3.send(new PutObjectCommand({
      Bucket: 'my-db-backups',
      Key:    `backups/${filename}`,
      Body:   fileBuffer,
      StorageClass: 'STANDARD_IA'
    }));

    console.log(`✅ Uploaded to S3: backups/${filename}`);

    // Verify
    await execAsync(`pg_restore --list ${localPath}`);
    console.log(`✅ Backup verified`);

  } finally {
    // Cleanup local file
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }
}

// Har raat 2 baje
cron.schedule('0 2 * * *', async () => {
  try {
    await createAndUploadBackup();
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    // Alert send karo
    await fetch(process.env.SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `🚨 DB Backup FAILED: ${err.message}` })
    });
  }
});
```

---

### Point-in-Time Recovery (PITR)

> **Definition (English):** PITR allows you to restore the database to any specific moment in time using a base backup combined with WAL log files. Essential for recovering from accidental data deletion or corruption.

> **Hinglish:** Galat `DROP TABLE orders` run ho gaya? PITR se usi second pe wapas jao jab table exist karti thi. Base backup + WAL logs = Time Machine! Galti ke 1 minute pehle ka state restore karo.

```
PITR Time Machine:

  Sunday 2AM         Monday 3:44 PM    Monday 3:45 PM (Accident!)
      |                    |                   |
  [Base Backup] ──── [WAL Logs] ─────── [DROP TABLE orders] ❌
      |                    |
      └────────────────────┘
      Restore to 3:44 PM → Table exists! ✅
```

```bash
# ── PITR Prerequisites ────────────────────────────────────────
# postgresql.conf:
archive_mode = on
archive_command = 'aws s3 cp %p s3://wal-archive/pg/%f'
wal_level = replica


# ── Recovery Steps ────────────────────────────────────────────
# Scenario: DROP TABLE orders at 2024-01-15 15:45:00
# Goal: Restore to 2024-01-15 15:44:00 (1 minute before accident)

# Step 1: Recovery instance banao
mkdir -p /var/lib/postgresql/recovery

# Step 2: Base backup extract karo
tar -xzf /backups/base_backup_20240114.tar.gz \
    -C /var/lib/postgresql/recovery

# Step 3: Recovery config set karo (PostgreSQL 12+)
cat >> /var/lib/postgresql/recovery/postgresql.conf << EOF

# PITR Recovery Settings
restore_command = 'aws s3 cp s3://wal-archive/pg/%f %p'
recovery_target_time = '2024-01-15 15:44:00'  # 1 min before accident!
recovery_target_action = 'promote'             # After recovery → become primary
recovery_target_inclusive = false              # Exact time tak hi recover karo
EOF

# Step 4: Recovery start karo
pg_ctl start -D /var/lib/postgresql/recovery

# PostgreSQL ab WAL replay karega:
# Sunday 2AM → Monday 3:44 PM (stop here!)
# 3:45 PM DROP TABLE → Apply NAHI hoga ✅

# Step 5: Verify
psql -d myapp -c "\dt orders"
# orders table wapas aa gayi! ✅

# Step 6: Data verify karo
psql -d myapp -c "SELECT COUNT(*) FROM orders;"
```

```javascript
// AWS RDS — PITR (one click!)
const { RDSClient, RestoreDBInstanceToPointInTimeCommand } = require('@aws-sdk/client-rds');

const rds = new RDSClient({ region: 'ap-south-1' });

async function recoverDatabase(targetTime) {
  console.log(`🔄 Recovering to: ${targetTime}`);

  const command = new RestoreDBInstanceToPointInTimeCommand({
    SourceDBInstanceIdentifier: 'myapp-production',
    TargetDBInstanceIdentifier: 'myapp-recovered',
    RestoreTime:                new Date(targetTime),
    DBInstanceClass:            'db.r6g.large',
    MultiAZ:                    false,
    Tags: [{ Key: 'Purpose', Value: 'PITR Recovery' }]
  });

  const response = await rds.send(command);
  console.log(`✅ Recovery initiated: ${response.DBInstance.DBInstanceIdentifier}`);
  console.log('RDS will be available in ~15-30 minutes');
  return response;
}

// Usage: Accident se 5 minutes pehle ka state restore karo
await recoverDatabase('2024-01-15T15:44:00.000Z');
```

---

### Backup Strategy — 3-2-1 Rule

```
3-2-1 Rule:
  3 copies of data    → Live DB + Daily backup + Weekly backup
  2 different storage → Local disk + Cloud (S3)
  1 offsite location  → Different AWS region

Retention Schedule:
  Daily backups    → 30 days   (PITR granularity)
  Weekly backups   → 12 weeks  (Monthly snapshots)
  Monthly backups  → 1 year    (Compliance)

WAL Archiving:
  Continuous → Every WAL file (typically every 16MB or 5 minutes)
  Enables PITR to any point within retention window!

RTO vs RPO:
  RTO (Recovery Time Objective):  Kitne time mein recover karoge?
  RPO (Recovery Point Objective): Kitna data loss acceptable hai?

  With PITR: RPO = few seconds (WAL frequency)
             RTO = 15-30 minutes (restore time)
```

```javascript
// ── Backup Verification (CRITICAL!) ──────────────────────────
// Backup hai toh hai — but test kiya?

async function verifyBackup(backupPath) {
  console.log('🔍 Verifying backup...');

  const testDb = 'backup_verify_' + Date.now();

  try {
    // Temp DB banao
    await execAsync(`createdb ${testDb}`);

    // Restore karo
    await execAsync(`pg_restore --dbname=${testDb} ${backupPath}`);

    // Sanity checks
    const pool = new Pool({ database: testDb });
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)    AS users,
        (SELECT COUNT(*) FROM orders)   AS orders,
        (SELECT MAX(created_at)::TEXT FROM orders) AS latest_order
    `);

    console.log('✅ Backup verification results:', rows[0]);

    await pool.end();
    return { valid: true, stats: rows[0] };

  } finally {
    // Cleanup
    await execAsync(`dropdb ${testDb}`).catch(() => {});
  }
}

// Har backup ke baad verify karo — silently!
// Untested backup = false sense of security!
```

> 💡 **Interview Tip:** "3-2-1 rule follow karta hoon. PITR ke liye WAL archiving must-have hai — iske bina time-travel recovery impossible. Most important: Backup REGULARLY TEST karo — untested backup restore guarantee nahi karta. RTO aur RPO clearly define karo business ke saath."

---

## 8. High Availability (HA)

> **Definition (English):** High Availability means designing a database system to remain operational and accessible with minimal downtime — typically targeting 99.9% to 99.999% uptime through redundancy, automatic failover, and health monitoring.

> **Hinglish:** System kabhi down na ho — ya bahut kam aur bahut kam time ke liye down ho. Ek component fail ho toh doosra automatically le le. HA = Redundancy + Automatic Failover + Monitoring.

---

### Uptime Numbers — Kitna Down Hona Acceptable?

```
Availability  | Downtime/Year    | Downtime/Month
─────────────────────────────────────────────────
99%           | 3.65 days        | 7.3 hours    ← Unacceptable!
99.9%         | 8.76 hours       | 43 minutes   ← Most apps
99.95%        | 4.38 hours       | 22 minutes   ← Better
99.99%        | 52.6 minutes     | 4.4 minutes  ← "Four nines"
99.999%       | 5.26 minutes     | 26 seconds   ← Enterprise

Single server → 99% difficult
HA setup      → 99.99% achievable ✅
```

---

### Failover Strategies

#### Strategy 1: Active-Passive (Most Common)

```
Normal Operation:
  ┌──────────────────┐       ┌──────────────────┐
  │  PRIMARY ✅       │ ────→ │  STANDBY 😴       │
  │  Serves all      │repl.  │  Just waiting    │
  │  Read + Write    │       │  Replicating      │
  └──────────────────┘       └──────────────────┘

Failure:
  ┌──────────────────┐       ┌──────────────────┐
  │  PRIMARY ❌       │       │  STANDBY → ✅     │
  │  Crashed!        │       │  Promoted!        │
  │                  │       │  Now Primary      │
  └──────────────────┘       └──────────────────┘
  Recovery time: 30-60 seconds (with Patroni)
```

#### Strategy 2: Active-Active (High Throughput)

```javascript
// CockroachDB — Distributed SQL with Active-Active
const { Pool } = require('pg');

// All nodes accept reads AND writes!
const nodes = [
  new Pool({ host: 'node1.cockroach.internal', port: 26257 }),
  new Pool({ host: 'node2.cockroach.internal', port: 26257 }),
  new Pool({ host: 'node3.cockroach.internal', port: 26257 }),
];

let nodeIndex = 0;
const getNode = () => nodes[nodeIndex++ % nodes.length];

// Write to any node — CockroachDB handles consensus internally
await getNode().query(
  'INSERT INTO users (name, email) VALUES ($1, $2)',
  ['Rahul', 'rahul@gmail.com']
);

// Read from nearest node
await getNode().query('SELECT * FROM products WHERE id = $1', [productId]);
// No read replicas needed — every node is primary!
```

---

### Patroni — Production-Grade HA

```yaml
# patroni.yml — Automatic Leader Election + Failover
scope: myapp-ha-cluster
name: db-node1  # Unique per server

restapi:
  listen: 0.0.0.0:8008
  connect_address: db-node1.internal:8008

etcd3:
  hosts:
    - etcd1.internal:2379
    - etcd2.internal:2379
    - etcd3.internal:2379

bootstrap:
  dcs:
    ttl: 30               # Leader lease: 30 seconds
    loop_wait: 10         # Heartbeat: every 10 seconds
    retry_timeout: 10
    maximum_lag_on_failover: 1048576  # 1MB max lag for failover candidate

  initdb:
    - encoding: UTF8
    - data-checksums

postgresql:
  listen: 0.0.0.0:5432
  connect_address: db-node1.internal:5432
  data_dir: /var/lib/postgresql/15/main

  parameters:
    max_connections: 300
    shared_buffers: 4GB
    wal_level: replica
    hot_standby: on
    synchronous_commit: on

tags:
  nofailover: false
  noloadbalance: false
```

```bash
# Cluster management commands:
patronictl -c /etc/patroni.yml list
# Shows: Leader, Replica1, Replica2 with lag info

# Planned switchover (graceful):
patronictl -c /etc/patroni.yml switchover myapp-ha-cluster

# Manual failover (emergency):
patronictl -c /etc/patroni.yml failover myapp-ha-cluster --master db-node1

# Reinitialize a replica:
patronictl -c /etc/patroni.yml reinit myapp-ha-cluster db-node3
```

---

### HAProxy — Load Balancing + Health Check

```ini
# haproxy.cfg

global
  log /dev/log local0
  maxconn 10000

defaults
  log global
  timeout connect 10s
  timeout client  1m
  timeout server  1m

# ── Write Port (5000) → Always Primary ──────────────────────
frontend db_write
  bind *:5000
  default_backend pg_primary

backend pg_primary
  option httpchk GET /primary   # Patroni REST API se primary check karo
  server db1 db-node1.internal:5432 check port 8008
  server db2 db-node2.internal:5432 check port 8008
  server db3 db-node3.internal:5432 check port 8008
  # Only the Patroni primary will respond 200 to /primary
  # Others get 503 → excluded!

# ── Read Port (5001) → Any Healthy Replica ──────────────────
frontend db_read
  bind *:5001
  default_backend pg_replicas

backend pg_replicas
  balance roundrobin
  option httpchk GET /replica   # Patroni: only replicas respond 200
  server db1 db-node1.internal:5432 check port 8008
  server db2 db-node2.internal:5432 check port 8008
  server db3 db-node3.internal:5432 check port 8008
```

```javascript
// App mein HAProxy use karo — failover transparent!
const primaryPool = new Pool({ host: 'haproxy.internal', port: 5000 });
const readPool    = new Pool({ host: 'haproxy.internal', port: 5001 });

// Failover hone pe: Patroni promotes replica → HAProxy auto-routes to new primary
// App kuch nahi karta!
```

---

### Multi-Region Database

> **Definition (English):** Distributing the database across multiple geographic regions to reduce latency for global users and survive regional disasters.

> **Hinglish:** Users India mein hain, US mein hain, Europe mein hain — sab ko fast response chahiye. Multi-region mein har region ka apna DB copy hai. Local se padho → fast! Primary sirf ek jagah hai (writes ke liye).

```
Multi-Region Architecture:

   Mumbai (Primary)           Singapore (Replica)        Frankfurt (Replica)
   ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
   │  PRIMARY         │──────►│  READ REPLICA    │──────►│  READ REPLICA    │
   │  Reads + Writes  │ repl. │  Reads only      │ repl. │  Reads only      │
   └──────────────────┘       └──────────────────┘       └──────────────────┘
           ↑                          ↑                          ↑
    Indian Users                Asian Users               European Users
    ~10ms latency               ~8ms latency              ~12ms latency

Cross-region replication: Mumbai → Singapore → Frankfurt (async)
Writes: Always Mumbai (single primary — strong consistency)
Reads: Local replica (fast! low latency)
```

```javascript
// Multi-region routing based on user location
const regionPools = {
  'ap-south-1':    new Pool({ host: 'db.mumbai.internal' }),    // Mumbai
  'ap-southeast-1': new Pool({ host: 'db.singapore.internal' }), // Singapore
  'eu-west-1':     new Pool({ host: 'db.frankfurt.internal' }), // Frankfurt
};

const primaryPool = regionPools['ap-south-1'];  // Mumbai = Writer

function detectUserRegion(req) {
  // CloudFront/CDN header se user ka AWS region detect karo
  return req.headers['x-aws-region'] ||
         req.headers['cloudfront-viewer-country-region'] ||
         'ap-south-1';  // Default
}

// Reads → Nearest region (low latency!)
app.get('/api/products', async (req, res) => {
  const region  = detectUserRegion(req);
  const pool    = regionPools[region] || primaryPool;

  const { rows } = await pool.query('SELECT * FROM products WHERE is_active=true');
  res.json(rows);
  // Mumbai user: 10ms. Singapore user: 8ms. Frankfurt: 12ms. All fast!
});

// Writes → Always Primary (consistency!)
app.post('/api/orders', async (req, res) => {
  const { rows } = await primaryPool.query(
    'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
    [req.body.userId, req.body.total]
  );
  res.json(rows[0]);
  // Single writer → strong consistency guaranteed
});
```

---

### Leader Election

> **Definition (English):** Leader election is the automatic process by which distributed database nodes choose one node to be the primary (leader) using a consensus algorithm — so all nodes agree on who is in charge of writes.

> **Hinglish:** Primary crash ho gaya — kaun naya primary banega? Leader election automatically decide karta hai using majority voting. Jaise team mein manager absent ho toh senior automatically lead karta hai — aur sab agree karte hain.

```
Raft Consensus (Patroni/etcd use karta hai):

Normal:
  Node1 (Leader) → heartbeat bhejta rehta hai → Node2, Node3

Leader Fails:
  Node1 ❌ → heartbeat band
  Node2: "30 seconds se heartbeat nahi aaya — Election!"
  Node3: "Haan, mujhe bhi nahi aaya!"

Election:
  Node2: "Main candidate hoon! Vote do!"
         (Requests vote from Node3)
  Node3: "Node2 ka WAL Node1 se current hai — Vote for Node2!" ✅
  Node2: 2/3 votes (including self) = Majority! → NEW LEADER! 🎉

Quorum Rule: (n/2 + 1) nodes must be healthy
  3 nodes → 2 needed
  5 nodes → 3 needed
  Even number → avoid (split-brain risk)!
```

```javascript
// Application-level leader election — Redlock (Redis-based)
// Use case: Distributed cron jobs, background workers
const Redlock = require('redlock');
const redis = require('redis');

const redisNodes = [
  redis.createClient({ url: 'redis://redis1:6379' }),
  redis.createClient({ url: 'redis://redis2:6379' }),
  redis.createClient({ url: 'redis://redis3:6379' }),
];

const redlock = new Redlock(redisNodes, {
  retryCount:  3,
  retryDelay:  200,  // ms
  retryJitter: 100   // Random jitter
});

async function runAsLeader(jobName, fn) {
  let lock;
  try {
    // Sirf ek instance acquire kar sakta hai ye lock!
    lock = await redlock.acquire([`leader:${jobName}`], 60000);  // 60s TTL

    console.log(`✅ This instance is LEADER for ${jobName}`);
    await fn();  // Leader ka kaam

  } catch (err) {
    if (err.name === 'ExecutionError') {
      console.log(`ℹ️  Another instance is leader for ${jobName} — skipping`);
    } else {
      throw err;
    }
  } finally {
    if (lock) await lock.release();
  }
}

// Usage: Multiple instances hain lekin sirf ek run kare
setInterval(async () => {
  await runAsLeader('daily-report', async () => {
    await generateDailyReport();
    await sendReportEmails();
  });
}, 60 * 60 * 1000);  // Har ghante try karo
```

---

### Health Monitoring

```javascript
// Health check endpoint — K8s probes ke liye
app.get('/health/db', async (req, res) => {
  const health = { status: 'healthy', checks: {}, timestamp: new Date() };

  try {
    // Primary check
    const t1 = Date.now();
    await primaryPool.query('SELECT 1');
    health.checks.primary = { status: 'up', latency: Date.now() - t1 };
  } catch (err) {
    health.checks.primary = { status: 'down', error: err.message };
    health.status = 'unhealthy';
  }

  try {
    // Replica check + lag
    const { rows } = await primaryPool.query(`
      SELECT
        COUNT(*) FILTER (WHERE state = 'streaming') AS active_replicas,
        MAX(EXTRACT(EPOCH FROM (now() - reply_time))::INT) AS max_lag_seconds
      FROM pg_stat_replication
    `);
    health.checks.replication = {
      status: rows[0].active_replicas > 0 ? 'up' : 'degraded',
      activeReplicas: parseInt(rows[0].active_replicas),
      maxLagSeconds: rows[0].max_lag_seconds
    };
  } catch (err) {
    health.checks.replication = { status: 'unknown' };
  }

  try {
    // Redis check
    await cache.ping();
    health.checks.cache = { status: 'up' };
  } catch (err) {
    health.checks.cache = { status: 'down', error: err.message };
    // Cache down = degraded, not unhealthy (fallback to DB)
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Kubernetes probes:
// livenessProbe:
//   httpGet:
//     path: /health/db
//     port: 3000
//   initialDelaySeconds: 30
//   periodSeconds: 10
//   failureThreshold: 3
```

---

### HA Stack Summary

```
Component          | Technology                | Purpose
───────────────────────────────────────────────────────────────
Replication        | Streaming WAL             | Data redundancy
Failover           | Patroni + etcd            | Auto leader election
Load Balancing     | HAProxy / pgBouncer       | Traffic routing
Health Checks      | Patroni REST API          | Node status
App Connectivity   | HAProxy ports 5000/5001   | Transparent routing
Monitoring         | Prometheus + Grafana      | Alerting
Backup             | WAL archive + snapshots   | Disaster recovery
Multi-region       | AWS RDS Global / CockroachDB | Low latency globally

Target: 99.99% uptime = 52 minutes downtime per year
```

> 💡 **Interview Tip:** "HA = Replication + Automatic Failover + Health Monitoring. Patroni + etcd + HAProxy combination PostgreSQL ke liye production standard hai. AWS pe RDS Multi-AZ simplest — managed service, auto-failover ~60 seconds, same endpoint. Leader election: Raft consensus, majority voting. Quorum = n/2 + 1 nodes must be healthy."

---

## 9. Avoid Full Table Scan & MVCC

---

### Part A: Avoid Full Table Scan

> **Definition (English):** A full table scan (sequential scan) occurs when the database reads EVERY row in a table to find matching rows — instead of using an index to jump directly to relevant rows. It's O(n) complexity vs O(log n) for indexed access.

> **Hinglish:** Full table scan = Poori table row by row padhna. 10 million rows hain, ek row dhundh rahe ho → 10 million comparisons! Index hota toh sirf ~20-30 comparisons. EXPLAIN ANALYZE mein `Seq Scan` dikhna = full scan chal raha hai.

---

### Identify Full Table Scans

```sql
-- EXPLAIN ANALYZE se query plan dekho
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'rahul@gmail.com';

-- ❌ BAD OUTPUT — Sequential Scan (Full table scan!)
-- Seq Scan on users  (cost=0.00..2891.00 rows=1 width=150)
--   Filter: (email = 'rahul@gmail.com')
--   Rows Removed by Filter: 999999   ← 1M rows scan kiye, 1 mila!
--   Actual time: 450.231 ms          ← Very slow!

-- ✅ GOOD OUTPUT — Index Scan
-- Index Scan using idx_users_email on users
--   Index Cond: (email = 'rahul@gmail.com')
--   Actual time: 0.082 ms            ← 5500x faster!

-- Key Terms in EXPLAIN output:
-- Seq Scan         → ❌ No index / index not usable
-- Index Scan       → ✅ Index used (still reads table for non-indexed cols)
-- Index Only Scan  → ✅✅ BEST! Only index read, table not touched
-- Bitmap Index Scan → ✅ Used when multiple index conditions
-- cost=X..Y        → Estimated cost (Y = total, lower = better)
-- actual time=X..Y → Real ms (first row..all rows)
-- rows=N           → Estimated rows (if very different from actual → stale stats)
```

---

### Cause 1: Missing Index

```sql
-- ❌ Problem: No index → Full scan
SELECT * FROM orders WHERE user_id = 42;    -- user_id pe no index!
SELECT * FROM users  WHERE email = 'x@y.com'; -- email pe no index!

-- ✅ Fix: Index add karo
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Foreign keys pe bhi index zaroori!
-- FK columns are often used in JOINs — index without explicit creation doesn't exist!
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

---

### Cause 2: Function on Indexed Column (Index Killer!)

```sql
-- ❌ Function wraps column → B-Tree index bypass ho jaata hai!
WHERE YEAR(created_at) = 2024            -- Full scan!
WHERE MONTH(created_at) = 6             -- Full scan!
WHERE LOWER(email) = 'rahul@gmail.com'  -- Full scan!
WHERE TRIM(name) = 'Rahul'              -- Full scan!
WHERE created_at::DATE = '2024-01-15'   -- Full scan!
WHERE price::TEXT = '999'               -- Full scan! (type cast)

-- ✅ Fix 1: Range condition (no function on column)
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
WHERE created_at >= '2024-06-01' AND created_at < '2024-07-01'

-- ✅ Fix 2: Expression Index (agar function zaroori hai)
CREATE INDEX idx_lower_email ON users(LOWER(email));
-- Ab ye query index use karegi:
WHERE LOWER(email) = 'rahul@gmail.com'  -- ✅ Uses idx_lower_email!

CREATE INDEX idx_created_date ON orders((created_at::DATE));
-- Ab ye query index use karegi:
WHERE created_at::DATE = '2024-01-15'   -- ✅ Uses expression index!
```

---

### Cause 3: LIKE with Leading Wildcard

```sql
-- ❌ Leading % → B-Tree index useless (can't skip to middle of string)
WHERE name LIKE '%Rahul%'     -- Full scan!
WHERE name LIKE '%Sharma'     -- Full scan!
WHERE email LIKE '%@gmail.com' -- Full scan!

-- ✅ Fix 1: Trailing wildcard only (prefix search — index works!)
WHERE name LIKE 'Rahul%'      -- ✅ B-Tree index use kar sakta hai!

-- ✅ Fix 2: pg_trgm extension (LIKE '%...%' ko bhi index karo)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_users_name_trgm ON users USING gin(name gin_trgm_ops);

-- Ab ye query bhi index use karegi:
WHERE name ILIKE '%Rahul%'    -- ✅ Trigram index!
WHERE name ILIKE '%Sharma%'   -- ✅ Trigram index!

-- ✅ Fix 3: Full Text Search (complex text search ke liye)
CREATE INDEX idx_products_fts ON products
USING gin(to_tsvector('english', name || ' ' || description));

WHERE to_tsvector('english', name || ' ' || description)
      @@ to_tsquery('english', 'laptop & gaming');
```

---

### Cause 4: Wrong Data Type

```sql
-- ❌ Type mismatch → implicit cast → index bypass!
WHERE id = '42'         -- id column INT hai, '42' STRING
WHERE price = '99.99'   -- DECIMAL column, string compare
WHERE is_active = 1     -- BOOLEAN column, integer

-- ✅ Fix: Correct type use karo
WHERE id = 42           -- INT ✅
WHERE price = 99.99     -- DECIMAL ✅
WHERE is_active = true  -- BOOLEAN ✅
```

```javascript
// Node.js mein common mistake!
app.get('/users/:id', async (req, res) => {
  // ❌ BAD: req.params.id is STRING → type mismatch!
  await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

  // ✅ GOOD: Parse to correct type
  await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(req.params.id, 10)]);

  // Prisma automatically handles this (type-safe)
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id, 10) }
  });
});
```

---

### Cause 5: Composite Index — Wrong Order

```sql
-- Composite index: Column ORDER MATTERS!
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- ✅ Index USES hoga (leftmost column present)
WHERE user_id = 42
WHERE user_id = 42 AND created_at > '2024-01-01'

-- ❌ Index USE NAHI hoga (leftmost column absent!)
WHERE created_at > '2024-01-01'    -- Full scan! user_id nahi hai

-- RULE: Index (A, B, C):
-- A ✅ | A+B ✅ | A+B+C ✅ | B ❌ | C ❌ | B+C ❌
```

---

### Cause 6: Low Cardinality Column

```sql
-- ❌ Boolean/status column pe index → useless if very common
-- Agar 90% users is_active=true hain:
CREATE INDEX idx_users_active ON users(is_active);
WHERE is_active = true;  -- DB prefer karega full scan! (90% = not selective)

-- ✅ Fix 1: Partial index (sirf active users index karo)
CREATE INDEX idx_active_users ON users(id, email)
WHERE is_active = true AND deleted_at IS NULL;

-- ✅ Fix 2: Compound index with selective column
CREATE INDEX idx_users_active_plan ON users(plan, is_active);
WHERE plan = 'premium' AND is_active = true;
-- plan column selective hai → index effective
```

---

### Covering Index — Fastest Possible

```sql
-- Covering Index: Query sirf index se answer ho — table TOUCH nahi hoti!

-- ❌ Normal index: Table bhi read hoti hai
CREATE INDEX idx_users_plan ON users(plan);
SELECT id, name, email FROM users WHERE plan = 'premium';
-- Index se plan filter → TABLE se id, name, email fetch

-- ✅ Covering index: INCLUDE extra columns
CREATE INDEX idx_users_plan_covering ON users(plan)
INCLUDE (id, name, email, created_at);
-- ↑ id, name, email index mein stored hain!

-- Same query — INDEX ONLY SCAN! Table nahi touch hoti!
SELECT id, name, email, created_at
FROM users WHERE plan = 'premium';
-- EXPLAIN: "Index Only Scan" ← FASTEST!
```

---

### Quick Reference: Full Scan Causes & Fixes

| Cause | ❌ Problem | ✅ Fix |
|---|---|---|
| No index | `WHERE email = 'x'` | `CREATE INDEX` |
| Function on column | `WHERE YEAR(col) = 2024` | Range condition / Expression index |
| Leading wildcard | `WHERE name LIKE '%abc'` | pg_trgm / Full-text search |
| Type mismatch | `WHERE id = '42'` | `parseInt(id)` / correct type |
| Wrong index order | `WHERE created_at = X` (missing user_id) | Check composite index order |
| Low cardinality | `WHERE is_active = true` (90% rows) | Partial index |

---

### Part B: MVCC (Multi-Version Concurrency Control)

> **Definition (English):** MVCC is a concurrency control method where instead of locking rows during reads, the database maintains multiple versions of each row — allowing readers and writers to operate simultaneously without blocking each other.

> **Hinglish:** Purana tarika: "Koi padh raha hai → koi likh nahi sakta" (lock-based). Slow! MVCC tarika: Har transaction apna snapshot dekhe. Readers writers ko block nahi karte. Writers readers ko block nahi karte. Ek row ke multiple versions exist karte hain simultaneously.

---

### MVCC Internal Mechanism

```
Every PostgreSQL row has hidden system columns:
  xmin → Transaction ID jo yeh row CREATE kiya
  xmax → Transaction ID jo yeh row DELETE/UPDATE kiya (0 = alive)
  ctid  → Physical location on disk

Original Row (transaction 100 ne insert kiya):
  | id | name  | xmin | xmax | ctid  |
  | 1  | Rahul | 100  | 0    | (0,1) | ← xmax=0 = alive!

Transaction 150 updates the row:
  | id | name     | xmin | xmax | ctid  |
  | 1  | Rahul    | 100  | 150  | (0,1) | ← Old version (dead)
  | 1  | Rahul2   | 150  | 0    | (0,2) | ← New version (alive)

Reader with txid=140:
  Sees: "Rahul"  (xmin=100 ≤ 140, xmax=150 > 140)
  
Reader with txid=160:
  Sees: "Rahul2" (xmin=150 ≤ 160, xmax=0)

Each reader sees consistent snapshot based on their txid!
No locks needed for reads!
```

---

### MVCC in Action — Readers Never Block

```sql
-- Session 1 (txid=1000): Long-running read transaction
BEGIN;
-- Snapshot taken: All committed data up to txid=999

SELECT COUNT(*) FROM orders;  -- Returns 5000
-- Ab 10 seconds baad bhi query karo...

-- Meanwhile Session 2 (txid=1001): Writing
BEGIN;
INSERT INTO orders (user_id, total) VALUES (1, 599);  -- 5001 rows now!
COMMIT;

-- Session 1 continues (same snapshot!):
SELECT COUNT(*) FROM orders;  -- STILL returns 5000
-- Session 1 ko Session 2 ki insert dikhti nahi!
-- No blocking, no waiting, consistent view!

COMMIT;  -- Session 1 ends

-- New Session 3 (txid=1002): Fresh read
SELECT COUNT(*) FROM orders;  -- 5001 ← Session 2's insert visible now!
```

---

### MVCC Dead Tuples — The Cost

```sql
-- UPDATE = OLD version mark as dead + NEW version create
-- DELETE = row mark as dead
-- Dead tuples disk pe space waste karte hain!

-- Dead tuple count check karo:
SELECT
  relname              AS table_name,
  n_live_tup           AS live_rows,
  n_dead_tup           AS dead_rows,
  ROUND(
    100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2
  )                    AS dead_pct,
  last_autovacuum,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 10;

-- ❌ If dead_pct > 20%: Problem! Table bloat
-- ✅ Fix: VACUUM

-- Manual VACUUM:
VACUUM users;                  -- Dead tuples remove karo
VACUUM ANALYZE users;          -- Vacuum + statistics update (slower queries fix)
VACUUM FULL users;             -- Full compaction — BLOCKS table! Careful!
                                -- Production mein off-peak hours mein karo

-- High-write tables ke liye aggressive autovacuum:
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor  = 0.05,  -- 5% dead rows pe trigger (default 20%)
  autovacuum_vacuum_threshold     = 50,     -- Minimum 50 dead rows
  autovacuum_analyze_scale_factor = 0.02   -- Analyze bhi frequent karo
);
```

---

### MVCC — Long Transactions Are Dangerous!

```sql
-- Long transactions VACUUM ko rok dete hain!
-- Dead tuples accumulate karte hain jab tak oldest transaction alive hai

-- ❌ BAD: 1 hour transaction
BEGIN;
SELECT COUNT(*) FROM reports;
-- ... app freezes for 1 hour ...
COMMIT;

-- Iske dauran: VACUUM dead tuples remove nahi kar sakta!
-- Dead tuples accumulate hote hain → Table bloat → Slow queries!

-- Long-running transactions detect karo:
SELECT
  pid,
  now() - xact_start     AS transaction_age,
  state,
  LEFT(query, 100)       AS query_snippet
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
  AND now() - xact_start > INTERVAL '5 minutes'
ORDER BY transaction_age DESC;

-- Kill them:
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE now() - xact_start > INTERVAL '30 minutes'
  AND state != 'idle';

-- Transaction timeout set karo:
-- postgresql.conf:
statement_timeout = '30s'                    -- Single query timeout
idle_in_transaction_session_timeout = '5min' -- Idle transaction timeout
```

```javascript
// Node.js: Always timeout set karo transactions mein
async function runTransaction(fn, timeoutMs = 30000) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL statement_timeout = '${timeoutMs}'`);
    await client.query(`SET LOCAL idle_in_transaction_session_timeout = '60s'`);

    const result = await fn(client);
    await client.query('COMMIT');
    return result;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();  // HAMESHA release karo! Connection leak = MVCC problem
  }
}

// Usage:
await runTransaction(async (client) => {
  await client.query('UPDATE users SET plan=$1 WHERE id=$2', ['premium', userId]);
  await client.query('INSERT INTO subscription_log ...', [...]);
});
```

---

### XID Wraparound — VACUUM FREEZE

```sql
-- PostgreSQL transaction IDs (XIDs) are 32-bit: ~2.1 billion max
-- Wraparound ho sakta hai → SERIOUS data corruption risk!

-- Check XID age:
SELECT
  datname,
  age(datfrozenxid)                               AS xid_age,
  2147483648 - age(datfrozenxid)                 AS xids_remaining,
  ROUND(age(datfrozenxid)::NUMERIC / 2147483648 * 100, 1) AS pct_used
FROM pg_database
ORDER BY age(datfrozenxid) DESC;

-- ❌ Alert: xid_age > 1.5 billion → Immediate action needed!
-- ❌ Critical: xid_age > 2 billion → PostgreSQL will REFUSE all writes!

-- Fix: VACUUM FREEZE (old XIDs ko freeze karo → won't wraparound)
VACUUM FREEZE users;            -- Specific table
VACUUMDB --freeze --all         -- All databases

-- Monitoring query for alerts:
SELECT datname
FROM pg_database
WHERE age(datfrozenxid) > 1500000000;  -- Alert at 1.5B
-- Agar koi result aaye → Tatkaal VACUUM FREEZE karo!
```

---

### MVCC Summary

```
MVCC Benefits:
  ✅ Read-write concurrency: Readers writers ko block nahi karte
  ✅ Consistent snapshots per transaction
  ✅ No read locks needed
  ✅ Better throughput for mixed read-write workloads

MVCC Costs:
  ❌ Dead tuples accumulate → Disk bloat → Need VACUUM
  ❌ Long transactions → Bloat bolta jata hai → Slow queries
  ❌ XID wraparound risk (need VACUUM FREEZE)
  ❌ Slightly more disk space (multiple row versions)

Best Practices:
  ✅ Short transactions — fast COMMIT!
  ✅ Autovacuum monitor karo regularly
  ✅ Long-running transactions detect + kill karo
  ✅ XID age monitor karo (> 1.5B = alert!)
  ✅ High-write tables pe aggressive autovacuum settings
  ✅ Always release connections (no connection leaks)
```

> 💡 **Interview Tip:** "MVCC PostgreSQL ka core concurrency mechanism hai — readers writers ko block nahi karte, yahi high throughput ka secret hai. Tradeoff: Dead tuples accumulate hote hain — VACUUM cleanup karta hai. Long transactions MVCC ki main enemy — VACUUM block ho jaata hai. Full table scan avoid: EXPLAIN ANALYZE se identify, index add karo, function-on-column avoid karo, expression index use karo."

---

## 🏁 Quick Interview Cheatsheet

```
Topic               | One-Line Answer
────────────────────────────────────────────────────────────────────
DB Scaling          | Cache → Replicas → Pool → Partition → Shard
Stored Procedures   | Pre-compiled SQL in DB; network trips kam; complex txns
Triggers            | Auto-execute on DML; audit/timestamps/inventory sync
Views               | Named queries; Materialized = pre-computed (fast!)
Replication         | WAL streaming; Primary writes; Replicas read; Patroni failover
Consistency         | Strong=all see latest; Eventual=converge over time
Backup/Recovery     | 3-2-1 rule; PITR=time machine; WAL archiving must-have
High Availability   | Replication+Failover+Monitoring; Patroni+HAProxy; 99.99%
Full Table Scan     | Seq Scan bad; Index Scan good; EXPLAIN ANALYZE se fix karo
MVCC                | Multiple row versions; readers never block; VACUUM needed
```

---

## 📝 Interview One-Liners (Ready to Speak)

- **Scaling:** *"Scaling ka sahi order: Cache first (80% problems solve), phir read replicas, phir query optimization, phir partitioning, sharding last resort."*

- **Triggers:** *"Audit logging aur updated_at ke liye triggers use karta hoon — transparent automation. Complex business logic application layer pe rakhna prefer karta hoon — debugging aur testability better rehti hai."*

- **Materialized Views:** *"Dashboard analytics ke liye materialized views use karta hoon — 5-table join jo 2 seconds leta hai wo pre-compute ho jaata hai, query 10ms mein answer aati hai. Trade-off: Refresh karna padta hai."*

- **Replication:** *"Production mein Patroni + HAProxy use karta hoon — automatic failover 30-45 seconds mein, application transparent. Replication lag ke liye read-your-writes pattern with Redis flag."*

- **Consistency:** *"Business requirement se decide karta hoon — bank balance ke liye strong consistency non-negotiable, social media likes ke liye eventual consistency sufficient aur much faster."*

- **MVCC:** *"MVCC PostgreSQL ka secret weapon hai — readers writers ko kabhi block nahi karte, isliye high concurrency possible hai. Tradeoff: VACUUM regularly run karo, long transactions avoid karo."*

- **Backup:** *"3-2-1 rule follow karta hoon. PITR ke liye WAL archiving must-have — iske bina 'restore to exact moment' impossible. Most important: Backup regularly test karo — untested backup = false security."*

---
