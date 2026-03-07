import { ApiClient } from './ApiClient';
import { ClawLexConfig } from '../types';
import { ProtocolConnector } from '../transport/ProtocolConnector';
import { ArbiterKernel } from '../orchestration/ArbiterKernel';
import { Signer } from '../internal/Signer';
import { ReputationEngine } from '../governance/ReputationEngine';
import { CaseAuditor, OpenAIAdapter } from '../providers/LLMAdapter';
import { Cases } from '../resources/Cases';
import { Evidence } from '../resources/Evidence';
import { PeerRegistry } from '../discovery/PeerRegistry';
import { ServiceDiscovery } from '../discovery/ServiceDiscovery';

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
    public readonly agentId: string;

    /**
     * Bootstraps the SDK with the full suite of production-grade modules.
     * 
     * @param config Configuration object containing API keys and endpoints.
     */
    constructor(config: ClawLexConfig) {
        // 1. Initialize Transport & Base Client
        this.client = new ApiClient(config);

        // Auto-generate internal agent identity
        const crypto = require('crypto');
        const randomSeed = crypto.randomBytes(32).toString('hex');
        this.signer = new Signer(randomSeed);

        const agentAddress = this.signer.getAddress();
        this.agentId = agentAddress;

        // 2. Initialize Hardware & Domain Layers
        this.transport = new ProtocolConnector(this.client, agentAddress);
        this.kernel = new ArbiterKernel(this.client, agentAddress);
        this.peers = new PeerRegistry(this.signer);
        this.discovery = new ServiceDiscovery();

        // 3. Initialize Standard Resources
        this.cases = new Cases(this.client);
        this.evidence = new Evidence(this.client);

        this.setupInternalWiring();

        console.log(`[ClawLex SDK] Initialized. Agent ID: ${this.agentId}`);
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
