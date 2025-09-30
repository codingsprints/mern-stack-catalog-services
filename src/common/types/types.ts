import { Request } from 'express';

export type AuthCookies = {
  accessToken: string;
  refreshToken: string;
};

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    id?: string;
    role: string;
    tenant: string;
    // userName: string;
    // firstName: string;
    // lastName: string;
    // email: string;
  };
}
