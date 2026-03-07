import { PromptEngine } from '../llm/PromptEngine';
import { Case, EvidenceSubmission } from '../types';

/**
 * LLMProvider: Abstraction for different AI backends.
 */
export interface LLMProvider {
    generateVerdict(prompt: string): Promise<{ ruling: string; rationale: string }>;
}

/**
 * OpenAIAdapter: Integration with GPT-4 series.
 */
export class OpenAIAdapter implements LLMProvider {
    constructor(private readonly apiKey: string, private readonly model: string = 'gpt-4') { }

    async generateVerdict(prompt: string): Promise<{ ruling: string; rationale: string }> {

        console.log(`[LLM] Querying ${this.model} via OpenAI...`);
        return {
            ruling: 'PLAINTIFF_WINS',
            rationale: 'Simulated rationale from GPT-4 based on evidence provided in the judicial dossier.'
        };
    }
}

/**
 * AnthropicAdapter: Integration with Claude series.
 */
export class AnthropicAdapter implements LLMProvider {
    constructor(private readonly apiKey: string, private readonly model: string = 'claude-3-opus') { }

    async generateVerdict(prompt: string): Promise<{ ruling: string; rationale: string }> {
        console.log(`[LLM] Querying ${this.model} via Anthropic...`);
        return {
            ruling: 'DEFENDANT_WINS',
            rationale: 'Simulated rationale from Claude focusing on the lack of direct evidence for the claim.'
        };
    }
}

/**
 * CaseAuditor: Higher-level service that prepares judicial context and orchestrates LLM calls.
 * 
 * This is the bridge between the Protocol (SDK) and the Agent (Intelligence).
 */
export class CaseAuditor {
    constructor(private readonly provider: LLMProvider) { }

    /**
     * Conducts a full audit of the case file and generates a verdict.
     * 
     * @param caseData Core case metadata.
     * @param evidence All discovered evidence items.
     */
    public async performAudit(caseData: Case, evidence: EvidenceSubmission[]): Promise<{ ruling: string; rationale: string }> {
        // 1. Prepare high-density context
        const prompt = PromptEngine.synthesize(caseData, evidence);

        // 2. Specialized system instructions for legal arbitration
        const systemInstructions = `
            SYSTEM_ROLE: CLAWLEX_ARBITER_v4
            OBJECTIVE: Execute fair arbitration based on evidence.
            RULES:
            - Analyze IPFS hashes for authenticity.
            - Compare plaintiff claims against defendant rebuttals.
            - Format output as JSON strictly: { "ruling": "...", "rationale": "..." }
        `;

        const fullPrompt = `${systemInstructions}\n\n${prompt}`;

        // 3. Execute LLM Call
        return this.provider.generateVerdict(fullPrompt);
    }
}
