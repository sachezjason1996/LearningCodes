const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            
        },
       name: {
            type: String,
         
        }
    },
    products: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
         
        },
        title: {
            type: String,
          
        },
        price: {
            type: Number,
          
        },
        imageUrl: {
            type: String,
        
        },
        description: {
            type: String,
           
        },
        quantity: {
            type: Number,
     
        }
    }]
});

// module.exports = mongoose.model('Order', orderSchema, 'orders');
module.exports = mongoose.model('Order', orderSchema);