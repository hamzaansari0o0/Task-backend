// validators/userValidator.js
const Joi = require("joi");

// Signup validation schema
const signupValidation = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Name is required ❌",
    "string.min": "Name atleast 3 characters",
    "any.required": "Name is required ❌",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required ❌",
    "string.email": "InValid email ❌",
    "any.required": "Email is required ❌",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required ❌",
    "string.min": "Password atleast 6 characters",
    "any.required": "Password is required ❌",
  }),
});

// Login validation schema
const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required ❌",
    "string.email": "InValid email ❌",
    "any.required": "Email is required ❌",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required ❌",
    "string.min": "Password atleast 6 characters",
    "any.required": "Password is required ❌",
  }),
});

module.exports = { signupValidation, loginValidation };
