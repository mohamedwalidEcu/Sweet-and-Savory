const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const AppError = require('../utils/appError');

class OrderService {
  async createOrder(userId, orderPayload, io = null) {
    const { shippingAddress, paymentMethod = 'simulated_card', couponCode, items: directItems } = orderPayload;

    let orderItems = [];

    if (directItems && directItems.length > 0) {
      for (const item of directItems) {
        const product = await Product.findById(item.productId);
        if (!product) throw new AppError(`Product not found: ${item.productId}`, 404);
        if (product.stock < item.quantity) {
          throw new AppError(`Not enough stock for ${product.name}`, 400);
        }

        const basePrice = product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : product.price;
        const sizeAdjustment = item.selectedSize?.priceAdjustment ? Number(item.selectedSize.priceAdjustment) : 0;
        const toppingsTotal = (item.selectedToppings || []).reduce((s, t) => s + (Number(t.price) || 0), 0);
        const flavorsTotal = (item.selectedFlavors || []).reduce((s, f) => s + (Number(f.price) || 0), 0);
        const unitPrice = basePrice + sizeAdjustment + toppingsTotal + flavorsTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images[0] || '',
          quantity: item.quantity,
          selectedSize: item.selectedSize || { name: 'Regular', priceAdjustment: 0 },
          selectedToppings: item.selectedToppings || [],
          selectedFlavors: item.selectedFlavors || [],
          unitPrice,
          itemTotal: unitPrice * item.quantity,
          specialInstructions: item.specialInstructions || '',
        });

        // Decrement stock
        product.stock -= item.quantity;
        await product.save();
      }
    } else {
      // Pull items from user's cart
      const cart = await Cart.findOne({ user: userId });
      if (!cart || cart.items.length === 0) {
        throw new AppError('Your cart is empty', 400);
      }

      for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (product) {
          if (product.stock < item.quantity) {
            throw new AppError(`Not enough stock for ${product.name}`, 400);
          }
          product.stock -= item.quantity;
          await product.save();
        }

        orderItems.push({
          product: item.product,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedToppings: item.selectedToppings,
          selectedFlavors: item.selectedFlavors,
          unitPrice: item.unitPrice,
          itemTotal: item.itemTotal,
          specialInstructions: item.specialInstructions,
        });
      }

      // Empty cart
      cart.items = [];
      cart.subtotal = 0;
      await cart.save();
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.itemTotal, 0);
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      });

      if (coupon && new Date() <= new Date(coupon.expirationDate)) {
        if (subtotal >= coupon.minOrder) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = Math.min(coupon.value, subtotal);
          }
          discount = Number(discount.toFixed(2));
          appliedCoupon = {
            code: coupon.code,
            discountValue: discount,
          };
          coupon.usageCount += 1;
          await coupon.save();
        }
      }
    }

    const deliveryFee = subtotal > 50 ? 0 : 3.50; // Free delivery over $50
    const total = Number((subtotal - discount + deliveryFee).toFixed(2));
    const orderNumber = `SWT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
        transactionId: `TXN-${Date.now()}`,
        cardLast4: '4242',
      },
      orderStatus: 'pending',
      statusHistory: [{
        status: 'pending',
        note: 'Order placed successfully. Waiting for kitchen confirmation.',
        timestamp: new Date(),
      }],
      subtotal: Number(subtotal.toFixed(2)),
      discount,
      deliveryFee,
      total,
      appliedCoupon,
      estimatedDeliveryTime: '30-45 minutes',
    });

    // If socket is available, emit event to admin channel
    if (io) {
      io.emit('new_order', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.orderStatus,
      });
    }

    return order;
  }

  async getUserOrders(userId) {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getOrderById(orderId, userId = null, isAdmin = false) {
    const query = orderId.match(/^[0-9a-fA-F]{24}$/) ? { _id: orderId } : { orderNumber: orderId };
    const order = await Order.findOne(query).populate('user', 'name email phone');
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (!isAdmin && userId && order.user._id.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to view this order', 403);
    }

    return order;
  }

  async updateOrderStatus(orderId, newStatus, note = '', io = null) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      note: note || `Order status updated to ${newStatus.replace(/_/g, ' ')}`,
      timestamp: new Date(),
    });

    if (newStatus === 'delivered') {
      order.paymentInfo.status = 'completed';
    }

    await order.save();

    // Real-time broadcast via Socket.IO
    if (io) {
      // Broadcast to user-specific room and general order updates
      io.to(`user_${order.user}`).emit('order_status_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: newStatus,
        note,
        timestamp: new Date(),
      });
      io.emit(`order_${order._id}`, {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: newStatus,
        note,
        timestamp: new Date(),
      });
    }

    return order;
  }

  async getAllOrders(queryParams) {
    const { page = 1, limit = 10, status, search } = queryParams;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    };
  }
}

module.exports = new OrderService();
