const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.post('/products/:productId/reviews', protect, reviewController.createReview);
router.delete('/reviews/:id', protect, reviewController.deleteReview);

module.exports = router;
