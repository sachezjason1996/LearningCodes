
//const Cart = require("../models/cart");
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');
const path = require("path");
const warehouse = require('../models/warehouse');
const { Console } = require('console');

module.exports.getIndex = (req, res, next) => {
  const pageSize = 2; // show only 2 products per page
  const page = parseInt(req.query.page) || 1; // get the current page from the query string

  Product.find()
    .skip((page - 1) * pageSize) // skip the number of documents to get to the current page
    .limit(pageSize) // limit the number of documents to the page size
    .then((products) => {
      Product.countDocuments() // get the total number of products
        .then((totalProducts) => {
          const totalPages = Math.ceil(totalProducts / pageSize); // calculate the total number of pages

          res.render("shop/index", {
            pageTitle: "Shop",
            path: "/",
            products: products, // pass the products for the current page
            currentPage: page, // pass the current page number
            totalPages: totalPages, // pass the total number of pages
            hasNextPage: page < totalPages, // check if there's a next page
            hasPreviousPage: page > 1, // check if there's a previous page
          });
        })
        .catch((err) => {
          console.log(err);
          next(err); // handle the error properly
        });
    })
    .catch((err) => {
      console.log(err);
      next(err); // handle the error properly
    });
};



module.exports.getProducts = (req, res, next) => {
  
  Product.find()
    .then((products) => {
      // Render the 'shop/index' view with the fetched products
      res.render("shop/product-list", {
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
        products: products, // Pass the products to the view
      });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      next(err); // Pass the error to the next middleware
    });
};


// Fetch all products using Sequelize

module.exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  console.log(`Fetching product with ID: ${productId}`);

  Product.findById(productId)
    .then(product => {
      if (!product) {
        console.log("Product not found");
        return res
          .status(404)
          .render("404", { pageTitle: "Product Not Found", path: "/404" });
      }
      console.log("Product found:", product);
      res.render("shop/product-details", {
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
        product: product, // No need for product[0] if it's a single object
      });
    })
    .catch(err => {
      console.error("Error fetching product:", err);
      res.status(500).render("500", { pageTitle: "Error", path: "/500" });
    });
};


module.exports.getCart = (req, res, next) => {
  // Call the getCart method on the user object, which retrieves the user's cart from the database
  req.user.getCart()
      .then(products => {
        console.log('Get Cart Result of products', products );
          // If successful, render the 'cart' view and pass the retrieved products to the view
          res.render('shop/cart', {
              pageTitle: 'Cart',  // Set the page title
              path: '/cart',
              isAuthenticated: req.session.isLoggedIn,  // Set the path for active link highlighting
              products: products  // Pass the products to the view
          });
      })
      .catch(err => console.log(err));  // Log any errors that occur
};



module.exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  console.log('Received productId:', productId);

  if (!req.user || typeof req.user.addToCart !== 'function') {
    console.log('User or addToCart method not available.');
    return res.status(400).send('User or method not found.');
  }

  req.user.addToCart(productId)
    .then(result => {
      console.log('Add to cart result:', result);
      res.redirect('/cart');
    })
    .catch(err => {
      console.log('Error adding to cart:', err);
      res.status(500).send('Error adding to cart.');
    });
};



    module.exports.postDeleteCartProduct = (req, res, next) => {
      const productId = req.body.productId;

      if (!req.user || typeof req.user.deleteItemFromCart !== 'function') {
        console.log('User or deleteItemFromCart method not available.');
        return res.status(400).send('User or method not found.');
      }
    
      req.user.deleteItemFromCart(productId)
        .then(result => {
          res.redirect('/cart');
        })
        .catch(err => {
          console.log('Error deleting item from cart:', err);
          res.status(500).send('Error deleting item from cart.');
        });
  };
  module.exports.getOrders = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    const userId = req.user._id;
    console.log('User ID:', userId); // Log the user ID for debugging

    Order.find({ 'user._id': userId })
    .then(orders => {
        if (!orders) {
            orders = []; // Ensure orders is always an array
        }
        if (orders.length > 0) {
            console.log(`Found ${orders.length} matching order(s) for user ID ${userId}`);
        } else {
            console.log(`No matching orders found for user ID ${userId}`);
        }
        res.render('shop/orders', {
            pageTitle: 'Orders',
            path: '/orders',
            isAuthenticated: req.session.isLoggedIn,
            orders: orders
        });
    })
        .catch(err => {
            console.error(err);
            res.status(500).render('shop/orders', {
                pageTitle: 'Orders',
                path: '/orders',
                isAuthenticated: req.session.isLoggedIn,
                orders: [],
                errorMessage: 'An error occurred while fetching orders. Please try again later.'
            });
        });
};
module.exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    isAuthenticated: req.session.isLoggedIn,
    path: "/checkout",
  });
};



