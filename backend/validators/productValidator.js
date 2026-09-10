const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  nameAr: Joi.string().allow('', null).optional(),
  description: Joi.string().required(),
  descriptionAr: Joi.string().allow('', null).optional(),
  shortDescription: Joi.string().allow('', null),
  category: Joi.string().required(),
  categorySlug: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).min(1).required(),
  price: Joi.number().positive().required(),
  discountPrice: Joi.number().positive().allow(null),
  stock: Joi.number().integer().min(0).default(50),
  availableSizes: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      priceAdjustment: Joi.number().default(0),
      isDefault: Joi.boolean().default(false),
    })
  ).optional(),
  availableToppings: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      price: Joi.number().default(0),
      category: Joi.string().default('general'),
    })
  ).optional(),
  availableFlavors: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      price: Joi.number().default(0),
      category: Joi.string().default('general'),
    })
  ).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  nutritionalInfo: Joi.object({
    calories: Joi.number().optional(),
    protein: Joi.string().allow('').optional(),
    carbs: Joi.string().allow('').optional(),
    fat: Joi.string().allow('').optional(),
  }).optional(),
  preparationTime: Joi.string().allow('').optional(),
  isFeatured: Joi.boolean().default(false),
  isPopular: Joi.boolean().default(false),
  badgeText: Joi.string().allow('').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  productSchema,
};
