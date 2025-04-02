import React, { useState, useEffect } from "react";

export default function RiskMeter({ probability }) {
  const [riskPercentage, setRiskPercentage] = useState(0);
  const [riskCategory, setRiskCategory] = useState("low");

  useEffect(() => {
    const targetPercentage = probability * 100;
    // Simple animation effect - update percentage gradually or directly
    setRiskPercentage(targetPercentage);

    // Determine risk category for styling
    if (targetPercentage < 30) {
      setRiskCategory("low");
    } else if (targetPercentage < 70) {
      setRiskCategory("moderate");
    } else {
      setRiskCategory("high");
    }
  }, [probability]); // Update when probability changes

  return (
    <div className="risk-meter">
      <h3>Risk Meter</h3>
      <div className="meter-container">
        <div
          className={`risk-indicator ${riskCategory}`}
          style={{ width: `${riskPercentage}%` }}
          role="progressbar"
          aria-valuenow={riskPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Risk Level: ${riskPercentage.toFixed(1)}%`}
        ></div>
        
        <div
           className={`risk-pointer ${riskCategory}`}
           style={{ left: `${riskPercentage}%` }}
           aria-hidden="true"
        ></div>
      </div>
      <div className="risk-labels">
        <span className="normal">Low (0-30%)</span>
        <span className="normal">Moderate (30-70%)</span>
        <span className="normal">High (70-100%)</span>
      </div>
       {/* Display the exact percentage */}
       <h3 className="mt-2 mb-0 fw-bold fs-5">
         {riskPercentage.toFixed(1)}%
       </h3>
    </div>
  );
}