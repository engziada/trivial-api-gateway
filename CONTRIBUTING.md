# Contributing to Trivial API Gateway

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the Trivial API Gateway project.

---

## Code of Conduct

Be respectful, inclusive, and professional. We're building a community where everyone feels welcome.

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database (for local development)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/trivial-api-gateway.git
cd trivial-api-gateway

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start the dev server
pnpm dev

# Run tests
pnpm test
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New functionality
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Check TypeScript
pnpm check
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new API endpoint"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Test improvements
- `chore:` - Build/dependency updates

### 5. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Reference to related issues
- Screenshots (if UI changes)
- Test results

---

## Adding a New API Endpoint

### Step 1: Implement the Function

Add your implementation to `server/utils/apiImplementations.ts`:

```typescript
export function myNewAPI(param1: string, param2: number): string {
  // Implementation
  return result;
}
```

### Step 2: Create Tests

Add tests to `server/utils/apiImplementations.test.ts`:

```typescript
describe("myNewAPI", () => {
  it("should return expected result", () => {
    const result = myNewAPI("test", 42);
    expect(result).toBe("expected");
  });
});
```

### Step 3: Add tRPC Procedure

Add to `server/routers.ts`:

```typescript
myNewAPI: publicProcedure
  .input(z.object({
    param1: z.string(),
    param2: z.number(),
  }))
  .query(({ input }) => ({
    result: myNewAPI(input.param1, input.param2),
  })),
```

### Step 4: Add UI Component

Add to the `API_ENDPOINTS` array in `client/src/pages/Home.tsx`:

```typescript
{
  id: "mynewapi",
  name: "My New API",
  category: "Category",
  description: "Description of what this API does",
  endpoint: "utils.mynewapi.call",
  procedurePath: "utils.mynewapi.call",
  inputs: [
    { label: "Parameter 1", key: "param1", type: "text" },
    { label: "Parameter 2", key: "param2", type: "number" },
  ],
}
```

### Step 5: Update Documentation

Add to `API_DOCUMENTATION.md`:

```markdown
### Your New API

**Endpoint:** `utils.mynewapi.call`  
**Description:** What this API does

**Parameters:**
- `param1` (string, required): Description
- `param2` (number, required): Description

**Example Request:**
```

### Step 6: Run Tests

```bash
pnpm test
```

All tests must pass before submitting a PR.

---

## Code Style

### TypeScript

- Use strict type checking
- Avoid `any` types
- Use descriptive variable names
- Add JSDoc comments for complex functions

### React

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for prop types
- Prefer composition over inheritance

### CSS

- Use Tailwind utilities
- Follow the Brutalist design philosophy
- Avoid inline styles
- Keep specificity low

---

## Testing

### Writing Tests

```typescript
import { describe, it, expect } from "vitest";

describe("Feature", () => {
  it("should do something", () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });

  it("should handle edge cases", () => {
    const result = myFunction(edgeCase);
    expect(result).toThrow();
  });
});
```

### Test Coverage

Aim for high coverage:
- Unit tests for all functions
- Integration tests for API endpoints
- Error handling tests
- Edge case tests

Run coverage:

```bash
pnpm test --coverage
```

---

## Documentation

### README Updates

Update `README.md` if you:
- Add new features
- Change setup instructions
- Update architecture
- Add new endpoints

### API Documentation

Update `API_DOCUMENTATION.md` for all new endpoints with:
- Endpoint path
- Description
- Parameters with types
- Example request
- Example response
- Use cases

### Code Comments

Add JSDoc comments for:
- Complex functions
- Non-obvious logic
- Public APIs
- Edge cases

Example:

```typescript
/**
 * Calculates the sum of two numbers.
 * @param a - First number
 * @param b - Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

---

## Performance

### Guidelines

- Keep response times under 100ms
- Minimize database queries
- Cache when appropriate
- Use efficient algorithms
- Profile before optimizing

### Benchmarking

```bash
# Run performance tests
pnpm test --bench
```

---

## Security

### Guidelines

- Never commit secrets or credentials
- Validate all inputs
- Sanitize user data
- Use HTTPS only
- Keep dependencies updated

### Dependency Updates

```bash
# Check for updates
pnpm outdated

# Update dependencies
pnpm update
```

---

## Pull Request Process

1. **Create a PR** with a clear title and description
2. **Link related issues** using `Fixes #123`
3. **Add tests** for all changes
4. **Update documentation** as needed
5. **Pass all checks** (tests, TypeScript, linting)
6. **Request review** from maintainers
7. **Address feedback** promptly
8. **Merge** after approval

### PR Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] TypeScript compiles (`pnpm check`)
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Code follows style guidelines
- [ ] Commit messages are clear
- [ ] No breaking changes (or documented)

---

## Reporting Issues

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Screenshots (if applicable)

### Feature Requests

Include:
- Clear description of the feature
- Use cases and benefits
- Proposed implementation (optional)
- Related issues or discussions

---

## Review Process

### What Reviewers Look For

- Code quality and style
- Test coverage
- Documentation completeness
- Performance implications
- Security considerations
- Breaking changes

### Feedback

- Be open to feedback
- Ask questions if unclear
- Suggest improvements
- Be respectful and constructive

---

## Deployment

### Staging

Changes are automatically deployed to staging for testing:

```bash
# View staging environment
https://staging.trivialapi.manus.space
```

### Production

After approval and merge to `main`:

```bash
# Automatically deployed to production
https://trivialapi.manus.space
```

---

## Resources

- **Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **README:** [README.md](./README.md)
- **Issues:** [GitHub Issues](https://github.com/yourusername/trivial-api-gateway/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/trivial-api-gateway/discussions)

---

## Questions?

- Open a GitHub Discussion
- Check existing issues
- Review the documentation
- Ask in the community

---

Thank you for contributing! 🚀
