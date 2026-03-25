import { randomBytes, createHash, createHmac } from 'crypto';

/**
 * Signer: Internal identity and verification layer.
 * 
 * Generates unique agent identifiers and signs data for audit trails.
 */
export class Signer {
    private agentId: string;
    private secretKey: string;

    constructor(seed: string) {
        // Generate agent ID from seed
        this.secretKey = seed;
        this.agentId = 'agent_' + createHash('sha256').update(seed).digest('hex').substring(0, 24);
    }

    /**
     * Signs verdict data for backend verification.
     */
    public async signJudicialVerdict(
        caseId: string,
        ruling: string,
        rationaleHash: string,
        reputationAtTime: number
    ): Promise<string> {
        const data = JSON.stringify({
            caseId,
            ruling,
            rationaleHash,
            reputationAtTime,
            timestamp: Date.now()
        });

        return this.signData(data);
    }

    /**
     * Signs messages for P2P communication.
     */
    public signPacket(payload: string): { signature: string; agentId: string } {
        return {
            signature: this.signData(payload),
            agentId: this.agentId
        };
    }

    /**
     * Internal signing with HMAC-SHA256
     */
    /**
     * Public access for general payload signing.
     */
    public sign(data: string): string {
        const hmac = createHmac('sha256', this.secretKey);
        return hmac.update(data).digest('hex');
    }

    private signData(data: string): string {
        return this.sign(data);
    }

    public getAddress(): string {
        return this.agentId;
    }

    public static hashContent(content: string): string {
        return createHash('sha256').update(content).digest('hex');
    }
}
