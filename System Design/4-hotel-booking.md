# 🏨 Hotel Booking System - HLD / LLD Notes


# 🧠 Core Problem Areas

- Availability vs Reservation race condition
- Pricing strategies
- Date-based inventory management

---

# 🧩 Core Entities

- Hotel
- Room
- RoomInventory
- Booking
- Payment
- PricingRule

---

# 🔗 UML / Flow Diagram

```text
Hotel
  |
  | 1:N
  ↓
Room
  |
  | 1:N
  ↓
RoomInventory
  |
  | 1:N
  ↓
Booking
  |
  | 1:1
  ↓
Payment

Hotel
  |
  | 1:N
  ↓
PricingRule
```

---

# 🗄️ Schema Design

## hotels

```sql
hotels
-------------
id
name
city
address
rating
```

---

## rooms

```sql
rooms
-------------
id
hotel_id
room_type
capacity
base_price
```

### room_type

```text
single
double
suite
deluxe
```

---

## room_inventory

MOST IMPORTANT TABLE 🔥

```sql
room_inventory
-------------
id
room_type_id --> single, double, suite, deluxe
date
total_rooms
available_rooms
reserved_rooms
```

👉 Inventory date-wise maintain hoga.

---

## bookings

```sql
bookings
-------------
id
user_id
room_id
check_in_date
check_out_date
status
total_amount
created_at
```

### status

```text
pending
confirmed
cancelled
completed
```

---

## payments

```sql
payments
-------------
id
booking_id
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
hotel_id
room_type
day_type
multiplier
```

### day_type

```text
weekday
weekend
holiday
festival
```

---

# 🧠 Date-Based Inventory

Inventory room-wise nahi,
DATE-wise maintain hota hai.

---

# Example

Suppose:

```text
Hotel has:
10 deluxe rooms
```

Inventory table:

| date | available_rooms |
|---|---|
| 1 Jun | 10 |
| 2 Jun | 10 |
| 3 Jun | 10 |

---

# Booking Example

User books:

```text
1 Jun → 3 Jun
```

Then:

| date | available_rooms |
|---|---|
| 1 Jun | 9 |
| 2 Jun | 9 |
| 3 Jun | 10 |

👉 Har date individually reduce hogi.

---

# 🔥 Availability Search Logic

```sql
SELECT room_id
FROM room_inventory
WHERE date BETWEEN '2026-06-01' AND '2026-06-03'
AND available_rooms > 0
GROUP BY room_id
HAVING COUNT(*) = 3;
```

---

# 🚨 Availability vs Reservation Race Condition

MOST IMPORTANT INTERVIEW QUESTION 🔥

---

# ❌ Problem

2 users same last room ek saath book kar rahe.

---

# ✅ Correct Flow

```text
1. Check inventory
2. Lock inventory rows
3. Reduce available_rooms
4. Create booking
5. Commit transaction
```

---

# SQL Locking

```sql
SELECT *
FROM room_inventory
WHERE room_id = 101
AND date BETWEEN '2026-06-01' AND '2026-06-03'
FOR UPDATE;
```

---

# Update Inventory

```sql
UPDATE room_inventory
SET available_rooms = available_rooms - 1,
reserved_rooms = reserved_rooms + 1
WHERE room_id = 101
AND date BETWEEN '2026-06-01' AND '2026-06-03';
```

---

# 💰 Pricing Strategies

Dynamic pricing support karna hoga.

---

# Pricing Factors

- weekend
- holiday
- festivals
- occupancy
- surge demand

---

# Strategy Examples

```text
WeekendPricingStrategy
HolidayPricingStrategy
SurgePricingStrategy
```

---

# 🌐 APIs

## 1. Search Hotels

```http
GET /hotels/search
```

### Logic

```text
1. Find hotels
2. Check inventory
3. Apply pricing
4. Return rooms
```

---

## 2. Reserve Room

```http
POST /bookings
```

### Logic

```text
1. Lock inventory rows
2. Validate availability
3. Reduce inventory
4. Create booking
5. Process payment
6. Confirm booking
```

---

## 3. Cancel Booking

```http
POST /bookings/cancel
```

### Logic

```text
1. Fetch booking
2. Increase inventory
3. Refund payment
4. Cancel booking
```

---

## 4. Get Booking Details

```http
GET /bookings/:id
```

---

# ⚡ Important Things to Mention

## ✅ Transactions

Inventory + booking creation same transaction me hoga.

---

## ✅ Row Locking

Use:

```sql
FOR UPDATE
```

To avoid double booking.

---

## ✅ Redis Cache

Cache:
- hotel search
- pricing config

---

## ✅ Idempotency

Retry se duplicate booking nahi hona chahiye.

---

## ✅ Event Driven Flow

```text
Booking Service
   ↓
Kafka/Bull Queue
   ↓
Notification Service
```

---

# 🚨 Edge Cases

- payment success but booking failed
- overlapping bookings
- cancellation refund failure

