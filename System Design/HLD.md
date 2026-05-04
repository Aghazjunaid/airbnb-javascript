# 🏗️ High Level Design (HLD) — Complete Interview Notes

> **Target Audience:** JavaScript Full Stack Developers (5+ years experience)
> **Language:** Hinglish (Hindi + English) for easy understanding
> **Format:** Concept → English Definition → JS Example → Real World Use Case

---

## 📑 Table of Contents

1. [Foundation — HLD Ke ABCs](#1-foundation--hld-ke-abcs)
2. [DNS, CDN & Load Balancing](#2-dns-cdn--load-balancing)
3. [Caching — Speed Ka Secret](#3-caching--speed-ka-secret)
4. [Databases at Scale](#4-databases-at-scale)
5. [Messaging & Async Communication](#5-messaging--async-communication)
6. [API Design & Communication](#6-api-design--communication)
7. [Microservices Architecture](#7-microservices-architecture)
8. [Storage — Kahan Kya Rakho](#8-storage--kahan-kya-rakho)
9. [System Design Interview Problems](#9-system-design-interview-problems)
10. [Reliability & Resilience](#10-reliability--resilience)
11. [Security & Auth](#11-security--auth)
12. [Infrastructure & Observability](#12-infrastructure--observability)
13. [Estimation & Numbers to Know](#13-estimation--numbers-to-know)

---

# 1. FOUNDATION — HLD KE ABCS

## 1.1 Scalability 🔥

**Hinglish:** Jab traffic badhta hai aur tera system slow ho jata hai — uska solution hai scalability. Matlab system ko itna sakhsam banao ki zyada load aaye to bhi handle kar sake.

**English Definition (Interview):**
> Scalability is the ability of a system to handle increased load by adding resources without compromising performance.

### Do Types:

**1. Vertical Scaling (Scale Up) — "Ek hi server ko mota karo"**
- Same server me CPU, RAM, Storage badhao
- Jaise: 8GB RAM wala server → 64GB RAM wala bana do
- **Pros:** Simple, code change nahi
- **Cons:** Hardware ki limit hoti hai, single point of failure

**2. Horizontal Scaling (Scale Out) — "Aur server add karo"**
- Multiple servers laga do, load balancer se distribute karo
- Jaise: 1 Node.js server → 10 Node.js servers behind a load balancer
- **Pros:** Theoretically infinite scale, fault tolerant
- **Cons:** Complex (state management, distributed systems problems)

### JavaScript Example:
```javascript
// Vertical Scaling — same Node.js process, but with cluster module to use all CPU cores
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // Same machine ke saare cores use karo
  }
} else {
  require('./server.js'); // Tera express app
}

// Horizontal Scaling — multiple machines
// PM2, Docker, Kubernetes use karke multiple servers pe deploy
// Nginx/AWS ALB se traffic distribute
```

### Real World:
- **Netflix, Amazon, Uber** — sab horizontal scaling use karte hain
- Stateless services banao taaki kisi bhi server pe request jaa sake

### Interview Tip:
> "Most modern systems prefer horizontal scaling because it's more resilient and cost-effective at scale."

---

## 1.2 Availability & Reliability 🛡️

**Hinglish:** Tera system kitne time tak up rehta hai (Availability) aur kitna sahi kaam karta hai (Reliability). Dono milke trust banate hain.

**English Definition:**
> **Availability** is the percentage of time a system is operational. **Reliability** is the probability that the system performs correctly during a specific time duration.

### The "Nines" of Availability:

| Availability | Downtime/Year | Downtime/Day |
|--------------|---------------|--------------|
| 99% (2 nines) | 3.65 days | 14.4 mins |
| 99.9% (3 nines) | 8.76 hours | 1.44 mins |
| 99.99% (4 nines) | 52.56 mins | 8.64 secs |
| 99.999% (5 nines) | 5.26 mins | 0.864 secs |

### Kaise achieve karein?

1. **Redundancy** — backup server hamesha ready rakho
2. **Failover** — main server mar gaya to automatically backup pe switch
3. **Load Balancing** — traffic distribute karo
4. **Health Checks** — har server ko monitor karo
5. **Graceful Degradation** — kuch features fail ho to bhi core kaam kare

### JavaScript Example:
```javascript
// Health check endpoint — load balancer iska use karta hai
app.get('/health', (req, res) => {
  const checks = {
    database: db.isConnected(),
    redis: redis.ping(),
    diskSpace: getDiskSpace() > 1024 // > 1GB
  };
  
  const isHealthy = Object.values(checks).every(check => check);
  res.status(isHealthy ? 200 : 503).json(checks);
});

// Retry logic with exponential backoff for reliability
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

### Real World:
- **AWS S3** ka SLA 99.99% hai
- **WhatsApp** down ho jaata hai sometimes (low availability moments)
- **SLA (Service Level Agreement)** — company kitni availability guarantee karti hai

---

## 1.3 Latency vs Throughput ⚡

**Hinglish:** 
- **Latency** = ek request kitni jaldi complete hoti hai (response time)
- **Throughput** = ek second me kitni requests handle kar sakte ho

Soch, ek pizza shop hai:
- Latency = ek pizza banane me kitna time
- Throughput = ek ghante me kitne pizze ban gaye

**English Definition:**
> **Latency** is the time taken for a single request to complete. **Throughput** is the number of requests processed per unit time.

### Trade-off:
- Kabhi kabhi latency badha ke throughput badhate hain (batching)
- Kabhi throughput kam karke latency reduce karte hain

### JavaScript Example:
```javascript
// Low latency — har request turant process karo
app.post('/log', async (req, res) => {
  await db.insert(req.body); // 50ms
  res.send('ok');
});

// High throughput — batching karo, latency thodi badh jayegi
const batch = [];
app.post('/log', (req, res) => {
  batch.push(req.body);
  res.send('queued'); // <1ms
});

setInterval(async () => {
  if (batch.length > 0) {
    await db.insertMany(batch.splice(0)); // 1000 inserts in 100ms
  }
}, 1000);
```

### Numbers Yaad Rakho:
- **Good API latency:** < 200ms
- **Acceptable:** 200-1000ms
- **Bad:** > 1s
- **Throughput target:** depends on use case (analytics → high, banking → low but consistent)

---

## 1.4 CAP Theorem 📐

**Hinglish:** Distributed system me 3 cheezein hoti hain — **C**onsistency, **A**vailability, **P**artition Tolerance. Tu sirf 2 chun sakta hai, teeno ek saath nahi mil sakte.

**English Definition:**
> In a distributed system, you can guarantee at most two out of three: Consistency, Availability, and Partition Tolerance.

### Teeno Kya Hain?

1. **Consistency (C)** — Sab nodes ko same data milega same time pe
2. **Availability (A)** — Har request ko response milega (success or failure)
3. **Partition Tolerance (P)** — Network fail ho jaaye to bhi system kaam kare

### Real Choices:
- **CP systems** — MongoDB, HBase, Redis (strong consistency, may sacrifice availability)
- **AP systems** — Cassandra, DynamoDB, CouchDB (always available, eventual consistency)
- **CA systems** — Traditional RDBMS (single node, no partition tolerance)

> ⚠️ **Important:** Distributed system me Partition Tolerance LENI HI PADTI hai, kyunki network fail ho sakta hai. So real choice CP vs AP hai.

### Example Scenarios:

**Banking (CP):**
```
Tera bank balance check karna hai. 
Agar 2 servers me different balance dikhe to disaster!
Better hai response milne me thodi der lage but correct balance dikhe.
```

**Social Media Likes (AP):**
```
Instagram pe ek post ke 1000 likes vs 1001 likes — koi farq nahi padta.
Better hai feature kaam kare, exact count thoda baad me sync ho jaye.
```

### JavaScript Example (Consistency vs Availability):
```javascript
// CP approach — wait for all replicas
async function updateBalance(userId, amount) {
  const result = await db.transaction(async (trx) => {
    await trx.replica1.update(userId, amount);
    await trx.replica2.update(userId, amount);
    await trx.replica3.update(userId, amount);
  });
  // Strict: agar koi ek fail hua to error
}

// AP approach — eventual consistency
async function updateLikes(postId) {
  cache.increment(`likes:${postId}`); // Turant available
  queue.push({ type: 'SYNC_LIKES', postId }); // Background sync
}
```

---

# 2. DNS, CDN & LOAD BALANCING

## 2.1 DNS (Domain Name System) 🌐

**Hinglish:** DNS internet ka phone book hai. Tu naam yaad rakhta hai (google.com), DNS uska number nikal deta hai (142.250.183.78). Saara internet ismein TIK hai.

**English Definition:**
> DNS translates human-readable domain names into IP addresses through a hierarchical, distributed naming system.

### Resolution Process (Step by Step):

```
1. Browser → tujhe google.com chahiye
2. OS Cache check → mil gaya? Done. Nahi mila to →
3. Router → ISP DNS server
4. ISP DNS → Root DNS server (.)
5. Root → TLD server (.com)
6. TLD → Authoritative server (google.com)
7. Authoritative → IP address dega: 142.250.183.78
8. Browser uss IP pe connect karega
```

### Important DNS Records:
- **A Record** — domain → IPv4 address
- **AAAA Record** — domain → IPv6 address
- **CNAME** — domain → another domain (alias)
- **MX** — mail servers
- **TXT** — text data (SPF, DKIM for email)
- **NS** — nameservers

### TTL (Time To Live):
- DNS records cache hote hain
- TTL = kitne seconds tak cache karna hai
- Low TTL (60s) — quick changes, but more DNS queries
- High TTL (3600s) — fast resolution, but changes slow propagate

### JavaScript Example:
```javascript
const dns = require('dns').promises;

// Domain resolve karo
const addresses = await dns.resolve4('google.com');
console.log(addresses); // ['142.250.183.78']

// Reverse lookup
const hostnames = await dns.reverse('8.8.8.8');
console.log(hostnames); // ['dns.google']

// MX records (mail servers)
const mx = await dns.resolveMx('gmail.com');
```

### Real World:
- **Cloudflare DNS** (1.1.1.1) — fastest
- **Google DNS** (8.8.8.8) — popular
- **AWS Route 53** — managed DNS with routing policies (geo, weighted, failover)

### Interview Tip:
> "DNS lookups add latency. We can reduce it using DNS prefetching, longer TTLs, or anycast networks like Cloudflare."

---

## 2.2 CDN (Content Delivery Network) 🚀

**Hinglish:** User Mumbai me hai aur tera server US me — to user ko slow lagega. CDN bolta hai "ruk, mai US server ka data Mumbai me cache kar deta hu, aur jo Mumbai ka user aaye usko Mumbai se hi serve kardo." Speed ka asli baap hai!

**English Definition:**
> A CDN is a geographically distributed network of proxy servers that cache content closer to users to reduce latency and origin server load.

### Kya Cache Hota Hai?
- **Static assets:** images, CSS, JS, videos, fonts
- **Dynamic content:** API responses (with smart caching)

### Types:
1. **Push CDN** — tu manually upload karta hai files (jaise S3 to CloudFront)
2. **Pull CDN** — pehli request pe origin se kheechta hai, baad me cache (most common)

### How It Works:
```
User (Mumbai) → CDN edge server (Mumbai) — cached? Direct serve!
                                    ↓ no
                         Origin server (US) — fetch & cache
```

### JavaScript Example:
```javascript
// Express me CDN headers set karo
app.get('/static/:file', (req, res) => {
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
    'CDN-Cache-Control': 'max-age=86400' // CDN ke liye 1 day
  });
  res.sendFile(req.params.file);
});

// React app me CDN URL use karo
const CDN_URL = 'https://d1abc123.cloudfront.net';
<img src={`${CDN_URL}/images/logo.png`} />
```

### Popular CDNs:
- **Cloudflare** — most popular, free tier achha
- **AWS CloudFront** — AWS ecosystem
- **Akamai** — enterprise level
- **Fastly** — developer friendly
- **Vercel/Netlify** — built-in for frontend

### Cache Invalidation:
```javascript
// File change hua, CDN ko update karna hai?
// Method 1: Version in URL
<script src="/app.v123.js" /> // Naya version, naya URL

// Method 2: Cache busting query
<script src="/app.js?v=123" />

// Method 3: Manual purge (CDN API)
await cloudfront.createInvalidation({
  DistributionId: 'DIST_ID',
  InvalidationBatch: { Paths: { Items: ['/app.js'] } }
});
```

---

## 2.3 Load Balancer ⚖️

**Hinglish:** Tere paas 10 servers hain. Traffic kis pe bheju? Load balancer decide karta hai — sabko barabar load do, koi overload na ho.

**English Definition:**
> A load balancer distributes incoming network traffic across multiple servers to ensure no single server becomes overwhelmed, improving availability and performance.

### Types:

**1. Layer 4 (Transport Layer) — TCP/UDP**
- IP aur port ke basis pe route karta hai
- Bahut fast, but content-aware nahi
- Example: AWS NLB

**2. Layer 7 (Application Layer) — HTTP/HTTPS**
- URL, headers, cookies dekh sakta hai
- Smart routing possible (e.g., /api → server1, /static → server2)
- Example: AWS ALB, Nginx

### Load Balancing Algorithms:

| Algorithm | Hinglish Meaning | Use Case |
|-----------|-----------------|----------|
| **Round Robin** | Bari bari sabko do | Equal capacity servers |
| **Least Connections** | Jisko kam kaam ho usko do | Long-lived connections |
| **IP Hash** | Same user same server | Sticky sessions |
| **Weighted** | Powerful server ko zyada do | Different capacity servers |
| **Consistent Hashing** | Smart distribution | Caching, sharding |

### JavaScript Example (Nginx Config):
```nginx
upstream backend {
    least_conn;  # Algorithm
    server node1.example.com:3000 weight=3;
    server node2.example.com:3000 weight=2;
    server node3.example.com:3000 backup;  # Sirf failure pe use
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
        # Health check
        proxy_next_upstream error timeout http_500;
    }
}
```

### Health Checks:
```javascript
// Load balancer har 5 sec me yeh hit karega
app.get('/health', (req, res) => {
  if (server.isHealthy()) {
    res.status(200).send('OK');
  } else {
    res.status(503).send('Service Unavailable');
  }
});
```

### Sticky Sessions:
- User ki har request same server pe jaye
- Useful jab session in-memory ho
- **Better solution:** session ko Redis me rakho, sticky sessions ki zaroorat nahi

---

# 3. CACHING — SPEED KA SECRET

## 3.1 Caching Strategies 💾

**Hinglish:** DB se baar baar puchna mehnga hai. Pehle cache check karo. Mil gaya — fast! Nahi mila — DB jao, phir cache me daal do. Itna simple!

**English Definition:**
> Caching stores frequently accessed data in fast storage (memory) to reduce latency and database load.

### Strategies:

### 1. Cache-Aside (Lazy Loading) — Most Common
**Logic:** App khud cache manage karta hai
```javascript
async function getUser(userId) {
  // 1. Cache check
  let user = await redis.get(`user:${userId}`);
  if (user) return JSON.parse(user); // Cache HIT
  
  // 2. DB se fetch (Cache MISS)
  user = await db.users.findById(userId);
  
  // 3. Cache me daal do (TTL ke saath)
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
  
  return user;
}
```
**Pros:** Simple, only requested data cached  
**Cons:** First request slow (cache miss), stale data possible

### 2. Write-Through
**Logic:** Likhte time DB aur cache dono me likho
```javascript
async function updateUser(userId, data) {
  await db.users.update(userId, data);
  await redis.set(`user:${userId}`, JSON.stringify(data));
}
```
**Pros:** Cache hamesha fresh  
**Cons:** Write slow, cache full of unused data

### 3. Write-Behind (Write-Back)
**Logic:** Cache me likho, DB me baad me async likho
```javascript
async function updateLikes(postId) {
  await redis.incr(`likes:${postId}`); // Fast
  queue.push({ type: 'SYNC_LIKES', postId }); // Async DB write
}
```
**Pros:** Bahut fast writes  
**Cons:** Data loss risk if cache fails

### 4. Read-Through
**Logic:** Cache library DB se khud data fetch karti hai
- App sirf cache se baat karta hai
- Cache itself is responsible for loading

### TTL (Time To Live):
```javascript
// 1 hour TTL
await redis.setex('key', 3600, 'value');

// Different TTLs for different data:
// User profile — 1 hour
// Trending posts — 5 mins
// Static config — 24 hours
```

### Where to Cache?
1. **Browser cache** — HTTP headers
2. **CDN** — geographically distributed
3. **API Gateway cache** — at edge
4. **Application cache** — in-memory (Node.js process)
5. **Distributed cache** — Redis, Memcached
6. **Database cache** — query results

---

## 3.2 Redis Deep Dive 🔴

**Hinglish:** Redis ek in-memory database hai. RAM me data rakhta hai, isliye microseconds me response. Cache, queue, sessions — sab kuch ismein chal jata hai.

**English Definition:**
> Redis is an in-memory data structure store, used as a database, cache, message broker, and streaming engine.

### Why Redis is FAST?
- RAM me data
- Single-threaded (no lock overhead)
- Optimized data structures
- ~100,000 ops/sec on single instance

### Data Structures:

```javascript
const redis = require('redis').createClient();

// 1. STRING — simple key-value
await redis.set('user:1:name', 'Rahul');
await redis.get('user:1:name');

// 2. HASH — object jaise
await redis.hset('user:1', { name: 'Rahul', age: 30 });
await redis.hget('user:1', 'name');

// 3. LIST — queue/stack
await redis.lpush('queue', 'task1');
await redis.rpop('queue'); // FIFO

// 4. SET — unique items
await redis.sadd('post:1:likes', 'user:5');
await redis.scard('post:1:likes'); // count

// 5. SORTED SET — leaderboard
await redis.zadd('leaderboard', 100, 'player1');
await redis.zrevrange('leaderboard', 0, 9); // Top 10

// 6. STREAM — Kafka-like
await redis.xadd('events', '*', 'type', 'login', 'user', '123');

// 7. PUB/SUB
redis.subscribe('notifications');
redis.publish('notifications', 'New message!');

// 8. HYPERLOGLOG — unique count (approximate)
await redis.pfadd('unique_visitors', 'user1', 'user2');
await redis.pfcount('unique_visitors');
```

### Use Cases:

1. **Caching** — most common
2. **Session Store** — JWT alternative
3. **Rate Limiting** — sliding window counter
4. **Leaderboards** — sorted sets
5. **Queues** — lists or streams
6. **Pub/Sub** — real-time notifications
7. **Distributed Locks** — Redlock algorithm

### Persistence:
- **RDB** — snapshot at intervals (faster, may lose recent data)
- **AOF** — append every operation (durable, slightly slower)
- **Both** — best of both worlds

### Redis Cluster:
- Sharding across multiple nodes
- 16,384 hash slots
- Each node owns some slots
- High availability with replicas

---

## 3.3 Cache Eviction Policies 🗑️

**Hinglish:** Cache full ho gaya. Naya data daalna hai. Konsa purana data hatao? Yahi decide karti hai eviction policy.

**English Definition:**
> Eviction policies determine which cached items to remove when the cache reaches its capacity limit.

### Policies:

| Policy | Full Form | Hinglish | Use Case |
|--------|-----------|----------|----------|
| **LRU** | Least Recently Used | Sabse purana access wala hatao | Most common, general purpose |
| **LFU** | Least Frequently Used | Sabse kam access wala hatao | Stable popular items |
| **FIFO** | First In First Out | Pehle aaya pehle gaya | Time-sensitive data |
| **TTL** | Time To Live | Expiry time pe automatic | Session, OTP |
| **Random** | Random | Koi bhi random hatado | Rarely used |

### Redis Eviction Policies:
```bash
# redis.conf me set karo
maxmemory 2gb
maxmemory-policy allkeys-lru  # All keys, LRU se hatao

# Options:
# noeviction — error on full (default)
# allkeys-lru — any key, LRU
# allkeys-lfu — any key, LFU
# volatile-lru — only TTL keys, LRU
# volatile-ttl — keys with shortest TTL first
# allkeys-random — random
```

### JavaScript Example (Custom LRU Cache):
```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // Map maintains insertion order!
  }
  
  get(key) {
    if (!this.cache.has(key)) return -1;
    
    // Recently used — move to end
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### When to Use What?
- **LRU** — default choice, works for most apps
- **LFU** — when access patterns are stable (e.g., popular videos)
- **TTL** — sessions, OTPs, time-bound data
- **FIFO** — log buffers, ordered events

---

# 4. DATABASES AT SCALE

## 4.1 SQL vs NoSQL 🗄️

**Hinglish:** SQL structured data ke liye (rows, columns), NoSQL flexible data ke liye (JSON-like). Dono ke apne use cases hain. Right tool for right job!

**English Definition:**
> SQL databases use structured schemas with ACID guarantees. NoSQL databases offer flexible schemas optimized for scale and specific data patterns.

### Comparison:

| Feature | SQL | NoSQL |
|---------|-----|-------|
| **Schema** | Fixed | Flexible |
| **Scaling** | Vertical (mostly) | Horizontal |
| **ACID** | Strong | Varies |
| **Joins** | Built-in | Application level |
| **Examples** | PostgreSQL, MySQL | MongoDB, Cassandra, DynamoDB |

### Types of NoSQL:

1. **Document** — MongoDB, CouchDB
   - JSON-like documents
   - Use: content management, user profiles
   
2. **Key-Value** — Redis, DynamoDB
   - Simple key → value
   - Use: caching, sessions
   
3. **Column-Family** — Cassandra, HBase
   - Optimized for writes at scale
   - Use: time-series, IoT, logs
   
4. **Graph** — Neo4j, ArangoDB
   - Relationships first-class
   - Use: social network, recommendations

### When to Use What?

**Use SQL when:**
- Complex queries with joins
- ACID transactions zaruri (banking)
- Data structure stable hai
- Reporting/analytics

**Use NoSQL when:**
- Massive scale (millions of writes/sec)
- Flexible schema (rapid iteration)
- Geographic distribution
- Specific access patterns

### JavaScript Example:
```javascript
// SQL — PostgreSQL with relations
const users = await db.query(`
  SELECT u.name, COUNT(o.id) as order_count
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.created_at > $1
  GROUP BY u.id
`, [lastWeek]);

// NoSQL — MongoDB document
await db.users.insertOne({
  name: 'Rahul',
  email: 'r@example.com',
  preferences: { theme: 'dark', notifications: true },
  addresses: [
    { type: 'home', city: 'Mumbai' },
    { type: 'office', city: 'Bangalore' }
  ]
});

// NoSQL — DynamoDB key-value
await dynamodb.put({
  TableName: 'Users',
  Item: { userId: '123', name: 'Rahul', email: 'r@example.com' }
});
```

### Polyglot Persistence:
> Modern apps use multiple databases — PostgreSQL for transactions + Redis for cache + Elasticsearch for search + S3 for files.

---

## 4.2 Sharding & Partitioning 🔪

**Hinglish:** Tera ek DB me 100 million rows hai — slow ho gaya. Solution? Data ko tukdo me baat do, alag alag servers pe rakho. Yahi sharding hai.

**English Definition:**
> Sharding is horizontal partitioning where data is distributed across multiple database servers based on a shard key.

### Difference:
- **Partitioning** — same DB me data tukde
- **Sharding** — multiple DB servers pe data tukde

### Sharding Strategies:

### 1. Range-Based Sharding
```
Shard 1: User IDs 1-1M
Shard 2: User IDs 1M-2M
Shard 3: User IDs 2M-3M
```
**Pros:** Simple  
**Cons:** Hotspots possible (newest users → last shard)

### 2. Hash-Based Sharding
```javascript
function getShardId(userId) {
  return hash(userId) % numShards;
}
// User 123 → hash(123) % 4 → Shard 2
```
**Pros:** Uniform distribution  
**Cons:** Re-sharding hard (all data moves)

### 3. Consistent Hashing
- Hash ring banao
- Re-sharding pe minimal data movement
- Used by: DynamoDB, Cassandra
```
[Hash Ring]
   Server A (0-90)
        ↓
   Server B (91-180)
        ↓
   Server C (181-270)
        ↓
   Server D (271-360)
```

### 4. Geographic Sharding
- Indian users → India shard
- US users → US shard
- Low latency for users

### Challenges:

1. **Cross-shard queries** — slow, complex
2. **Distributed transactions** — 2PC, Saga pattern
3. **Hotspot keys** — celebrity user gets all traffic
4. **Re-sharding** — data migration nightmare

### JavaScript Example:
```javascript
// Application-level sharding
class ShardedDB {
  constructor(shards) {
    this.shards = shards; // Array of DB connections
  }
  
  getShard(userId) {
    const hash = this.hashCode(userId);
    return this.shards[Math.abs(hash) % this.shards.length];
  }
  
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
  
  async getUser(userId) {
    const shard = this.getShard(userId);
    return shard.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}
```

### Real World:
- **Instagram** — sharded by user ID
- **Discord** — sharded by guild (server) ID
- **MongoDB** — auto-sharding with shard key

---

## 4.3 Database Replication 📋

**Hinglish:** Ek DB se kaam nahi chalega. Backup chahiye. Replication matlab DB ki copy banao multiple servers pe — primary fail ho to backup le le.

**English Definition:**
> Replication maintains copies of data across multiple database servers for fault tolerance, read scaling, and geographic distribution.

### Types:

### 1. Master-Slave (Primary-Replica)
```
[Primary] — writes
    ↓
[Replica 1] [Replica 2] [Replica 3] — reads
```
- **Writes:** sirf primary pe
- **Reads:** replicas se distribute
- **Lag:** replicas thode peeche reh sakte hain

### 2. Master-Master (Multi-Primary)
```
[Primary 1] ↔ [Primary 2]
   ↑              ↑
  reads         reads
  writes        writes
```
- Dono pe writes
- Conflict resolution zaruri
- Complex but flexible

### Sync Types:

**Synchronous Replication:**
- Primary waits for replica confirmation
- Data safe, but slow
- Use: financial systems

**Asynchronous Replication:**
- Primary doesn't wait
- Fast, but data loss possible if primary crashes
- Use: most web apps

**Semi-Synchronous:**
- Wait for at least one replica
- Balance between safety and speed

### JavaScript Example:
```javascript
// Read-Write splitting in Node.js
class DBRouter {
  constructor() {
    this.primary = createConnection({ host: 'primary.db' });
    this.replicas = [
      createConnection({ host: 'replica1.db' }),
      createConnection({ host: 'replica2.db' })
    ];
  }
  
  async write(query, params) {
    return this.primary.query(query, params);
  }
  
  async read(query, params) {
    // Round-robin between replicas
    const replica = this.replicas[Math.floor(Math.random() * this.replicas.length)];
    return replica.query(query, params);
  }
}

// Usage
const db = new DBRouter();
await db.write('INSERT INTO orders ...');
const orders = await db.read('SELECT * FROM orders ...');
```

### Replication Lag:
```javascript
// Problem: just wrote, immediately read — replica may not have it
await db.write('INSERT INTO posts ... RETURNING id'); // Primary
const post = await db.read('SELECT * FROM posts WHERE id = ?'); // Replica — may be empty!

// Solution 1: Read from primary after write
const post = await db.write('SELECT * FROM posts WHERE id = ?');

// Solution 2: Wait for replication
await sleep(100);
const post = await db.read(...);

// Solution 3: Use "read your writes" — track per session
```

---

## 4.4 Indexing & Query Optimization 🔍

**Hinglish:** 10 million rows me ek user dhundhna hai. Index nahi hai → poora table scan, slow! Index hai → seedha jagah pe pohonch jata hai. Book ka index jaisa hi hai.

**English Definition:**
> Indexes are data structures that improve query performance by allowing fast lookups, at the cost of additional storage and slower writes.

### Types of Indexes:

### 1. B-Tree Index (Most Common)
- Default in PostgreSQL, MySQL
- Good for: equality, range queries, sorting
- `WHERE id = 5`, `WHERE age > 18`, `ORDER BY name`

### 2. Hash Index
- Equality only, no range
- Faster for exact match
- `WHERE email = 'a@b.com'`

### 3. Composite (Multi-Column)
```sql
CREATE INDEX idx_user_status_date ON orders(user_id, status, created_at);
```
- Order matters!
- Useful: `WHERE user_id = 5 AND status = 'pending'`
- Useless: `WHERE status = 'pending'` alone

### 4. Full-Text Index
- Text search
- PostgreSQL: `tsvector`
- MongoDB: text indexes
- Better: use Elasticsearch

### 5. Geospatial Index
- Location queries
- "Find restaurants within 5km"

### When to Index?
- ✅ Foreign keys
- ✅ Columns in WHERE clauses
- ✅ Columns in JOIN conditions
- ✅ Columns in ORDER BY
- ❌ Tables with heavy writes (slows down)
- ❌ Small tables
- ❌ Columns with low cardinality (gender: M/F)

### EXPLAIN ANALYZE:
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'a@b.com';

-- Without index:
-- Seq Scan on users (cost=0.00..1234.56 rows=1) — SLOW
-- Total time: 1200ms

-- With index:
-- Index Scan using idx_email on users (cost=0.42..8.44) — FAST
-- Total time: 0.5ms
```

### JavaScript Example:
```javascript
// Mongoose me index
const userSchema = new mongoose.Schema({
  email: { type: String, index: true, unique: true },
  age: { type: Number, index: true },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number]
  }
});

userSchema.index({ location: '2dsphere' }); // Geo index
userSchema.index({ name: 'text', bio: 'text' }); // Full-text
userSchema.index({ status: 1, createdAt: -1 }); // Composite
```

### Common Pitfalls:
1. **Function on indexed column** — `WHERE LOWER(email) = ...` won't use index
2. **Leading wildcard** — `WHERE name LIKE '%john%'` won't use index
3. **OR conditions** — sometimes prevents index use
4. **Too many indexes** — slow writes, more storage

---

# 5. MESSAGING & ASYNC COMMUNICATION

## 5.1 Message Queues 📬

**Hinglish:** Tu email send kar raha hai, user ko 5 second wait kyu karwaye? Queue me daal de, background me process ho jayega. User ko turant response — fast feel hota hai!

**English Definition:**
> A message queue is an asynchronous communication mechanism that allows producers to send messages to consumers via an intermediary queue.

### Why Use Queues?
1. **Decoupling** — services independent rahe
2. **Async processing** — user ko fast response
3. **Load leveling** — traffic spike absorb kare
4. **Reliability** — message persist hota hai
5. **Retry** — failure pe automatic retry

### Architecture:
```
[Producer] → [Queue] → [Consumer 1]
                    → [Consumer 2]
                    → [Consumer 3]
```

### Popular Queues:

| Queue | Best For | Notes |
|-------|----------|-------|
| **RabbitMQ** | Complex routing | AMQP protocol |
| **AWS SQS** | Simple, managed | Easy AWS integration |
| **Redis Queue** | Simple, fast | Bull/BullMQ in Node |
| **Kafka** | Event streaming | High throughput |

### JavaScript Example (Bull with Redis):
```javascript
const Queue = require('bull');
const emailQueue = new Queue('emails', 'redis://localhost:6379');

// Producer (your API)
app.post('/signup', async (req, res) => {
  const user = await db.users.create(req.body);
  
  // Queue me daal do, async process hoga
  await emailQueue.add('welcome-email', {
    userId: user.id,
    email: user.email
  }, {
    attempts: 3, // 3 baar try karo failure pe
    backoff: { type: 'exponential', delay: 2000 } // 2s, 4s, 8s
  });
  
  res.json({ success: true }); // User ko turant response
});

// Consumer (background worker)
emailQueue.process('welcome-email', async (job) => {
  const { email } = job.data;
  await sendEmail(email, 'Welcome!');
});
```

### Concepts:

**1. Acknowledgment (ACK):**
- Consumer message process karke acknowledge karta hai
- Bina ACK message dubara aata hai

**2. Dead Letter Queue (DLQ):**
- Jo messages baar baar fail ho rahe hain — DLQ me daalo
- Manually investigate karo

**3. Visibility Timeout:**
- Message processing ke liye consumer ko diya gaya
- Timeout ke baad dusre consumer ko mil sakta hai

**4. FIFO vs Standard:**
- **FIFO** — order guaranteed (slower)
- **Standard** — order not guaranteed (faster)

### Real World Use Cases:
- Email/SMS sending
- Image/video processing
- Order fulfillment
- Data sync between systems
- Webhook delivery

---

## 5.2 Kafka / Event Streaming 🌊

**Hinglish:** Kafka ek high-throughput log hai — millions of events per second handle kar sakta hai. Multiple consumers same data padh sakte hain. Real-time data pipelines ka king!

**English Definition:**
> Apache Kafka is a distributed event streaming platform capable of handling trillions of events per day, with persistent storage and replay capabilities.

### Kafka vs Traditional Queue:

| Feature | Kafka | Queue (RabbitMQ) |
|---------|-------|------------------|
| **Storage** | Persistent log | Temporary (until consumed) |
| **Replay** | Yes, anytime | No |
| **Throughput** | Very high (millions/sec) | High (thousands/sec) |
| **Multiple consumers** | All can read all messages | One message → one consumer |
| **Use case** | Streams, logs, events | Tasks, jobs |

### Core Concepts:

```
[Topic: user-events]
  ├─ Partition 0: [msg1] [msg2] [msg3] ...
  ├─ Partition 1: [msg4] [msg5] [msg6] ...
  └─ Partition 2: [msg7] [msg8] [msg9] ...
```

1. **Topic** — category of events (e.g., `user-signups`, `orders`)
2. **Partition** — topic ke tukde, parallel processing ke liye
3. **Producer** — events publish karta hai
4. **Consumer** — events consume karta hai
5. **Consumer Group** — multiple consumers parallel kaam karte
6. **Offset** — position in partition (consumer kahan tak padha)
7. **Broker** — Kafka server

### JavaScript Example (kafkajs):
```javascript
const { Kafka } = require('kafkajs');
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092']
});

// Producer
const producer = kafka.producer();
await producer.connect();
await producer.send({
  topic: 'user-events',
  messages: [
    { 
      key: userId, // Same key → same partition (order guaranteed)
      value: JSON.stringify({ event: 'signup', userId, timestamp: Date.now() })
    }
  ]
});

// Consumer
const consumer = kafka.consumer({ groupId: 'analytics-service' });
await consumer.connect();
await consumer.subscribe({ topic: 'user-events', fromBeginning: false });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    await processEvent(event);
    // Auto-commit offset after processing
  }
});
```

### Use Cases:
1. **Event Sourcing** — har state change event ke through
2. **Log Aggregation** — saare microservices ke logs
3. **Stream Processing** — real-time analytics
4. **Data Pipeline** — DB → Kafka → multiple consumers
5. **Audit Logs** — replay possible

### Real World:
- **LinkedIn** — Kafka invented here, 7 trillion msgs/day
- **Uber** — real-time pricing, fraud detection
- **Netflix** — event tracking, recommendations

---

## 5.3 Pub/Sub Pattern 📢

**Hinglish:** Ek event hua, multiple jagah notification jaani chahiye. Order place hua → Email service, SMS service, Inventory service, Analytics — sabko pata chale ek saath. Yahi pub/sub hai.

**English Definition:**
> Pub/Sub is a messaging pattern where publishers send messages to topics, and subscribers receive messages from topics they're subscribed to, without direct coupling.

### Pub/Sub vs Queue:

```
[Queue]                    [Pub/Sub]
                          
Producer → [Q] → Consumer  Publisher → [Topic] → Sub 1
                                                → Sub 2
ONE consumer gets msg                          → Sub 3
                                              ALL subscribers get msg
```

### Implementations:

1. **Redis Pub/Sub** — simple, in-memory (no persistence)
2. **Kafka** — persistent, replay-able
3. **Google Pub/Sub** — managed cloud service
4. **AWS SNS** — Simple Notification Service
5. **NATS** — lightweight, fast

### JavaScript Example (Redis Pub/Sub):
```javascript
const redis = require('redis');

// Publisher
const publisher = redis.createClient();
app.post('/order', async (req, res) => {
  const order = await createOrder(req.body);
  
  // Sab subscribers ko notify
  publisher.publish('order.created', JSON.stringify(order));
  
  res.json(order);
});

// Subscriber 1: Email Service
const emailSub = redis.createClient();
emailSub.subscribe('order.created');
emailSub.on('message', (channel, message) => {
  const order = JSON.parse(message);
  sendOrderConfirmationEmail(order);
});

// Subscriber 2: Inventory Service
const inventorySub = redis.createClient();
inventorySub.subscribe('order.created');
inventorySub.on('message', (channel, message) => {
  const order = JSON.parse(message);
  updateInventory(order.items);
});

// Subscriber 3: Analytics
const analyticsSub = redis.createClient();
analyticsSub.subscribe('order.*'); // Wildcard
analyticsSub.on('pmessage', (pattern, channel, message) => {
  trackEvent(channel, JSON.parse(message));
});
```

### Use Cases:
- **Notifications fan-out** — order placed → email + SMS + push + analytics
- **Cache invalidation** — data update → all caches refresh
- **Real-time updates** — chat, live scores, stock prices
- **Microservices communication** — loose coupling

---

# 6. API DESIGN & COMMUNICATION

## 6.1 REST API Design 🌐

**Hinglish:** REST ek standard hai API banane ka. URLs me resources, HTTP methods se actions. Clean, predictable, sab developers samajh sakte hain.

**English Definition:**
> REST (Representational State Transfer) is an architectural style for designing networked applications using stateless, cacheable communication via HTTP.

### REST Principles:

1. **Stateless** — har request independent
2. **Resources** — URLs identify entities
3. **HTTP Methods** — actions
4. **Standard status codes**
5. **Cacheable**
6. **Uniform interface**

### HTTP Methods:

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| **GET** | Read | ✅ | ✅ |
| **POST** | Create | ❌ | ❌ |
| **PUT** | Update (full) | ✅ | ❌ |
| **PATCH** | Update (partial) | ❌ | ❌ |
| **DELETE** | Delete | ✅ | ❌ |

### URL Design:

```
✅ Good                          ❌ Bad
GET /users                       GET /getAllUsers
GET /users/123                   GET /user?id=123
POST /users                      POST /createUser
GET /users/123/orders            GET /getUserOrders?id=123
DELETE /users/123                POST /deleteUser/123
```

### Status Codes:

```
2xx — Success
  200 OK — generic success
  201 Created — resource created
  204 No Content — success, no body

3xx — Redirection
  301 Moved Permanently
  304 Not Modified (caching)

4xx — Client Error
  400 Bad Request
  401 Unauthorized (auth needed)
  403 Forbidden (auth done, no permission)
  404 Not Found
  409 Conflict (duplicate)
  422 Unprocessable Entity (validation)
  429 Too Many Requests (rate limit)

5xx — Server Error
  500 Internal Server Error
  502 Bad Gateway
  503 Service Unavailable
  504 Gateway Timeout
```

### JavaScript Example (Express):
```javascript
const express = require('express');
const app = express();

// GET — list with pagination
app.get('/api/v1/users', async (req, res) => {
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
  
  const users = await db.users.find()
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit);
    
  const total = await db.users.count();
  
  res.set('X-Total-Count', total);
  res.json({
    data: users,
    pagination: {
      page: +page,
      limit: +limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// POST — create
app.post('/api/v1/users', async (req, res) => {
  try {
    const user = await db.users.create(req.body);
    res.status(201).location(`/api/v1/users/${user.id}`).json(user);
  } catch (err) {
    if (err.code === 'DUPLICATE') return res.status(409).json({ error: 'User exists' });
    res.status(422).json({ error: err.message });
  }
});

// PATCH — partial update
app.patch('/api/v1/users/:id', async (req, res) => {
  const user = await db.users.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// DELETE
app.delete('/api/v1/users/:id', async (req, res) => {
  await db.users.delete(req.params.id);
  res.status(204).send();
});
```

### Best Practices:

1. **Versioning:** `/api/v1/users` or `Accept: application/vnd.api+json;version=1`
2. **Pagination:** `?page=1&limit=20` or cursor-based
3. **Filtering:** `?status=active&role=admin`
4. **Sorting:** `?sort=-createdAt,name`
5. **Field selection:** `?fields=name,email`
6. **HATEOAS:** include related links in response
7. **Rate limiting:** prevent abuse
8. **Idempotency keys:** for POST safety

---

## 6.2 GraphQL 🎯

**Hinglish:** REST me tu jo bhi maange — server pura object dega. GraphQL me tu exactly bata sakta hai kya chahiye — sirf wahi milega. Frontend ki zindagi aasaan!

**English Definition:**
> GraphQL is a query language for APIs that allows clients to request exactly the data they need in a single request, with strong typing and a single endpoint.

### REST vs GraphQL:

```javascript
// REST — multiple requests, fixed structure
GET /users/123          // user data
GET /users/123/posts    // user's posts
GET /users/123/friends  // user's friends
// 3 requests, may have unused data

// GraphQL — one request, exact shape
POST /graphql
{
  user(id: 123) {
    name
    email
    posts(limit: 5) { title }
    friends { name }
  }
}
// 1 request, exact data
```

### Core Concepts:

1. **Schema** — strongly typed
2. **Queries** — read data
3. **Mutations** — write data
4. **Subscriptions** — real-time (WebSocket)
5. **Resolvers** — functions that fetch data

### JavaScript Example (Apollo Server):
```javascript
const { ApolloServer, gql } = require('apollo-server');

// Schema
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }
  
  type Query {
    user(id: ID!): User
    users(limit: Int): [User!]!
  }
  
  type Mutation {
    createUser(name: String!, email: String!): User!
  }
  
  type Subscription {
    postCreated: Post!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => db.users.findById(id),
    users: (_, { limit }) => db.users.find().limit(limit)
  },
  
  User: {
    posts: (parent) => db.posts.find({ userId: parent.id })
  },
  
  Mutation: {
    createUser: (_, args) => db.users.create(args)
  },
  
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator(['POST_CREATED'])
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen();
```

### Pros:
- ✅ No over-fetching / under-fetching
- ✅ Single endpoint
- ✅ Strong typing (auto-generated client code)
- ✅ Self-documenting
- ✅ Better mobile performance

### Cons:
- ❌ Caching harder (POST requests)
- ❌ Complex queries can crash server (N+1 problem)
- ❌ Learning curve
- ❌ File uploads tricky

### N+1 Problem:
```javascript
// Bad — N+1 queries
{
  users { 
    name
    posts { title } // For each user, separate DB query!
  }
}

// Solution: DataLoader (batches & caches)
const userLoader = new DataLoader(async (ids) => {
  const users = await db.users.find({ id: { $in: ids } });
  return ids.map(id => users.find(u => u.id === id));
});
```

### When to Use?
- ✅ Mobile apps (data efficiency matters)
- ✅ Multiple clients with different needs
- ✅ Complex relational data
- ❌ Simple CRUD APIs (REST is enough)
- ❌ Heavy file uploads
- ❌ Public APIs (REST is more standard)

---

## 6.3 gRPC & Protobuf 🚀

**Hinglish:** gRPC microservices ke beech communication ke liye REST se 5-10x fast hai. Binary format use karta hai (Protobuf), HTTP/2 pe chalta hai. Internal services ke liye perfect.

**English Definition:**
> gRPC is a high-performance RPC framework using HTTP/2 and Protocol Buffers for binary serialization, ideal for service-to-service communication.

### gRPC vs REST:

| Feature | gRPC | REST |
|---------|------|------|
| **Protocol** | HTTP/2 | HTTP/1.1 (mostly) |
| **Format** | Binary (Protobuf) | Text (JSON) |
| **Speed** | Very fast | Slower |
| **Streaming** | Bidirectional | Limited (SSE) |
| **Browser support** | Limited | Native |
| **Schema** | Strict (.proto) | Optional (OpenAPI) |

### Protobuf Definition:
```protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc StreamUsers (StreamRequest) returns (stream User); // Server streaming
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

message GetUserRequest {
  int32 id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message StreamRequest {
  int32 limit = 1;
}
```

### JavaScript Example:
```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Server
const packageDef = protoLoader.loadSync('user.proto');
const userProto = grpc.loadPackageDefinition(packageDef).UserService;

const server = new grpc.Server();
server.addService(userProto.service, {
  GetUser: async (call, callback) => {
    const user = await db.users.findById(call.request.id);
    callback(null, user);
  },
  
  CreateUser: async (call, callback) => {
    const user = await db.users.create(call.request);
    callback(null, user);
  }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});

// Client
const client = new userProto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

client.GetUser({ id: 123 }, (err, user) => {
  console.log(user);
});
```

### Streaming Types:
1. **Unary** — req/res (like REST)
2. **Server streaming** — server keeps sending
3. **Client streaming** — client keeps sending
4. **Bidirectional** — both stream simultaneously

### When to Use?
- ✅ Microservice-to-microservice
- ✅ Low-latency requirements
- ✅ Polyglot environments (multiple languages)
- ✅ Streaming data
- ❌ Browser clients (use gRPC-Web or REST)
- ❌ Public APIs

---

## 6.4 WebSockets & SSE 🔄

**Hinglish:** HTTP me client request bhejta hai, server response. Real-time chat ya live updates ke liye yeh problem hai. WebSocket me dono ek dusre se kabhi bhi baat kar sakte hain — full duplex!

**English Definition:**
> WebSocket provides full-duplex communication over a single TCP connection. SSE (Server-Sent Events) provides one-way server-to-client streaming over HTTP.

### Comparison:

| Feature | HTTP | SSE | WebSocket |
|---------|------|-----|-----------|
| **Direction** | Request/Response | Server → Client | Bidirectional |
| **Connection** | New each time | Persistent | Persistent |
| **Protocol** | HTTP | HTTP | WS/WSS |
| **Reconnect** | N/A | Auto | Manual |
| **Use case** | Standard API | News feed | Chat, gaming |

### WebSocket Example:
```javascript
// Server (Node.js with ws)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          user: msg.user,
          text: msg.text,
          timestamp: Date.now()
        }));
      }
    });
  });
  
  ws.on('close', () => console.log('Client disconnected'));
});

