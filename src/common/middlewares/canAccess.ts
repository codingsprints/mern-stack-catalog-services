import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { AuthRequest } from '../types/types';

export const canAccess = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const _req = req as AuthRequest;
    const roleFromToken = _req.auth.role;
    // const targetRole = req.body.role || '';

    if (!allowedRoles.includes(roleFromToken)) {
      const error = createHttpError(403, "You don't have enough permissions");

      next(error);
      return;
    }

    // Role-specific restrictions
    // const restrictedTargetRoles: Record<string, string[]> = {
    //   manager: ['admin'], // Managers cannot act on 'admin' roles
    // };

    // if (
    //   restrictedTargetRoles?.[roleFromToken] &&
    //   restrictedTargetRoles?.[roleFromToken]?.includes(targetRole)
    // ) {
    //   return next(
    //     createHttpError(
    //       403,
    //       `You cannot perform this action on the '${targetRole}' role`,
    //     ),
    //   );
    // }
    next();
  };
};
