const Product = require('../models/product');


exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
  
    req.user
      .createProduct({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl
      })
      .then(result => {
        console.log('Created Product');
        res.redirect('/admin/products');
      })
      .catch(err => {
        console.log(err);
      });
  };


module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle:'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};


module.exports.getEditProduct = (req, res, next) => {
    // Check if edit mode is enabled
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }

    // Get the product ID from the request parameters
    const productId = req.params.productId;

    // Fetch the specific product details using Sequelize
    Product.findByPk(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }

            // Render the edit-product view with the fetched product details
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        })
        .catch(err => {
            console.error(err); // Log the error for debugging
            next(err); // Pass the error to the next middleware
        });
};

module.exports.postEditProduct = (req, res, next) => {
    // Extract the product details from the request body
    const productId = req.body.id;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedPrice = req.body.price;

    // Find the product by its ID using Sequelize
    Product.findByPk(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }

            // Update the product attributes with the new values
            product.title = updatedTitle;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDescription;
            product.price = updatedPrice;

            // Save the updated product back to the database
            return product.save();
        })
        .then(() => {
            // Redirect to the admin products page after saving
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.error(err); // Log the error for debugging
            next(err); // Pass the error to the next middleware
        });
};


module.exports.getProducts = (req, res, next) => {
    // Fetch all products using Sequelize
    req.user.getProducts()
        .then(products => {
            // Render the 'shop/index' view with the fetched products
            res.render('admin/product-list', {
                pageTitle: 'Admin',
                path: '/products',
                products: products // Pass the products to the view
            });
        })
        .catch(err => {
            console.error(err); // Log the error for debugging
            next(err); // Pass the error to the next middleware
        });
};

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;

    // Find the product by its ID and delete it using Sequelize
    Product.destroy({ where: { id: productId } })
        .then(() => {
            // Redirect to the admin products page after deletion
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.error(err); // Log the error for debugging
            next(err); // Pass the error to the next middleware
        });
};
