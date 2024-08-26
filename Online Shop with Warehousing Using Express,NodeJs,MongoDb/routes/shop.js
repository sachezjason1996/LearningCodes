const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');
const router = express.Router();


 router.get('/',isAuth , shopController.getIndex);

 router.get('/products', shopController.getProducts);

 router.get('/product/:productId', shopController.getProduct);

 router.get('/cart',isAuth , shopController.getCart);

  router.post('/cart',isAuth ,shopController.postCart);

  router.post('/cart-delete-item',isAuth , shopController.postDeleteCartProduct);

router.get('/orders',isAuth , shopController.getOrders);

router.get('/checkout',isAuth , shopController.getCheckout);

  router.post('/create-order',isAuth , shopController.postOrder);
  router.get('/order/:orderId', isAuth, shopController.getInvoice);
  

module.exports = router;