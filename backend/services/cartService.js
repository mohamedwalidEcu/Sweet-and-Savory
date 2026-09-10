const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/appError');

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name images price discountPrice stock slug categorySlug');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  async addToCart(userId, itemData) {
    const { productId, quantity = 1, selectedSize, selectedToppings = [], selectedFlavors = [], specialInstructions = '' } = itemData;

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items in stock`, 400);
    }

    // Calculate base price
    const basePrice = product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : product.price;
    const sizeAdjustment = (selectedSize && selectedSize.priceAdjustment) ? Number(selectedSize.priceAdjustment) : 0;
    const toppingsTotal = selectedToppings.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
    const flavorsTotal = selectedFlavors.reduce((acc, f) => acc + (Number(f.price) || 0), 0);

    const unitPrice = basePrice + sizeAdjustment + toppingsTotal + flavorsTotal;
    const itemTotal = unitPrice * quantity;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if identical item already exists in cart (same product, same size, same toppings, same flavors)
    const existingItemIndex = cart.items.findIndex(item => {
      const sameProduct = item.product.toString() === productId;
      const sameSize = (item.selectedSize?.name || '') === (selectedSize?.name || 'Regular');
      const sameToppings = JSON.stringify(item.selectedToppings.map(t => t.name).sort()) === JSON.stringify(selectedToppings.map(t => t.name).sort());
      const sameFlavors = JSON.stringify(item.selectedFlavors.map(f => f.name).sort()) === JSON.stringify(selectedFlavors.map(f => f.name).sort());
      return sameProduct && sameSize && sameToppings && sameFlavors;
    });

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].itemTotal = cart.items[existingItemIndex].quantity * unitPrice;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        quantity,
        selectedSize: selectedSize || { name: 'Regular', priceAdjustment: 0 },
        selectedToppings,
        selectedFlavors,
        unitPrice,
        itemTotal,
        specialInstructions,
      });
    }

    await cart.save();
    return await this.getCart(userId);
  }

  async updateItemQuantity(userId, itemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new AppError('Item not found in cart', 404);
    }

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
      item.itemTotal = item.unitPrice * quantity;
    }

    await cart.save();
    return await this.getCart(userId);
  }

  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items.pull(itemId);
    await cart.save();
    return await this.getCart(userId);
  }

  async clearCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      await cart.save();
    }
    return { items: [], subtotal: 0 };
  }
}

module.exports = new CartService();
