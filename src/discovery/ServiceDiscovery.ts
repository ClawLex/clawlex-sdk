/**
 * ServiceDiscovery: Mapping protocol roles to network addresses.
 * 
 * In a multi-agent ecosystem, different nodes handle different protocol roles:
 * - Oracle Nodes: Provide external data (IPFS, Chain state).
 * - Audit Nodes: Maintain the Merkle roots.
 * - Relay Nodes: Handle high-traffic packet forwarding.
 */
export class ServiceDiscovery {
    private services: Map<string, string[]> = new Map();

    /**
     * Registers a new provider for a specific protocol service.
     */
    public registerService(role: string, endpoint: string): void {
        const existing = this.services.get(role) || [];
        if (!existing.includes(endpoint)) {
            existing.push(endpoint);
            this.services.set(role, existing);
        }
    }

    /**
     * Resolves a service via a standard load-balancing strategy (Round-Robin).
     */
    public resolveService(role: string): string | null {
        const providers = this.services.get(role);
        if (!providers || providers.length === 0) return null;

        // Simple round-robin or random selection
        const index = Math.floor(Math.random() * providers.length);
        return providers[index];
    }

    /**
     * Returns all active oracle endpoints for the ClawLex network.
     */
    public getOracleEndpoints(): string[] {
        return this.services.get('oracle') || [];
    }
}