// Client (Browser)
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(`${msg.user}: ${msg.text}`);
};

ws.send(JSON.stringify({ user: 'Rahul', text: 'Hello!' }));
```

### SSE Example:
```javascript
// Server
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: new Date() })}\n\n`);
  }, 1000);
  
  req.on('close', () => clearInterval(interval));
});

// Client
const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

### Long Polling (Old technique):
```javascript
// Client keeps asking, server holds response until data available
async function poll() {
  while (true) {
    const response = await fetch('/api/messages?since=' + lastId);
    const messages = await response.json();
    if (messages.length) updateUI(messages);
    // No sleep — server holds the request
  }
}
```

### Use Cases:
- **WebSocket:** Chat, gaming, collaborative editing (Google Docs), trading
- **SSE:** Live notifications, news feeds, stock tickers, progress updates
- **Long Polling:** Fallback when WebSocket not available

### Scaling Challenges:
- Sticky sessions or shared state (Redis pub/sub)
- Connection limits (use multiple servers)
- Heartbeats for connection health
- Authentication on connect

---

## 6.5 API Gateway 🚪

**Hinglish:** Tere paas 50 microservices hain. Client ko 50 endpoints yaad rakhne hain? Nahi! API Gateway ek single dwaar hai jahan se sab requests pass hote hain — auth, rate limit, routing — sab ek jagah.

**English Definition:**
> An API Gateway is a single entry point for all client requests, providing routing, authentication, rate limiting, and other cross-cutting concerns for microservices.

### Responsibilities:

1. **Routing** — request → correct microservice
2. **Authentication** — JWT verify
3. **Authorization** — permission check
4. **Rate Limiting** — abuse prevention
5. **Caching** — common responses
6. **Logging & Monitoring**
7. **Request/Response transformation**
8. **SSL termination**
9. **API composition** — multiple services → single response

### Architecture:
```
[Mobile App]  ↘
[Web App]    →  [API Gateway] → [Auth Service]
[Partner API] ↗                → [User Service]
                               → [Order Service]
                               → [Payment Service]