---

# 🎯 Interview Winning Line

“I’ll maintain inventory date-wise because hotel availability changes daily.  
To avoid double booking, inventory rows will be locked using SELECT FOR UPDATE inside a transaction.  
Pricing logic will use Strategy Pattern for extensibility like weekend, holiday, and surge pricing.”


---

# 🔄 Better Table Flow Diagram (with Connections)

```text
                ┌──────────────┐
                │    hotels    │
                └──────┬───────┘
                       │ 1:N
                       ↓
                ┌──────────────┐
                │    rooms     │
                └──────┬───────┘
                       │ 1:N
                       ↓
             ┌───────────────────┐
             │  room_inventory   │
             └──────┬────────────┘
                    │
                    │ date-wise inventory
                    ↓
               ┌──────────────┐
               │   bookings   │
               └──────┬───────┘
                      │ 1:1
                      ↓
               ┌──────────────┐
               │   payments   │
               └──────────────┘


                ┌────────────────┐
                │ pricing_rules  │
                └──────┬─────────┘
                       │
                       ↓
                  affects
                       ↓
                   rooms
```

---

# 🧠 How room_inventory gets initial data?

Inventory future dates ke liye pre-generate hota hai.

Usually:
- hotel onboarding time
OR
- daily cron job

---

# Example

Suppose:
10 deluxe rooms available.

Then inventory rows:

| room_id | date | available_rooms |
|---|---|---|
| 101 | 1 Jun | 10 |
| 101 | 2 Jun | 10 |
| 101 | 3 Jun | 10 |

---

# Inventory Generation Flow

```text
for each room
   for next 365 days
      create inventory row
```

---

# Example Code

```js
const today = new Date();

for(let i = 0; i < 365; i++) {

   const inventoryDate = addDays(today, i);

   await db.query(`
      INSERT INTO room_inventory (
         room_id,
         date,
         total_rooms,
         available_rooms,
         reserved_rooms
      )
      VALUES ($1, $2, $3, $4, $5)
   `, [
      roomId,
      inventoryDate,
      10,
      10,
      0
   ]);
}
```

---

# 💰 Pricing Strategy Calculations

Pricing dynamic hoga.

Factors:
- weekend
- holiday
- occupancy
- demand surge

---

# WeekendPricingStrategy

Weekend pe demand high hota hai.

Formula:

base_price × 1.5

---

# Example

```text
1000 × 1.5 = 1500
```

---

# HolidayPricingStrategy

Festival / holidays pe pricing aur increase.

Formula:

base_price × 2

---

# Example

```text
1000 × 2 = 2000
```

---

# SurgePricingStrategy

Occupancy based pricing.

---

# Occupancy Formula

occupancy = booked_rooms / total_rooms × 100

---

# Example

| Occupancy | Multiplier |
|---|---|
| <50% | 1x |
| >70% | 1.5x |
| >90% | 2x |

---

# Example

```text
90 booked
100 total

occupancy = 90%
```

Final price:

```text
1000 × 2 = 2000
```

---

# Example Code

```js
class SurgePricingStrategy {

   calculate(basePrice, occupancy) {

      if(occupancy > 90) {
         return basePrice * 2;
      }

      if(occupancy > 70) {
         return basePrice * 1.5;
      }

      return basePrice;
   }
}
```

---

# ⏰ Cron Jobs

VERY IMPORTANT FOR SENIOR INTERVIEWS 🔥

---

# 1. Inventory Generation Cron

Purpose:
Generate inventory for future dates.

Example:

```text
daily at 1 AM
generate next 365 day inventory
```

---

# 2. Booking Expiry Cron

Purpose:
Pending bookings auto cancel.

Example:

```text
payment not completed within 15 mins
→ release inventory
```

---

# 3. Pricing Refresh Cron

Purpose:
Recalculate dynamic pricing.

Example:

```text
every 30 mins
recalculate occupancy pricing
```

---

# 4. Notification Cron

Purpose:
Send reminders.

Example:
- check-in reminder
- checkout reminder

---

# 5. Analytics Cron

Purpose:
Generate reports.

Example:
- occupancy report
- revenue report
- cancellation trends

---

# 🎯 Additional Important Things

## ✅ Idempotency

Retry booking request:
duplicate booking nahi hona chahiye.

---

## ✅ Distributed Locking

High traffic systems:
Redis locks use kar sakte.

---

## ✅ Read Replica

Search traffic heavy hota hai.

Use:
- read replicas
- cache layer

---

## ✅ Cache

Redis cache:
- hotel search
- inventory
- pricing

---

# 🎯 Senior Level Interview Summary

“I’ll maintain inventory date-wise because hotel availability changes every day.  
Inventory rows will be locked using SELECT FOR UPDATE inside transactions to avoid double booking.  
Pricing will be strategy-based and support dynamic surge pricing using occupancy.  
Background cron jobs will manage inventory generation, booking expiry, analytics, and pricing recalculation.”
