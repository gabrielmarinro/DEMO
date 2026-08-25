# Architecture

Outcome Intervention is a React/Vite decision-intelligence system for fleet and physical operations.

The repository separates the implementation into four primary concerns:

- `src/` — application logic and UI
- `data/` — operation-specific datasets used by the live system
- `assets/` and `screenshots/` — presentation assets consumed by the application
- `.github/workflows/` — automated GitHub Pages deployment

## Application structure

```text
src/
├── App.jsx
├── AdminPanel.jsx
├── components/
├── hooks/
├── utils/
├── index.css
└── main.jsx
```

The current implementation is intentionally centered around the working control-tower experience. `components/`, `hooks/`, and `utils/` contain reusable interaction, visualization, state and inference-oriented modules around the main application surface.

## Intelligence flow

```text
Fleet state → context → finding → root cause → impact → action → new state
```

The system is designed around a decision loop rather than a monitoring loop: signals are connected to causes, economic impact and possible intervention.

## Delivery

```text
Source → npm run build → GitHub Pages
```

The live system is deployed from `main` through GitHub Actions.