```

### Popular API Gateways:
- **Kong** — open source, plugin-based
- **AWS API Gateway** — managed
- **NGINX** — reverse proxy + features
- **Apigee** — Google, enterprise
- **Express Gateway** — Node.js based

### JavaScript Example (Custom with Express):
```javascript
const express = require('express');
const httpProxy = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Public routes
app.use('/auth', httpProxy.createProxyMiddleware({ 
  target: 'http://auth-service:3001' 
}));

// Protected routes
app.use('/users', authenticate, httpProxy.createProxyMiddleware({ 
  target: 'http://user-service:3002' 
}));

app.use('/orders', authenticate, httpProxy.createProxyMiddleware({ 
  target: 'http://order-service:3003' 
}));

// Composition endpoint
app.get('/dashboard', authenticate, async (req, res) => {
  const [user, orders, notifications] = await Promise.all([
    fetch(`http://user-service:3002/users/${req.user.id}`),
    fetch(`http://order-service:3003/users/${req.user.id}/orders`),
    fetch(`http://notif-service:3004/users/${req.user.id}/recent`)
  ]);
  
  res.json({
    user: await user.json(),
    orders: await orders.json(),
    notifications: await notifications.json()
  });
});

app.listen(3000);
```

### BFF (Backend For Frontend):
- Different gateway for different clients
- Mobile gateway optimized for mobile
- Web gateway for web app
- Reduces over-fetching

---

# 7. MICROSERVICES ARCHITECTURE

## 7.1 Microservices vs Monolith 🏛️

**Hinglish:** Monolith ek bada app hai — sab kuch ek codebase me. Microservices me chote chote independent services. Dono ke pros and cons hain.

**English Definition:**
> A monolith is a single, tightly coupled codebase. Microservices are small, independent services that communicate over the network, each owning its data and business logic.

### Comparison:

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Deployment** | Single unit | Independent |
| **Scaling** | Whole app | Per service |
| **Database** | Shared | Per service |
| **Technology** | Single stack | Polyglot |
| **Team** | One team | Multiple teams |
| **Complexity** | Low initially | High |
| **Debugging** | Easy | Distributed tracing |
| **Network** | In-process | Over network |

### When to Choose Monolith?
- ✅ Startup, MVP
- ✅ Small team (<10)
- ✅ Simple domain
- ✅ Limited resources
- ✅ Fast iteration needed

### When to Microservices?
- ✅ Large team (multiple teams)
- ✅ Complex domain (clear boundaries)
- ✅ Different scaling needs per feature
- ✅ Multiple tech stacks
- ✅ Independent deployment cycles

### Migration Path:
```
1. Start with Monolith
2. Identify bounded contexts (auth, billing, inventory)
3. Extract services one at a time (Strangler Pattern)
4. Eventually: Microservices
```

### Example Architecture:

**Monolith:**
```javascript
// One Express app
app.post('/order', async (req, res) => {
  // All in one process
  const user = await db.users.findById(req.user.id);
  const product = await db.products.findById(req.body.productId);
  const order = await db.orders.create(...);
  await db.inventory.decrement(product.id);
  await sendEmail(user.email);
  res.json(order);
});
```

**Microservices:**
```javascript
// Order Service
app.post('/orders', async (req, res) => {
  const user = await fetch('http://user-service/users/' + req.user.id);
  const product = await fetch('http://product-service/products/' + req.body.productId);
  
  const order = await db.orders.create(...);
  
  // Async events
  eventBus.publish('order.created', order);
  
  res.json(order);
});

