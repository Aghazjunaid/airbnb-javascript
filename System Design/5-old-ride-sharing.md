# 🚖 Ride Sharing System Design (Uber / Ola Type)

# 1. Introduction

A Ride Sharing System allows users to:

* Request rides
* Match with nearby drivers
* Track rides in real time
* Make payments
* Calculate dynamic pricing (surge pricing)

This system must support:

* Real-time driver tracking
* Nearest driver matching
* High concurrency
* Scalable architecture
* Reliable trip lifecycle management

---

# 2. Core Concepts

## MOST IMPORTANT Concepts 🔥

* Nearest Driver Matching
* Real-Time Location Tracking
* Trip Lifecycle
* Surge Pricing
* Concurrency Handling

---

# 3. Core Entities

| Entity         | Purpose                   |
| -------------- | ------------------------- |
| User           | Customer requesting rides |
| Driver         | Driver accepting rides    |
| Vehicle        | Driver vehicle details    |
| DriverLocation | Real-time GPS tracking    |
| Ride           | Ride/trip information     |
| Payment        | Payment details           |
| PricingRule    | Fare calculation rules    |

---

# 4. Table Relationship Flow Diagram

```text
User
  |
  | 1:N
  ↓
Ride
  |
  | N:1
  ↓
Driver
  |
  | 1:1
  ↓
Vehicle


Driver
  |
  | 1:1
  ↓
DriverLocation


Ride
  |
  | 1:1
  ↓
Payment


PricingRule
   |
   ↓
 affects
   ↓
Ride Pricing
```

---

# 5. Database Schema Design

## users

```sql
users
-------------
id
name
phone
rating
```

---

## drivers

```sql
drivers
-------------
id
name
phone
status
rating
```

### Driver Status

* online
* offline
* busy

---

## vehicles

```sql
vehicles
-------------
id
driver_id
vehicle_number
vehicle_type
```

---

# 📍 MOST IMPORTANT TABLE

## driver_locations

Stores real-time GPS coordinates.

```sql
driver_locations
-------------
driver_id
latitude
longitude
updated_at
```

---

# 🔥 MOST IMPORTANT ENTITY

## rides

```sql
rides
-------------
id
user_id
driver_id
pickup_lat
pickup_long
drop_lat
drop_long
status
fare
requested_at
started_at
completed_at
```

---

## Ride Status Lifecycle

```text
requested
   ↓
driver_assigned
   ↓
driver_arriving
   ↓
ongoing
   ↓
completed
```

Cancelled flow:

```text
requested → cancelled
```

---

## payments

```sql
payments
-------------
id
ride_id
amount
status
payment_method
```

---

## pricing_rules

```sql
pricing_rules
-------------
id
city
base_fare
per_km_rate
surge_multiplier
```

---

# 6. Driver Matching Logic 🔥

# Goal

When a user requests a ride:

✅ Find nearest available driver

---

# Basic Matching Flow

```text
User requests ride
        ↓
Get pickup location
        ↓
Search nearby online drivers
        ↓
Sort by distance
        ↓
Choose nearest driver
        ↓
Lock driver atomically
        ↓
Create ride
        ↓
Notify driver
```

---

# Basic SQL Example

```sql
SELECT *
FROM driver_locations dl
JOIN drivers d
ON d.id = dl.driver_id
WHERE d.status = 'online'
ORDER BY distance ASC
LIMIT 1;
```

---

# Real-World Optimization

Production systems use:

* GeoHash
* QuadTree
* Redis GEO
* PostGIS

---

# Redis GEO Example

## Store Driver Locations

```bash
GEOADD drivers longitude latitude driver_id
```

## Find Nearby Drivers

```bash
GEORADIUS drivers longitude latitude 3 km
```

---

# 7. Concurrency Problem 🔥

# Problem

Suppose:

2 users request the same driver simultaneously.

Without protection:

❌ Same driver may get assigned twice.

---

# Solution → Atomic Update

```sql
UPDATE drivers
SET status='busy'
WHERE id=101
AND status='online';
```

---

# Important Check

If:

```text
rows affected = 1
```

Means:

✅ Driver assigned successfully

Else:

❌ Another request already assigned driver.

---

# 8. Trip Lifecycle 🔥

# Step 1: Ride Requested

User enters:

* Pickup location
* Destination

Ride row created:

```text
status = requested
```

---

# Step 2: Driver Assigned

Nearest driver matched.

```text
status = driver_assigned
```

---

# Step 3: Driver Arriving

Driver accepted ride.

```text
status = driver_arriving
```

---

# Step 4: Ride Started

OTP verified.

```text
status = ongoing
```

---

# Step 5: Ride Completed

Fare calculated.

```text
status = completed
```

---

# 9. Pricing Logic 💰

# Fare Formula

```text
fare = base_fare + (distance × per_km_rate)
```

---

# Example

```text
base_fare = 50
distance = 10 km
rate = 12/km

fare = 170
```

---

# 10. Surge Pricing 🔥

