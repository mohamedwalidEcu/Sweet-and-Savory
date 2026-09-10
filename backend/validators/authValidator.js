const Joi = require('joi');
const AppError = require('../utils/appError');
const { isValidEgyptianPhone } = require('../utils/phoneValidator');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => detail.message).join('; ');
      return next(new AppError(errorDetails, 400));
    }

    req[property] = value;
    next();
  };
};

const egyptianPhoneValidator = Joi.string()
  .trim()
  .allow('', null)
  .custom((value, helpers) => {
    if (!value) return value;
    if (!isValidEgyptianPhone(value)) {
      return helpers.message('Phone number must be a valid Egyptian mobile number (e.g. 01012345678 or +20 100 123 4567)');
    }
    return value;
  });

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required',
  }),
  phone: egyptianPhoneValidator,
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
  }).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60),
  email: Joi.string().email().lowercase().trim(),
  phone: egyptianPhoneValidator,
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
  }),
  currentPassword: Joi.string().min(6).when('newPassword', {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  newPassword: Joi.string().min(6),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
