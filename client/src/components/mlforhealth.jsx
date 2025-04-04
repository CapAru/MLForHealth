import React from "react";
import { Link } from "react-router-dom";

export default function MLForHealth() {
  return (
      <div style={{ padding: "5rem 0" }}>
          <div className="container">
              {/* Main Application Title */}
              <div className="text-center mb-5">
                  <h1 className="fw-bold">
                      ML <span>for</span> Health
                  </h1>
                  <p className="lead text-white">
                      Your intelligent companion for insights into physical and
                      mental well-being.
                  </p>
              </div>

              {/* Navigation Cards */}
              <div className="row justify-content-center g-4">
                  {/* ML for Body */}
                  <div className="col-md-5">
                      <div className="results p-4 p-md-5 shadow rounded d-flex flex-column h-100">
                          <div className="flex-grow-1">
                              <h2 className="mb-3 fw-bold">
                                  ML <span>for</span> Body
                              </h2>
                              <p className="mb-4 text-dark">
                                  Assess your cardiovascular health risk using
                                  machine learning. Input your metrics for a
                                  personalized prediction.
                              </p>
                          </div>
                          <Link
                              to="https://predictheartdisease.onrender.com/"
                              className="btn btn-lg mt-auto w-100 shadow-sm"
                          >
                              Assess Heart Health
                          </Link>
                      </div>
                  </div>

                  {/* ML for Mind */}
                  <div className="col-md-5">
                      <div className="results p-4 p-md-5 shadow rounded d-flex flex-column h-100">
                          <div className="flex-grow-1">
                              <h2 className="mb-3 fw-bold">
                                  ML <span>for</span> Mind
                              </h2>
                              <p className="mb-4 text-dark">
                                  Explore your mental state based on your
                                  written thoughts. Get insights, suggested
                                  articles, and curated music playlists.
                              </p>
                          </div>
                          <Link
                              to="/mind"
                              className="btn btn-lg mt-auto w-100 shadow-sm"
                          >
                              Analyze Feelings
                          </Link>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}
