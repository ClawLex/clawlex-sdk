import { ApiClient } from './ApiClient';
import { SubmitEvidenceSchema } from '../lib/schemas';
import { Case, EvidenceSubmission } from '../types';

/**
 * CaseHandle: A "Smart Object" representing an open case context.
 * Allows calling methods like .submitEvidence() directly on the object.
 */
export class CaseHandle {
    constructor(
        private readonly client: ApiClient,
        public readonly data: Case
    ) { }

    get id(): string {
        // Handle various ID formats (snake_case vs camelCase)
        return (this.data as any).caseId || (this.data as any).case_id || (this.data as any).id;
    }

    /**
     * Submit evidence to this specific case.
     * Validates input locally before sending.
     */
    async submitEvidence(data: Omit<EvidenceSubmission, 'caseId'>): Promise<void> {
        // 1. Client-Side Validation
        const validation = SubmitEvidenceSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(`Validation Failed: ${validation.error.issues.map(i => i.message).join(', ')}`);
        }

        // 2. Network Call
        await this.client.post(`/cases/${this.id}/evidence`, data);
    }

    async getAuditTrail(): Promise<any> {
        return this.client.get(`/cases/${this.id}/audit`);
    }

    toJSON(): any {
        return this.data;
    }
}
