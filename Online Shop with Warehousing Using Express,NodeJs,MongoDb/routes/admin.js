const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
//const upload = require('../middleware/upload'); // Update with the correct path
const productValidator = require('../validators/product');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', isAuth,  productValidator.productInfo, adminController.postAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', isAuth, productValidator.productInfo, adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.get('/warehouse', isAuth, adminController.getCreateWarehouse);
router.post('/warehouse', isAuth, adminController.postCreateWarehouse);

router.get('/searchwarehouses', isAuth, adminController.searchWarehouse);



module.exports = router;
