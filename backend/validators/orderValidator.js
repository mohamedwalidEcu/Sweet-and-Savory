const Joi = require('joi');
const { isValidEgyptianPhone } = require('../utils/phoneValidator');

const createOrderSchema = Joi.object({
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string()
      .trim()
      .required()
      .custom((value, helpers) => {
        if (!isValidEgyptianPhone(value)) {
          return helpers.message('Phone number must be a valid Egyptian mobile number (e.g. 01012345678 or +20 100 123 4567)');
        }
        return value;
      })
      .messages({
        'string.empty': 'Phone number is required',
        'any.required': 'Phone number is required',
      }),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    deliveryNotes: Joi.string().allow('', null),
  }).required(),
  paymentMethod: Joi.string().valid('simulated_card', 'cash_on_delivery', 'stripe_ready').default('simulated_card'),
  couponCode: Joi.string().allow('', null),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      selectedSize: Joi.object({
        name: Joi.string().required(),
        priceAdjustment: Joi.number().default(0),
      }).optional(),
      selectedToppings: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().default(0),
        })
      ).optional(),
      selectedFlavors: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().default(0),
        })
      ).optional(),
      specialInstructions: Joi.string().allow('', null),
    })
  ).optional(), // Can either pass items explicitly or let server use user's active Cart
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled').required(),
  note: Joi.string().allow('', null),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
