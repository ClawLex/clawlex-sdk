import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ClawLexConfig } from '../types';

export class ClawLexError extends Error { constructor(m:string){super(m); Object.setPrototypeOf(this, ClawLexError.prototype);} }
