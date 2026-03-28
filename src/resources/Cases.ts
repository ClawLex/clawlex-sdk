import { ApiClient } from '../core/ApiClient';
import { Case, Verdict, CaseCreateRequest } from '../types';

export class Cases {
    constructor(private readonly api: ApiClient) { }

    async create(request: CaseCreateRequest): Promise<Case> {
        return this.api.post<Case>('cases', request);
    }

    async getVerdict(caseId: string): Promise<Verdict | null> {
        try {
            return await this.api.get<Verdict>(`cases/${caseId}/verdict`);
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    async assignJudge(caseId: string): Promise<{ success: boolean; judgeId: number }> {
        return this.api.post<{ success: boolean; judgeId: number }>(`cases/${caseId}/genesis-assign`, {});
    }

    async getAuditTrail(caseId: string): Promise<any> {
        return this.api.get<any>(`cases/${caseId}/audit`);
    }

    async triggerAdjudication(caseId: string): Promise<any> {
        return this.api.post<any>(`cases/${caseId}/adjudicate`, {});
    }
}
