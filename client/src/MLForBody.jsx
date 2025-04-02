import { useState, useEffect } from "react";

import jsPDF from "jspdf";

import RiskMeter from "./components/RiskMeter";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
console.log("API_BASE_URL:", API_BASE_URL);
const getDisplayText = (field, value) => {
  if (value === "" || value === null || value === undefined) return "N/A";
  const numericValue = String(value);

  switch (field) {
    case "gender":
      return numericValue === "1"
        ? "Male"
        : numericValue === "0"
        ? "Female"
        : "N/A";
    case "chestpain":
      const cpMap = {
        1: "Typical Angina",
        2: "Atypical Angina",
        3: "Non-anginal Pain",
        4: "Asymptomatic",
      };
      return cpMap[numericValue] || "N/A";
    case "fastingbloodsugar":
      return numericValue === "1"
        ? "Yes (> 120 mg/dl)"
        : numericValue === "0"
        ? "No (<= 120 mg/dl)"
        : "N/A";
    case "restingrelectro":
      const ecgMap = {
        0: "Normal",
        1: "ST-T Abnormality",
        2: "LV Hypertrophy",
      };
      return ecgMap[numericValue] || "N/A";
    case "exerciseangia":
      return numericValue === "1" ? "Yes" : numericValue === "0" ? "No" : "N/A";
    case "slope":
      const slopeMap = { 1: "Upsloping", 2: "Flat", 3: "Downsloping" };
      return slopeMap[numericValue] || "N/A";
    case "noofmajorvessels":
      return numericValue;
    default:
      return numericValue;
  }
};

