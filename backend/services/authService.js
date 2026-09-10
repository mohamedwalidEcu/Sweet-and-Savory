const User = require('../models/User');
const AppError = require('../utils/appError');

class AuthService {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 400);
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      phone: userData.phone || '',
      address: userData.address || {},
      role: 'user', // Default role
    });

    const token = user.getSignedJwtToken();
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    return { user: sanitizedUser, token };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const token = user.getSignedJwtToken();
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    return { user: sanitizedUser, token };
  }

  async updateProfile(userId, updateData) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.address) user.address = { ...user.address, ...updateData.address };

    // Email change check
    if (updateData.email && updateData.email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: updateData.email.toLowerCase() });
      if (emailExists) {
        throw new AppError('Email is already taken by another account', 400);
      }
      user.email = updateData.email.toLowerCase();
    }

    // Password change check
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new AppError('Current password is required to set a new password', 400);
      }
      const isMatch = await user.matchPassword(updateData.currentPassword);
      if (!isMatch) {
        throw new AppError('Current password is incorrect', 400);
      }
      user.password = updateData.newPassword;
    }

    await user.save();

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    const token = user.getSignedJwtToken();

    return { user: sanitizedUser, token };
  }
}

module.exports = new AuthService();
