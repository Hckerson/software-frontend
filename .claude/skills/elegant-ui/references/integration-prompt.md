# Integration-prompt scaffold (Upgrade mode)

Emit this **verbatim**, filling only the `«placeholders»`. Keep the "Implementation
Guidelines" and "Steps to integrate" boilerplate exactly as written — that fixed
shape is what makes the output paste-and-run in a shadcn project.

- `«component-file»` — kebab-case name, e.g. `stat-card.tsx` (or any kebab-case name matching the component).
- Component + `demo.tsx` go in one ```tsx fence. `demo.tsx`must exercise the
  component with realistic sample data and import via`@/components/ui/«name»`.
- Add one extra ```tsx fence per **dependency primitive** the component needs that
  isn't already in `components/`(label it`shadcn/button`, etc.).
- `«npm-deps»` — comma-separated external packages only (e.g. `lucide-react,
class-variance-authority`). Omit anything already in `package.json`.
- All component code must already satisfy the house-token + structure rules in
  `SKILL.md` before it goes in here — this scaffold only packages it.

---

You are given a task to integrate an existing React component in the codebase

The codebase should support:

- shadcn project structure
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles.
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:

```tsx
«component-file»
«COMPONENT CODE»

demo.tsx
«DEMO CODE»
```

Copy-paste these files for dependencies:

```tsx
«dependency-label»
«DEPENDENCY CODE»
```

Install NPM dependencies:

```bash
«npm-deps»
```

Implementation Guidelines

1.  Analyze the component structure and identify all required dependencies
2.  Review the component's argumens and state
3.  Identify any required context providers or hooks and install them
4.  Questions to Ask

- What data/props will be passed to this component?
- Are there any specific state management requirements?
- Are there any required assets (images, icons, etc.)?
- What is the expected responsive behavior?
- What is the best place to use this component in the app?

Steps to integrate 0. Copy paste all the code above in the correct directories

1.  Install external dependencies
2.  Fill image assets with stock images from an allowlisted host you know exist
3.  Use lucide-react icons for svgs or logos if component requires them
