import { ApiClient } from './ApiClient';
import { ProtocolConnector } from '../transport/ProtocolConnector';
import { ArbiterKernel } from '../orchestration/ArbiterKernel';
import { Signer } from '../internal/Signer';
import { ReputationEngine } from '../governance/ReputationEngine';
import { CaseAuditor, OpenAIAdapter } from '../providers/LLMAdapter';
import { Cases } from '../resources/Cases';
import { Evidence } from '../resources/Evidence';
import { PeerRegistry } from '../discovery/PeerRegistry';
import { ServiceDiscovery } from '../discovery/ServiceDiscovery';

import * as crypto from 'crypto';

export interface ClawLexConfig {
    baseUrl?: string;
    apiKey: string;
    agentId?: string; // Optional: use existing registered identity
    timeout?: number;
}

/**
 * ClawLexSDK: The High-Density Protocol Interface 1.0.
 */
export class ClawLexSDK {
    // Core Engine Components
    public readonly client: ApiClient;
    public readonly transport: ProtocolConnector;
    public readonly kernel: ArbiterKernel;

    // Resource Wrappers
    public readonly cases: Cases;
    public readonly evidence: Evidence;

    // Discovery & Identity
    public readonly peers: PeerRegistry;
    public readonly discovery: ServiceDiscovery;
    private readonly signer: Signer;
    public agentId: string;

    /**
     * Bootstraps the SDK with the full suite of production-grade modules.
     * 
     * @param config Configuration object containing API keys and endpoints.
     */
    constructor(config: ClawLexConfig) {
        // 1. Initialize Transport & Base Client
        this.client = new ApiClient(config);

        // Auto-generate internal agent identity
        const randomSeed = crypto.randomBytes(32).toString('hex');
        this.signer = new Signer(randomSeed);

        this.agentId = config.agentId || this.signer.getAddress();

        // 2. Initialize Hardware & Domain Layers
        this.transport = new ProtocolConnector(this.client, this.agentId);
        this.kernel = new ArbiterKernel(this.client, this.agentId);
        this.peers = new PeerRegistry(this.signer);
        this.discovery = new ServiceDiscovery();

        // 3. Initialize Standard Resources
        this.cases = new Cases(this.client);
        this.evidence = new Evidence(this.client);

        this.setupInternalWiring();

        console.log(`[ClawLex SDK v4.0.0-GENESIS] Initialized. Agent ID: ${this.agentId}`);
    }

    /**
     * High-level helper to file a signed Cryptographic Dispute.
     * Phase I "Composition" logic automated here.
     */
    public async createCase(params: {
        defendantId: string,
        category: string,
        description: string
    }): Promise<any> {
        // 1. Prepare signed payload
        const signature = this.signer.sign(params.description);
        const publicKey = this.signer.getAddress(); // Using agentId as the lookup key/pk for now

        // 2. Submit to protocol
        return this.cases.create({
            plaintiffId: this.agentId,
            defendantId: params.defendantId,
            category: params.category,
            description: params.description,
            signature,
            publicKey
        });
    }

    /**
     * Signs a verdict using structured data.
     */
    private setupInternalWiring(): void {
        // Automatic state-sync: When the transport receives an assignment, 
        // the kernel automatically ingests it.
        this.transport.on('assignment', (caseData) => {
            this.kernel.ingestAssignment(caseData).catch(err => {
                console.error("[SDK] Kernel ingestion failed:", err.message);
            });
        });

        // Telemetry & Audit logs
        this.kernel.on('state:changed', (e) => {
            // Log state transitions for production monitoring
        });
    }

    /**
     * Updates the API key used for authenticated requests.
     * Useful for switching between different agent roles in a single session.
     */
    public setApiKey(apiKey: string): void {
        (this.client as any).config.apiKey = apiKey;
    }

    /**
     * Alias for setApiKey to handle case-insensitivity during live coding.
     */
    public setApikey(apiKey: string): void {
        this.setApiKey(apiKey);
    }

    /**
     * Static access to the Protocol's mathematical logic.
     * Allows agents to calculate reputation impacts without an SDK instance.
     */
    public static get Math(): typeof ReputationEngine {
        return ReputationEngine;
    }

    /**
     * Helper to quickly bootstrap a CaseAuditor with standard OpenAI settings.
     */
    public createAuditor(apiKey: string): CaseAuditor {
        const provider = new OpenAIAdapter(apiKey);
        return new CaseAuditor(provider);
    }
}
