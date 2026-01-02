import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : undefined,
      message: err.msg,
    }));
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errorMessages);
  }
  next();
};

// Email validation
const emailValidation = body('email')
  .trim()
  .isEmail()
  .withMessage('Invalid email format')
  .normalizeEmail()
  .isLength({ max: 255 })
  .withMessage('Email must be less than 255 characters');

// Password validation (for registration and creation)
const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')
  .isLength({ max: 128 })
  .withMessage('Password must be less than 128 characters');

// Optional password validation (for updates)
const optionalPasswordValidation = body('password')
  .optional()
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')
  .isLength({ max: 128 })
  .withMessage('Password must be less than 128 characters');

// Name validation
const nameValidation = body('name')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('Name must be between 1 and 100 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
  .optional();

// First name validation
const firstNameValidation = body('firstName')
  .trim()
  .isLength({ min: 1, max: 50 })
  .withMessage('First name must be between 1 and 50 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes');

// Last name validation
const lastNameValidation = body('lastName')
  .trim()
  .isLength({ min: 1, max: 50 })
  .withMessage('Last name must be between 1 and 50 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes');

// Department validation
const departmentValidation = body('department')
  .trim()
  .isLength({ max: 100 })
  .withMessage('Department must be less than 100 characters')
  .optional();

// Year validation
const yearValidation = body('year')
  .optional({ checkFalsy: true })
  .custom((value) => {
    if (value === undefined || value === null || value === '') return true;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 10) {
      throw new Error('Year must be between 1 and 10');
    }
    return true;
  });

// Date of birth validation
const dobValidation = body('dob')
  .optional({ checkFalsy: true })
  .custom((value) => {
    if (!value || value === '') return true;
    // Check if it's a valid ISO 8601 date
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
    if (!iso8601Regex.test(value) && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('Date of birth must be a valid ISO 8601 date');
    }
    const dob = new Date(value);
    if (isNaN(dob.getTime())) {
      throw new Error('Date of birth must be a valid date');
    }
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 10 || age > 100) {
      throw new Error('Date of birth must represent an age between 10 and 100 years');
    }
    return true;
  });

// Role validation
const roleValidation = body('role')
  .isIn(['academic', 'student'])
  .withMessage('Role must be either "academic" or "student"');

// Sub-role validation
const subRoleValidation = body('subRole')
  .isIn(['faculty', 'administrative'])
  .withMessage('Sub-role must be either "faculty" or "administrative"')
  .optional();

// Status validation
const statusValidation = body('status')
  .isIn(['active', 'inactive'])
  .withMessage('Status must be either "active" or "inactive"');

// ID parameter validation
export const idParamValidation = param('id')
  .isMongoId()
  .withMessage('Invalid ID format');

// Contact validation
const contactValidation = body('contact')
  .optional({ checkFalsy: true })
  .custom((value) => {
    if (!value || value === '' || (typeof value === 'object' && Object.keys(value).length === 0)) {
      return true; // Allow empty/undefined contact
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Contact must be an object');
    }
    if (value.phone !== undefined && value.phone !== null && value.phone !== '' && typeof value.phone !== 'string') {
      throw new Error('Phone must be a string');
    }
    if (value.address !== undefined && value.address !== null && value.address !== '' && typeof value.address !== 'string') {
      throw new Error('Address must be a string');
    }
    if (value.city !== undefined && value.city !== null && value.city !== '' && typeof value.city !== 'string') {
      throw new Error('City must be a string');
    }
    if (value.state !== undefined && value.state !== null && value.state !== '' && typeof value.state !== 'string') {
      throw new Error('State must be a string');
    }
    if (value.zip !== undefined && value.zip !== null && value.zip !== '' && typeof value.zip !== 'string') {
      throw new Error('Zip must be a string');
    }
    return true;
  });

// Avatar URL validation
const avatarUrlValidation = body('avatarUrl')
  .optional({ checkFalsy: true })
  .custom((value) => {
    if (!value || value === '') return true;
    // Allow data URIs (base64 images) and regular URLs
    if (value.startsWith('data:image/')) {
      if (value.length > 2048) {
        throw new Error('Avatar URL must be less than 2048 characters');
      }
      return true;
    }
    // Validate as URL for non-data URIs
    try {
      new URL(value);
      if (value.length > 2048) {
        throw new Error('Avatar URL must be less than 2048 characters');
      }
      return true;
    } catch {
      throw new Error('Avatar URL must be a valid URL');
    }
  });

