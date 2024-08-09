# airbnb-javascript
{
      title: 'Titanic',
      year: 1997,
      genres: [ 'Drama', 'Romance' ],
      rated: 'PG-13',
      languages: [ 'English', 'French', 'German', 'Swedish', 'Italian', 'Russian' ],
      released: ISODate("1997-12-19T00:00:00.000Z"),
      awards: {
         wins: 127,
         nominations: 63,
         text: 'Won 11 Oscars. Another 116 wins & 63 nominations.'
      },
      cast: [ 'Leonardo DiCaprio', 'Kate Winslet', 'Billy Zane', 'Kathy Bates' ],
      directors: [ 'James Cameron' ]
   },
   {
      title: 'The Dark Knight',
      year: 2008,
      genres: [ 'Action', 'Crime', 'Drama' ],
      rated: 'PG-13',
      languages: [ 'English', 'Mandarin' ],
      released: ISODate("2008-07-18T00:00:00.000Z"),
      awards: {
         wins: 144,
         nominations: 106,
         text: 'Won 2 Oscars. Another 142 wins & 106 nominations.'
      },
      cast: [ 'Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine' ],
      directors: [ 'Christopher Nolan' ]
   },
   {
      title: 'Spirited Away',
      year: 2001,
      genres: [ 'Animation', 'Adventure', 'Family' ],
      rated: 'PG',
      languages: [ 'Japanese' ],
      released: ISODate("2003-03-28T00:00:00.000Z"),
      awards: {
         wins: 52,
         nominations: 22,
         text: 'Won 1 Oscar. Another 51 wins & 22 nominations.'
      },
      cast: [ 'Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki', 'Takashi Naitè' ],
      directors: [ 'Hayao Miyazaki' ]
   },
   {
      title: 'Casablanca',
      genres: [ 'Drama', 'Romance', 'War' ],
      rated: 'PG',
      cast: [ 'Humphrey Bogart', 'Ingrid Bergman', 'Paul Henreid', 'Claude Rains' ],
      languages: [ 'English', 'French', 'German', 'Italian' ],
      released: ISODate("1943-01-23T00:00:00.000Z"),
      directors: [ 'Michael Curtiz' ],
      awards: {
         wins: 9,
         nominations: 6,
         text: 'Won 3 Oscars. Another 6 wins & 6 nominations.'
      },
      lastupdated: '2015-09-04 00:22:54.600000000',
      year: 1942
   }


1. db.getCollection('products').find({year:{$lte : 2000}})
2. db.getCollection('products').find({year:{$gte : 2000}})
3. db.getCollection('products').find({year:{$lte : 2010, $gte: 1990}})
4. db.getCollection('products').find({$and: [{genres : "Drama"}]})
5. db.getCollection('products').find({$and: [{languages : { $in: ["English","French"]}} ]})
6. db.getCollection('products').find({$and: [{languages : { $in: ["English","French"]}}, {genres: "Romance"} ]})
7. db.getCollection('products').find({"awards.wins" : 9})
8. db.getCollection('products').find({released: {$lt : ISODate("2000-01-01")}})
9. db.getCollection('products').find({directors: {$exists: false}})
10. db.getCollection('products').updateOne({title: "Casablanca"},{$push: {"genres": "Ishq"}})
11. db.getCollection('products').updateOne({title: "Casablanca"},{$set: {"awards.aj": "aj"}})
12. db.getCollection('products').updateOne({title: "Casablanca"},{$unset: {"awards.aj": "aj"}})
13. db.getCollection('products').updateOne({title: "Casablanca"},{$pop: {"genres": 1}}) to remove last generes element in an array
14. db.getCollection('products').updateOne({title: "Casablanca"},{$pop: {"genres": -1}}) to remove first element
15. db.getCollection('products').find({title: /th/i}) searching like in mysql
16. db.getCollection('products').find({title: /^the/i}) match first 3 character
17. db.getCollection('products').find({title: /the$/i}) match last 3 character

1. db.getCollection('products').aggregate([{$group: {_id:null , result: {$sum: "$price"}}}]) to sum price
2. db.getCollection('products').aggregate([{$group: {_id:"$type" , result: {$sum: 1}}}])
3. db.getCollection('products').aggregate([{$unwind: "$type"}])
4. db.getCollection('products').aggregate([{$unwind: "$type"},{
    $group: {_id: "$type", count: {$sum: 1}}
    }])
5. db.getCollection('products').aggregate([{$unwind: "$type"},{
    $group: {_id: "$type", count: {$sum: 1}}
},
    {$sort: {"count": 1}}
    ])
6. db.getCollection('products').aggregate([{
    $project: {name:1, price:1,rating:1, multiply: {$subtract: ["$price", "$rating"]}}
    },
    {$skip:2 },{$limit:3}
    
])
7. db.getCollection('products').aggregate([{$unwind: "$type"},{
    $group: {_id: "$type", MaxPrice: {$max: "$price"}}
    }
])
8. db.getCollection('products').aggregate([{$unwind: "$type"},
{
    $match: {type:"phone"}
},
{
    $group: {_id: "$type", MaxPrice: {$max: "$price"}}
    }
])
9. db.getCollection('products').aggregate([{$unwind: "$type"},
{
    $match: {type: {$in: ["phone","charger"]}}
},
{
    $group: {_id: "$type", MaxPrice: {$max: "$price"}}
    }
])
10. db.getCollection('products').aggregate([{$unwind: "$type"},{
    $group: {_id: "$type", value: {$sum : {$multiply: ["$price","$rating"]}}}
    }
])
11. db.sales.aggregate([
  {
    $group : {
       _id : null,
       totalSaleAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
       averageQuantity: { $avg: "$quantity" },
       count: { $sum: 1 }
    }
  }
 ])
