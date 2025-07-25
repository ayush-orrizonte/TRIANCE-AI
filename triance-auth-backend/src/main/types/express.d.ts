import { Request as ExpressRequest } from "express";

export interface Request extends ExpressRequest {
    
    plainToken?: PlainToken;
}

export interface PlainToken {
    id: number;
    name: string;
    email: string;
    role_id: number;
    level: string;
    
  }
  
