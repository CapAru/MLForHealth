import { Routes, Route, Link } from "react-router-dom";
import MLForMind from "./components/mlformind.jsx";
import MLForBody from "./components/mlforbody.jsx";
import MLForHealth from "./components/mlforhealth.jsx";
import Background from "./components/Background.jsx";

export default function App() {
  return (
      <div>
          {/* Navigation Bar */}
          <nav
              className="navbar navbar-expand-lg"
              style={{ backgroundColor: "#021526" }}
          >
              <Background />
              <div className="container">
                  <Link
                      className="navbar-brand"
                      to="/"
                      style={{ color: "#6EACDA" }}
                  >
                      ML <span>for</span> Health
                  </Link>
                  <button
                      className="navbar-toggler"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#navbarNav"
                      aria-controls="navbarNav"
                      aria-expanded="false"
                      aria-label="Toggle navigation"
                  >
                      <span className="navbar-toggler-icon"></span>
                  </button>
                  <div className="collapse navbar-collapse" id="navbarNav">
                      <ul className="navbar-nav ms-auto">
                          <li className="nav-item">
                              <Link
                                  className="nav-link"
                                  to="/mind"
                                  style={{ color: "#E2E2B6" }}
                              >
                                  ML <span>for</span> Mind
                              </Link>
                          </li>
                          <li className="nav-item">
                              <Link
                                  className="nav-link"
                                  to="https://predictheartdisease.onrender.com/"
                                  style={{ color: "#E2E2B6" }}
                              >
                                  ML <span>for</span> Body
                              </Link>
                          </li>
                          <li className="nav-item">
                              <Link
                                  className="nav-link"
                                  to="/body"
                                  style={{ color: "#E2E2B6" }}
                              >
                                  🫀
                              </Link>
                          </li>
                      </ul>
                  </div>
              </div>
          </nav>

          {/* Define Routes */}
          <Routes>
              <Route path="/" element={<MLForHealth />} />
              <Route path="/mind" element={<MLForMind />} />
              <Route path="/body" element={<MLForBody />} />
          </Routes>
      </div>
  );
}
