const mongodb = require("mongodb");
const Product = require("../models/product");
const Warehouse = require("../models/warehouse");

const ObjectId = mongodb.ObjectId;
const {validationResult} = require('express-validator');

module.exports.searchWarehouse = async (req, res, next) => {

  try {
    const searchTerm = req.query.q;
    const results = await Warehouse.find({
      $or: [
        { warehouse: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } },
      ],
    });
    res.render('admin/add-product', { results: results });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error searching warehouses' });
  }


};

module.exports.getCreateWarehouse = (req, res, next) => {
  res.render("admin/add-warehouse", {
    pageTitle: "Add Warehouse",
    path: "/admin/add-warehouse",
    isAuthenticated: req.session.isLoggedIn,
    editing: false,

  });


};


module.exports.postCreateWarehouse = (req, res, next) => {
  const warehouseName = req.body.warehouseName;
  const warehouseLocation = req.body.warehouseLocation;
  const locationQuantity = req.body.locationQuantity;
  const userId = req.session.user._id;

  Warehouse.findOne({ warehouse: warehouseName })
    .then(warehouse => {
      if (warehouse) {
        console.error('Warehouse with the same name already exists');
        return renderAddWarehousePage(res, 'Warehouse with the same name already exists.');
      } else {
        const newWarehouse = new Warehouse({
          warehouse: warehouseName,
          location: warehouseLocation,
          stockLocation: locationQuantity,
          userId: userId
        });

        newWarehouse.save()
          .then(result => {
            console.log('Warehouse created:', result);
            res.redirect('/');
          })
          .catch(err => {
            console.error('Error saving warehouse:', err);
            renderAddWarehousePage(res, 'Error creating warehouse. Please try again.');
          });
      }
    })
    .catch(err => {
      console.error('Error checking for existing warehouse:', err);
      renderAddWarehousePage(res, 'Error creating warehouse. Please try again.');
    });
};

const renderAddWarehousePage = (res, errorMessage) => {
  res.render('admin/add-warehouse', {
    pageTitle: 'Add Warehouse',
    isAuthenticated: req.session.isLoggedIn,
    path: "/admin/add-warehouse",
    errorMessage: errorMessage
  });
};

module.exports.postAddProduct = (req, res, next) => {
  const productTitle = req.body.title;
  const productPrice = req.body.price;
  const productImage = req.file;
  const productDescription = req.body.description;
  const userId = req.session.user._id;
  const warehouseName = req.body.warehouseName;
  const errors = validationResult(req);
  let hasError = false;
  let errorMessage = [];
  let validationErrors = [];

  if (!productImage) {
    hasError = true;
    errorMessage = ['Attached file is not an image'];
    validationErrors = [{ param: 'image' }];
  }

  if (!errors.isEmpty() || hasError) {
    errorMessage = [...errorMessage, ...errors.array().map(error => error.msg)];
    validationErrors = [...validationErrors, ...errors.array()];
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: errorMessage,
      product: {
        title: productTitle,
        price: productPrice,
        description: productDescription,
        warehouse: warehouseName
      },
      validationErrors: validationErrors
    });
  }

  const product = new Product({
    title: productTitle,
    price: productPrice,
    imageUrl: productImage.path,
    description: productDescription,
    userId: userId,
    warehouse: warehouseName
  });

  product.save()
    .then(result => {
      console.log('Product created:', result);
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.error('Error saving product:', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    isAuthenticated: req.session.isLoggedIn,
    editing: false,
    errorMessage: [],
    validationErrors: []
  });
};

module.exports.getEditProduct = (req, res, next) => {
  if (!req.session.isLoggedIn){
    return res.redirect('/login')
  }
  const productId = req.params.productId; // Extract the productId from the request parameters
  console.log(`Fetching product with ID: ${productId}`);

  // Find the product by its ID
  Product.findById(productId)
    .then(product => {
      if (!product) {
        console.log("Product not found");
        // If the product is not found, render a 404 error page
        return res.status(404).render("404", {
          pageTitle: "Product Not Found",
          path: "/404",
        });
      }

      console.log("Product found:", product);
      // Render the edit-product view, passing the product data
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true, // Indicate that we are in edit mode
        product: product, // Pass the product data to the view
        errorMessage: [],
        validationErrors: []
      });
    })
    .catch(err => {
      console.error("Error fetching product:", err);
      // If there's an error, render a 500 error page
      res.status(500).render("500", { pageTitle: "Error", path: "/500" });
    });
};




