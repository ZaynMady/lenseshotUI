import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://7545045a7898ac18b724e65ced0a1165@o4510484098580480.ingest.de.sentry.io/4510484107952208",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<Sentry.ErrorBoundary 
    fallback={<div className="error-screen">Oops! Something went wrong.</div>}
    showDialog // This adds a popup asking the user what happened
  >
    <App />
  </Sentry.ErrorBoundary>
  );