// Search query validation
export const searchQueryValidation = query('q')
  .optional()
  .trim()
  .isLength({ max: 100 })
  .withMessage('Search query must be less than 100 characters');

// Department query validation
export const departmentQueryValidation = query('department')
  .optional()
  .trim()
  .isLength({ max: 100 })
  .withMessage('Department filter must be less than 100 characters');

// Year query validation
export const yearQueryValidation = query('year')
  .optional()
  .isInt({ min: 1, max: 10 })
  .withMessage('Year filter must be between 1 and 10');

// Login validation
export const loginValidation: ValidationChain[] = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must be less than 128 characters'),
  roleValidation,
];

// Register validation
export const registerValidation: ValidationChain[] = [
  emailValidation,
  passwordValidation,
  roleValidation,
  body('subRole')
    .if(body('role').equals('academic'))
    .notEmpty()
    .withMessage('Sub-role is required for academic users')
    .isIn(['faculty', 'administrative'])
    .withMessage('Sub-role must be either "faculty" or "administrative"'),
  body('name')
    .if(body('role').equals('academic'))
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  body('firstName')
    .optional()
    .custom((value, { req }) => {
      if (req.body.role === 'student') {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          throw new Error('First name is required for students');
        }
        if (value.trim().length < 1 || value.trim().length > 50) {
          throw new Error('First name must be between 1 and 50 characters');
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          throw new Error('First name can only contain letters, spaces, hyphens, and apostrophes');
        }
      }
      return true;
    }),
  body('lastName')
    .optional()
    .custom((value, { req }) => {
      if (req.body.role === 'student') {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          throw new Error('Last name is required for students');
        }
        if (value.trim().length < 1 || value.trim().length > 50) {
          throw new Error('Last name must be between 1 and 50 characters');
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          throw new Error('Last name can only contain letters, spaces, hyphens, and apostrophes');
        }
      }
      return true;
    }),
  dobValidation,
  contactValidation,
  departmentValidation,
  yearValidation.if(body('role').equals('student')),
  avatarUrlValidation,
];

// Change password validation
export const changePasswordValidation: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .isLength({ max: 128 })
    .withMessage('New password must be less than 128 characters'),
];

// Phone validation
const phoneValidation = body('contact.phone')
  .optional({ nullable: true, checkFalsy: true })
  .trim()
  .isMobilePhone('any')
  .withMessage('Invalid phone number format');

// Address validation
const addressValidation = body('contact.address')
  .optional({ nullable: true, checkFalsy: true })
  .trim()
  .isLength({ max: 500 })
  .withMessage('Address must be less than 500 characters');

// Update profile validation (academic)
export const updateAcademicProfileValidation: ValidationChain[] = [
  emailValidation,
  nameValidation.optional(),
  departmentValidation,
  avatarUrlValidation,
  phoneValidation,
  addressValidation,
];

// Update profile validation (student - contact only)
export const updateStudentContactValidation: ValidationChain[] = [
  contactValidation,
];

// Create student validation
export const createStudentValidation: ValidationChain[] = [
  emailValidation,
  passwordValidation,
  firstNameValidation,
  lastNameValidation,
  dobValidation,
  contactValidation,
  departmentValidation,
  yearValidation,
  avatarUrlValidation,
];

// Update student validation
export const updateStudentValidation: ValidationChain[] = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  dobValidation,
  contactValidation,
  departmentValidation,
  yearValidation,
  avatarUrlValidation,
];

// Create faculty validation
export const createFacultyValidation: ValidationChain[] = [
  emailValidation,
  passwordValidation,
  subRoleValidation,
  nameValidation,
  departmentValidation,
  avatarUrlValidation,
];

// Update faculty validation
export const updateFacultyValidation: ValidationChain[] = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  nameValidation,
  subRoleValidation,
  departmentValidation,
  avatarUrlValidation,
];

// Toggle status validation
export const toggleStatusValidation: ValidationChain[] = [
  statusValidation,
];

