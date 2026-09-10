const Category = require('../models/Category');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const slugify = require('slugify');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    return successResponse(res, 200, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug.toLowerCase() });
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return successResponse(res, 200, 'Category retrieved', category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon, badgeText, order } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    
    const category = await Category.create({
      name,
      slug,
      description,
      image,
      icon,
      badgeText,
      order: order || 0,
    });
    return successResponse(res, 201, 'Category created', category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return successResponse(res, 200, 'Category updated', category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return successResponse(res, 200, 'Category deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
