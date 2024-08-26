const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true

  },
  price: {
    type: Number,
    require: true
    
  },
  description:{
    type: String,
    required: true
  },
  imageUrl:{
    type: String,
    required: false
  },
  warehouse: {
    type: String,
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

});

module.exports = mongoose.model('Product', productSchema);





// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description;
//     this._id = id;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
  
//     if (this._id) {
//       // Update the product
//       return db
//         .collection("products")
//         .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this });
//     } else {
//       // Insert Data
//       return db
//         .collection("products")
//         .insertOne(this)
//         .then((result) => {
//           console.log(result);
//           return result; // Return the inserted document (optional)
//         })
//         .catch((err) => {
//           console.error("Error saving product:", err);
//           throw err;
//         });
//     }
//   }
  

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         console.log;
//         return products;
//       })
//       .catch((err) => {
//         console.error("Error getting product:", err);
//         throw err;
//       });
//   }
//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({
//         _id: new mongodb.ObjectId(prodId),
//       })
//       .next()
//       .then((products) => {
//         console.log(products);
//         return products;
//       })
//       .catch((err) => {
//         console.error("Error getting product:", err);
//         throw err;
//       });
//   }
//   static deleteById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((result) => {
//         console.log(result);
//         console.log('Deleted');
//         return result; // Return the deletion result (optional)
//       })
//       .catch((err) => {
//         console.error("Error deleting product:", err);
//         throw err;
//       });
//   }
// }

// module.exports = Product;
