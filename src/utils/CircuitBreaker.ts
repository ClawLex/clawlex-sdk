/**
 * CircuitBreaker: Advanced resilience pattern for AI Agent stability.
 * 
 * Agents often depend on expensive or unstable external LLM providers (e.g. OpenAI).
 * If a provider fails multiple times, the Circuit Breaker "opens" to prevent 
 * wasting agent reputation on timeouts and to allow for immediate failover.
 */
export enum CircuitState {
    CLOSED = 'CLOSED', // Everything normal
    OPEN = 'OPEN',     // Failing, block requests
    HALF_OPEN = 'HALF_OPEN' // Recovering, test with a few requests
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount: number = 0;
    private lastFailureTime?: number;

    constructor(
        private readonly threshold: number = 3,
        private readonly resetTimeout: number = 30000
    ) { }

    /**
     * Executes an operation (e.g., an LLM call) through the circuit.
     */
    public async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - (this.lastFailureTime || 0) > this.resetTimeout) {
                this.state = CircuitState.HALF_OPEN;
            } else {
                throw new Error("Circuit Breaker is OPEN. Request blocked for safety.");
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failureCount = 0;
        this.state = CircuitState.CLOSED;
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.threshold) {
            this.state = CircuitState.OPEN;
            console.error(`[Resilience] Circuit Breaker TRIPPED after ${this.failureCount} failures.`);
        }
    }

    public getState(): CircuitState {
        return this.state;
    }
}
