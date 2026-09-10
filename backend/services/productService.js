const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/appError');
const slugify = require('slugify');

class ProductService {
  async getProducts(queryParams) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort = 'newest',
      isFeatured,
      isPopular,
    } = queryParams;

    const query = {};

    // Search keyword in name, description, tags
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    // Category filter by slug or ID
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        query.categorySlug = category.toLowerCase();
      }
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Min rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // In stock
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // Featured / Popular flags
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true' || isFeatured === true;
    }
    if (isPopular !== undefined) {
      query.isPopular = isPopular === 'true' || isPopular === true;
    }

    // Sorting
    let sortCriteria = {};
    switch (sort) {
      case 'price_asc':
        sortCriteria = { price: 1 };
        break;
      case 'price_desc':
        sortCriteria = { price: -1 };
        break;
      case 'rating':
        sortCriteria = { rating: -1, reviewCount: -1 };
        break;
      case 'popular':
        sortCriteria = { isPopular: -1, reviewCount: -1 };
        break;
      case 'newest':
      default:
        sortCriteria = { createdAt: -1 };
        break;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug icon badgeText')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      products,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  }

  async getProductByIdOrSlug(idOrSlug) {
    let product;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug).populate('category', 'name slug icon');
    } else {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() }).populate('category', 'name slug icon');
    }

    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async createProduct(productData) {
    // Generate slug
    const slug = slugify(productData.name, { lower: true, strict: true });
    const existingSlug = await Product.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    // Verify category exists
    let catObj;
    if (productData.category.match(/^[0-9a-fA-F]{24}$/)) {
      catObj = await Category.findById(productData.category);
    } else {
      catObj = await Category.findOne({ slug: productData.category.toLowerCase() });
    }

    if (!catObj) {
      throw new AppError('Specified category does not exist', 400);
    }

    // Validate discountPrice if provided
    if (productData.discountPrice !== undefined && productData.discountPrice !== null && productData.discountPrice !== '') {
      const priceNum = Number(productData.price);
      const discountNum = Number(productData.discountPrice);
      if (discountNum >= priceNum) {
        throw new AppError('سعر الخصم يجب أن يكون أقل من السعر الأساسي / Discount price must be less than base price', 400);
      }
      productData.discountPrice = discountNum;
    } else {
      productData.discountPrice = null;
    }

    const product = await Product.create({
      ...productData,
      slug: finalSlug,
      category: catObj._id,
      categorySlug: catObj.slug,
    });

    return product;
  }

  async updateProduct(id, updateData) {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Validate discountPrice relative to effective price
    const effectivePrice = updateData.price !== undefined ? Number(updateData.price) : product.price;
    if (updateData.discountPrice !== undefined && updateData.discountPrice !== null && updateData.discountPrice !== '') {
      const discountNum = Number(updateData.discountPrice);
      if (discountNum >= effectivePrice) {
        throw new AppError('سعر الخصم يجب أن يكون أقل من السعر الأساسي / Discount price must be less than base price', 400);
      }
      updateData.discountPrice = discountNum;
    } else if (updateData.discountPrice === null || updateData.discountPrice === '' || updateData.discountPrice === 0) {
      updateData.discountPrice = null;
    }

    if (updateData.name && updateData.name !== product.name) {
      const slug = slugify(updateData.name, { lower: true, strict: true });
      updateData.slug = slug;
    }

    if (updateData.category) {
      let catObj;
      if (updateData.category.match(/^[0-9a-fA-F]{24}$/)) {
        catObj = await Category.findById(updateData.category);
      } else {
        catObj = await Category.findOne({ slug: updateData.category.toLowerCase() });
      }
      if (catObj) {
        updateData.category = catObj._id;
        updateData.categorySlug = catObj.slug;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    return updatedProduct;
  }

  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }
}

module.exports = new ProductService();
