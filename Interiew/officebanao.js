// Design a system to maintain Stock order book for bid and asks
// You get Order events with each event containing 

// * Symbol - INFY
// * Sequence number - Unique incremental event ID - long
// * OrderId - long
// * Order Action - CREATE/UPDATE/DELETE
// * Order Type - BID/ASK
// * Price per Stock - 10.50 (In multiple of  25 paisa)
// * Stock Quantity - 1000
// When asked, show top 3 bid and ask prices and aggregated quantities, please show in sorted as following

// INFY
// BID					ASK
// 10.50	600			10.75	200
// 10.25	1200		11.00	450
// 10.00	900			11.25	700

// Sample events

// INFY, 1, 1, C, B, 10.50, 1000
// INFY, 2, 1, U, B, 10.50, 500
// INFY, 3, 2, C, B, 10.50, 200
// INFY, 4, 1, U, B, 10.50, 1000


class OrderBook {
    constructor() {
        this.bids = new Map(); // Map to hold bid orders
        this.asks = new Map(); // Map to hold ask orders
    }

    processEvent(event) {
        const [symbol, sequence, orderId, orderAction, orderType, price, quantity] = event.split(",").map(item => item.trim());
        const priceKey = parseFloat(price);
        const quantityNum = parseInt(quantity, 10);

        if (orderAction === 'C') {
            this.addOrder(orderType, priceKey, quantityNum, orderId);
        } else if (orderAction === 'U') {
            this.updateOrder(orderType, priceKey, quantityNum, orderId);
        } else if (orderAction === 'D') {
            this.deleteOrder(orderType, orderId);
        }
    }

    addOrder(orderType, price, quantity, orderId) {
        const orderMap = orderType === 'B' ? this.bids : this.asks;
        if (!orderMap.has(price)) {
            orderMap.set(price, { totalQuantity: 0, orders: new Set() });
        }
        const orderEntry = orderMap.get(price);
        orderEntry.totalQuantity += quantity;
        orderEntry.orders.add(orderId);
    }

    updateOrder(orderType, price, quantity, orderId) {
        const orderMap = orderType === 'B' ? this.bids : this.asks;
        for (let [key, value] of orderMap) {
            if (value.orders.has(orderId)) {
                value.totalQuantity -= quantity; // Remove the old quantity
                if (value.totalQuantity <= 0) {
                    orderMap.delete(key); // Remove the price level if quantity is zero
                }
                break;
            }
        }
        this.addOrder(orderType, price, quantity, orderId); // Add the new order
    }

    deleteOrder(orderType, orderId) {
        const orderMap = orderType === 'B' ? this.bids : this.asks;
        for (let [key, value] of orderMap) {
            if (value.orders.has(orderId)) {
                value.totalQuantity = 0; // Mark quantity as zero
                orderMap.delete(key); // Remove the entry
                break;
            }
        }
    }

    getTopOrders(orderType) {
        const orderMap = orderType === 'B' ? this.bids : this.asks;
        const sortedOrders = [...orderMap.entries()]
            .sort((a, b) => orderType === 'B' ? b[0] - a[0] : a[0] - b[0]) // Sort bids descending and asks ascending
            .slice(0, 3); // Take top 3

        return sortedOrders.map(([price, { totalQuantity }]) => ({ price, totalQuantity }));
    }
}

// Sample usage
const orderBook = new OrderBook();
const events = [
    "INFY, 1, 1, C, B, 10.50, 1000",
    "INFY, 2, 1, U, B, 10.50, 500",
    "INFY, 3, 2, C, B, 10.50, 200",
    "INFY, 4, 1, U, B, 10.50, 1000"
];

events.forEach(event => orderBook.processEvent(event));

// Get top 3 bids
console.log("Top 3 Bids:", orderBook.getTopOrders('B'));

// Get top 3 asks (no asks were created in the sample, but this is how you would call it)
console.log("Top 3 Asks:", orderBook.getTopOrders('A'));


//My code
const exchange = {};


function stockMapper(sym,seq,orderId,action,type,price,stock){
  if(sym in exchange){
    const symbolValue = exchange[sym];
    if(orderId in symbolValue){
      if(type === 'B'){
        symbolValue[orderId] = {
        orderType : type,
        stockQuantity : symbolValue[orderId].stockQuantity + stock,
        price: price
      }
      } else if(type === 'A'){
        symbolValue[orderId] = {
        orderType : type,
        stockQuantity : symbolValue[orderId].stockQuantity - stock,
        price: price
      }
      }
    } else {
      symbolValue[orderId] = {
        orderType : type,
        stockQuantity : stock,
        price: price
      }
    }
  } else {
    exchange[sym] = {
      [orderId] : {
        orderType : type,
        stockQuantity : stock,
        price: price
      }
    }
  }
  
  for(let [key,value] of Object.entries(exchange)){
    if(key === sym){
      for(let [key1,value1] of Object.entries(value)){
        // console.log(key1)
        console.log(value1.orderType, value1.stockQuantity, value1.price)
      }
    }
  }
}


stockMapper('INFY', 1, 1, 'C', 'B', 10.50, 1000)
stockMapper('INFY', 2, 1, 'U', 'B', 10.50, 100)
stockMapper('INFY', 3, 2, 'C', 'B', 10.20, 800)
// console.log(exchange)
