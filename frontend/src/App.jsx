import { useEffect, useState } from "react";
import {
  Dog,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Send,
  RefreshCw,
} from "lucide-react";
import "./App.css";

const API_URL =
  "https://r3xgrh3s2d.execute-api.us-east-1.amazonaws.com/prod/incidents";

function App() {
  const [dogName, setDogName] = useState("");
  const [description, setDescription] = useState("");
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [incidents, setIncidents] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Load previous incidents
  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load incident history.");
      }

      const data = await response.json();
      setIncidents(data.incidents || []);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load incident history when the page opens
  useEffect(() => {
    loadHistory();
  }, []);

  // Submit a new incident
  const analyzeIncident = async (e) => {
    e.preventDefault();

    if (!dogName.trim() || !description.trim()) {
      setError(
        "Please enter the dog's name and describe the incident."
      );
      return;
    }

    setLoading(true);
    setError("");
    setIncident(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dogName,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to analyze the incident.");
      }

      const data = await response.json();

      setIncident(data.incident);

      // Refresh history after creating a new incident
      await loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityClass =
    incident?.priority?.toLowerCase() || "unknown";

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Dog size={28} />
          </div>

          <div>
            <h1>PupWatch</h1>
            <p>AI-Powered Dog Incident Management</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>

      <main className="container">

        {/* Hero */}
        <section className="hero">
          <div>
            <p className="eyebrow">INCIDENT CENTER</p>

            <h2>Keep every pup safe.</h2>

            <p className="hero-text">
              Report a dog incident and let AI analyze the situation,
              determine its priority, and recommend the next action.
            </p>
          </div>

          <div className="hero-icon">
            <Dog size={72} />
          </div>
        </section>

        {/* Dashboard */}
        <div className="dashboard-grid">

          {/* Report Incident */}
          <section className="card">
            <div className="card-header">
              <div>
                <h3>Report an Incident</h3>
                <p>Describe what happened to the dog.</p>
              </div>

              <AlertTriangle size={24} />
            </div>

            <form onSubmit={analyzeIncident}>
              <label>Dog Name</label>

              <input
                type="text"
                placeholder="e.g. Buddy"
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
              />

              <label>What happened?</label>

              <textarea
                placeholder="Describe the incident..."
                rows="7"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {error && <div className="error">{error}</div>}

              <button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Activity size={18} />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Analyze Incident
                  </>
                )}
              </button>
            </form>
          </section>

          {/* AI Analysis */}
          <section className="card results-card">
            <div className="card-header">
              <div>
                <h3>AI Analysis</h3>
                <p>Powered by Google Gemini</p>
              </div>

              <Activity size={24} />
            </div>

            {/* No incident */}
            {!incident && !loading && (
              <div className="empty-state">
                <Dog size={48} />

                <h4>No incident analyzed yet</h4>

                <p>
                  Submit an incident and PupWatch will display the AI
                  analysis here.
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="empty-state">
                <Activity size={48} className="spin" />

                <h4>Analyzing incident...</h4>

                <p>
                  Gemini is reviewing the incident and generating a
                  recommended response.
                </p>
              </div>
            )}

            {/* Analysis result */}
            {incident && !loading && (
              <div className="analysis">

                <div className="dog-title">
                  <div className="dog-avatar">
                    <Dog size={28} />
                  </div>

                  <div>
                    <h4>{incident.dogName}</h4>

                    <p>
                      <Clock size={14} />

                      {incident.createdAt
                        ? new Date(
                            incident.createdAt
                          ).toLocaleString()
                        : "Unknown date"}
                    </p>
                  </div>
                </div>

                <div className="metrics">
                  <div className="metric">
                    <span>Category</span>
                    <strong>
                      {incident.category || "Incident"}
                    </strong>
                  </div>

                  <div
                    className={`metric priority ${priorityClass}`}
                  >
                    <span>Priority</span>

                    <strong>
                      {incident.priority || "UNKNOWN"}
                    </strong>
                  </div>
                </div>

                <div className="analysis-section">
                  <h4>
                    <CheckCircle size={18} />
                    Summary
                  </h4>

                  <p>
                    {incident.summary ||
                      incident.description}
                  </p>
                </div>

                <div className="analysis-section">
                  <h4>
                    <AlertTriangle size={18} />
                    Recommended Action
                  </h4>

                  <p>
                    {incident.recommendedAction ||
                      "Review the incident and take appropriate action."}
                  </p>
                </div>

                <div className="incident-id">
                  Incident ID: {incident.incidentId}
                </div>

              </div>
            )}
          </section>

        </div>

        {/* Incident History */}
        <section className="card history-card">

          <div className="card-header">
            <div>
              <h3>Incident History</h3>
              <p>
                Previous incidents recorded by PupWatch.
              </p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={loadHistory}
              disabled={historyLoading}
              title="Refresh incident history"
            >
              <RefreshCw
                size={20}
                className={
                  historyLoading ? "spin" : ""
                }
              />
            </button>
          </div>

          {/* History error */}
          {historyError && (
            <div className="error">
              {historyError}
            </div>
          )}

          {/* History loading */}
          {historyLoading && incidents.length === 0 && (
            <div className="empty-state">
              <Activity
                size={40}
                className="spin"
              />

              <h4>Loading incident history...</h4>

              <p>
                Retrieving previous incidents from DynamoDB.
              </p>
            </div>
          )}

          {/* No history */}
          {!historyLoading &&
            incidents.length === 0 &&
            !historyError && (
              <div className="empty-state">
                <Clock size={40} />

                <h4>No incidents recorded yet</h4>

                <p>
                  Submitted incidents will appear here.
                </p>
              </div>
            )}

          {/* History list */}
          {incidents.length > 0 && (
            <div className="history-list">
              {incidents.map((item) => (
                <div
                  className="history-item"
                  key={item.incidentId}
                >

                  <div className="history-top">

                    <div className="history-dog">

                      <div className="dog-avatar">
                        <Dog size={22} />
                      </div>

                      <div>
                        <h4>
                          {item.dogName}
                        </h4>

                        <p>
                          <Clock size={13} />

                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleString()
                            : "Unknown date"}
                        </p>
                      </div>

                    </div>

                    {item.priority && (
                      <span
                        className={`history-priority ${item.priority.toLowerCase()}`}
                      >
                        {item.priority}
                      </span>
                    )}

                  </div>

                  <div className="history-details">

                    <div>
                      <span>Category</span>

                      <strong>
                        {item.category ||
                          "Incident"}
                      </strong>
                    </div>

                    <div>
                      <span>Summary</span>

                      <p>
                        {item.summary ||
                          item.description ||
                          "No description available."}
                      </p>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </section>

      </main>

      <footer>
        <p>
          PupWatch • Serverless AI incident management
          powered by AWS and Google Gemini
        </p>
      </footer>
    </div>
  );
}

export default App;
