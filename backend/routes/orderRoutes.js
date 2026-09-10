const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../validators/authValidator');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/orderValidator');

router.use(protect);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

// Admin routes
router.get('/', authorize('admin'), orderController.getAllOrders);
router.put('/:id/status', authorize('admin'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
