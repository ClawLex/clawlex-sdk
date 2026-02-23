
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ClawLexConfig } from '../types';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';

// --- Custom Error Types ---

export class ClawLexError extends Error {
    constructor(message: string, public readonly code?: string, public readonly details?: any) {
        super(message);
        Object.setPrototypeOf(this, ClawLexError.prototype);
        this.name = 'ClawLexError';
    }
}

export class NetworkError extends ClawLexError {
    constructor(message: string, public readonly statusCode?: number) {
        super(message, 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}

export class ValidationError extends ClawLexError {
    constructor(message: string, public readonly fields?: any) {
        super(message, 'VALIDATION_ERROR', fields);
        this.name = 'ValidationError';
    }
}

// --- Telemetry Interface ---

interface RequestTelemetry {
    requestId: string;
    startTime: number;
    url: string;
    method: string;
}

/**
 * ApiClient: The core network engine for the ClawLex SDK.
 * Handles:
 * - Automatic Retries with Exponential Backoff
 * - Request/Response Interception for Telemetry
 * - Authentication Injection
 * - Standardized Error Handling
 */
export class ApiClient {
    public readonly client: AxiosInstance;
    private readonly config: ClawLexConfig;
    private activeRequests: Map<string, RequestTelemetry> = new Map();

    constructor(config: ClawLexConfig) {
        this.config = config;

        // Initialize Axios with default configuration
        this.client = axios.create({
            baseURL: config.baseUrl || 'https://clawlex.org/api/v1',
            timeout: config.timeout || 10000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ClawLexSDK/1.0.0 (NodeJS)',
                'x-unique-id': this.generateRequestId()
            }
        });

        // Setup Resilience Policies
        this.setupRetryLogic();

        // Setup Interceptors
        this.setupInterceptors();
    }

    /**
     * Configures automatic retry logic for network failures and 429s.
     * Uses exponential backoff to avoid thundering herd problems.
     */
    private setupRetryLogic() {
        const retryConfig: IAxiosRetryConfig = {
            retries: 3,
            retryDelay: (retryCount) => {
                const delay = axiosRetry.exponentialDelay(retryCount);
                // Add Jitter
                return delay + Math.random() * 100;
            },
            retryCondition: (error: AxiosError) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
            },
            onRetry: (retryCount, error, requestConfig) => {
                console.warn(`[ * ClawLexSDK: The High-Density Protocol Interface 1.0. Retrying request to ${requestConfig.url}... Attempt ${retryCount}/3`);
            }
        };
        axiosRetry(this.client, retryConfig);
    }

    /**
     * Configures Request and Response interceptors for Authentication and Telemetry.
     */
    private setupInterceptors() {
        // Request Interceptor
        this.client.interceptors.request.use((config) => {
            const requestId = this.generateRequestId();
            config.headers['x-request-id'] = requestId;

            // Inject Auth Token
            if (this.config.apiKey) {
                config.headers['x-api-key'] = this.config.apiKey;
            }

            // Start Telemetry
            this.activeRequests.set(requestId, {
                requestId,
                startTime: Date.now(),
                url: config.url || '',
                method: config.method?.toUpperCase() || 'GET'
            });

            return config;
        }, (error) => Promise.reject(error));

        // Response Interceptor
        this.client.interceptors.response.use(
            (response) => {
                this.logTelemetry(response.config);
                return response;
            },
            (error: AxiosError) => {
                this.logTelemetry(error.config);
                return Promise.reject(this.normalizeError(error));
            }
        );
    }

    /**
     * Logs performance metrics for the request.
     */
    private logTelemetry(config?: AxiosRequestConfig) {
        const requestId = config?.headers?.['x-request-id'] as string;
        if (!requestId || !this.activeRequests.has(requestId)) return;

        const telemetry = this.activeRequests.get(requestId)!;
        const duration = Date.now() - telemetry.startTime;
        this.activeRequests.delete(requestId);

        // Silent logging or emit event
        // console.debug(`[Telemetry] ${telemetry.method} ${telemetry.url} took ${duration}ms`);
    }

    /**
     * Converts raw Axios errors into strongly typed ClawLex errors.
     */
    private normalizeError(error: AxiosError): ClawLexError {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as any;
            const msg = data?.error || error.message;

            if (status === 400 || status === 422) {
                return new ValidationError(msg, data?.details);
            }
            return new NetworkError(msg, status);
        }
        if (error.request) {
            return new NetworkError('No response received from ClawLex Gateway. Check internet connection.');
        }
        return new ClawLexError(error.message);
    }

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // --- Public Methods ---

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}
