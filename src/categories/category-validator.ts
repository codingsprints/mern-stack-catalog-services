import { body } from 'express-validator';

export default [
  // Validate category name
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('Category name is required')
    .isString()
    .withMessage('Category name should be a string'),

  // Validate priceConfiguration object
  body('priceConfiguration')
    .exists({ checkFalsy: true })
    .withMessage('Price configuration is required')
    .isObject()
    .withMessage('Price configuration must be an object'),

  // Validate each priceConfiguration.*.priceType
  body('priceConfiguration.*.priceType')
    .exists({ checkFalsy: true })
    .withMessage('Price type is required')
    .isString()
    .withMessage('Price type must be a string')
    .custom((value: string) => {
      const validKeys = ['base', 'aditional'];
      if (!validKeys.includes(value)) {
        throw new Error(
          `${value} is invalid for priceType. Possible values: ${validKeys.join(', ')}`,
        );
      }
      return true;
    }),

  // Validate each priceConfiguration.*.availableOptions
  body('priceConfiguration.*.availableOptions')
    .exists({ checkFalsy: true })
    .withMessage('Available options are required')
    .isArray()
    .withMessage('Available options should be an array of strings')
    .custom((arr: unknown[]) => arr.every((item) => typeof item === 'string'))
    .withMessage('Each available option must be a string'),

  // Validate attributes array
  body('attributes')
    .exists({ checkFalsy: true })
    .withMessage('Attributes field is required')
    .isArray({ min: 1 })
    .withMessage('Attributes must be a non-empty array'),

  // Validate each attribute's fields
  body('attributes.*.name')
    .exists({ checkFalsy: true })
    .withMessage('Attribute name is required')
    .isString()
    .withMessage('Attribute name should be a string'),

  body('attributes.*.widgetType')
    .exists({ checkFalsy: true })
    .withMessage('Widget type is required')
    .isString()
    .withMessage('Widget type must be a string')
    .custom((value: string) => {
      const validWidgetTypes = ['switch', 'radio'];
      if (!validWidgetTypes.includes(value)) {
        throw new Error(
          `${value} is invalid for widgetType. Possible values: ${validWidgetTypes.join(', ')}`,
        );
      }
      return true;
    }),

  body('attributes.*.defaultValue')
    .exists({ checkFalsy: true })
    .withMessage('Default value is required'),

  body('attributes.*.availableOptions')
    .exists({ checkFalsy: true })
    .withMessage('Attribute availableOptions is required')
    .isArray()
    .withMessage('availableOptions must be an array of strings')
    .custom((arr: unknown[]) => arr.every((item) => typeof item === 'string'))
    .withMessage('Each available option in attributes must be a string'),
];

/*
It validates name (string).

It validates priceConfiguration as an object.

It validates each priceType to be either 'base' or 'aditional'.

It validates availableOptions in priceConfiguration as an array of strings.

It validates attributes as a non-empty array.

It validates each attribute’s name, widgetType, defaultValue, and availableOptions.

*/
