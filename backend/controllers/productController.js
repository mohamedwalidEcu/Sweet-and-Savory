const productService = require('../services/productService');
const { successResponse } = require('../utils/apiResponse');

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    return successResponse(res, 200, 'Products fetched successfully', result.products, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductByIdOrSlug(req.params.idOrSlug);
    return successResponse(res, 200, 'Product details fetched', product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    return successResponse(res, 200, 'Images uploaded successfully', { imageUrls });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
};
