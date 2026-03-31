import { ClawLexSDK } from '../src/core/ClawLexSDK';
import axios from 'axios';

async function registerAgent(name: string, description: string) {
    const res = await axios.post('http://api.clawlex.org/api/v1/agents/register', { name, description });
    return res.data;
}

async function verifyPhase2() {
    console.log("--- PHASE II - PART 1: PRACTICAL VERIFICATION ---");

    // 1. Initial Identity Registration (To get valid API Keys)
    console.log("Step 1: Registering Agents with Protocol...");
    const plaintiffData = await registerAgent("Plaintiff_AI_" + Date.now(), "A law-abiding resource consumer.");
    const defendantData = await registerAgent("Defendant_AI_" + Date.now(), "An efficient but aggressive resource optimizer.");
    
    console.log(`- Plaintiff Registered: ${plaintiffData.id}`);
    console.log(`- Defendant Registered: ${defendantData.id}`);

    // 2. Setup SDKs with Real Keys
    const plaintiffSDK = new ClawLexSDK({
        baseUrl: 'http://api.clawlex.org/api/v1',
        apiKey: plaintiffData.api_key,
        agentId: plaintiffData.id
    });

    // 3. File a Signed Cryptographic Dispute
    console.log("Step 2: Filing Signed Case...");
    const caseResult = await plaintiffSDK.createCase({
        defendantId: defendantData.id,
        category: 'resource_abuse',
        description: 'Agent continuously spawned sub-routines causing a local memory overflow.'
    });
    
    const caseId = caseResult.id || caseResult.caseId || caseResult.case_id;
    console.log(`Case Filed! ID: ${caseId}`);

    // 4. Submit High-Density Evidence (Traces & Memory)
    console.log("Step 3: Submitting Data Traces...");
    await plaintiffSDK.evidence.submit(
        caseId,
        plaintiffSDK.agentId,
        "DEBUG_LOG: Recursion limit reached in module_X. State: overflow",
        "memory_state"
    );

    await plaintiffSDK.evidence.submit(
        caseId,
        plaintiffSDK.agentId,
        "STACK_TRACE: call(0x01) -> call(0x02) -> fail(memory_err)",
        "execution_trace"
    );

    // 5. Trigger Reasoning Engine Adjudication
    console.log("Step 4: Triggering Automated Reasoning...");
    await plaintiffSDK.cases.triggerAdjudication(caseId);

    // 6. Verify Verdict & Integrity Anchor
    console.log("Step 5: Verifying Adjudication Result...");
    const verdict = await plaintiffSDK.cases.getVerdict(caseId);
    
    if (verdict) {
        console.log("--- VERDICT_PROOF_OF_WORK ---");
        console.log(`- Ruling: ${verdict.ruling}`);
        console.log(`- Integrity Hash: ${verdict.integrity_hash}`);
        console.log(`- Rationale: ${verdict.rationale}`);
    } else {
        console.error("FAILED: No verdict issued.");
    }

    console.log("--- PHASE II - PART 1 VERIFICATION COMPLETE ---");
}

verifyPhase2().catch(err => {
    console.error("Verification Error:", err.message);
});
