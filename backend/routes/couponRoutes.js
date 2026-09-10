const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/validate', protect, couponController.validateCoupon);
router.get('/public', couponController.getPublicOffers);

// Admin routes
router.get('/', protect, authorize('admin'), couponController.getCoupons);
router.post('/', protect, authorize('admin'), couponController.createCoupon);
router.put('/:id', protect, authorize('admin'), couponController.updateCoupon);
router.delete('/:id', protect, authorize('admin'), couponController.deleteCoupon);

module.exports = router;