// Inventory Service (separate process, separate DB)
eventBus.subscribe('order.created', async (order) => {
  await db.inventory.decrement(order.productId);
});

// Email Service
eventBus.subscribe('order.created', async (order) => {
  await sendOrderEmail(order);
});
```

### Microservices Challenges:
1. **Network failures** — circuit breakers, retries
2. **Distributed transactions** — saga pattern
3. **Service discovery** — how to find services
4. **Monitoring** — distributed tracing
5. **Data consistency** — eventual consistency
6. **Testing** — integration tests complex

---

## 7.2 Service Discovery & Mesh 🔍

**Hinglish:** 50 microservices hain, dynamic IPs hain (containers come and go). Ek service dusri ko kaise dhundhe? Service discovery yeh problem solve karta hai.

**English Definition:**
> Service discovery enables services to find and communicate with each other dynamically without hardcoded URLs.

### Patterns:

### 1. Client-Side Discovery:
```javascript
// Service registers itself
serviceRegistry.register({
  name: 'user-service',
  host: '10.0.1.5',
  port: 3001,
  health: '/health'
});

// Client queries registry
const instances = await serviceRegistry.getInstances('user-service');
const instance = loadBalance(instances);
const response = await fetch(`http://${instance.host}:${instance.port}/users/123`);
```

### 2. Server-Side Discovery:
- Load balancer queries registry
- Client just calls a known LB URL
- Example: Kubernetes Service

### Tools:

1. **Consul** — HashiCorp, KV store + discovery
2. **Eureka** — Netflix, Java focused
3. **etcd** — used by Kubernetes
4. **Kubernetes Service** — built-in DNS based
5. **Zookeeper** — distributed coordination

### Service Mesh:
> Service mesh handles service-to-service communication via sidecar proxies.

```
[Service A] ←→ [Sidecar Proxy A]   ←→   [Sidecar Proxy B] ←→ [Service B]
                       (mTLS, retries, traffic shaping, observability)
```

### Popular Service Meshes:
- **Istio** — most popular, feature-rich
- **Linkerd** — lightweight
- **Consul Connect**
- **AWS App Mesh**

### What Service Mesh Provides:
1. **mTLS** — automatic encryption
2. **Traffic management** — canary, A/B
3. **Observability** — metrics, traces, logs
4. **Resilience** — retries, timeouts, circuit breakers
5. **Security** — auth between services

### JavaScript Example (Consul):
```javascript
const consul = require('consul')();

// Register service
consul.agent.service.register({
  name: 'user-service',
  address: '10.0.1.5',
  port: 3001,
  check: {
    http: 'http://10.0.1.5:3001/health',
    interval: '10s'
  }
});

// Discover service
const services = await consul.health.service('user-service');
const healthy = services.filter(s => s.Checks.every(c => c.Status === 'passing'));
const target = healthy[Math.floor(Math.random() * healthy.length)];
```

---

## 7.3 Saga Pattern 🎬

**Hinglish:** Microservices me ek transaction multiple services me chalti hai. Database transaction kaam nahi karega. Saga bolta hai — har step ka ek "undo" step bhi rakho. Fail hua to undo karo.

**English Definition:**
> Saga is a pattern for managing distributed transactions across microservices using a sequence of local transactions, with compensating actions for rollback.

### Two Types:

### 1. Choreography (Decentralized):
- Services events publish karte hain
- Dusri services react karti hain
- No central coordinator

```
[Order Service] — order.created → 
                                 → [Payment Service] — payment.success →
                                                                       → [Inventory Service]
```

### 2. Orchestration (Centralized):
- Ek orchestrator/coordinator
- Steps explicitly call karta hai
- Easier to track

### Example: E-commerce Order

**Steps:**
1. Create order
2. Process payment
3. Reserve inventory
4. Ship product

**Compensating Actions:**
1. Cancel order
2. Refund payment
3. Release inventory
4. Cancel shipment

### JavaScript Example (Orchestration):
```javascript
class OrderSaga {
  async execute(orderData) {
    const completed = [];
    
    try {
      // Step 1
      const order = await orderService.create(orderData);
      completed.push({ step: 'order', id: order.id });
      
      // Step 2
      const payment = await paymentService.charge(order.amount);
      completed.push({ step: 'payment', id: payment.id });
      
      // Step 3
      const reservation = await inventoryService.reserve(order.items);
      completed.push({ step: 'inventory', id: reservation.id });
      
      // Step 4
      const shipment = await shippingService.create(order.id);
      completed.push({ step: 'shipping', id: shipment.id });
      
      return { success: true, order };
    } catch (err) {
      // Rollback in reverse
      await this.compensate(completed);
      throw err;
    }
  }
  
  async compensate(completed) {
    for (const action of completed.reverse()) {
      try {
        switch (action.step) {
          case 'shipping':
            await shippingService.cancel(action.id);
            break;
          case 'inventory':
            await inventoryService.release(action.id);
            break;
          case 'payment':
            await paymentService.refund(action.id);
            break;
          case 'order':
            await orderService.cancel(action.id);
            break;
        }
      } catch (err) {
        // Log compensation failure — needs manual intervention
        console.error('Compensation failed:', action, err);
      }
    }
  }
}
```

### Best Practices:
1. **Idempotent operations** — retries safe
2. **State machine** — track saga state
3. **Persistent saga state** — resume on crash
4. **Compensation must be reliable** — log failures
5. **Tools:** AWS Step Functions, Temporal, Camunda

---

## 7.4 Circuit Breaker ⚡

**Hinglish:** Ek service fail ho rahi hai, tu bar bar call kar raha hai — sab requests timeout pe ja rahi hain, system slow! Circuit breaker bolta hai "ruk, agle 30 seconds tak request mat bhej, fail fast karo."

**English Definition:**
> Circuit Breaker is a design pattern that prevents cascading failures by stopping requests to a failing service and allowing it to recover.

### States:

```
[CLOSED] — normal operation, requests pass
   ↓ (failures > threshold)
[OPEN] — fail fast, requests rejected immediately
   ↓ (after timeout)
[HALF-OPEN] — allow few requests to test
   ↓ (success)        ↓ (fail)
[CLOSED]            [OPEN]
```

### JavaScript Example:
```javascript
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.nextAttempt = Date.now();
  }
  
  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF-OPEN';
    }
    
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

// Usage
const paymentBreaker = new CircuitBreaker(
  async (orderId) => {
    return fetch(`http://payment-service/charge/${orderId}`);
  },
  { failureThreshold: 3, resetTimeout: 30000 }
);

