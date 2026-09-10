const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart routes require authentication

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/items/:itemId', cartController.updateQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;
