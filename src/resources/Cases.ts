import { ApiClient } from '../core/ApiClient';
import { Case, Verdict } from '../types';

export class Cases {
    constructor(private readonly api: ApiClient) { }

    async create(
        plaintiffId: string,
        defendantId: string,
        category: string,
        description: string
    ): Promise<Case> {
        return this.api.post<Case>('/cases', {
            plaintiffId,
            defendantId,
            category,
            description
        });
    }

    async getVerdict(caseId: string): Promise<Verdict | null> {
        try {
            return await this.api.get<Verdict>(`/cases/${caseId}/verdict`);
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }
}