try {
  await paymentBreaker.call(orderId);
} catch (err) {
  // Fallback: queue for retry, show degraded UI
  await retryQueue.add({ orderId });
}
```

### Libraries:
- **opossum** (Node.js)
- **Hystrix** (Java, Netflix)
- **Polly** (.NET)
- **Resilience4j** (Java)

### Patterns Together:
```
Circuit Breaker + Retry + Timeout + Fallback + Bulkhead
```

---

# 8. STORAGE — KAHAN KYA RAKHO

## 8.1 Object Storage 🗂️

**Hinglish:** Files (images, videos, PDFs) DB me daalna mehnga aur slow hai. Object storage me unlimited daal sakte ho, sasta hai, fast hai. S3 ka naam suna hi hoga!

**English Definition:**
> Object storage is a flat hierarchy storage system designed for unstructured data, with each object containing data, metadata, and a unique identifier.

### Examples:
- **AWS S3** — most popular
- **Google Cloud Storage**
- **Azure Blob Storage**
- **Cloudflare R2** — no egress fees!
- **MinIO** — self-hosted

### Features:
- **Unlimited size** — petabytes
- **Cheap** — ~$0.023/GB/month (S3)
- **Durable** — 11 nines (99.999999999%)
- **Globally accessible**
- **Versioning, lifecycle policies**
- **Static website hosting**

### Storage Classes (S3):

| Class | Use Case | Cost |
|-------|----------|------|
| **Standard** | Frequent access | Highest |
| **Infrequent Access** | Once a month | Medium |
| **Glacier** | Archive | Lowest |
| **Glacier Deep Archive** | Rarely access | Lowest |

### JavaScript Example (S3):
```javascript
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({ region: 'ap-south-1' });

// Upload
await s3.send(new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: 'users/123/avatar.jpg',
  Body: fileBuffer,
  ContentType: 'image/jpeg',
  Metadata: { userId: '123' }
}));

// Pre-signed URL (client direct upload, no server cost)
const url = await getSignedUrl(s3, new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: `uploads/${Date.now()}.jpg`,
  ContentType: 'image/jpeg'
}), { expiresIn: 300 }); // 5 min

// Frontend uses this URL to upload directly to S3
fetch(url, { method: 'PUT', body: file });
```

### Pre-signed URLs Pattern:
```
1. Client → Server: "Mujhe upload karna hai"
2. Server → S3: "Generate pre-signed URL"
3. Server → Client: "Yeh le URL"
4. Client → S3: Direct upload (server bypass!)
```

### When to Use?
- ✅ Images, videos, audio
- ✅ Backups
- ✅ Static website hosting
- ✅ Data lakes (analytics)
- ✅ Logs archival
- ❌ Frequently changing data
- ❌ Transactional data

---

## 8.2 Storage Types Deep Dive 💾

**Hinglish:** Storage 3 type ka hota hai — Block, File, Object. Har ek ka apna use case hai.

### 1. Block Storage 🧱
**Hinglish:** Hard disk ki tarah — raw blocks, OS isko file system bana ke use karta hai.

- **Examples:** AWS EBS, Azure Disk, iSCSI SAN
- **Use case:** Database storage, OS volumes
- **Mounting:** Single instance only (mostly)
- **Performance:** Highest (low latency)
- **Cost:** Higher than object

### 2. File Storage 📁
**Hinglish:** Network drive jaisa — folders, files, share kar sakte ho multiple machines me.

- **Examples:** AWS EFS, NFS, SMB
- **Use case:** Shared files, content management, lift-and-shift
- **Mounting:** Multiple instances
- **Performance:** Medium
- **Cost:** Medium

### 3. Object Storage 🗂️
**Hinglish:** Already covered — flat structure, REST API.

- **Examples:** S3, GCS, Azure Blob
- **Use case:** Unlimited unstructured data
- **Access:** HTTP API
- **Performance:** Higher latency
- **Cost:** Lowest

### Comparison Table:

| Feature | Block | File | Object |
|---------|-------|------|--------|
| **Structure** | Blocks | Hierarchy | Flat |
| **Access** | OS-level | Network protocol | HTTP API |
| **Scale** | TB | TB | Unlimited |
| **Latency** | Lowest | Low | Higher |
| **Use** | DB, OS | Shared files | Media, backup |
| **Multi-attach** | Limited | Yes | N/A |

### Decision Matrix:
```
Database? → Block storage (EBS)
Shared files across servers? → File storage (EFS)
User uploads/media? → Object storage (S3)
Backup/archive? → Object storage (S3 Glacier)
```

---

## 8.3 Search Systems 🔎

**Hinglish:** SQL me `LIKE '%query%'` bahut slow hai. Search ke liye dedicated tool chahiye — Elasticsearch! Inverted index, fuzzy match, ranking — sab kuch milta hai.

**English Definition:**
> Search systems use specialized data structures (inverted indexes) to provide fast, full-text search with relevance ranking, fuzzy matching, and faceting.

### Why Not SQL LIKE?
```sql
SELECT * FROM products WHERE name LIKE '%phone%'; -- Full table scan, SLOW

-- Even with full-text index, limited features
```

### Inverted Index:
```
Documents:
1. "Apple iPhone 15"
2. "Samsung Galaxy phone"
3. "iPhone case"

Inverted Index:
"apple" → [1]
"iphone" → [1, 3]
"15" → [1]
"samsung" → [2]
"galaxy" → [2]
"phone" → [2]
"case" → [3]

Search "iphone case" → intersect [1,3] ∩ [3] = [3]
```

### Popular Tools:
- **Elasticsearch** — most popular, ELK stack
- **Apache Solr** — also Lucene-based
- **Meilisearch** — modern, fast, easy
- **Algolia** — managed, expensive but great
- **Typesense** — open-source Algolia alternative
- **OpenSearch** — AWS fork of Elasticsearch

### JavaScript Example (Elasticsearch):
```javascript
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

// Index a document
await client.index({
  index: 'products',
  id: '1',
  body: {
    name: 'Apple iPhone 15 Pro',
    description: 'Latest iPhone with A17 chip',
    price: 999,
    category: 'phones',
    tags: ['apple', 'smartphone', 'premium']
  }
});

// Search
const result = await client.search({
  index: 'products',
  body: {
    query: {
      bool: {
        must: [
          { 
            multi_match: {
              query: 'iphone',
              fields: ['name^3', 'description', 'tags'], // name 3x weight
              fuzziness: 'AUTO' // typo tolerance
            }
          }
        ],
        filter: [
          { range: { price: { lte: 1500 } } },
          { term: { category: 'phones' } }
        ]
      }
    },
    aggs: {
      categories: { terms: { field: 'category.keyword' } },
      price_ranges: { 
        range: { 
          field: 'price', 
          ranges: [{ to: 500 }, { from: 500, to: 1000 }, { from: 1000 }]
        }
      }
    },
    sort: [{ _score: 'desc' }, { price: 'asc' }],
    from: 0,
    size: 20
  }
});

console.log(result.hits.hits); // Results with scores
console.log(result.aggregations); // Facets
```

### Features:
1. **Full-text search** — relevance ranking
2. **Fuzzy matching** — typos handle
3. **Autocomplete** — type-ahead
4. **Faceted search** — filters with counts
5. **Geo search** — location queries
6. **Aggregations** — analytics
7. **Multi-language** — analyzers per language

### Architecture Pattern:
```
[App] → writes → [PostgreSQL] (source of truth)
              → events → [Kafka] → [Elasticsearch] (search index)

Search queries: [App] → [Elasticsearch]
```

### Use Cases:
- Product search (e-commerce)
- Log search (Kibana)
- Document search (Confluence)
- Code search (GitHub)
- Autocomplete suggestions

---

# 9. SYSTEM DESIGN INTERVIEW PROBLEMS

## 9.1 URL Shortener (Bit.ly) 🔗

**Problem:** Long URL → Short URL (e.g., `bit.ly/3xY9Kz` → `https://example.com/very/long/url`)

### Requirements:
- **Functional:** shorten URL, redirect, custom alias, expiration, analytics
- **Non-functional:** low latency (<100ms), high availability (99.99%)

### Capacity Estimation:
```
Assumptions:
- 100M new URLs/day
- 100:1 read:write ratio
- URL avg size: 100 bytes

Writes/sec: 100M / 86400 ≈ 1200 writes/sec
Reads/sec: 1200 × 100 = 120K reads/sec

Storage (5 years):
100M × 365 × 5 × 100 bytes = ~18 TB
```

### High Level Design:
```
[Client] → [Load Balancer] → [App Servers] → [Cache (Redis)] 
                                          ↓ (miss)
                                          [DB (PostgreSQL/Cassandra)]
                                          ↓
                                          [ID Generator Service]
```

### Short Code Generation:

**Approach 1: Base62 Encoding**
- Characters: a-z, A-Z, 0-9 (62 chars)
- 7 chars = 62^7 = 3.5 trillion URLs

```javascript
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function encodeBase62(num) {
  let result = '';
  while (num > 0) {
    result = ALPHABET[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result.padStart(7, 'a');
}

// Counter-based (sequential, not random)
async function shorten(longUrl) {
  const id = await db.getNextId(); // Auto-increment
  const shortCode = encodeBase62(id);
  await db.urls.insert({ id, shortCode, longUrl });
  return `https://short.ly/${shortCode}`;
}
```

**Approach 2: Hash-based (MD5/SHA)**
```javascript
function hashUrl(longUrl) {
  const hash = crypto.createHash('md5').update(longUrl).digest('hex');
  return hash.substring(0, 7);
  // Risk: collisions (handle with retry + suffix)
}
```

**Approach 3: Random**
```javascript
function randomCode(length = 7) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * 62)];
  }
  return code;
}
```

### Schema:
```sql
CREATE TABLE urls (
  short_code VARCHAR(10) PRIMARY KEY,
  long_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count BIGINT DEFAULT 0
);

CREATE INDEX idx_user ON urls(user_id);
CREATE INDEX idx_expires ON urls(expires_at);
```

### Redirect Flow:
```javascript
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  
  // 1. Check cache
  let url = await redis.get(`url:${code}`);
  
  if (!url) {
    // 2. Check DB
    const record = await db.urls.findOne({ shortCode: code });
    if (!record) return res.status(404).send('Not found');
    
    if (record.expiresAt && record.expiresAt < new Date()) {
      return res.status(410).send('Expired');
    }
    
    url = record.longUrl;
    await redis.setex(`url:${code}`, 3600, url); // 1 hour cache
  }
  
  // 3. Async analytics (don't block redirect)
  analyticsQueue.push({ code, ip: req.ip, timestamp: Date.now() });
  
  // 4. Redirect (301 = permanent, 302 = temporary)
  res.redirect(302, url);
});
```

### Optimizations:
1. **Read-heavy** → aggressive caching (Redis + CDN)
2. **Counter** → use Redis INCR or Snowflake ID
3. **Sharding** → by short_code hash
4. **Analytics** → separate service, async via queue
5. **Custom domains** → subdomain routing

### Trade-offs:
- **Sequential ID:** predictable (security risk), but no collisions
- **Random:** unpredictable, but collision handling
- **Hash:** deterministic, but collision possible

---

## 9.2 Rate Limiter 🚦

**Problem:** API abuse rokna — har user max 100 requests/min.

### Algorithms:

### 1. Fixed Window Counter
```
[0:00 - 1:00] count: 100 — block more
[1:00 - 2:00] count: 0 — reset

