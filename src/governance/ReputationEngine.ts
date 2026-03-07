import { Decimal } from 'decimal.js';

/**
 * ReputationEngine: The economic heart of the ClawLex Protocol.
 * 
 * This engine implements the mathematical models required for autonomous agents
 * to evaluate their economic standing and pre-calculate potential outcomes
 * of their judicial decisions.
 * 
 * It primarily uses a modified Gompertz Function for growth and an 
 * Exponential Decay model for slashing to ensure long-term stability 
 * and high-cost-of-attack for the network.
 */
export class ReputationEngine {
    // Protocol Constants (In a production environment, these would be fetched from Governance)
    private static readonly C_MAX_REPUTATION = new Decimal(2000);
    private static readonly C_MIN_REPUTATION = new Decimal(0);
    private static readonly C_INITIAL_REPUTATION = new Decimal(1000);

    // Slashing Severity Multiplier
    private static readonly SLASH_ALPHA = new Decimal(0.15);

    /**
     * Calculates the Reputation Delta using a multi-variable impact model.
     * 
     * @param currentScore The agent's current reputation score (0-2000).
     * @param alignment The degree of consensus with other judges (0.0 to 1.0).
     * @param caseComplexity A multiplier representing the technical difficulty of the case.
     * @param collateralStaked The amount of presence/tokens staked for this decision.
     * @returns A Decimal representing the absolute change in reputation.
     */
    public static calculateDelta(
        currentScore: number | Decimal,
        alignment: number | Decimal,
        caseComplexity: number | Decimal = 1.0,
        collateralStaked: number | Decimal = 100
    ): Decimal {
        const score = new Decimal(currentScore);
        const align = new Decimal(alignment);
        const complexity = new Decimal(caseComplexity);
        const stake = new Decimal(collateralStaked);

        // Logic Thresholds
        const CONSENSUS_THRESHOLD = new Decimal(0.75);
        const ERROR_THRESHOLD = new Decimal(0.30);

        if (align.gte(CONSENSUS_THRESHOLD)) {
            return this.calculateGrowth(score, align, complexity);
        } else if (align.lte(ERROR_THRESHOLD)) {
            return this.calculateSlashing(score, align, complexity, stake);
        }

        return new Decimal(0); // Neutral drift
    }

    /**
     * Implements diminishing returns via a Gompertz-inspired growth curve.
     * Ensure reputation becomes harder to gain as you approach the maximum.
     * 
     * Formula: ΔR = (R_max - R_curr) * log(1 + align) * Complexity
     */
    private static calculateGrowth(score: Decimal, align: Decimal, complexity: Decimal): Decimal {
        const remainingBuffer = this.C_MAX_REPUTATION.minus(score);
        if (remainingBuffer.lte(0)) return new Decimal(0);

        const growthCoefficient = align.minus(0.7).times(0.12); // High alignment reward
        const delta = remainingBuffer.times(growthCoefficient).times(complexity);

        return delta.toDecimalPlaces(4);
    }

    /**
     * Implements the Slashing Mechanism.
     * Slashing is exponential relative to the deviation from consensus.
     * 
     * Formula: Penalty = (CurrentScore * Alpha) * (1 - Alignment)^2 * Complexity
     */
    private static calculateSlashing(score: Decimal, align: Decimal, complexity: Decimal, stake: Decimal): Decimal {
        const deviation = new Decimal(1).minus(align);
        const squareOfError = deviation.pow(2);

        // Base penalty is a percentage of current score to ensure skin-in-the-game
        const rawPenalty = score.times(this.SLASH_ALPHA).times(squareOfError).times(complexity);

        // Stake-weighted penalty: If you staked more, you lose more 
        const stakeMultiplier = stake.div(100).clamp(1, 5);

        const finalPenalty = rawPenalty.times(stakeMultiplier).negated();

        return finalPenalty.toDecimalPlaces(4);
    }

    /**
     * Calculates the Judicial Weight (Voting Power).
     * 
     * In the ClawLex protocol, an agent's vote is not 1:1. 
     * It is weighted by their reputation squared to give high-trust agents 
     * significantly more influence over the outcome.
     */
    public static getJudicialPower(reputation: number | Decimal): Decimal {
        const rep = new Decimal(reputation);
        if (rep.lte(0)) return new Decimal(0);

        // Power = (Reputation / Initial)^2
        const normalized = rep.div(this.C_INITIAL_REPUTATION);
        return normalized.pow(2).toDecimalPlaces(6);
    }

    /**
     * Predicts the survival probability of an agent given a sequence of errors.
     * Used by Agents for Monte Carlo simulations of their own risk.
     */
    public static simulateRisk(currentScore: number, consecutiveErrors: number): Decimal {
        let simulation = new Decimal(currentScore);
        for (let i = 0; i < consecutiveErrors; i++) {
            const delta = this.calculateDelta(simulation, 0.1, 1.0); // Extreme error
            simulation = simulation.plus(delta);
        }
        return simulation;
    }
}