export default function MLForBody() {
  const initialFormData = {
    age: "",
    gender: "",
    chestpain: "",
    restingBP: "",
    serumcholestrol: "",
    fastingbloodsugar: "",
    restingrelectro: "",
    maxheartrate: "",
    exerciseangia: "",
    oldpeak: "",
    slope: "",
    noofmajorvessels: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [patientId, setPatientId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePatientIdChange = (e) => {
    setPatientId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const submissionData = Object.keys(formData).reduce((acc, key) => {
      const value = formData[key];
      if (value !== "" && !isNaN(value) && typeof value === "string") {
        acc[key] = value.includes(".")
          ? parseFloat(value)
          : parseInt(value, 10);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

    try {
      const API_ENDPOINT = `${API_BASE_URL}/predict/body`;
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        let errorMessage = "Prediction failed.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {}
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Prediction Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!result || !formData) return;
    setPdfLoading(true);

    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true, // Enable compression
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;
        let yPos = 0;

        doc.setFillColor(110, 172, 218);
        doc.rect(0, 0, pageWidth, 20, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Heart Health Assessment Report", pageWidth / 2, 13, {
          align: "center",
        });
        yPos = 28; // Position after header

        // Reset styles
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        // 2. Report Info
        doc.setFontSize(10);
        const reportDate = new Date().toLocaleDateString();
        const reportId = `HD-${Math.floor(Math.random() * 10000)}`;
        doc.text(`Date: ${reportDate} | Report ID: ${reportId}`, margin, yPos);
        yPos += 10;

        // 3. Patient Information Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Patient Information", margin, yPos);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos + 1, margin + contentWidth, yPos + 1); // Underline
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const col1X = margin;
        const col2X = margin + contentWidth / 2; // Simple two-column layout

        // Row 1
        doc.text(`Patient ID: ${patientId || "N/A"}`, col1X, yPos);
        doc.text(
          `Age: ${getDisplayText("age", formData.age)} years`,
          col2X,
          yPos
        );
        yPos += 7;
        // Row 2
        doc.text(
          `Gender: ${getDisplayText("gender", formData.gender)}`,
          col1X,
          yPos
        );
        doc.text(
          `Chest Pain: ${getDisplayText("chestpain", formData.chestpain)}`,
          col2X,
          yPos
        );
        yPos += 7;
        // Row 3
        doc.text(
          `Resting BP: ${getDisplayText(
            "restingBP",
            formData.restingBP
          )} mm Hg`,
          col1X,
          yPos
        );
        doc.text(
          `Cholesterol: ${getDisplayText(
            "serumcholestrol",
            formData.serumcholestrol
          )} mg/dl`,
          col2X,
          yPos
        );
        yPos += 7;
        // Row 4
        doc.text(
          `Fasting BS (>120): ${getDisplayText(
            "fastingbloodsugar",
            formData.fastingbloodsugar
          )}`,
          col1X,
          yPos
        );
        doc.text(
          `Resting ECG: ${getDisplayText(
            "restingrelectro",
            formData.restingrelectro
          )}`,
          col2X,
          yPos
        );
        yPos += 7;
        // Row 5
        doc.text(
          `Max Heart Rate: ${getDisplayText(
            "maxheartrate",
            formData.maxheartrate
          )} bpm`,
          col1X,
          yPos
        );
        doc.text(
          `Exercise Angina: ${getDisplayText(
            "exerciseangia",
            formData.exerciseangia
          )}`,
          col2X,
          yPos
        );
        yPos += 7;
        // Row 6
        doc.text(
          `ST Depression: ${getDisplayText("oldpeak", formData.oldpeak)}`,
          col1X,
          yPos
        );
        doc.text(
          `ST Slope: ${getDisplayText("slope", formData.slope)}`,
          col2X,
          yPos
        );
        yPos += 7;
        // Row 7
        doc.text(
          `Major Vessels: ${getDisplayText(
            "noofmajorvessels",
            formData.noofmajorvessels
          )}`,
          col1X,
          yPos
        );
        yPos += 10; // Space before next section

        // 4. Assessment Result Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Assessment Result", margin, yPos);
        doc.line(margin, yPos + 1, margin + contentWidth, yPos + 1);
        yPos += 8;

        const riskPercentage = result.probability * 100;
        const predictionText =
          result.message ||
          (result.prediction === 1
            ? "High Risk Detected"
            : "Low Risk Detected");
        const probabilityText = `Probability: ${riskPercentage.toFixed(1)}%`;

        // Colored box for risk level
        if (result.prediction === 1) {
          doc.setFillColor(217, 83, 79); // Red
        } else {
          doc.setFillColor(92, 184, 92); // Green
        }
        doc.roundedRect(margin, yPos, contentWidth, 12, 3, 3, "F"); // Rounded rectangle
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(
          `${predictionText} (${probabilityText})`,
          pageWidth / 2,
          yPos + 8,
          { align: "center" }
        );
        yPos += 20; // Space after box

        // Reset styles
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        // 5. Recommendations Section (Simplified - add more detail if needed)
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Recommendations", margin, yPos);
        doc.line(margin, yPos + 1, margin + contentWidth, yPos + 1);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const suggestionsElement = renderHealthSuggestions(true); 
        if (
          suggestionsElement &&
          suggestionsElement.props &&
          suggestionsElement.props.children
        ) {
          const extractText = (element) => {
            if (typeof element === "string") return element;
            if (Array.isArray(element))
              return element.map(extractText).join("");
            if (element && element.props && element.props.children) {
              return extractText(element.props.children);
            }
            return "";
          };
          let recommendationsText = extractText(suggestionsElement)
            .replace(/• /g, "\n• ")
            .replace(/✓ /g, "\n✓ ")
            .replace(/Personalized Health Insights/g, "")
            .replace(/Priority Actions:/g, "\nPriority Actions:")
            .replace(/Preventive Actions:/g, "\nPreventive Actions:")
            .replace(
              /General Heart Health Recommendations:/g,
              "\nGeneral Heart Health Recommendations:"
            )
            .replace(
              /Observations Based on Your Profile:/g,
              "\nObservations Based on Your Profile:"
            )
            .replace(/^\s*\n/gm, "")
            .trim();

          const lines = doc.splitTextToSize(recommendationsText, contentWidth);
          doc.text(lines, margin, yPos);
          yPos += lines.length * 5;
        } else {
          doc.text(
            "Recommendations could not be generated for the PDF.",
            margin,
            yPos
          );
          yPos += 7;
        }

        // 6. Disclaimer
        yPos = doc.internal.pageSize.getHeight() - 25; // Position near bottom
        doc.line(margin, yPos - 2, margin + contentWidth, yPos - 2); // Line above disclaimer
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        const disclaimer =
          "Disclaimer: This assessment is for informational purposes only and does not constitute medical advice. Consult a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.";
        const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
        doc.text(disclaimerLines, margin, yPos);

        // 7. Save PDF
        doc.save(
          `Heart_Health_Assessment_${
            patientId || "Report"
          }_${reportDate.replace(/\//g, "-")}.pdf`
        );
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        setError("Failed to generate PDF report. Please try again."); // Show error to user
      } finally {
        setPdfLoading(false); // Hide loading message
      }
    }, 100); // Short delay to allow UI update for loading message
  };

  const renderHealthSuggestions = (forPdf = false) => {
    if (!result) return null;

    const { prediction, probability } = result;
    const riskLevel = prediction === 1 ? "high" : "low";
    const riskPercentage = (probability * 100).toFixed(1);

    let suggestions = []; // Store suggestion strings or elements

    const generalSuggestions = [
      "Maintain a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins.",
      "Aim for at least 150 minutes of moderate exercise per week.",
      "Monitor and manage your blood pressure and cholesterol levels.",
      "Avoid smoking and limit alcohol consumption.",
      "Manage stress through relaxation techniques, adequate sleep, and social connections.",
    ];
    const specificSuggestions = [];
    const age = parseFloat(formData.age);
    const chol = parseFloat(formData.serumcholestrol);
    const bp = parseFloat(formData.restingBP);
    const maxhr = parseFloat(formData.maxheartrate);

    if (!isNaN(age) && age > 50)
      specificSuggestions.push(
        "Consider regular heart check-ups as age is a significant risk factor."
      );
    if (!isNaN(chol) && chol > 200)
      specificSuggestions.push(
        `Your cholesterol (${chol} mg/dl) is elevated. Consider dietary changes and consult your doctor.`
      );
    if (!isNaN(bp) && bp > 130)
      specificSuggestions.push(
        `Your blood pressure (${bp} mm Hg) is high. Regular monitoring and lifestyle modifications are recommended.`
      );
    if (!isNaN(maxhr) && maxhr < 150)
      specificSuggestions.push(
        `Your max heart rate (${maxhr} bpm) is lower than typical. Gradual exercise may improve fitness.`
      );

    if (riskLevel === "high") {
      suggestions.push(
        `Risk Message: Your assessment indicates a higher risk (${riskPercentage}%) for heart disease. Please consult with a healthcare provider promptly.`
      );
      suggestions.push("Priority Actions:");
      suggestions.push("✓ Schedule an appointment with a cardiologist.");
      suggestions.push("✓ Discuss medication options with your provider.");
      suggestions.push("✓ Consider cardiac rehabilitation if recommended.");
      suggestions.push(
        "✓ Make immediate lifestyle changes to reduce risk factors."
      );
    } else {
      suggestions.push(
        `Risk Message: Your assessment indicates a lower risk (${riskPercentage}%) for heart disease. Continue with preventive measures.`
      );
      suggestions.push("Preventive Actions:");
      suggestions.push("✓ Maintain your current heart-healthy practices.");
      suggestions.push("✓ Continue with regular health check-ups.");
      suggestions.push(
        "✓ Stay physically active and maintain a healthy weight."
      );
    }

    if (specificSuggestions.length > 0) {
      suggestions.push("\nObservations Based on Your Profile:");
      specificSuggestions.forEach((s) => suggestions.push(`• ${s}`));
    }

    suggestions.push("\nGeneral Heart Health Recommendations:");
    generalSuggestions.forEach((s) => suggestions.push(`• ${s}`));

    if (forPdf) {
      // For PDF, return a structure that generatePDF can easily parse
      // Returning a simple div containing text is easier for basic extraction
      return <div aria-hidden="true">{suggestions.join("\n")}</div>;
    }

    // For rendering in HTML (similar to original but using map)
    const renderList = (items) =>
      items.map((item, index) => {
        if (item.startsWith("✓") || item.startsWith("•")) {
          return <li key={index}>{item}</li>;
        }
        if (item.endsWith(":")) {
          // Render section headers differently
          return (
            <h5 key={index} className="mb-2 mt-3">
              {item}
            </h5>
          );
        }
        if (item.startsWith("Risk Message:")) {
          return (
            <p
              key={index}
              className={`${
                riskLevel === "high" ? "text-danger" : ""
              } fw-bold mb-3`}
            >
              {item.replace("Risk Message: ", "")}
            </p>
          );
        }
        // Default paragraph for other lines if needed
        return <p key={index}>{item}</p>;
      });

    // Group suggestions logically for HTML rendering
    const htmlSuggestions = [];
    let currentList = [];
    let currentHeader = null;

    suggestions.forEach((item, index) => {
      if (item.endsWith(":")) {
        // If there was a previous list, render it
        if (currentList.length > 0) {
          htmlSuggestions.push(
            <div key={`section-${index - 1}`} className="mb-4">
              {currentHeader && <h5 className="mb-2">{currentHeader}</h5>}
              <ul className="list-unstyled ps-3">{renderList(currentList)}</ul>
            </div>
          );
        }
        // Start new section
        currentHeader = item;
        currentList = [];
      } else if (item.startsWith("Risk Message:")) {
        // Render risk message immediately
        htmlSuggestions.push(renderList([item])[0]);
      } else {
        currentList.push(item);
      }
    });
    // Render the last list
    if (currentList.length > 0) {
      htmlSuggestions.push(
        <div key="last-section" className="mb-4">
          {currentHeader && <h5 className="mb-2">{currentHeader}</h5>}
          <ul className="list-unstyled ps-3">{renderList(currentList)}</ul>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 box rounded shadow-sm">
        <h3 className="mb-3 text-center">Personalized Health Insights</h3>
        {htmlSuggestions}
      </div>
    );
  };

  // Component JSX
  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        {/* ... (keep existing header) */}
        <h1 className="fw-bold">
          ML <span>for</span> Body
        </h1>
        <p className="lead">Heart Disease Risk Assessment Tool</p>
        <p className="small text-warning">
          <strong>Note:</strong> This tool provides an estimate based on common
          risk factors and is <strong>not</strong> a substitute for professional
          medical diagnosis or advice.
        </p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-5 p-4 p-md-5 shadow rounded bg-white"
      >
        <h2 className="mb-4 border-bottom pb-3">Patient Information</h2>
        <div className="row g-3">
          
          {/* <div className="col-md-4">
            <label htmlFor="patientId" className="form-label">
              Patient ID (Optional)
            </label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={patientId}
              onChange={handlePatientIdChange}
              className="form-control"
            />
          </div> */}
          
          <div className="col-md-4">
            <label htmlFor="age" className="form-label">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="form-control"
              required
              min="1"
              placeholder="Years"
            />
          </div>
          
          <div className="col-md-4">
            <label htmlFor="gender" className="form-label">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="1">Male</option>
              <option value="0">Female</option>
            </select>
          </div>
          <div className="col-md-4">
            <label htmlFor="chestpain" className="form-label">
              Chest Pain Type
            </label>
            <select
              id="chestpain"
              name="chestpain"
              value={formData.chestpain}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="1">1: Typical Angina</option>
              <option value="2">2: Atypical Angina</option>
              <option value="3">3: Non-anginal Pain</option>
              <option value="4">4: Asymptomatic</option>
            </select>
          </div>
          {/* Resting BP */}
          <div className="col-md-4">
            <label htmlFor="restingBP" className="form-label">
              Resting BP (mm Hg)
            </label>
            <input
              type="number"
              id="restingBP"
              name="restingBP"
              value={formData.restingBP}
              onChange={handleChange}
              className="form-control"
              required
              min="0"
              placeholder="e.g., 120"
            />
          </div>
          {/* Cholesterol */}
          <div className="col-md-4">
            <label htmlFor="serumcholestrol" className="form-label">
              Serum Cholesterol (mg/dl)
            </label>
            <input
              type="number"
              id="serumcholestrol"
              name="serumcholestrol"
              value={formData.serumcholestrol}
              onChange={handleChange}
              className="form-control"
              required
              min="0"
              placeholder="e.g., 200"
            />
          </div>
          {/* Fasting Blood Sugar */}
          <div className="col-md-4">
            <label htmlFor="fastingbloodsugar" className="form-label">
              Fasting BS {">"} 120 mg/dl
            </label>
            <select
              id="fastingbloodsugar"
              name="fastingbloodsugar"
              value={formData.fastingbloodsugar}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          {/* Resting ECG */}
          <div className="col-md-4">
            <label htmlFor="restingrelectro" className="form-label">
              Resting ECG Results
            </label>
            <select
              id="restingrelectro"
              name="restingrelectro"
              value={formData.restingrelectro}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="0">0: Normal</option>
              <option value="1">1: ST-T Abnormality</option>
              <option value="2">2: LV Hypertrophy</option>
            </select>
          </div>
          {/* Max Heart Rate */}
          <div className="col-md-4">
            <label htmlFor="maxheartrate" className="form-label">
              Max Heart Rate Achieved
            </label>
            <input
              type="number"
              id="maxheartrate"
              name="maxheartrate"
              value={formData.maxheartrate}
              onChange={handleChange}
              className="form-control"
              required
              min="0"
              placeholder="e.g., 150 bpm"
            />
          </div>
          {/* Exercise Angina */}
          <div className="col-md-4">
            <label htmlFor="exerciseangia" className="form-label">
              Exercise Induced Angina
            </label>
            <select
              id="exerciseangia"
              name="exerciseangia"
              value={formData.exerciseangia}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          {/* Oldpeak */}
          <div className="col-md-4">
            <label htmlFor="oldpeak" className="form-label">
              ST Depression (Oldpeak)
            </label>
            <input
              type="number"
              id="oldpeak"
              name="oldpeak"
              value={formData.oldpeak}
              onChange={handleChange}
              className="form-control"
              required
              step="0.1"
              min="0"
              placeholder="e.g., 1.0"
            />
          </div>
          {/* Slope */}
          <div className="col-md-4">
            <label htmlFor="slope" className="form-label">
              Slope of Peak Exercise ST
            </label>
            <select
              id="slope"
              name="slope"
              value={formData.slope}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="1">1: Upsloping</option>
              <option value="2">2: Flat</option>
              <option value="3">3: Downsloping</option>
            </select>
          </div>
          {/* Major Vessels */}
          <div className="col-md-4">
            <label htmlFor="noofmajorvessels" className="form-label">
              Major Vessels Colored (0-3)
            </label>
            <select
              id="noofmajorvessels"
              name="noofmajorvessels"
              value={formData.noofmajorvessels}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>{" "}
        {/* End Row */}
        <div className="mt-4 pt-4 text-center border-top">
          <button
            type="submit"
            className="btn btn-primary btn-lg shadow px-5 w-100 w-md-auto"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Analyzing...
              </>
            ) : (
              "Predict Risk"
            )}
          </button>
          {error && (
            <p className="text-danger mt-3 mb-0" aria-live="polite">
              <strong>Error:</strong> {error}
            </p>
          )}
        </div>
      </form>

      {pdfLoading && (
        <div className="pdf-loading-message" role="status">
          Generating PDF... Please wait.
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="p-4 p-md-5 shadow rounded bg-white mb-5">
          <h2 className="mb-4 text-center border-bottom pb-3">
            Prediction Results
          </h2>
          {patientId && (
            <p className="text-center mb-3">
              Reference Patient ID: {patientId}
            </p>
          )}

          {/* Prediction Message */}
          <p
            className={`text-center fs-4 mb-2 fw-bold ${
              result.prediction === 1 ? "text-danger" : "text-success"
            }`}
          >
            {result.message ||
              (result.prediction === 1
                ? "High Risk Detected"
                : "Low Risk Detected")}
          </p>

          {/* --- NEW: Risk Meter --- */}
          <RiskMeter probability={result.probability} />
          {/* --- END: Risk Meter --- */}

          {renderHealthSuggestions()}

          <div className="text-center download-pdf-button">
            <button
              onClick={generatePDF}
              className="btn btn-secondary"
              disabled={pdfLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-download me-2"
                viewBox="0 0 16 16"
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
              Download Results as PDF
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-center mt-4">
        <p className="small">
          <strong>Disclaimer:</strong> This prediction tool is for informational
          purposes only... Model accuracy depends on data quality and inherent
          limitations.
        </p>
      </div>
    </div>
  );
}
