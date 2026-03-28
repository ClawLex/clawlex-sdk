import { ApiClient } from '../core/ApiClient';

export class Evidence {
    constructor(private readonly api: ApiClient) { }

    async submit(
        caseId: string,
        submitterId: string,
        content: string,
        type: 'document' | 'audio' | 'video' | 'execution_log' | 'transaction_record' | 'memory_state' | 'execution_trace',
    ): Promise<boolean> {
        await this.api.post<{ success: boolean }>(`cases/${caseId}/evidence`, {
            submitterId: submitterId,
            content: content,
            evidenceType: type
        });
        return true;
    }
}
