const mongoose = require('mongoose');

const Product = require('./product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
      type: String,
      required: true
  },
    cart: {
        items: [
          {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
          }
        ]
      }
});
userSchema.methods.clearCart = function() {
  this.cart = {
      items: []
  };
  return this.save();
}

userSchema.methods.addToCart = function(productId) {
    // Ensure cart is initialized
    if (!this.cart) {
      // If the cart is not defined, initialize it with an empty items array
      this.cart = { items: [] };
    }
  
    // Find the index of the product in the cart items array
    const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === productId.toString());
    let newQuantity = 1;  // Default quantity for a new product
    const updatedCartItems = [ ...this.cart.items ];  // Create a copy of the current cart items
  
    if (cartProductIndex >= 0) {
      // If the product is already in the cart, increment its quantity
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      // If the product is not in the cart, add it with a quantity of 1
      updatedCartItems.push({ productId: productId, quantity: newQuantity });
    }
  
    // Create an updated cart object with the modified items array
    const updatedCart = { items: updatedCartItems };
  
    // Debug note: Log the cart state before and after the update
    console.log('Cart before update:', this.cart);
    console.log('Updated cart:', updatedCart);
  
    // Update the user's cart in the database
    this.cart = updatedCart;
    return this.save();
  };

  userSchema.methods.getCart = function() {
    // Extract the product IDs from the cart items
    const productIds = this.cart.items.map(item => item.productId);

    console.log('This is Product ID in Get Card Method', productIds );
  
    // Find the products in the database that match the product IDs in the cart
    return Product.find({ _id: { $in: productIds } })
      .then(products => {
        console.log('Result of products', products );
        // Map the found products to include the quantity from the cart
        return products.map(product => {
          return {
            ...product.toObject(),
            quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString()).quantity
          };
        });
     
      })
      .catch(err => console.log(err));  // Log any errors that occur
  };
  userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
}


  
module.exports = mongoose.model('User', userSchema);


// userSchema.methods.clearCart = function() {
//     this.cart = {
//         items: []
//     };
//     return this.save();
// }

// module.exports = mongoose.model('User', userSchema, 'users');





// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;
// const ObjectId = mongodb.ObjectId; // Ensure ObjectId is imported
// const Product = require('../models/product');


// class User {
//     constructor(username, email, cart = { items: [] }, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart; // Ensure cart is properly initialized
//         this._id = id ? new ObjectId(id) : null; // Ensure _id is an ObjectId

//         console.log('User initialized:', this);
//       }

//       addToCart(productId) {
//         // Ensure cart is initialized
//         if (!this.cart) {
//             // If the cart is not defined, initialize it with an empty items array
//             this.cart = { items: [] };
//         }
    
//         // Find the index of the product in the cart items array
//         const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === productId.toString());
//         let newQuantity = 1;  // Default quantity for a new product
//         const updatedCartItems = [ ...this.cart.items ];  // Create a copy of the current cart items
    
//         if (cartProductIndex >= 0) {
//             // If the product is already in the cart, increment its quantity
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             // If the product is not in the cart, add it with a quantity of 1
//             updatedCartItems.push({ productId: new ObjectId(productId), quantity: newQuantity });
//         }
    
//         // Create an updated cart object with the modified items array
//         const updatedCart = { items: updatedCartItems };
    
//         // Debug note: Log the cart state before and after the update
//         console.log('Cart before update:', this.cart);
//         console.log('Updated cart:', updatedCart);
    
//         // Get the database connection
//         const db = getDb();
    
//         // Update the user's cart in the database
//         return db.collection('users')
//             .updateOne(
//                 { _id: this._id },  // Find the user by their ID
//                 { $set: { cart: updatedCart }}  // Set the cart field to the updated cart
//             )
//             .then(result => console.log('Database update result:', result))  // Log the result of the update
//             .catch(err => console.log('Error updating database:', err));  // Log any errors that occur
//     }
    
//     getCart() {
//         // Get the database connection
//         const db = getDb();
    
//         // Extract the product IDs from the cart items
//         const productIds = this.cart.items.map(item => item.productId);
    
//         // Find the products in the database that match the product IDs in the cart
//         return db.collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 // Map the found products to include the quantity from the cart
//                 return products.map(product => {
//                     return {
//                         ...product,
//                         quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString()).quantity
//                     };
//                 });
//             })
//             .catch(err => console.log(err));  // Log any errors that occur
//     }
    
     

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .findOne({ _id: new ObjectId(userId) }) // Convert userId to ObjectId
//             .then(user => {
//                 return user;
//             })
//             .catch(err => {
//                 // Debug note: Log any errors during user fetching
//                 console.log('Error fetching user by ID:', err);
//             });
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db.collection('users')
//             .find()
//             .toArray()
//             .then(users => {
//                 // Debug note: Check the fetched users
//                 console.log('Fetched users:', users);
//                 return users;
//             })
//             .catch(err => {
//                 // Debug note: Log errors
//                 console.log('Error fetching users:', err);
//             });
//     }
//     deleteFromCart(productId) {
//         const db = getDb();
//         let updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
//         const updatedCart = { items: updatedCartItems };
//         return db.collection('users')
//             .updateOne(
//                 { _id: this._id },
//                 { $set: { cart: updatedCart }}
//             );
//     }

//     addOrder() {
//         const db = getDb();  // Get the database connection
    
//         // Retrieve the current user's cart
//         return this.getCart()
//             .then(products => {
//                 // Create an order object with the cart items and user details
//                 const order = {
//                     items: products,  // Products in the cart
//                     user: {
//                         _id: new ObjectId(this._id),  // User ID
//                         username: this.username,  // Username
//                         email: this.email  // User email
//                     }
//                 };
    
//                 // Insert the order into the 'orders' collection
//                 return db.collection('orders')
//                     .insertOne(order);
//             })
//             .then(result => {
//                 // After the order is inserted, clear the user's cart
//                 this.cart = { items: [] };
    
//                 // Update the user's cart in the database to reflect the empty cart
//                 return db.collection('users')
//                     .updateOne(
//                         { _id: new ObjectId(this._id) },  // Find the user by their ID
//                         { $set: { cart: this.cart }}  // Set the cart field to the empty cart
//                     );
//             })
//             .catch(err => console.log(err));  // Log any errors that occur
//     }
    


//     getOrders() {
//         const db = getDb();  // Get the database connection
    
//         // Find all orders for the current user in the 'orders' collection
//         return db.collection('orders')
//             .find({ 'user._id': new ObjectId(this._id) })  // Match orders by user ID
//             .toArray();  // Convert the result to an array
//     }
    


// }

// module.exports = User;
