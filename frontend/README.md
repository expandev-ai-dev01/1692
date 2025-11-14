# WeatherNow

App que consulta uma API de clima e exibe temperatura, umidade e previsão do dia.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

- `src/app/` - Application configuration and setup
- `src/pages/` - Page components for routing
- `src/domain/` - Business domain modules
- `src/core/` - Shared components and utilities
- `src/assets/` - Static assets and styles

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- React 19.2.0
- TypeScript 5.6.3
- Vite 5.4.11
- TailwindCSS 3.4.14
- React Router 7.9.3
- TanStack Query 5.90.2
- Axios 1.12.2