# Why Surge Happens

Demand high + Drivers low

Examples:

* Rain
* Festivals
* Peak hours
* Late night

---

# Surge Formula

```text
final_fare = normal_fare × surge_multiplier
```

---

# Example

```text
normal fare = 200
surge = 1.8x

final fare = 360
```

---

# Surge Calculation Logic

Possible formula:

```text
surge_multiplier =
active_requests / available_drivers
```

---

# 11. APIs 🌐

# 1. Request Ride

```http
POST /rides/request
```

## Flow

1. Find nearby drivers
2. Lock nearest driver
3. Create ride
4. Notify driver

---

# 2. Accept Ride

```http
POST /rides/:id/accept
```

---

# 3. Start Ride

```http
POST /rides/:id/start
```

---

# 4. Complete Ride

```http
POST /rides/:id/complete
```

## Flow

1. Calculate distance
2. Apply surge pricing
3. Calculate final fare
4. Complete payment
5. Update driver status

---

# 5. Update Driver Location 🔥

```http
POST /drivers/location
```

Used for:

* Real-time tracking
* ETA updates
* Nearest driver lookup

---

# 12. Ride Timeout Cron 🔥

# Problem

Suppose:

* No driver accepts ride
  OR
* No nearby driver available

Ride cannot remain forever in:

```text
status = requested
```

---

# Solution → Ride Timeout Cron

Cron runs every:

* 30 seconds
  OR
* 1 minute

---

# Cron Query

```sql
SELECT *
FROM rides
WHERE status='requested'
AND requested_at < NOW() - interval '2 mins';
```

Meaning:

* Ride requested more than 2 mins ago
* Still no driver assigned

---

# Auto Cancel Query

```sql
UPDATE rides
SET status='cancelled'
WHERE status='requested'
AND requested_at < NOW() - interval '2 mins';
```

---

# User Response

```text
"No drivers available nearby"
```

OR

```text
"Retry after some time"
```

---

# Real-World Matching Flow

Companies usually:

❌ Do NOT assign only one driver directly.

Instead:

```text
Find nearest drivers
        ↓
Send requests sequentially/parallel
        ↓
Wait few seconds
        ↓
Rejected? → Try next driver
        ↓
Nobody accepts within timeout
        ↓
Cancel ride
```

---

# Example

```text
Driver A → No response
Driver B → Rejected
Driver C → Timeout

→ Ride Cancelled
```

---

# Advanced Optimizations 🔥

## Retry Radius Expansion

Initially:

```text
Search within 2 km
```

Then:

```text
5 km
10 km
```

---

## Surge Increase

If drivers unavailable:

```text
Increase surge pricing
```

to attract drivers.

---

# Event-Driven Architecture

```text
Ride Requested
        ↓
Kafka Queue
        ↓
Matching Service
        ↓
Driver Notification
```

If no acceptance:

```text
Timeout Event Triggered
```

---

# Important Edge Case 🔥

Suppose:

Driver accepts exactly at timeout moment.

Need:

Atomic state transition.

---

# Safe Query

```sql
UPDATE rides
SET status='driver_assigned'
WHERE id=1
AND status='requested';
```

Only one valid state transition allowed.

---

# 13. Cron Jobs ⏰

## 1. Driver Cleanup Cron

Purpose:

Mark inactive drivers offline.

Example:

```text
last location update > 5 mins
→ mark offline
```

---

## 2. Surge Calculation Cron

Runs every:

```text
2 mins
```

Purpose:

Recalculate city surge.

---

## 3. Ride Timeout Cron

Purpose:

Cancel old pending ride requests.

---

## 4. Analytics Cron

Generate:

* Daily revenue
* Peak hour reports
* Trip statistics

---

## 5. Payment Retry Cron

Retry failed payments.

---

# 14. Scaling Discussion ⚡

# Redis GEO

Used for:

* Driver location storage
* Fast nearest-driver lookup

---

# Kafka / Event Streaming

```text
Ride Events
     ↓
Kafka
     ↓
Analytics / Pricing / Notifications
```

---

# WebSockets

Used for:

* Real-time driver movement
* ETA updates
* Live trip tracking

---

# Read Replicas

Used for:

* Ride history
* Analytics
* Heavy read traffic

---

# 15. Important Edge Cases 🚨

## Driver Accepts But App Crashes

Need:

* Heartbeat mechanism
* Reassignment logic

---

## GPS Jitter

Need:

* Location smoothing
* Noise filtering

---

## Payment Success But Ride Failed

Need:

* Refund flow
* Compensation logic

---

## Driver Cancels Frequently

Need:

* Penalty system
* Rating reduction

---

# 16. Interview Winning Summary 🎯

“Driver matching is the core scalability challenge in ride-sharing systems.

I would use geo-spatial indexing like Redis GEO for nearest-driver lookup and atomic driver state updates to avoid double assignment.

Trip lifecycle should be event-driven, while surge pricing dynamically adjusts fares based on demand and driver availability.”
