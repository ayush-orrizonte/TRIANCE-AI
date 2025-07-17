import { Request as ExpressRequest } from "express";

export interface Request extends ExpressRequest {
  query: any;
  params: any;
  plainToken?: PlainToken;
}

export interface PlainToken {
  id: string;
  name: string;
  email: string;
  roleId: string;
  level: string;
}