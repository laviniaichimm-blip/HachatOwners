# HachatOwners

Project repository for **HachatOwners**.

## Repository structure

```text
HachatOwners/
├── frontend/
├── backend/
├── tests/
├── docs/
├── assets/
├── README.md
├── .gitignore
└── .env.example
```

## Branch strategy

- `main` — stable / production-ready code
- `develop` — integration branch for active development
- `feature/frontend` — frontend work
- `feature/backend` — backend work
- `feature/algorithm` — algorithm / core logic work
- `feature/integration` — integration work

Feature branches should normally merge into `develop`. Once a tested version is ready, `develop` can be merged into `main`.

## Getting started

1. Clone the repository.
2. Copy `.env.example` to `.env` and add local values.
3. Work on the relevant `feature/*` branch.
4. Open a pull request into `develop`.
