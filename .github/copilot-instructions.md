# 🤖 Copilot Instructions for React/Vite Project

This file contains the core guidelines, best practices, and development workflow for the `react-app` project. All contributors, including AI assistants, must adhere to these rules.

## 🚀 Project Overview
*   **Project Type:** Single Page Application (SPA)
*   **Framework:** React (using functional components and Hooks)
*   **Build Tool:** Vite
*   **Language:** TypeScript (Recommended) / JavaScript
*   **Styling:** CSS Modules or Tailwind CSS (Use CSS Modules by default unless specified otherwise).

## ✨ Coding Standards & Best Practices
1.  **Component Structure:**
    *   Components must be small, focused, and reusable (Single Responsibility Principle).
    *   Use functional components with Hooks (`useState`, `useEffect`, etc.).
    *   Separate concerns: Logic/State management should be separated from UI rendering.
2.  **State Management:**
    *   For local component state, use `useState`.
    *   For global state, use React Context or a dedicated state library (e.g., Redux Toolkit, Zustand) as appropriate.
3.  **Styling:**
    *   Prefer using CSS Modules (`.module.css`) for component-scoped styling to avoid global namespace collisions.
    *   If a utility-first approach is needed, use Tailwind CSS classes.
4.  **Error Handling:**
    *   Implement robust error boundaries (`<ErrorBoundary>`) around major UI sections.
    *   Use `try...catch` blocks for asynchronous operations (API calls).
5.  **Performance:**
    *   Memoize expensive calculations or components using `useMemo` and `useCallback`.
    *   Lazy load components using `React.lazy` and `Suspense` for large sections of the application.

## ⚙️ Development Workflow
1.  **Starting the Project:**
    *   Run `npm run dev` to start the development server.
2.  **Building the Project:**
    *   Run `npm run build` to create the optimized production build in the `dist/` folder.
3.  **Testing:**
    *   Unit tests should be written using React Testing Library and Jest.
    *   Run tests with `npm run test`.
4.  **API Interaction:**
    *   All API calls must be handled by a dedicated service layer (e.g., `src/api/apiClient.js`) to centralize base URLs, headers, and error handling.

## 🛠️ Tooling & Dependencies
*   **Linter:** ESLint (Follow all configured rules).
*   **Formatter:** Prettier (Run `npm run format` before committing).
*   **Testing:** Jest / React Testing Library.

## ⚠️ Guidelines for AI Assistants (Copilot)
*   **Always:** Provide clear explanations for any code block generated.
*   **Always:** Assume the project uses TypeScript unless explicitly told otherwise.
*   **Never:** Generate code that violates the Single Responsibility Principle.
*   **Always:** Reference the relevant section of this document when making a significant architectural change.