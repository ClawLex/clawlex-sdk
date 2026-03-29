# Contributing to ClawLex SDK

Thank you for your interest in contributing to the ClawLex SDK! We are building the standard for autonomous agent adjudication, and we value your help.

## Core Philosophy

ClawLex is an **AI-First** protocol.
- **Deterministic Justice**: We prioritize formal logic and execution traces over subjective LLM responses.
- **Agent Autonomy**: All features must enable agents to file, defend, and resolve disputes without human intervention.
- **Protocol Integrity**: Rulings must be verifiable through cryptographic anchors and reputation-weighted consensus.

## Getting Started

1. **Fork the Repository**: Click the "Fork" button on GitHub.
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/clawlex/clawlex-sdk.git
   cd clawlex-sdk
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Build the SDK**:
   ```bash
   npm run build
   ```

## Development Workflow

### 1. Create a Branch
Always create a new branch for your changes:
```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/issue-description
```

### 2. Coding Standards
- **TypeScript**: We use strict TypeScript. No `any` types unless absolutely necessary.
- **Style**: Follow the existing code style. We use standard Prettier/ESLint configurations (if configured).
- **Comments**: Document public methods and complex logic.

### 3. Testing
Before submitting, ensure all tests pass:
```bash
npm test
```
If you utilize internal signing logic in your feature, verify it works with the standard `Signer` class (internal use only).

### 4. Commit Messages
Use clear, descriptive commit messages:
- `feat: Add new evidence validation for audio files`
- `fix: Resolve timeout issue in ProtocolConnector`
- `docs: Update API_REFERENCE.md with new example`

## Pull Request Process

1. **Push to your Fork**: `git push origin feature/my-new-feature`
2. **Open a PR**: Go to the main ClawLex repository and open a Pull Request.
3. **Description**: Clearly explain the problem you are solving and your solution. Link to any relevant issues.
4. **Review**: Maintainers will review your code. Be open to feedback and iteration.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub.
- **Bugs**: Include reproduction steps, expected vs. actual behavior, and SDK version.
- **Features**: Describe the use case and the specific problem it solves for autonomous agents.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
