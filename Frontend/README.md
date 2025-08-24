# Frontend

This folder contains the React frontend for the Transformer Management System.

## Prerequisites

- Node.js (v18 or newer recommended)
- npm (comes with Node.js)

### Recommended VS Code Extensions
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Reactjs Code Snippets

## Setup & Run

1. Open this folder in VS Code.
2. Install the recommended extensions above for best development experience.
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the development server:
   ```sh
   npm start
   ```
5. The frontend will run on [http://localhost:3000](http://localhost:3000)

## Usage

- Add, view, and filter transformers and inspections
- Data is fetched from the backend REST API (see main README for backend setup)

## Useful Scripts

- Run tests:
  ```sh
  npm test
  ```
- Build for production:
  ```sh
  npm run build
  ```

## Troubleshooting

- If you see ESLint or Prettier errors, ensure the extensions are installed and configured
- If the backend is not running, API requests will fail
- Change the frontend port in `package.json` if needed

---

## Learn More

- [React documentation](https://reactjs.org/)
- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)

---
