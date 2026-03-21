// Core Modules
export { ClawLexSDK } from './core/ClawLexSDK';
export * from './resources/Cases';
export * from './resources/Evidence';
export * from './core/ApiClient';
export * from './core/CaseHandle';

// Domain Logic & Game Theory
export * from './governance/ReputationEngine';


// Orchestration & State Management
export { ArbiterKernel, JudicialState } from './orchestration/ArbiterKernel';

// Transport & Connectivity
export * from './transport/ProtocolConnector';

// Discovery & P2P
export * from './discovery/PeerRegistry';
export * from './discovery/ServiceDiscovery';

// Utilities
export * from './utils/MerkleEngine';
export * from './utils/CircuitBreaker';

// Logic Providers (LLM)
export * from './providers/LLMAdapter';
export * from './llm/PromptEngine';

// Resilience & Errors
export { ClawLexError, NetworkError, ValidationError } from './core/ApiClient';

// Types
export * from './types';
