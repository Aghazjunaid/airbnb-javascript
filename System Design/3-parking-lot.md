# 🅿️ Parking Lot System - LLD Notes (SDE-2)

# 🧠 Core Entities

- ParkingLot
- Floor
- Slot
- Vehicle
- Ticket
- Payment

👉 Main entity = Ticket

Because:
Entry → Parking → Exit  
sab ticket ke around track hoga.

---

# 🔗 Flow Diagram / UML Style

```text
ParkingLot
   |
   | 1:N
   ↓
Floor
   |
   | 1:N
   ↓
ParkingSlot
   |
   | 1:1 (active)
   ↓
Ticket
   ↑
   | N:1
Vehicle

Ticket
   |
   | 1:1
   ↓
Payment
```

---

# 🗄️ Schema Design

## parking_lots

```sql
parking_lots
--------------
id
name
location
```

---

## floors

```sql
floors
--------------
id
parking_lot_id
floor_number
```

---

## parking_slots

```sql
parking_slots
--------------
id
floor_id
slot_number
slot_type
status
zone
sequence_number
```

### slot_type

```text
bike
car
truck
ev
vip
```

### status

```text
available
occupied
blocked
```

---

## vehicles

```sql
vehicles
--------------
id
vehicle_number
vehicle_type
```

---

## tickets

```sql
tickets
--------------
id
vehicle_id
slot_id
entry_time
exit_time
status
```

### status

```text
active
completed
cancelled
```

---

## payments

```sql
payments
--------------
id
ticket_id
amount
status
payment_method
```

---

# 🚗 Slot Allocation Logic (Algorithm)

Goal:
Vehicle aaye → suitable empty slot assign karo.

---

# 🔥 Simple Flow

```text
1. Vehicle enters
2. Find available slot based on vehicle type
3. Lock slot
4. Mark slot occupied
5. Create ticket
6. Return ticket
```

---

# 🚗 Normal Car Allocation

```sql
SELECT *
FROM parking_slots
WHERE slot_type = 'car'
AND status = 'available'
ORDER BY floor_id ASC, sequence_number ASC
LIMIT 1;
```

👉 Nearest available car slot.

---

# ⚡ EV Vehicle Allocation

## Logic

```text
1. Find EV charging slot
2. If available → assign
3. Else → fallback to normal car slot
```

---

## Query

```sql
SELECT *
FROM parking_slots
WHERE slot_type = 'ev'
AND status = 'available'
ORDER BY floor_id ASC, sequence_number ASC
LIMIT 1;
```

---

# 👑 VIP Allocation

## Logic

```text
1. Find VIP slot
2. If available → assign
3. Else → fallback to normal car slot
```

---

## Query

```sql
SELECT *
FROM parking_slots
WHERE slot_type = 'vip'
AND status = 'available'
ORDER BY floor_id ASC, sequence_number ASC
LIMIT 1;
```

---

# 🔒 Concurrency Handling

## Problem

2 vehicles same slot le sakti hain.

---

## Solution

Atomic update:

```sql
UPDATE parking_slots
SET status='occupied'
WHERE id = 1
AND status='available';
```

👉 Agar rows affected = 0  
means slot already occupied.

---

# 🎯 Strategy Pattern

Purpose:
Future me different allocation rules easily add kar sake.

---

# Different Strategies

```text
NearestSlotStrategy
EVPriorityStrategy
VIPStrategy
RandomSlotStrategy
```

---

# Example

## Normal Car

```text
Nearest available slot
```

---

## EV Vehicle

```text
Prefer EV charging slot
```

---

## VIP User

```text
Prefer reserved VIP slot
```

---

# 💻 Strategy Pattern Code

## Base Strategy

```js
class SlotAllocationStrategy {
  allocate(slots) {
    throw new Error("allocate() method required");
  }
}
```

---

## NearestSlotStrategy

```js
class NearestSlotStrategy extends SlotAllocationStrategy {

  allocate(slots) {

    const availableSlots = slots.filter(
      slot => slot.status === "available"
    );

    if (availableSlots.length === 0) {
      return null;
    }

    availableSlots.sort(
      (a, b) => a.sequence_number - b.sequence_number
    );

    return availableSlots[0];
  }
}
```

---

## EVPriorityStrategy

```js
class EVPriorityStrategy extends SlotAllocationStrategy {

  allocate(slots) {

    const evSlots = slots.filter(
      slot =>
        slot.slotType === "ev" &&
        slot.status === "available"
    );

    if (evSlots.length > 0) {

      evSlots.sort(
        (a, b) => a.sequence_number - b.sequence_number
      );

      return evSlots[0];
    }

    const normalCarSlots = slots.filter(
      slot =>
        slot.slotType === "car" &&
        slot.status === "available"
    );

    if (normalCarSlots.length === 0) {
      return null;
    }

    normalCarSlots.sort(
      (a, b) => a.sequence_number - b.sequence_number
    );

    return normalCarSlots[0];
  }
}
```

---

## VIPStrategy

```js
class VIPStrategy extends SlotAllocationStrategy {

  allocate(slots) {

    const vipSlots = slots.filter(
      slot =>
        slot.slotType === "vip" &&
        slot.status === "available"
    );

    if (vipSlots.length > 0) {

      vipSlots.sort(
        (a, b) => a.sequence_number - b.sequence_number
      );

      return vipSlots[0];
    }

    const normalSlots = slots.filter(
      slot =>
        slot.slotType === "car" &&
        slot.status === "available"
    );

    if (normalSlots.length === 0) {
      return null;
    }

    normalSlots.sort(
      (a, b) => a.sequence_number - b.sequence_number
    );

    return normalSlots[0];
  }
}
```

---

# 🌐 APIs

## 1. Park Vehicle

```http
POST /park
```

### Request

```json
{
  "vehicle_number": "DL01AB1234",
  "vehicle_type": "car"
}
```

### Logic

```text
1. Find slot
2. Lock slot
3. Mark occupied
4. Create ticket
5. Return ticket
```

---

## 2. Exit Vehicle

```http
POST /exit
```

### Request

```json
{
  "ticket_id": 101
}
```

### Logic

```text
1. Fetch ticket
2. Calculate duration
3. Calculate parking fee
4. Create payment
5. Free slot
6. Close ticket
```

---

## 3. Get Available Slots

```http
GET /slots/available?type=car
```

### Logic

```text
Return all available slots for given vehicle type
```

---

## 4. Get Ticket Details

```http
GET /tickets/:id
```

---

## 5. Make Payment

```http
POST /payments
```

---

# ⚡ Important Things to Mention in Interview

## ✅ Indexing

```sql
INDEX(status, slot_type)
```

Because:
slot search bahut frequently hoga.

---

## ✅ Transactions

Use transaction while:
- allocating slot
- creating ticket

To avoid inconsistent data.

---

## ✅ Extensibility

Future features:
- EV parking
- VIP parking
- Reserved parking
- Dynamic pricing
- Online booking

Isliye:
- Strategy Pattern use karenge
- Generic slot types rakhenge

---

## ✅ Billing Logic

```text
amount = duration × hourly_rate
```

Future:
- weekend pricing
- surge pricing
- VIP pricing

---

## ✅ Real-time Availability

Optimize using:
- Redis cache
- available slot counters

Instead of:
har baar DB query.

---

# 🎯 Interview Summary Line

“I’ll model ParkingLot → Floors → Slots hierarchy.  
Ticket will be the central entity tracking entry and exit.  
Slot allocation will use Strategy Pattern for future extensibility like EV/VIP parking.  
To avoid race conditions, I’ll use transactions or atomic updates.”
