const orderService = require('../services/orderService');
const { successResponse } = require('../utils/apiResponse');

const createOrder = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const order = await orderService.createOrder(req.user.id, req.body, io);
    return successResponse(res, 201, 'Order placed successfully', order);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    return successResponse(res, 200, 'Orders retrieved', orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const order = await orderService.getOrderById(req.params.id, req.user.id, isAdmin);
    return successResponse(res, 200, 'Order details retrieved', order);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    return successResponse(res, 200, 'All orders retrieved', result.orders, result.pagination);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const { status, note } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, note, io);
    return successResponse(res, 200, 'Order status updated', order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
