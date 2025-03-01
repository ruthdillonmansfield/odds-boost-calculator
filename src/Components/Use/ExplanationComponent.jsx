import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Use.css";
import Footer from "../Footer/Footer";
import { Zap, Rocket } from "lucide-react"; // Using Zap and Rocket icons

const ExplanationComponent = () => {
  const location = useLocation();
  const [showOverlay, setShowOverlay] = useState(false);

  // Example instructions per calculator (we focus on the risk-free EBO case here)
  const instructionsMap = {
    "/risk-free-ebocalc": (
      <div>
        <p>
          The Equivalent Boosted Odds (EBO) method reframes a risk-free bet into an
          effective value bet.
        </p>
        <p>
          Compare the EBO to the true odds: if EBO is higher, taking the AP bet may be
          favorable.
        </p>
      </div>
    ),
    // ...other instructions for different calculators
  };

  const calculatorInstructions = instructionsMap[location.pathname] || (
    <p>Use the calculator above to get started.</p>
  );

  return (
    <aside className="use">
      <div className="use-content">
        <h3 className="title">Lightning-Fast Odds Calculations</h3>

        <ul className="use-list">
          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={18} color="#00aaff" />
            Matched betting? Quickly lock in profit before odds shift.
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Rocket size={18} color="#ff9900" />
            Press <strong>"C"</strong> to <strong>copy</strong> instantly.
          </li>
        </ul>

        <div className="calculator-instructions">
          <h3>Using this Calculator</h3>
          {calculatorInstructions}
          {location.pathname === "/risk-free-ebocalc" && (
            <div style={{ marginTop: "12px" }}>
              <button
                className="learn-more-button"
                onClick={() => setShowOverlay(true)}
              >
                Learn More
              </button>
            </div>
          )}
        </div>

        <div className="use-cta disclaimer">
          <p>
            <strong>Disclaimer:</strong> These calculators are for informational purposes only.
            Always gamble responsibly.
          </p>
        </div>
      </div>
      <Footer />

      {showOverlay && (
        <div
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowOverlay(false);
          }}
        >
          <div className="overlay-content">
            <button
              className="close-button"
              onClick={() => setShowOverlay(false)}
              title="Close"
            >
              ✖
            </button>
            <h2>Understanding the EBO Method</h2>
            <p>
              When you receive a risk-free bet, you have two choices:
              either lay it (via matched betting) to secure a small profit or take it as
              an AP bet with variance.
            </p>
            <p>
              The EBO method converts the risk-free bet into “boosted odds” by accounting
              for the effective free bet value (based on your retention rate) and your maximum loss.
              For example, with a £10 bet at 4.0 odds and a 70% retention, your free bet is worth £7,
              meaning your maximum loss is £3 and your potential profit is £30.
            </p>
            <p>
              The Equivalent Boosted Odds (EBO) is then calculated as:
              <br />
              <em>True Odds + ((Potential Profit – Max Loss) * (True Odds – 1))</em>.
              Compare this value with the true odds to decide if an AP bet is more favorable.
            </p>
            <p>
              Additionally, a rating is derived (EBO / True Odds) which helps you quickly assess
              the bet’s value:
              <br />
              100% or lower – Not worth it; 120%+ – Excellent edge.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ExplanationComponent;
