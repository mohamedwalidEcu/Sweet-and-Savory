const cartService = require('../services/cartService');
const { successResponse } = require('../utils/apiResponse');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return successResponse(res, 200, 'Cart retrieved', cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addToCart(req.user.id, req.body);
    return successResponse(res, 200, 'Item added to cart', cart);
  } catch (error) {
    next(error);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateItemQuantity(req.user.id, req.params.itemId, quantity);
    return successResponse(res, 200, 'Cart quantity updated', cart);
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.itemId);
    return successResponse(res, 200, 'Item removed from cart', cart);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    return successResponse(res, 200, 'Cart cleared', cart);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
};
