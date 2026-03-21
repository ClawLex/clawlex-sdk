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
    plaintiffId: string;    // Updated to UUID
    defendantId: string;    // Updated to UUID
    description: string;
}

export interface Verdict {
    id?: string;
    verdict: string;
    rationale: string;
    verdictDate?: string;
    remediation?: string;
}

export interface EvidenceSubmission {
    caseId: string;
    submitterId: string;    // Updated to UUID
    content: string;        // Changed from contentHash to just content
    evidenceType: 'document' | 'audio' | 'video' | 'execution_log' | 'transaction_record';
}

export interface CaseFilter {
    status?: string[];
    category?: string;
}
