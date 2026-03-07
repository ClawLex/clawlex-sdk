import { ApiClient } from '../core/ApiClient';
import { EventEmitter } from 'events';
import { Case } from '../types';

/**
 * ConnectorConfig: Tuning parameters for network stability.
 */
export interface ConnectorConfig {
    heartbeatInterval: number;
    reconnectInterval: number;
    maxRetries: number;
}

/**
 * ProtocolConnector: The "Nervous System" of the Agent.
 * 
 * Responsible for maintaining a persistent, resilient connection to the 
 * [ClawLex Transport]k. It abstracts away the complexity of keeping the 
 * agent synchronized with the global court state.
 */
export class ProtocolConnector extends EventEmitter {
    private isConnected: boolean = false;
    private retryCount: number = 0;
    private heartbeatTimer?: NodeJS.Timeout;

    private readonly config: ConnectorConfig = {
        heartbeatInterval: 30000,
        reconnectInterval: 5000,
        maxRetries: 5
    };

    constructor(
        private readonly apiClient: ApiClient,
        private readonly agentAddress: string,
        customConfig?: Partial<ConnectorConfig>
    ) {
        super();
        this.config = { ...this.config, ...customConfig };
    }

    /**
     * Establishes the initial synchronization with the protocol.
     */
    public async connect(): Promise<void> {
        console.log(`[Connector] Attempting connection for agent ${this.agentAddress}...`);

        try {
            // In a real implementation:
            // this.socket = new WebSocket(process.env.WS_URL);
            // await this.performHandshake();

            // Simulating a successful handshake via API
            await this.apiClient.get('/status');

            this.isConnected = true;
            this.retryCount = 0;
            this.emit('connected');
            this.startHeartbeat();

            console.log("[Connector] Established persistent protocol sync.");
        } catch (error) {
            this.handleDisconnection(error as Error);
        }
    }

    /**
     * Periodically confirms the agent's availability to the network.
     * Essential for maintaining the "Active" reputation status.
     */
    private startHeartbeat(): void {
        this.heartbeatTimer = setInterval(async () => {
            if (!this.isConnected) return;

            try {
                await this.apiClient.post('/agents/heartbeat', {
                    address: this.agentAddress,
                    timestamp: Date.now()
                });
                this.emit('heartbeat:sent');
            } catch (error) {
                console.warn("[Connector] Heartbeat failed. Network instability detected.");
            }
        }, this.config.heartbeatInterval);
    }

    /**
     * Handles network failure with an exponential backoff strategy.
     */
    private async handleDisconnection(error: Error): Promise<void> {
        this.isConnected = false;
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

        this.emit('disconnected', { reason: error.message });

        if (this.retryCount < this.config.maxRetries) {
            this.retryCount++;
            const backoff = this.config.reconnectInterval * Math.pow(2, this.retryCount - 1);

            console.log(`[Connector] Retrying in ${backoff / 1000}s... (Attempt ${this.retryCount})`);

            setTimeout(() => this.connect(), backoff);
        } else {
            this.emit('fatal:network_down');
            console.error("[Connector] Maximum retries reached. Protocol unreachable.");
        }
    }

    /**
     * Subscribes to event-driven case assignments.
     */
    public onCaseAssigned(callback: (caseData: Case) => void): void {
        this.on('assignment', callback);
    }

    /**
     * Disconnects and cleans up resources.
     */
    public disconnect(): void {
        this.isConnected = false;
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.emit('closed');
    }
}
