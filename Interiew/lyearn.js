1. if from razorpay different amount comes and from our transaction different amount comes
how will you handle this situation

System amount (our transaction amount) is the source of truth.
Razorpay amount must exactly match the expected transaction amount.
If not → do NOT blindly mark success.

      1. Verify signature
      2. Fetch transaction from GPS
      3. Compare amounts
      4. If mismatch:
            → Mark FAILED
            → Log error
            → Alert
            → (Optional refund)
      5. If match:
            → Insert SFT
            → Update transaction SUCCESS
            → Business logic
            → Send email

2.LRU(Least Recently Used) in 0(1)

LRU ka rule:
  Jo sabse kam recently use hua ho, capacity full hone pe usko delete karo.
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;

    const value = this.map.get(key);

    // move to most recent
    this.map.delete(key);
    this.map.set(key, value);

    return value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }

    this.map.set(key, value);

    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}

const cache = new LRUCache(2);

cache.put(1, 10);
cache.put(2, 20);
console.log(cache.get(1)); // 10
cache.put(3, 30); // evicts key 2
console.log(cache.get(2)); // -1


JavaScript ka Map:
✅ Insertion order maintain karta hai
✅ .keys().next().value se sabse purana (oldest) key mil jaata hai
✅ .delete() + .set() se hum kisi key ko most recently used bana sakte hain

