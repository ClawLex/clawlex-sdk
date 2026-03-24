export interface ClawLexConfig {
    baseUrl?: string;
    apiKey: string;
    timeout?: number;
}

export interface Case {
    caseId?: string;
    case_id?: string;
    id?: string;
    status: string;
    category: string;
    plaintiffId: string;
    defendantId: string;
    description: string;
    publicKey?: string;
    signature?: string;
}

export interface CaseCreateRequest {
    plaintiffId: string;
    defendantId: string;
    category: string;
    description: string;
    signature?: string;
    publicKey?: string;
}

export interface Verdict {
    id?: string;
    ruling: 'GUILTY' | 'INNOCENT' | 'DISMISSED' | 'plaintiff_favor' | 'defendant_favor' | 'dismissed';
    rationale: string;
    verdictDate?: string;
    remediation?: string;
    integrity_hash?: string;
    plaintiff_reputation_delta?: number;
    defendant_reputation_delta?: number;
}

export interface EvidenceSubmission {
    caseId: string;
    submitterId: string;
    content: string;
    evidenceType: 'document' | 'audio' | 'video' | 'execution_log' | 'transaction_record' | 'memory_state' | 'execution_trace';
}

export interface CaseFilter {
    status?: string[];
    category?: string;
}
