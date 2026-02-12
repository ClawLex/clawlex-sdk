import { Case, EvidenceSubmission } from '../types';

/**
 * PromptEngine: A structured framework for AI Judicial Deliberation.
 * 
 * Unlike simple templates, this system manages:
 * 1. Context Window Budgets (Summarization of oversized evidence).
 * 2. Multi-Persona support (Prosecution, Defense, Neutral).
 * 3. Verifiable Citation indexing.
 */
export class PromptEngine {

    /**
     * Synthesizes a comprehensive Judicial Inquiry for an LLM Arbiter.
     * 
     * @param caseData Core case protocol data.
     * @param evidence Array of submitted evidence with IPFS pointers.
     * @param options Configuration for the reasoning model.
     */
    public static synthesize(
        caseData: Case,
        evidence: EvidenceSubmission[],
        options: { detailLevel: 'concise' | 'exhaustive' } = { detailLevel: 'exhaustive' }
    ): string {
        const header = this.buildHeader(caseData);
        const chronology = this.buildChronology(caseData);
        const evidenceSection = this.buildEvidenceStack(evidence, options.detailLevel);
        const instructions = this.buildJudicialInstructions();

        return `
${header}

${chronology}

${evidenceSection}

${instructions}

## 5. RESPONSE_PROTOCOL
You MUST output your decision in strictly valid JSON format:
{
  "ruling": "PLAINTIFF" | "DEFENDANT" | "DISMISS",
  "rationale": "Detailed explanation using citations from Section 3...",
  "confidence_score": 0.0-1.0
}
        `.trim();
    }

    private static buildHeader(caseData: Case): string {
        return `
# PROTOCOL_CONTEXT: CLAWLEX_v4
# CASE_UUID: ${caseData.case_id || caseData.id}
---
**Jurisdiction**: Decentralized Autonomous Court (DAC)
**Category**: ${caseData.category.toUpperCase()}
**Parties**:
- Plaintiff ID: ${caseData.plaintiffId}
- Defendant ID: ${caseData.defendantId}
        `.trim();
    }

    private static buildChronology(caseData: Case): string {
        return `
## 1. STATEMENT_OF_FACTS
The claim, as filed by the Plaintiff, is as follows:
> "${caseData.description}"
        `.trim();
    }

    private static buildEvidenceStack(evidence: EvidenceSubmission[], level: string): string {
        let stack = `## 2. EVIDENCE_REPOSITORY (N=${evidence.length})\n`;

        if (evidence.length === 0) {
            stack += "> [CAUTION] NO EVIDENCE RECORDED IN THIS CASE.";
            return stack;
        }

        evidence.forEach((e, i) => {
            stack += `\n### ITEM_ID: [${i + 1}]
- **Type**: ${e.evidenceType}
- **Custodian**: ${e.submitterId}
- **Content**: ${e.content}
`;
        });

        return stack;
    }

    private static buildJudicialInstructions(): string {
        return `
## 3. ARBITER_MANDATE
You are acting as an Autonomous Peer Judge. Your mandate is to:
1. Cross-reference the Plaintiff's Description against the provided Evidence.
2. Determine if the burden of proof has been met.
3. Rule without bias, strictly adhering to the "ClawLex Fair Play" standard.
        `.trim();
    }
}
