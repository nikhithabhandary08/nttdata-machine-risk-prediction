import { useState } from "react";
import "./App.css";
import FieldConfiguration from "./components/FieldConfiguration";

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>

          <div>
            <h1>Machine Risk</h1>
            <p>Management System</p>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${
              activeSection === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activeSection === "fields" ? "active" : ""
            }`}
            onClick={() => setActiveSection("fields")}
          >
            <span>⚙</span>
            Field Configuration
          </button>

          <button
            className={`nav-item ${
              activeSection === "machines" ? "active" : ""
            }`}
            onClick={() => setActiveSection("machines")}
          >
            <span>▣</span>
            Machine Records
          </button>

          <button
            className={`nav-item ${
              activeSection === "prediction" ? "active" : ""
            }`}
            onClick={() => setActiveSection("prediction")}
          >
            <span>◈</span>
            Risk Prediction
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot"></span>
          Local system
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MACHINE MANAGEMENT</p>
            <h2>Dynamic Machine Data & Risk Prediction</h2>
          </div>

          <div className="api-status">
            <span className="status-dot"></span>
            API Connected
          </div>
        </header>

        <section className="content">
          {activeSection === "dashboard" && (
            <Dashboard onNavigate={setActiveSection} />
          )}

          {activeSection === "fields" && <FieldConfiguration />}

          {activeSection === "machines" && (
            <SectionPlaceholder
              title="Machine Records"
              description="Create, view, edit, and delete machine records."
            />
          )}

          {activeSection === "prediction" && (
            <SectionPlaceholder
              title="Risk Prediction"
              description="Predict machine risk using the local Python ML model."
            />
          )}
        </section>
      </main>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  return (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">LOCAL MACHINE INTELLIGENCE</p>
          <h3>Manage machines. Predict risk.</h3>
          <p>
            Configure machine fields, manage machine records, and run local
            machine risk predictions.
          </p>
        </div>

        <div className="welcome-badge">
          <span>ML</span>
          Local Prediction
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Dynamic Fields</span>
          <strong>—</strong>
          <span className="stat-description">
            Configured in the database
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Machine Records</span>
          <strong>—</strong>
          <span className="stat-description">
            Stored machine data
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Risk Model</span>
          <strong>Ready</strong>
          <span className="stat-description">
            Local Random Forest model
          </span>
        </div>
      </div>

      <div className="quick-actions">
        <div className="section-heading">
          <div>
            <p className="eyebrow">QUICK ACTIONS</p>
            <h3>Choose where to start</h3>
          </div>
        </div>

        <div className="action-grid">
          <button
            className="action-card"
            onClick={() => onNavigate("fields")}
          >
            <span className="action-icon">⚙</span>
            <strong>Configure Fields</strong>
            <span>
              Add text, number, and dropdown fields.
            </span>
          </button>

          <button
            className="action-card"
            onClick={() => onNavigate("machines")}
          >
            <span className="action-icon">▣</span>
            <strong>Manage Machines</strong>
            <span>
              Create and manage machine records.
            </span>
          </button>

          <button
            className="action-card"
            onClick={() => onNavigate("prediction")}
          >
            <span className="action-icon">◈</span>
            <strong>Predict Risk</strong>
            <span>
              Run the local ML risk prediction.
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

function SectionPlaceholder({ title, description }) {
  return (
    <div className="page-placeholder">
      <p className="eyebrow">MODULE</p>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="coming-soon">Module setup in progress</span>
    </div>
  );
}

export default App;