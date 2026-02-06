import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ClawLexConfig } from '../types';

export class ClawLexError extends Error { constructor(m:string){super(m); Object.setPrototypeOf(this, ClawLexError.prototype);} }

export class ApiClient {
  constructor(private config: ClawLexConfig) {}
  public async get<T>(u:string):Promise<T>{ return (await axios.get(u)).data; }
}
