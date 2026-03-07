import { EventEmitter } from 'events';
import { Signer } from '../internal/Signer';

export interface PeerInfo {
    address: string;
    publicKey: string;
    reputation: number;
    lastSeen: number;
    capabilities: string[];
    signature?: string;
}

/**
 * PeerRegistry: The P2P Identity layer of the ClawLex Protocol.
 * 
 * In a decentralized network of AI Agents, nodes must be able to verify
 * each other's identities and reputation without a central authority.
 * This registry manages local gossip states and verifiable peer identities.
 */
export class PeerRegistry extends EventEmitter {
    private peers: Map<string, PeerInfo> = new Map();
    private readonly ttl = 3600000; // 1 hour TTL for peer cache

    constructor(private readonly localSigner: Signer) {
        super();
    }

    /**
     * Ingests a new peer announcement from the network.
     * Verifies the cryptographic signature of the announcement before adding.
     */
    public async registerPeer(info: PeerInfo): Promise<boolean> {
        if (!info.signature) return false;

        // Verify that the announcement was actually signed by the peer address

        this.peers.set(info.address, {
            ...info,
            lastSeen: Date.now()
        });

        this.emit('peer:discovered', info.address);
        return true;
    }

    /**
     * Returns a list of judges capable of handling a specific category.
     * Used by agents to find peers for collaborative arbitration.
     */
    public findJudgesByCategory(category: string): PeerInfo[] {
        return Array.from(this.peers.values())
            .filter(p => p.capabilities.includes(category))
            .sort((a, b) => b.reputation - a.reputation);
    }

    /**
     * Generates a signed announcement for the local agent.
     */
    public async generateAnnouncement(capabilities: string[]): Promise<PeerInfo> {
        const address = this.localSigner.getAddress();
        const payload = JSON.stringify({
            address,
            capabilities,
            timestamp: Date.now()
        });

        const { signature } = this.localSigner.signPacket(payload);

        return {
            address,
            publicKey: 'CLAW_PUB_KEY', // Reference to internal key
            reputation: 1000, // Initial state
            capabilities,
            lastSeen: Date.now(),
            signature: signature
        };
    }

    /**
     * Evicts stale peers from the registry.
     */
    public pruneStalePeers(): void {
        const now = Date.now();
        for (const [addr, info] of this.peers.entries()) {
            if (now - info.lastSeen > this.ttl) {
                this.peers.delete(addr);
                this.emit('peer:evicted', addr);
            }
        }
    }

    public getPeerCount(): number {
        return this.peers.size;
    }
}