module.exports.postOrder = async (req, res, next) => {
  try {
    // Fetch and populate the user's cart with product details
    const user = await User.findById(req.user._id).populate('cart.items.productId').exec();

    console.log('User after populate:', JSON.stringify(user, null, 2));

    // Log detailed contents of the cart items
    console.log('Cart items:', JSON.stringify(user.cart.items, null, 2));

    // Map the cart items to the required product format
    const products = user.cart.items.map(item => {
      if (!item.productId) {
        console.warn('ProductId is null or undefined for cart item:', JSON.stringify(item, null, 2));
        return null; // or handle this case as needed
      }
      return {
        _id: item.productId._id,
        title: item.productId.title,
        price: item.productId.price,
        description: item.productId.description,
        imageUrl: item.productId.imageUrl,
        warehouse: item.productId.warehouse,
        quantity: item.quantity
      };
    });
    console.log('Mapped products:', JSON.stringify(products, null, 2));

    // Update the warehouse stock quantities
    await Promise.all(
      products.map(async (product) => {
        // Attempt to find the warehouse item that matches the product ID and location
        console.log('Map Products', product);
        const warehouseItem = await warehouse.findOne({
          warehouse: product.warehouse
          
        
        });
        console.log('Result OF find One ', warehouseItem);
        // If no matching warehouse item is found, log an error and skip further processing
        if (!warehouseItem) {
          console.error(`Warehouse item not found for product ${product.title}`);
          return; // Exit the current iteration of the map function
        }
    
        // Calculate the new stock quantity by subtracting the requested quantity from the current stock
        let totalQuantity = 0;
        for (const product of products) {
          totalQuantity += product.quantity;
        }
        console.log('What is the result of totalQuantity', totalQuantity);
        const newStockQuantity = warehouseItem.stockLocation - totalQuantity;
    
        // If the new stock quantity is less than zero, log an error and throw an exception
        if (newStockQuantity < 0) {
          console.error(
            `Not enough stock for product ${product.title}. Required: ${product.quantity}, Available: ${warehouseItem.stockLocation}`
          );
          throw new Error(
            `Not enough stock for product ${product.title}`
          ); // This will cause the Promise.all to reject
        }
    
        // If there is enough stock, update the stock quantity in the warehouse item
        warehouseItem.stockLocation = newStockQuantity;
    
        // Save the updated warehouse item back to the database
        await warehouseItem.save();
      })
    );

    const order = new Order({
      user: {
        _id: user._id,
        name: user.name
      },
      products: products
    });
    await order.save();

    // Clear the user's cart
    await user.clearCart();
    res.redirect('/');

  } catch (err) {
    // Log any errors that occur with specific messages
    console.error('An error occurred while processing the order:');
    if (err.message) {
      console.error('Error message:', err.message);
    }
    if (err.stack) {
      console.error('Error stack:', err.stack);
    }
    console.error('Error details:', err);

    // Send an error response to the client
    res.status(500).json({ error: 'An error occurred while processing your order. Please try again later.' });

    // Pass the error to the next middleware
    next(err);
  }
};
module.exports.getInvoice = (req, res, next) => {
  // Retrieve the order ID from the request parameters
  const orderId = req.params.orderId;

  // Find the order in the database by its ID
  Order
      .findById(orderId)
      .then(order => {
          // Check if the order was found
          if (!order) {
              // Pass an error to the next middleware with the message 'no order found'
              return next(new Error('no order found'));
          }
          // Check if the user is authorized to access this order
          if (order.user._id.toString() !== req.user._id.toString()) {
              // Pass an error to the next middleware with the message 'unauthorized access'
              return next(new Error('unauthorized access'));
          }

          // Create the filename for the invoice PDF
          const invoiceName = 'invoice-' + orderId + '.pdf';
          // Construct the path to the invoice file (not used in this snippet)
          const invoicePath = path.join('data', 'invoices', invoiceName);

          // Set the response headers to indicate the content type and suggest the filename for the PDF
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'filename="' + invoiceName + '"');

          // Create a new PDF document
          const pdfDoc = new PDFDocument();
          // Pipe the PDF document to the response
          pdfDoc.pipe(res);

          // Add invoice title and order ID to the PDF
          pdfDoc.fontSize(20).text('Invoice # ' + order._id);
          pdfDoc.text('------------------------------');

          // Set font size for the product details
          pdfDoc.fontSize(12);
          let index = 1;
          let totalPrice = 0;

          // Iterate over each product in the order to add details to the PDF
          order.products.forEach(product => {
              // Calculate the price for the current product
              let calculatedPrice = product.price * product.quantity;
              // Add product details to the PDF
              pdfDoc
              .fontSize(12)
              .text(`${index + 1}. Title: ${product.title} - Quantity: ${product.quantity} - Price: ${calculatedPrice}`);
              // Accumulate the total price
              totalPrice += calculatedPrice;
              index++;
          });

          // Add a separator line
          pdfDoc.text('------------------------------');
          // Add the total price to the PDF
          pdfDoc.fontSize(16).text('Total: ' + totalPrice);

          // Finalize the PDF document
          pdfDoc.end();
      })
      .catch(err => {
          // Create a new error object with the caught error message
          const error = new Error(err);
          // Set an HTTP status code for internal server errors
          error.httpStatusCode = 500;
          // Pass the error to the next middleware
          next(error);
      });
}
