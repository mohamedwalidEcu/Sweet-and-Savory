const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validate } = require('../validators/authValidator');
const { productSchema } = require('../validators/productValidator');

router.get('/', productController.getProducts);
router.get('/:idOrSlug', productController.getProduct);

// Admin-only routes
router.post('/', protect, authorize('admin'), validate(productSchema), productController.createProduct);
router.put('/:id', protect, authorize('admin'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);
router.post('/upload', protect, authorize('admin'), upload.array('images', 5), productController.uploadProductImages);

module.exports = router;
