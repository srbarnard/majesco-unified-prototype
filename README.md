# Majesco Unified Prototype

A modern React application scaffold built with TypeScript, Vite, Material UI v6, Emotion, and React Router v7.

## Stack

- **React 18** with TypeScript
- **Vite** for development and production builds
- **MUI v6** with Emotion styling and CSS theme variables
- **React Router v7** for multi-page navigation

## Project structure

```
src/
├── app/                    # Application layer (routes, layouts, pages)
│   ├── layouts/
│   ├── pages/
│   ├── providers/
│   └── routes/
└── design-system/          # Shared design system (theme, tokens, components)
    ├── components/
    ├── theme/
    └── tokens/
```

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Type-check and build     |
| `npm run preview` | Preview production build |
| `npm run lint`  | Run Oxlint               |