module.exports.postEditProduct = (req, res, next) => {
  // Extract the updated product details from the request body
  const prodId = req.body.id;
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const warehouseName = req.body.warehouseName;
  const updatedPrice = req.body.price;
  const productImage = req.file; // Get the uploaded file (if any)
  const errors = validationResult(req); // Validate the request for errors

  // Check if there are any validation errors
  if (!errors.isEmpty()) {
    return res
      .status(422) // Send a 422 status code for validation error
      .render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        errorMessage: errors.array().map(error => error.msg), // Collect error messages
        product: {
          _id: prodId,
          title: updatedTitle,
          price: updatedPrice,
          description: updatedDescription,
          warehouse: warehouseName, 
          imageUrl: req.body.imageUrl // Retain the existing image URL if there's an error
        },
        validationErrors: errors.array() // Collect validation errors
      });
  }

  // Find the product by its ID
  Product.findById(prodId)
    .then(product => {
      // Check if the product belongs to the current user
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/'); // Redirect if the user is not authorized
      }
      if (!product) {
        // If the product is not found, throw an error
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      // Update product properties with new data
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.warehouse= warehouseName;

      // If a new image file is uploaded, update the imageUrl
      if (productImage) {
        product.imageUrl = productImage.path; // Update with the new file path
      }

      // Save the updated product to the database
      return product.save(); // Return the Promise from save()
    })
    .then(() => {
      console.log('UPDATED PRODUCT!'); // Log the update
      // Redirect the user to the products page after a successful update
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.error(err); // Log any errors
      // If there's an error, pass it to the next middleware for error handling
      next(err);
    });
};



module.exports.getProducts = (req, res, next) => {
  let errorMessage = req.flash('error');
  let alertMessage = req.flash('alert');
  let successMessage = req.flash('success');
  let message;
  let messageType;
  if(alertMessage.length > 0) {
      message = alertMessage;
      messageType = 'alert';
  } else if (errorMessage.length > 0) {
      message = errorMessage;
      messageType = 'error';
  } else if (successMessage.length > 0) {
      message = successMessage;
      messageType = 'success';
  } else {
      message = null;
      messageType = null;
  }
  
  // Check if the user is not logged in
  if (!req.session.isLoggedIn) {
    // Redirect to the login page if not logged in
    return res.redirect('/login');
  }

  // Make sure req.user exists and contains _id
  if (!req.user || !req.user._id) {
    console.error('User not found or invalid user ID');
    return res.redirect('/login');
  }

 

  // Fetch products created by the logged-in user
  Product.find({ userId: req.user._id })
    .then((products) => {
      // Log the fetched products for debugging
      console.log(`/admin/products Data: ${products}`);

      // Get the warehouse names from the products
      const warehouseNames = products.map(product => product.warehouse);

      // Fetch warehouses by names
      Warehouse.find({ warehouse: { $in: warehouseNames } })
        .then((warehouses) => {
          console.log(`Did I get value from my warehouse: ${warehouses}`);
          // Render the 'admin/product-list' view with the fetched products and warehouses
          res.render('admin/product-list', {
            pageTitle: 'Admin', // Set the page title
            path: '/admin/products', // Set the current path
            products: products, // Pass products to the view
            warehouses: warehouses, // Pass warehouses to the view
            isAuthenticated: req.session.isLoggedIn, // Pass authentication status to the view
            message: message,
            messageType: messageType
          });
        })
        .catch((err) => {
          // Log any errors
          console.error(err);

          // Pass the error to the next middleware
          next(err);
        });
    })
    .catch((err) => {
      // Log any errors
      console.error(err);

      // Pass the error to the next middleware
      next(err);
    });
 };

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId; // Assuming productId is sent via POST request body

    Product.findByIdAndDelete(productId)
        .then(() => {
            console.log('Deleted Product');
            res.redirect('/admin/products'); // Redirect to admin products page after deletion
        })
        .catch(err => {
            console.error('Error deleting product:', err);
            next(err); // Pass the error to the next middleware for error handling
        });
};
