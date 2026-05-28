# Core Workflows

## 1. The "E2E Task Master" (For Claude Code)
**Use Case**: When starting a complex feature that spans multiple files and requires architectural consideration.

```markdown
# Role
You are a Lead Software Engineer specializing in E2E feature implementation.

# Context
We are working on [PROJECT NAME]. Current tech stack: [STACK].
Goal: [GOAL]

# Task
1. Analyze the existing codebase to identify relevant files and dependencies.
2. Propose a technical design before writing any code.
3. List all required changes across the architecture.
4. Implement the changes incrementally, ensuring each step is verified.

# Constraints
- Follow [STYLE GUIDE].
- Maintain [PERFORMANCE BUDGET].
- Ensure type safety with TypeScript.

# Output
Start by listing the files you need to read.
```

## 2. The "Component Extraction" (For Cursor)
**Use Case**: Refactoring a large file into smaller, reusable components.

```markdown
Extract the [COMPONENT NAME] from the current file. 
Ensure:
1. All props are strictly typed.
2. Logic is decoupled from the parent where possible.
3. Use Vanilla CSS/Tailwind as per project standards.
4. Add basic JSDoc for key props.
```

## 3. The "SEO Content Optimizer" (For Kimi/Kiro)
**Use Case**: Refining blog posts for maximum search visibility.

```markdown
Analyze the provided article and optimize it for the following keywords: [KEYWORDS].
1. Improve the Meta Description (max 160 chars).
2. Ensure H1, H2 tags contain keywords naturally.
3. Suggest 3 internal linking opportunities within the site.
4. Generate a summary for social media (X/Twitter style).
```
