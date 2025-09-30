import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { v4 as uuidV4 } from 'uuid';

// Middleware to handle validation
export const validate = (validations: ValidationChain[]): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const errorId = uuidV4();
      // Run all validations
      await Promise.all(validations.map((validation) => validation.run(req)));

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          id: errorId,
          path: req.url,
          method: req.method,
          type: errors?.array()[0]?.type,
          msg: errors?.array()[0]?.msg,
          errors: errors.array(),
          error: true,
        });
        return;
      }

      // Proceed to next middleware
      next();
    } catch (err) {
      next(err);
    }
  };
};
