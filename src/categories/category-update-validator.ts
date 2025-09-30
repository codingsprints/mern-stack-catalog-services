import { body, param } from 'express-validator';

export default [
  // Validate ID parameter
  param('id')
    .exists({ checkFalsy: true })
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID format'),

  // Ensure at least one field is present in body
  body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  }),

  // Name validation (if provided)
  body('name')
    .optional()
    .isString()
    .withMessage('Category name should be a string')
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty'),

  // Price configuration validation (if provided)
  body('priceConfiguration')
    .optional()
    .custom((value) => {
      if (typeof value !== 'object' || value === null) {
        throw new Error('Price configuration must be an object');
      }
      return true;
    }),

  // Each priceType validation inside priceConfiguration
  body('priceConfiguration.*.priceType')
    .optional()
    .isString()
    .withMessage('Price type must be a string')
    .custom((value: string) => {
      const validKeys = ['base', 'aditional'];
      if (!validKeys.includes(value)) {
        throw new Error(
          `${value} is invalid for priceType field. Possible values are: [${validKeys.join(', ')}]`,
        );
      }
      return true;
    }),

  // Each availableOptions inside priceConfiguration
  body('priceConfiguration.*.availableOptions')
    .optional()
    .isArray()
    .withMessage('Available options should be an array')
    .custom((arr: unknown[]) => {
      if (
        !arr.every(
          (option) => typeof option === 'string' && option.trim().length > 0,
        )
      ) {
        throw new Error('All available options must be non-empty strings');
      }
      return true;
    }),

  // Attributes validation (if provided)
  body('attributes')
    .optional()
    .isArray()
    .withMessage('Attributes should be an array'),

  // Each attribute field validation
  body('attributes.*.name')
    .optional()
    .isString()
    .withMessage('Attribute name should be a string')
    .trim()
    .notEmpty()
    .withMessage('Attribute name cannot be empty'),

  body('attributes.*.widgetType')
    .optional()
    .isString()
    .withMessage('Widget type must be a string')
    .custom((value: string) => {
      const validTypes = ['switch', 'radio'];
      if (!validTypes.includes(value)) {
        throw new Error(
          `Invalid widget type. Possible values are: [${validTypes.join(', ')}]`,
        );
      }
      return true;
    }),

  body('attributes.*.defaultValue')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') {
        throw new Error('Default value is required for attributes');
      }
      return true;
    }),

  body('attributes.*.availableOptions')
    .optional()
    .isArray()
    .withMessage('Available options should be an array')
    .custom((arr: unknown[]) => {
      if (
        !arr.every(
          (option) => typeof option === 'string' && option.trim().length > 0,
        )
      ) {
        throw new Error('All available options must be non-empty strings');
      }
      return true;
    }),
];

/*
Added checkFalsy: true to .exists() so empty strings don’t pass.

Added .isString() before .custom() for string-only fields.

Used generic arr: unknown[] to type arrays inside .custom() (TypeScript friendly).

Explicitly validated defaultValue to ensure it’s not empty if present.

Consistent error messages.

*/