Problem: 100 at 0:59 + 100 at 1:00 = 200 in 2 seconds!
```

```javascript
async function fixedWindow(userId) {
  const window = Math.floor(Date.now() / 60000);
  const key = `rate:${userId}:${window}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= 100;
}
```

### 2. Sliding Window Log
- Sare timestamps store karo
- Last 1 min ka count nikalo
- Memory heavy

```javascript
async function slidingLog(userId) {
  const now = Date.now();
  const windowStart = now - 60000;
  
  await redis.zremrangebyscore(`rate:${userId}`, 0, windowStart);
  const count = await redis.zcard(`rate:${userId}`);
  
  if (count >= 100) return false;
  
  await redis.zadd(`rate:${userId}`, now, `${now}-${Math.random()}`);
  await redis.expire(`rate:${userId}`, 60);
  return true;
}
```

### 3. Sliding Window Counter (Hybrid)
- Current + previous window weighted
- Memory efficient

### 4. Token Bucket 🪣
**Hinglish:** Tere paas ek bucket hai jisme tokens bharte rehte hain. Har request ek token leti hai. Bucket khali — request reject.

```javascript
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }
  
  consume(tokens = 1) {
    this.refill();
    if (this.tokens < tokens) return false;
    this.tokens -= tokens;
    return true;
  }
  
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

// Distributed (Redis)
async function tokenBucket(userId) {
  const key = `bucket:${userId}`;
  const now = Date.now();
  
  const lua = `
    local bucket = redis.call('HMGET', KEYS[1], 'tokens', 'last')
    local tokens = tonumber(bucket[1]) or ${capacity}
    local last = tonumber(bucket[2]) or ${now}
    
    local elapsed = (${now} - last) / 1000
    tokens = math.min(${capacity}, tokens + elapsed * ${refillRate})
    
    if tokens < 1 then
      return 0
    end
    
    tokens = tokens - 1
    redis.call('HMSET', KEYS[1], 'tokens', tokens, 'last', ${now})
    redis.call('EXPIRE', KEYS[1], 60)
    return 1
  `;
  
  return redis.eval(lua, 1, key);
}
```

### 5. Leaky Bucket 💧
- Fixed rate of processing
- Queue of requests
- Smoothes out bursts

### Comparison:

| Algorithm | Memory | Burst | Accuracy |
|-----------|--------|-------|----------|
| Fixed Window | Low | Allows burst at edges | Low |
| Sliding Log | High | Accurate | High |
| Sliding Counter | Low | Smooth | Medium |
| Token Bucket | Low | Allows bursts | High |
| Leaky Bucket | Low | No bursts | High |

### HTTP Headers:
```javascript
res.set({
  'X-RateLimit-Limit': 100,
  'X-RateLimit-Remaining': 73,
  'X-RateLimit-Reset': resetTime,
  'Retry-After': 30 // when blocked
});
```

### Where to Apply?
1. **API Gateway** — first line of defense
2. **Per User** — authenticated requests
3. **Per IP** — anonymous requests
4. **Per Endpoint** — different limits (login: 5/min, search: 100/min)
5. **Global** — protect backend

---

## 9.3 News Feed (Twitter/Instagram) 📰

**Problem:** User ko follow kiye gaye logo ki posts dikhana, latest first.

### Requirements:
- **Functional:** post creation, feed generation, ranking
- **Non-functional:** low latency feed load (<200ms), high availability

### Two Approaches:

### 1. Pull Model (Fan-out on Read) 📥
**Hinglish:** Jab user feed open kare, tab follow kiye logo ke posts fetch karo.

```javascript
async function getFeed(userId) {
  const following = await db.followers.find({ followerId: userId });
  const followingIds = following.map(f => f.userId);
  
  // Get posts from all followed users
  const posts = await db.posts
    .find({ userId: { $in: followingIds } })
    .sort({ createdAt: -1 })
    .limit(50);
  
  return posts;
}
```

**Pros:** Low storage, real-time  
**Cons:** Slow for users following many people, expensive at scale

### 2. Push Model (Fan-out on Write) 📤
**Hinglish:** Jab user post kare, sabhi followers ke feed me pre-compute karke daal do.

```javascript
async function createPost(userId, content) {
  const post = await db.posts.create({ userId, content });
  
  // Get all followers
  const followers = await db.followers.find({ userId });
  
  // Async fan-out to all followers' feeds
  for (const follower of followers) {
    await redis.lpush(`feed:${follower.followerId}`, post.id);
    await redis.ltrim(`feed:${follower.followerId}`, 0, 999); // Keep last 1000
  }
  
  return post;
}

async function getFeed(userId) {
  const postIds = await redis.lrange(`feed:${userId}`, 0, 49);
  const posts = await db.posts.find({ id: { $in: postIds } });
  return posts;
}
```

**Pros:** Fast feed reads  
**Cons:** Storage explosion, slow for celebrities (millions of followers)

### 3. Hybrid (Best of Both) 🎯
**Hinglish:** Normal users ke liye push, celebrities ke liye pull.

```javascript
async function createPost(userId, content) {
  const post = await db.posts.create({ userId, content });
  const user = await db.users.findById(userId);
  
  if (user.followerCount < 10000) {
    // Normal user — push to all
    fanOutToFollowers(post);
  }
  // else: Celebrity — followers will pull on feed read
  
  return post;
}

async function getFeed(userId) {
  // Get pre-computed feed
  const feed = await redis.lrange(`feed:${userId}`, 0, 49);
  
  // Get celebrities user follows
  const celebrities = await db.followers.find({ 
    followerId: userId, 
    isCelebrity: true 
  });
  
  // Fetch their recent posts
  const celebPosts = await db.posts
    .find({ userId: { $in: celebrities.map(c => c.userId) } })
    .sort({ createdAt: -1 })
    .limit(20);
  
  // Merge and sort
  return mergeAndSort(feed, celebPosts).slice(0, 50);
}
```

### Ranking (Beyond Chronological):
```javascript
function calculateScore(post, user) {
  const recency = 1 / (Date.now() - post.createdAt);
  const engagement = post.likes + post.comments * 2 + post.shares * 3;
  const affinity = getUserAffinity(user.id, post.userId); // ML model
  
  return recency * 0.3 + engagement * 0.4 + affinity * 0.3;
}
```

### Architecture:
```
[Client] → [API Gateway] → [Feed Service]
                              ↓
              [Cache Redis] ← [Posts DB] ← [Kafka] ← [Post Service]
                              ↓
                        [User Graph DB]
                              ↓
                        [ML Ranking Service]
```

---

## 9.4 Chat System (WhatsApp) 💬

**Problem:** Real-time messaging, 1-on-1 + groups, read receipts, online status.

### Requirements:
- **Functional:** send/receive messages, group chat, online status, read receipts, media
- **Non-functional:** low latency (<100ms), reliable delivery, end-to-end encryption

### Architecture:
```
[Client] ←→ [WebSocket Gateway] ←→ [Chat Service]
                                       ↓
                              [Message Queue (Kafka)]
                                       ↓
                              [DB (Cassandra)] [Cache (Redis)]
                                       ↓
                              [Notification Service] (offline users)
```

### Connection Management:
```javascript
// User connects via WebSocket
const userConnections = new Map(); // userId → WebSocket
const connectionToUser = new Map();

wss.on('connection', async (ws, req) => {
  const userId = await authenticate(req);
  
  userConnections.set(userId, ws);
  connectionToUser.set(ws, userId);
  
  // Update Redis: user online
  await redis.set(`online:${userId}`, serverInstanceId);
  await redis.publish('user.online', userId);
  
  ws.on('message', handleMessage);
  
  ws.on('close', async () => {
    userConnections.delete(userId);
    await redis.del(`online:${userId}`);
    await redis.publish('user.offline', userId);
  });
});
```

### Sending a Message:
```javascript
async function sendMessage(senderId, receiverId, content) {
  const message = {
    id: generateId(),
    senderId,
    receiverId,
    content,
    timestamp: Date.now(),
    status: 'sent'
  };
  
  // 1. Persist
  await db.messages.insert(message);
  
  // 2. Check if receiver online (could be on another server)
  const receiverServer = await redis.get(`online:${receiverId}`);
  
  if (receiverServer === serverInstanceId) {
    // Same server — direct deliver
    const ws = userConnections.get(receiverId);
    ws?.send(JSON.stringify(message));
    message.status = 'delivered';
    await db.messages.update(message.id, { status: 'delivered' });
  } else if (receiverServer) {
    // Different server — pub/sub
    await redis.publish(`server:${receiverServer}`, JSON.stringify({
      type: 'message',
      data: message
    }));
  } else {
    // Offline — push notification
    await pushNotificationQueue.add({ userId: receiverId, message });
  }
  
  return message;
}
```

### Database Schema (Cassandra — for write-heavy):
```sql
-- Optimized for: get messages between two users
CREATE TABLE messages (
  conversation_id text,
  message_id timeuuid,
  sender_id bigint,
  content text,
  status text,
  PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- conversation_id = sorted_userId1_userId2 (for 1-on-1)
-- conversation_id = group_id (for groups)
```

### Read Receipts:
```javascript
async function markAsRead(userId, messageId) {
  await db.messages.update(messageId, { 
    readBy: { $push: { userId, timestamp: Date.now() } }
  });
  
  // Notify sender
  const message = await db.messages.findById(messageId);
  const senderWs = userConnections.get(message.senderId);
  senderWs?.send(JSON.stringify({
    type: 'read_receipt',
    messageId,
    readBy: userId
  }));
}
```

### Group Chat:
```javascript
async function sendGroupMessage(senderId, groupId, content) {
  const group = await db.groups.findById(groupId);
  const message = await db.messages.insert({ groupId, senderId, content });
  
  // Fan-out to all members
  const promises = group.members
    .filter(m => m !== senderId)
    .map(memberId => deliverMessage(memberId, message));
  
  await Promise.all(promises);
}
```

### End-to-End Encryption:
- Signal Protocol (used by WhatsApp)
- Each user has key pair
- Server only sees encrypted blobs
- Server cannot read messages

### Scale Numbers (WhatsApp):
- 2B+ users
- 100B+ messages/day
- ~1M messages/sec peak

---

## 9.5 Notification System 🔔

**Problem:** Email, SMS, push notifications crores of users ko bhejna.

### Architecture:
```
[App] → [Notification API] → [Kafka] → [Templating Service]
                                          ↓
                            [Email Service]   [SMS Service]   [Push Service]
                            ↓                  ↓                ↓
                            [SendGrid]        [Twilio]        [FCM/APNs]
```

### Components:

### 1. Template Service:
```javascript
const templates = {
  'welcome.email': {
    subject: 'Welcome {{name}}!',
    body: 'Hi {{name}}, thanks for joining {{appName}}.'
  }
};

function render(templateId, data) {
  const template = templates[templateId];
  return {
    subject: template.subject.replace(/{{(\w+)}}/g, (_, k) => data[k]),
    body: template.body.replace(/{{(\w+)}}/g, (_, k) => data[k])
  };
}
```

### 2. User Preferences:
```javascript
const userPrefs = {
  email: { marketing: false, transactional: true },
  sms: { transactional: true },
  push: { all: true, quietHours: { start: 22, end: 7 } }
};

function shouldSend(notification, prefs) {
  if (notification.priority === 'critical') return true; // Always send
  
  const channelPref = prefs[notification.channel];
  if (!channelPref?.[notification.category]) return false;
  
  // Check quiet hours
  const hour = new Date().getHours();
  if (prefs.push.quietHours && (hour >= prefs.push.quietHours.start || hour < prefs.push.quietHours.end)) {
    return false;
  }
  
  return true;
}
```

### 3. Deduplication:
```javascript
// Prevent same notification multiple times
async function sendOnce(notification) {
  const key = `notif:${notification.userId}:${notification.eventId}`;
  const exists = await redis.set(key, '1', 'NX', 'EX', 3600);
  if (!exists) return; // Already sent
  
  await send(notification);
}
```

### 4. Priority Queues:
```javascript
// Different queues for priorities
const queues = {
  critical: new Queue('notif-critical'), // Login OTP — instant
  transactional: new Queue('notif-trans'), // Order confirmation
  marketing: new Queue('notif-marketing') // Newsletter
};

// Critical processed first
queues.critical.process(10, async (job) => { /* ... */ }); // 10 concurrency
queues.transactional.process(50, async (job) => { /* ... */ });
queues.marketing.process(100, async (job) => { /* ... */ });
```

### 5. Retry & DLQ:
```javascript
queue.add('notif', data, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnFail: false // Keep for DLQ inspection
});
```

### Push Notifications:
```javascript
// FCM (Android, iOS)
const admin = require('firebase-admin');

await admin.messaging().send({
  token: userDeviceToken,
  notification: {
    title: 'New message',
    body: 'You have a new message from John'
  },
  data: { conversationId: '123' }, // Custom data
  apns: { payload: { aps: { sound: 'default' } } },
  android: { priority: 'high' }
});
```

### Scale Considerations:
- **1M users × 5 notifs/day = 5M notifs/day**
- Email: ~$0.0001 each via SendGrid = $500/day
- SMS: ~$0.005 each via Twilio = $25K/day (use sparingly!)
- Push: nearly free (FCM)

---

## 9.6 Ride-Sharing (Uber/Ola) 🚗

**Problem:** Riders match with nearby drivers, real-time tracking, surge pricing.

### Requirements:
- **Functional:** request ride, find nearby drivers, ETA, real-time tracking, payment
- **Non-functional:** very low latency (<1s for matching), high availability

### Architecture:
```
[Rider App] ↔ [Gateway] ↔ [Trip Service]
                              ↓
                         [Matching Service]
                              ↓
                         [Geo Service] ← drivers' location updates
                              ↓
                         [Driver App]
                         
[Pricing Service] ← [Trip Service] → [Payment Service]
```

### Geospatial Indexing:

### 1. Geohash 🗺️
**Hinglish:** Earth ko grid me baato, har grid ka unique short code.
- "tdr1y" = small area in Mumbai
- Nearby points have similar prefixes

```javascript
const ngeohash = require('ngeohash');

const hash = ngeohash.encode(19.0760, 72.8777, 7); // Mumbai, precision 7
// "te7ub3y"

// Find neighbors
const neighbors = ngeohash.neighbors(hash);
```

### 2. Quadtree
- Recursive 4-way partitioning
- Each node has 4 children
- Good for non-uniform density

### 3. R-Tree
- Bounding rectangles
- Used in PostGIS

### Driver Location Updates:
```javascript
// Driver app sends location every 4 seconds
async function updateDriverLocation(driverId, lat, lng) {
  const geohash = encodeGeohash(lat, lng, 7);
  
  // Redis Geo
  await redis.geoadd('drivers', lng, lat, driverId);
  
  // Or by region (for sharding)
  await redis.zadd(`drivers:${geohash}`, Date.now(), driverId);
  await redis.hset(`driver:${driverId}`, 'lat', lat, 'lng', lng);
}
```

### Find Nearby Drivers:
```javascript
async function findDrivers(riderLat, riderLng, radiusKm = 5) {
  // Redis Geo
  const drivers = await redis.georadius(
    'drivers', 
    riderLng, riderLat, 
    radiusKm, 'km', 
    'WITHCOORD', 'WITHDIST',
    'COUNT', 20,
    'ASC'
  );
  
  // Filter only available drivers
  const available = await Promise.all(
    drivers.map(async ([id, dist, [lng, lat]]) => {
      const status = await redis.hget(`driver:${id}`, 'status');
      return status === 'available' ? { id, dist, lat, lng } : null;
    })
  );
  
  return available.filter(Boolean);
}
```

### Matching Algorithm:
```javascript
async function matchRide(riderId, pickupLat, pickupLng) {
  let radius = 1; // km
  let driver = null;
  
  while (!driver && radius <= 10) {
    const candidates = await findDrivers(pickupLat, pickupLng, radius);
    
    for (const candidate of candidates) {
      // Try to lock this driver
      const locked = await redis.set(
        `lock:driver:${candidate.id}`, 
        riderId, 
        'NX', 'EX', 30
      );
      
      if (locked) {
        // Send request to driver
        const accepted = await requestDriverAcceptance(candidate.id, riderId);
        if (accepted) {
          driver = candidate;
          break;
        }
        await redis.del(`lock:driver:${candidate.id}`);
      }
    }
    
    radius *= 2; // Expand search
  }
  
  return driver;
}
```

### Surge Pricing:
```javascript
async function getSurgeMultiplier(geohash) {
  const demand = await redis.scard(`requests:${geohash}`);
  const supply = await redis.zcard(`drivers:${geohash}`);
  
  if (supply === 0) return 3.0; // Max surge
  
  const ratio = demand / supply;
  if (ratio > 2) return 2.5;
  if (ratio > 1.5) return 2.0;
  if (ratio > 1) return 1.5;
  return 1.0;
}
```

### Real-time Tracking:
```javascript
// WebSocket connection between driver and rider
driverWs.on('location', async ({ lat, lng }) => {
  const trip = await getCurrentTrip(driverId);
  if (trip) {
    // Forward to rider
    const riderWs = riderConnections.get(trip.riderId);
    riderWs?.send(JSON.stringify({ type: 'driver_location', lat, lng }));
    
    // Calculate ETA
    const eta = await calculateETA(lat, lng, trip.destination);
    riderWs?.send(JSON.stringify({ type: 'eta', eta }));
  }
});
```

### Sharding by Geography:
- Region-based sharding
- Mumbai requests → Mumbai servers
- Reduces latency, isolates failures

---

# 10. RELIABILITY & RESILIENCE

## 10.1 Failover & High Availability 🛡️

**Hinglish:** Primary server mar gaya — kya holega? Backup turant takeover karle, user ko pata bhi nahi chale. Yahi failover hai.

**English Definition:**
> Failover is the automatic switching to a redundant or standby system upon failure of the primary system, ensuring service continuity.

### Patterns:

### 1. Active-Passive (Hot Standby)
```
[Active] ←→ [Passive (Standby)]
   ↑                ↑
 traffic        no traffic, ready to take over
```
- Passive server idle but ready
- Failover detects primary down → switches
- Simpler, but resources wasted

### 2. Active-Active
```
[Active 1] ←→ [Active 2]
   ↑              ↑
 traffic        traffic
```
- Both serve traffic
- Load balancer distributes
- Better utilization

### 3. N+1 Redundancy
- N servers + 1 spare
- Cost-effective for many servers

### Failover Detection:
```javascript
class HealthMonitor {
  async checkServer(server) {
    try {
      const res = await fetch(`http://${server}/health`, { 
        timeout: 5000 
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  
  async monitor(servers) {
    setInterval(async () => {
      for (const server of servers) {
        const healthy = await this.checkServer(server);
        if (!healthy) {
          server.failures++;
          if (server.failures >= 3) {
            await this.failover(server);
          }
        } else {
          server.failures = 0;
        }
      }
    }, 5000);
  }
  
  async failover(failedServer) {
    // 1. Remove from load balancer
    await loadBalancer.remove(failedServer);
    
    // 2. Promote standby
    await standbyServer.promote();
    
    // 3. Redirect traffic
    await loadBalancer.add(standbyServer);
    
    // 4. Alert ops team
    await alertOnCall('Failover triggered: ' + failedServer.id);
  }
}
```

### Database Failover:
```javascript
// PostgreSQL with automatic failover
const Pool = require('pg-pool');

