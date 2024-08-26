const Product = require("../models/product");
const Cart = require("../models/cart");

module.exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      console.log(products); // Check the retrieved products
      res.render("shop/index", {
        pageTitle: "Shop",
        path: "/",
        products: products, // Ensure products is passed correctly
      });
    })
    .catch((err) => {
      console.log(err);
      next(err); // Handle the error properly
    });
};

module.exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      // Render the 'shop/index' view with the fetched products
      res.render("shop/product-list", {
        pageTitle: "All Products",
        path: "/products",
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
  console.log(`Fetching product with ID: ${productId}`); // Log the product ID
  Product.findById(productId)
    .then(([product]) => {
      if (!product) {
        console.log("Product not found");
        return res
          .status(404)
          .render("404", { pageTitle: "Product Not Found", path: "/404" });
      }
      console.log("Product found:", product); // Log the product details
      res.render("shop/product-details", {
        pageTitle: product.title,
        path: "/products",
        product: product[0],
      });
    })
    .catch((err) => {
      console.error("Error fetching product:", err);
      res.status(500).render("500", { pageTitle: "Error", path: "/500" });
    });
};

module.exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((err) => console.log(err));

  // Cart.fetchAll(cart => {
  //     Product.fetchAll(products => {
  //         const newProducts = [];
  //         for(let product of products) {
  //             let cartProductData = cart.products.find(prod => prod.id === product.id);
  //             if(cartProductData) {
  //                 newProducts.push({...product, quantity: cartProductData.quantity});
  //             }
  //         }
  //         const newCart = {
  //             products: newProducts,
  //             totalPrice: cart.totalPrice
  //         };
  //         res.render('shop/cart', {
  //             pageTitle: 'Your Cart',
  //             path: '/cart',
  //             cart: newCart
  //         });
  //     });
  // });
};

module.exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;

    req.user
        .getCart()
        .then(cart => {
            if (!cart) {
                // If the cart does not exist, create a new one for the user
                return req.user.createCart();
            }
            return cart;
        })
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            let product;
            if (products.length > 0) {
                product = products[0];
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => {
            if (!product) {
                // Handle case where the product does not exist
                throw new Error('Product not found');
            }
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('An error occurred while adding the product to the cart.');
        });
};


module.exports.postDeleteCartProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({
        where: {
          id: productId,
        },
      });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

module.exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders",
  });
};

module.exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

module.exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          return order.addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch((err) => console.log(err));
    })
    .then((result) => {
      return fetchedCart.setProducts(null);
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};
