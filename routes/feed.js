const express = require('express');

const feedController = require('../controllers/feed');

const productValidator = require('../validators/product');
const upload = require('../helper/multerConfig');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/posts', isAuth,feedController.getPostAll);
router.post('/createPost', isAuth,upload.single('image'),productValidator.productInfo ,feedController.createPost);
router.get('/posts/:id', isAuth,feedController.getPost);
router.put('/getPost/:id',isAuth, upload.single('image'),feedController.updatePost)
router.delete('/postsDelete/:id', isAuth, feedController.deletePost);



module.exports = router;