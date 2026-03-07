import { z } from 'zod';

export const CreateCaseSchema = z.object({
    plaintiffId: z.string().min(1, "Plaintiff ID required"),
    defendantId: z.string().min(1, "Defendant ID required"),
    category: z.string().min(1, "Category required"),
    description: z.string().min(10, "Description must be at least 10 chars")
});

export const SubmitEvidenceSchema = z.object({
    submitterId: z.string().min(1, "Submitter ID required"),
    content: z.string().min(1, "Content required"),
    evidenceType: z.union([
        z.literal('document'),
        z.literal('audio'),
        z.literal('video'),
        z.literal('execution_log'),
        z.literal('transaction_record')
    ])
});