const primary = new Pool({ host: 'db-primary.com' });
const replica = new Pool({ host: 'db-replica.com' });

async function executeWithFailover(query) {
  try {
    return await primary.query(query);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Primary down, failing over to replica');
      // Promote replica to primary externally
      return await replica.query(query);
    }
    throw err;
  }
}
```

### Multi-Region:
```
[Region: India]    [Region: US]
   ↓ DNS routing ↓
[Closest user-region pair]

If India down → Route 53 → US region
```

### Best Practices:
1. **Automate failover** — manual is too slow
2. **Test regularly** — chaos engineering
3. **Avoid split-brain** — use quorum (Raft, Paxos)
4. **Data consistency** — sync vs async replication trade-off
5. **Monitor everything** — false positives are bad

---

## 10.2 Back Pressure 🚧

**Hinglish:** Producer 1000/sec bhej raha hai, consumer sirf 100/sec process kar sakta hai. Kya holega? Memory full, system crash. Back pressure bolta hai "ruk producer, dheere bhej!"

**English Definition:**
> Back pressure is a technique where a system signals upstream to slow down when downstream cannot keep up, preventing resource exhaustion.

### Without Back Pressure:
```
Producer (1000/sec) → Buffer (overflows!) → Consumer (100/sec)
                          ↓
                     OutOfMemoryError 💥
```

### With Back Pressure:
```
Producer ← (slow down!) ← Consumer (overwhelmed)
   ↓
 throttles down to 100/sec
```

### Strategies:

### 1. Buffer with Bounded Size
```javascript
const queue = [];
const MAX_BUFFER = 1000;

async function produce(item) {
  if (queue.length >= MAX_BUFFER) {
    throw new Error('Queue full'); // Reject
    // Or: await waitForSpace();
  }
  queue.push(item);
}
```

### 2. Drop / Throttle
```javascript
let lastSent = 0;
const RATE_LIMIT = 100; // per second

function throttle(item) {
  const now = Date.now();
  const delay = 1000 / RATE_LIMIT;
  
  if (now - lastSent < delay) {
    // Drop or wait
    return false;
  }
  
  lastSent = now;
  return process(item);
}
```

### 3. Reactive Streams (Node.js Streams)
```javascript
const { Readable, Writable } = require('stream');

const slowConsumer = new Writable({
  highWaterMark: 100, // Buffer size
  write(chunk, encoding, callback) {
    setTimeout(() => {
      console.log('Processed:', chunk.toString());
      callback();
    }, 100); // Slow processing
  }
});

const fastProducer = new Readable({
  highWaterMark: 100,
  read() {
    // Stream automatically respects back pressure
    this.push(`Item ${Date.now()}`);
  }
});

fastProducer.pipe(slowConsumer); // Back pressure handled automatically
```

### 4. Reactive Programming (RxJS)
```javascript
const { interval } = require('rxjs');
const { throttleTime, bufferTime, mergeMap } = require('rxjs/operators');

interval(10) // Emits every 10ms
  .pipe(
    bufferTime(1000), // Batch every 1 second
    mergeMap(batch => processSlow(batch)) // Process in chunks
  )
  .subscribe();
```

### Real World Examples:

**Kafka:**
- Consumer pull-based (consumer controls rate)
- Producer can block on full partitions

**TCP:**
- Window-based flow control
- Receiver advertises window size

**Node.js Streams:**
- `pipe()` automatically handles back pressure

---

## 10.3 Idempotency 🔄

**Hinglish:** Same request 5 baar bheji to ek hi baar effect hona chahiye. Payment 2 baar nahi hona! Yahi idempotency hai.

**English Definition:**
> An idempotent operation produces the same result regardless of how many times it's executed, given the same input.

### Why Important?
- Network failures cause retries
- Browser back button
- Mobile network drops
- Without idempotency → double charges, duplicate orders

### Idempotent vs Not:

| Operation | Idempotent? |
|-----------|-------------|
| GET /users/123 | ✅ Yes |
| DELETE /users/123 | ✅ Yes |
| PUT /users/123 (full update) | ✅ Yes |
| POST /users (create) | ❌ No (creates duplicate) |
| `x = x + 1` | ❌ No |
| `x = 5` | ✅ Yes |

### Making POST Idempotent:

### 1. Idempotency Key:
```javascript
app.post('/api/charge', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header required' });
  }
  
  // Check if already processed
  const existing = await redis.get(`idempotency:${idempotencyKey}`);
  if (existing) {
    return res.json(JSON.parse(existing)); // Return cached response
  }
  
  // Acquire lock
  const lock = await redis.set(
    `lock:${idempotencyKey}`, '1', 'NX', 'EX', 30
  );
  if (!lock) {
    return res.status(409).json({ error: 'Request in progress' });
  }
  
  try {
    // Process payment
    const result = await chargePayment(req.body);
    
    // Cache response (24 hours)
    await redis.setex(
      `idempotency:${idempotencyKey}`, 
      86400, 
      JSON.stringify(result)
    );
    
    res.json(result);
  } finally {
    await redis.del(`lock:${idempotencyKey}`);
  }
});

// Client side
fetch('/api/charge', {
  method: 'POST',
  headers: { 'Idempotency-Key': uuidv4() },
  body: JSON.stringify({ amount: 100 })
});
```

### 2. Database Unique Constraint:
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  idempotency_key VARCHAR(255) UNIQUE,
  amount DECIMAL,
  status VARCHAR(50)
);
```

```javascript
async function createPayment(idempotencyKey, amount) {
  try {
    return await db.payments.insert({
      id: uuidv4(),
      idempotencyKey,
      amount,
      status: 'pending'
    });
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return await db.payments.findOne({ idempotencyKey });
    }
    throw err;
  }
}
```

### 3. Conditional Updates:
```sql
-- Only update if status is still 'pending'
UPDATE orders 
SET status = 'paid', paid_at = NOW()
WHERE id = $1 AND status = 'pending';
```

### Stripe-style Idempotency:
- 24 hour idempotency window
- Same key + same params → cached response
- Different params + same key → error

### Best Practices:
1. **Use UUIDs** as idempotency keys (client generated)
2. **Cache for sufficient duration** (Stripe: 24 hours)
3. **Return same response** for retries
4. **Handle in-flight requests** (locks)
5. **Clean up old keys** (TTL or scheduled cleanup)

---

# 11. SECURITY & AUTH

## 11.1 Authentication — JWT, OAuth, SSO 🔐

**Hinglish:** User kaun hai (Authentication) aur kya kar sakta hai (Authorization). Modern apps me JWT, OAuth, SSO common hain.

### Session vs Token:

### Session-based (Traditional):
```
1. Login → Server creates session, stores in DB/Redis
2. Server sends sessionId in cookie
3. Every request includes cookie
4. Server checks sessionId in DB
```

```javascript
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  const sessionId = uuidv4();
  await redis.setex(`session:${sessionId}`, 3600, user.id);
  res.cookie('sessionId', sessionId, { httpOnly: true, secure: true });
  res.json({ success: true });
});

app.get('/profile', async (req, res) => {
  const userId = await redis.get(`session:${req.cookies.sessionId}`);
  if (!userId) return res.status(401).send('Unauthorized');
  const user = await db.users.findById(userId);
  res.json(user);
});
```

**Pros:** Easy to revoke, server controls  
**Cons:** Stateful (DB hit per request)

### JWT (JSON Web Token):

**Hinglish:** JWT khud me sab info hold karta hai — server ko DB hit nahi karna padta. Stateless authentication!

```
header.payload.signature

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Structure:**
```json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload (claims)
{ 
  "userId": "123",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}

// Signature
HMACSHA256(base64(header) + "." + base64(payload), secret)
```

**JavaScript Example:**
```javascript
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

// Generate
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    SECRET,
    { expiresIn: '7d' }
  );
  
  // Store refresh token (revocable)
  await db.refreshTokens.insert({ token: refreshToken, userId: user.id });
  
  res.json({ accessToken, refreshToken });
});

// Verify (middleware)
function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Refresh
app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  // Check if revoked
  const stored = await db.refreshTokens.findOne({ token: refreshToken });
  if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });
  
  try {
    const payload = jwt.verify(refreshToken, SECRET);
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ error: 'Expired refresh token' });
  }
});
```

**JWT Pros:**
- Stateless (no DB hit)
- Cross-domain
- Self-contained (info in token)

**JWT Cons:**
- Cannot revoke easily (until expiry)
- Larger than session ID
- Don't store sensitive data (just base64)

**Best Practices:**
- Short access token (15 min)
- Long refresh token (7-30 days)
- Use HTTPS only
- HttpOnly cookies (mobile use header)
- Rotate refresh tokens

### OAuth 2.0:
**Hinglish:** "Login with Google" — Google verify karta hai, tu Google ke certificate par bharosa karta hai.

**Flow (Authorization Code):**
```
1. User clicks "Login with Google"
2. Redirect to Google → User logs in
3. Google redirects back with code
4. Backend exchanges code for access token
5. Backend uses token to get user info
6. Backend creates session/JWT
```

```javascript
// 1. Redirect to Google
app.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/oauth/authorize?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent('http://localhost/callback')}&` +
    `response_type=code&` +
    `scope=email profile`;
  res.redirect(url);
});

// 2. Callback
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  // Exchange code for token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://localhost/callback',
      grant_type: 'authorization_code'
    })
  });
  const { access_token } = await tokenRes.json();
  
  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const googleUser = await userRes.json();
  
  // Create user in our DB if not exists
  let user = await db.users.findOne({ email: googleUser.email });
  if (!user) {
    user = await db.users.create({ email: googleUser.email, name: googleUser.name });
  }
  
  // Issue our JWT
  const jwt = generateJWT(user);
  res.json({ token: jwt });
});
```

### SSO (Single Sign-On):
**Hinglish:** Ek baar login karo, saare apps me access mil jaye. Office me Google account se Gmail, Drive, Calendar — sab login.

**Protocols:**
- **SAML** — XML-based (enterprise)
- **OAuth 2.0 + OIDC** — modern, JSON-based
- **OpenID Connect (OIDC)** — built on OAuth, adds identity layer

---

## 11.2 Security at Scale 🛡️

**Hinglish:** App scale pe hai to attackers bhi serious hote hain. DDoS, SQL injection, XSS — sabse defense zaruri.

### OWASP Top 10:
1. **Injection** (SQL, NoSQL, Command)
2. **Broken Authentication**
3. **Sensitive Data Exposure**
4. **XML External Entities (XXE)**
5. **Broken Access Control**
6. **Security Misconfiguration**
7. **Cross-Site Scripting (XSS)**
8. **Insecure Deserialization**
9. **Components with Known Vulnerabilities**
10. **Insufficient Logging & Monitoring**

### Common Attacks & Defense:

### 1. SQL Injection
```javascript
// VULNERABLE
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
// User input: ' OR '1'='1 → Returns all users!

// SAFE — parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
db.query(query, [req.body.email]);

// ORM (auto-safe)
db.users.findOne({ where: { email: req.body.email } });
```

### 2. XSS (Cross-Site Scripting)
```javascript
// VULNERABLE
res.send(`<h1>Hello, ${req.body.name}</h1>`);
// Input: <script>alert('hacked')</script>

// SAFE — escape HTML
const escapeHtml = (s) => s.replace(/[&<>"']/g, c => 
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

res.send(`<h1>Hello, ${escapeHtml(req.body.name)}</h1>`);

// React auto-escapes
<h1>Hello, {name}</h1> // Safe

// Set CSP header
res.set('Content-Security-Policy', "default-src 'self'");
```

### 3. CSRF (Cross-Site Request Forgery)
```javascript
// Malicious site auto-submits form to your site using user's cookies
// Defense: CSRF tokens

const csrf = require('csurf');
app.use(csrf({ cookie: true }));

app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

// Or use SameSite cookies
app.use(session({ 
  cookie: { sameSite: 'strict' } 
}));
```

### 4. DDoS (Distributed Denial of Service)
**Defense Layers:**
- **CDN** (Cloudflare, AWS Shield) — absorbs attack
- **Rate limiting** — per IP, per user
- **WAF** (Web Application Firewall) — block bad patterns
- **Auto-scaling** — handle legitimate spikes

### 5. Password Storage
```javascript
const bcrypt = require('bcrypt');

// HASH (not encrypt!)
const hashed = await bcrypt.hash(password, 12); // 12 = rounds
await db.users.insert({ email, password: hashed });

// VERIFY
const user = await db.users.findOne({ email });
const valid = await bcrypt.compare(password, user.password);
```

### 6. HTTPS Everywhere
```javascript
// Force HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// HSTS
res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
```

### Encryption:
- **At rest:** AES-256 (S3, EBS, RDS)
- **In transit:** TLS 1.3
- **End-to-end:** Signal protocol (apps know data only)

### Secrets Management:
```javascript
// BAD — in code
const API_KEY = "sk_live_abc123";

// GOOD — environment variables
const API_KEY = process.env.STRIPE_KEY;

// BETTER — secrets manager
const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');
const secret = await secretsManager.getSecretValue({ SecretId: 'stripe-key' });
```

### Security Headers:
```javascript
const helmet = require('helmet');
app.use(helmet()); // Sets multiple security headers

// Or manually
res.set({
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
});
```

---

# 12. INFRASTRUCTURE & OBSERVABILITY

## 12.1 Docker & Kubernetes 🐳

**Hinglish:** Docker = app ko container me pack karo, kahin bhi run karo. Kubernetes = sai containers ko orchestrate karo, manage karo, scale karo.

### Docker:
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build
docker build -t my-app .

# Run
docker run -p 3000:3000 my-app

# docker-compose.yml — multi-container
version: '3'
services:
  app:
    build: .
    ports: ['3000:3000']
    depends_on: [db, redis]
  db:
    image: postgres:15
    environment: { POSTGRES_PASSWORD: secret }
  redis:
    image: redis:7
```

### Why Docker?
- **Consistency** — "works on my machine" solved
- **Isolation** — apps don't conflict
- **Portability** — run anywhere
- **Fast deployment** — image pulls quickly

### Kubernetes (K8s):

**Core Concepts:**
1. **Pod** — smallest unit, 1+ containers
2. **Deployment** — manages pods, scaling
3. **Service** — stable endpoint for pods
4. **Ingress** — external HTTP routing
5. **ConfigMap/Secret** — config management
6. **Volume** — persistent storage
7. **Namespace** — logical separation

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:v1.2
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host

---
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

```bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl scale deployment my-app --replicas=5
kubectl rollout restart deployment my-app
```

### Auto-scaling:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Service Mesh (Istio):
- Sidecar proxy with each pod
- Traffic management, security, observability
- Without code changes

---

## 12.2 Monitoring & Observability 📊

**Hinglish:** Production me bug aaya, kaise pata chalega? Logs, metrics, traces — yahi 3 pillars hain observability ke. Bina monitoring ke andhere me teer chala rahe ho!

### Three Pillars:

### 1. Logs 📝
- **Use:** Detailed events, debugging
- **Tools:** ELK (Elasticsearch + Logstash + Kibana), Datadog, Splunk

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
    new winston.transports.Console()
  ]
});

// Structured logging
logger.info('User logged in', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: Date.now()
});

logger.error('Payment failed', {
  userId,
  amount,
  error: err.message,
  stack: err.stack
});
```

### 2. Metrics 📈
- **Use:** Aggregated numbers over time, dashboards, alerts
- **Tools:** Prometheus + Grafana, Datadog, New Relic

```javascript
const promClient = require('prom-client');

// Counter — only increases
const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Histogram — distribution
const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in ms',
  labelNames: ['method', 'route'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000]
});

// Gauge — can go up/down
const activeConnections = new promClient.Gauge({
  name: 'websocket_active_connections',
  help: 'Active WebSocket connections'
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestCounter.labels(req.method, req.route?.path, res.statusCode).inc();
    requestDuration.labels(req.method, req.route?.path).observe(duration);
  });
  next();
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.send(promClient.register.metrics());
});
```

**The Four Golden Signals (Google SRE):**
1. **Latency** — request duration
2. **Traffic** — requests/sec
3. **Errors** — error rate
4. **Saturation** — resource usage

### 3. Traces 🔗
- **Use:** Track request across microservices
- **Tools:** Jaeger, Zipkin, Datadog APM

```javascript
const opentelemetry = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');

const provider = new NodeTracerProvider();
provider.register();
const tracer = opentelemetry.trace.getTracer('my-service');

app.get('/order/:id', async (req, res) => {
  const span = tracer.startSpan('GET /order/:id');
  
  try {
    span.setAttribute('order.id', req.params.id);
    
    // Child span
    const dbSpan = tracer.startSpan('db.query', { parent: span });
    const order = await db.orders.findById(req.params.id);
    dbSpan.end();
    
    // Cross-service call (trace propagated)
    const userSpan = tracer.startSpan('http.user-service', { parent: span });
    const user = await fetch(`http://user-service/users/${order.userId}`, {
      headers: opentelemetry.propagation.inject({}) // Pass trace context
    });
    userSpan.end();
    
    res.json({ order, user });
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
    throw err;
  } finally {
    span.end();
  }
});
```

### Alerts:
```yaml
# Prometheus AlertManager
groups:
- name: app-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "Error rate >5%"
  
  - alert: HighLatency
    expr: histogram_quantile(0.99, http_request_duration_ms) > 1000
    for: 5m
    annotations:
      summary: "P99 latency >1s"
```

### SLI, SLO, SLA:
- **SLI (Service Level Indicator)** — measured metric (e.g., request success rate)
- **SLO (Service Level Objective)** — target (e.g., 99.9% success)
- **SLA (Service Level Agreement)** — contract (e.g., 99.5% uptime or refund)

---

## 12.3 CI/CD & Deployments 🚀

**Hinglish:** Code push kiya → automatically test, build, deploy ho jaye. Manual deployment ka zamana gaya. Zero downtime deployments chahiye.

### CI/CD Pipeline:
```
Code Push → Build → Test → Security Scan → Deploy to Staging → 
Integration Tests → Approval → Deploy to Production
```

### Tools:
- **GitHub Actions, GitLab CI, Jenkins, CircleCI**
- **ArgoCD, Flux** (GitOps)
- **Spinnaker** (multi-cloud deployment)

### GitHub Actions Example:
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with: { node-version: 18 }
    - run: npm ci
    - run: npm test
    - run: npm run lint
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - run: docker build -t my-app:${{ github.sha }} .
    - run: docker push my-app:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - run: kubectl set image deployment/my-app my-app=my-app:${{ github.sha }}
    - run: kubectl rollout status deployment/my-app
```

### Deployment Strategies:

### 1. Rolling Update (Default in K8s)
- Replace pods one by one
- No downtime, but mixed versions during deployment

### 2. Blue-Green Deployment
```
[Blue: v1] (active, 100% traffic)
[Green: v2] (new, 0% traffic)

→ Switch traffic to Green
→ Blue becomes standby (instant rollback)
```

```yaml
# K8s with two services
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector:
    version: blue # Change to green for switch
```

### 3. Canary Deployment
```
v1: 95% traffic
v2: 5% traffic (canary)

Monitor → all good? → 25%, 50%, 100%
                    → bad? → rollback
```

```yaml
# Istio canary
apiVersion: networking.istio.io/v1
kind: VirtualService
spec:
  http:
  - route:
    - destination: { host: my-app, subset: v1 }
      weight: 95
    - destination: { host: my-app, subset: v2 }
      weight: 5
```

### 4. Feature Flags
```javascript
const launchDarkly = require('launchdarkly-node-server-sdk');
const client = launchDarkly.init('SDK_KEY');

app.get('/feature', async (req, res) => {
  const showNewUI = await client.variation('new-ui', { key: req.user.id }, false);
  
  if (showNewUI) {
    res.render('new-ui');
  } else {
    res.render('old-ui');
  }
});
```

### Database Migrations:
```javascript
// Backwards-compatible migrations
// Step 1: Add new column (deploy)
ALTER TABLE users ADD COLUMN new_email VARCHAR(255);

// Step 2: Dual-write code (deploy)
async function updateEmail(userId, email) {
  await db.users.update(userId, { email, new_email: email });
}

// Step 3: Backfill old data (run script)
UPDATE users SET new_email = email WHERE new_email IS NULL;

// Step 4: Switch reads to new column (deploy)
// Step 5: Remove old column (deploy)
```

### Rollback Strategy:
- **Automated:** if error rate spikes, rollback automatic
- **One-click rollback** in CI/CD tool
- **Database migrations** — always backward compatible

---

# 13. ESTIMATION & NUMBERS TO KNOW

## 13.1 Back-of-Envelope Estimation 📐

**Hinglish:** Interviewer puchhega "1 crore users ke liye storage kitna chahiye?" Quick math karna aata hona chahiye. Calculator nahi, bas estimate.

### Powers of Ten:
```
1 KB = 10³ bytes (1,000)
1 MB = 10⁶ bytes (1,000,000)
1 GB = 10⁹ bytes (1 billion)
1 TB = 10¹² bytes (1 trillion)
1 PB = 10¹⁵ bytes
```

### Time:
```
1 day = 86,400 seconds (~10⁵)
1 month = ~2.6 million seconds
1 year = ~31 million seconds (~3 × 10⁷)
```

### Common Estimations:

### QPS (Queries Per Second):
```
Daily Active Users: 100M
Avg requests per user per day: 10
Total: 1B requests/day
QPS = 1B / 86400 ≈ 11,500 QPS
Peak QPS = 2-3x avg ≈ 30,000 QPS
```

### Storage:
```
Tweet:
- Text: 280 chars × 2 bytes = 560 bytes
- Metadata: ~440 bytes
- Total: ~1 KB per tweet

500M tweets/day × 1 KB = 500 GB/day
500 GB × 365 × 5 years = 912 TB ≈ 1 PB

With replication (3x): ~3 PB
```

### Bandwidth:
```
Video streaming:
- 1080p: ~5 Mbps
- 1M concurrent viewers
- Bandwidth: 5 Tbps
```

### Memory (Cache):
```
Cache hit ratio target: 80%
Active users: 10M
Each user data: 1 KB
Total cache: 10M × 1 KB = 10 GB
With overhead: ~15 GB
```

### Example Problem: Twitter

```
Users: 300M, DAU: 150M
Avg tweets per user per day: 2
Avg follows per user: 200

Tweet QPS:
150M × 2 / 86400 ≈ 3,500 tweets/sec

Read QPS (timeline reads):
150M × 50 reads/day / 86400 ≈ 87,000 reads/sec
Read:Write = 25:1

Storage (5 years):
3,500 tweets/sec × 86400 × 365 × 5 × 1 KB
= 552 TB ≈ 600 TB
With replication: ~2 PB

Fan-out (push model):
3,500 tweets/sec × 200 followers
= 700,000 writes/sec to feeds!
```

---

## 13.2 Latency Numbers Everyone Should Know ⏱️

**Hinglish:** Yeh numbers yaad rakh, har system design interview me kaam aayenge. Speed comparison ke liye.

### Latency Numbers (Approximate):

```
L1 cache reference                           0.5 ns
Branch mispredict                            5 ns
L2 cache reference                           7 ns
Mutex lock/unlock                            25 ns
Main memory reference                        100 ns

Compress 1 KB with Snappy                    3,000 ns = 3 μs
Send 1 KB over 1 Gbps network                10,000 ns = 10 μs

Read 4 KB from SSD                           150,000 ns = 150 μs
Read 1 MB sequentially from memory           250,000 ns = 250 μs
Round trip in same datacenter                500,000 ns = 500 μs

Read 1 MB sequentially from SSD              1,000,000 ns = 1 ms
Disk seek (HDD)                              10,000,000 ns = 10 ms
Read 1 MB sequentially from disk             20,000,000 ns = 20 ms
Send packet CA → Netherlands → CA            150,000,000 ns = 150 ms
```

### Rules of Thumb:
- **Memory:** ~100x faster than SSD
- **SSD:** ~100x faster than HDD
- **Same datacenter:** <1 ms
- **Cross-continent:** ~150 ms
- **Cache hit:** <1 ms
- **DB query (indexed):** ~1-10 ms
- **DB query (no index):** ~100 ms - seconds

### Common Operations:

| Operation | Time |
|-----------|------|
| Redis GET | <1 ms |
| PostgreSQL indexed query | 1-5 ms |
| HTTP request (same DC) | 1-10 ms |
| HTTP request (cross-region) | 50-200 ms |
| Mobile network round trip | 100-300 ms |
| DNS lookup | 10-100 ms |
| TLS handshake | 50-200 ms |

### Throughput Numbers:

| System | Throughput |
|--------|------------|
| Single Redis instance | ~100K ops/sec |
| PostgreSQL (single) | ~10K writes/sec, ~50K reads/sec |
| Kafka (per broker) | ~100K msgs/sec |
| Single Node.js server | ~10K req/sec (simple) |
| Nginx | ~50K+ req/sec |
| HTTP/2 | 2-3x faster than HTTP/1.1 |

### Bandwidth:

| Medium | Bandwidth |
|--------|-----------|
| Home WiFi | 50-500 Mbps |
| 4G LTE | 5-50 Mbps |
| 5G | 100 Mbps - 1 Gbps |
| Datacenter network | 10-100 Gbps |
| Cross-region (AWS) | 1-10 Gbps |

### Real World Latency Targets:

| Use Case | Target |
|----------|--------|
| API response | <200 ms |
| Page load | <2 sec |
| Video buffering | <2 sec |
| Search autocomplete | <100 ms |
| Online gaming | <50 ms |
| Database query | <10 ms |
| Cache hit | <1 ms |

---

# 🎯 INTERVIEW APPROACH (5+ YEARS)

## How to Answer System Design Questions:

### 1. Clarify Requirements (5 min)
- Functional requirements (what features?)
- Non-functional (scale, latency, availability)
- Constraints (budget, team size)

### 2. Estimation (5 min)
- Users, QPS, storage, bandwidth
- Helps choose right tech

### 3. High-Level Design (10 min)
- Boxes and arrows
- Major components
- Data flow

### 4. Deep Dive (15 min)
- Pick 1-2 key components
- Database schema
- API design
- Specific algorithms

### 5. Scale & Optimize (10 min)
- Bottlenecks identification
- Caching, sharding, replication
- Trade-offs

### 6. Wrap Up (5 min)
- Summarize
- Acknowledge limitations
- Future improvements

## Common Mistakes to Avoid:
- ❌ Jumping to solution without clarifying
- ❌ Not asking about scale upfront
- ❌ Designing for unrealistic scale (overengineering)
- ❌ Ignoring trade-offs
- ❌ Not thinking about failures
- ❌ Forgetting about monitoring/observability

## Key Phrases to Use:
- "Trade-off here is X vs Y..."
- "We can optimize for read or write but not both..."
- "Eventually consistent is acceptable for this use case..."
- "We can start simple and evolve as we scale..."
- "The bottleneck would be..."
- "For monitoring, we'd track..."

---

# 📚 RECOMMENDED RESOURCES

## Books:
- **Designing Data-Intensive Applications** — Martin Kleppmann (MUST read!)
- **System Design Interview Vol 1 & 2** — Alex Xu
- **Building Microservices** — Sam Newman

## YouTube Channels:
- Gaurav Sen
- ByteByteGo
- Tech Dummies
- Hussein Nasser
- System Design Fight Club

## Websites:
- High Scalability (highscalability.com)
- Engineering blogs: Netflix, Uber, Airbnb, Discord, Cloudflare
- system-design-primer (GitHub)

## Practice:
- Pramp, Interviewing.io — mock interviews
- LeetCode System Design problems
- Excalidraw — for diagrams

---

# 🏁 FINAL TIPS

1. **Practice drawing** — system design is visual
2. **Time yourself** — 45-60 min total
3. **Speak out loud** — interviewer wants to know your thought process
4. **Trade-offs always** — there's no "best" design
5. **Real-world examples** — "Netflix does X for similar problem"
6. **Don't memorize** — understand principles, apply
7. **Ask questions** — interviewer expects collaboration

---

> **Remember:** System design is about thinking, not memorizing. Every problem has multiple correct answers. Show your reasoning, acknowledge trade-offs, and you'll do great!

**All the best for your interviews! 🚀**

---

*Made with ❤️ for JavaScript Full Stack developers*

*Last Updated: 2026*
