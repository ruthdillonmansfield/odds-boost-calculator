import React, { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { dutchingCalc } from "./calculations.js";

const DutchingCalculator = () => {
  // Only back bets are supported, so we no longer need a mode selection.
  const [targetType, setTargetType] = useState("totalStake"); // 'totalStake' or 'firstStake'
  const [targetValue, setTargetValue] = useState("");
  const [round, setRound] = useState(false);
  // Each outcome now has a name and odds.
  const [outcomes, setOutcomes] = useState([{ name: "", odds: "" }]);
  const [result, setResult] = useState(null);
  const [copiedMinProfit, setCopiedMinProfit] = useState(false);

  useEffect(() => {
    const tv = parseFloat(targetValue) || 0;
    const oddsArray = outcomes.map(o => parseFloat(o.odds));
    // Ensure all outcomes have valid odds greater than zero
    if (tv > 0 && oddsArray.every(o => o > 0)) {
      try {
        const calcResult = dutchingCalc({
          targetType,
          targetValue: tv,
          prices: oddsArray,
          round,
        });
        console.log(calcResult)
        setResult(calcResult);
      } catch (e) {
        setResult({ error: e.message });
      }
    } else {
      setResult(null);
    }
  }, [targetType, targetValue, outcomes, round]);

  const handleOutcomeChange = (index, field, value) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index][field] = value;
    setOutcomes(newOutcomes);
  };

  const addOutcome = () => {
    setOutcomes([...outcomes, { name: "", odds: "" }]);
  };

  const removeOutcome = (index) => {
    if (outcomes.length > 1) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const copyMinProfitToClipboard = () => {
    if (result && typeof result.minProfit === "number") {
      navigator.clipboard.writeText(result.minProfit.toFixed(2)).then(() => {
        setCopiedMinProfit(true);
        setTimeout(() => setCopiedMinProfit(false), 2000);
      });
    }
  };

  return (
    <div className="container dutching-calculator">
      <h2 className="title with-subhead">Dutching Calculator</h2>
      <h4 className="subhead">
        Calculate your stake distribution for a target total stake or a target first selection stake.
      </h4>

      <div className="inline-fields">
        <div className="input-group-inline">
            <button
                className={`toggle-button ${targetType === "totalStake" ? "active-button" : "inactive-button"}`}
                onClick={() => setTargetType("totalStake")}
                style={{padding: "12px"}}
            >
                Target<br />Total Stake
            </button>
        </div>
        <div className="input-group-inline">
            <button
                className={`toggle-button ${targetType === "firstStake" ? "active-button" : "inactive-button"}`}
                onClick={() => setTargetType("firstStake")}
                style={{padding: "12px"}}
            >
                Target<br />First Selection Stake
            </button>
        </div>
      </div>
        
      <div className="inline-fields flex-start">
        <div className="input-group-inline">
          <label>
            Target {targetType === "totalStake" ? "Total Stake" : "First Selection Stake"}:
          </label>
          <div className="input-prefix-suffix only-prefix">
            <span className="prefix">£</span>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="50"
            />
          </div>
        </div>
        <div className="input-group-inline">
          <label>Round Stakes:</label>
          <label className="switch mt-14">
            <input
              type="checkbox"
              checked={round}
              onChange={() => setRound(!round)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <h3>Outcomes</h3>
      {outcomes.map((outcome, idx) => (
        <div
          key={idx}
          className="inline-fields outcome-row"
          style={{ position: "relative" }}
        >
          <div className="input-group-inline">
            <label>Outcome Name:</label>
            <input
              type="text"
              value={outcome.name}
              onChange={(e) => handleOutcomeChange(idx, "name", e.target.value)}
              placeholder="Event name"
            />
          </div>
          <div className="input-group-inline">
            <label>Odds:</label>
            <input
              type="number"
              step="0.01"
              value={outcome.odds}
              onChange={(e) => handleOutcomeChange(idx, "odds", e.target.value)}
              placeholder="3.5"
            />
          </div>
          <div className="input-group-inline">
            <label>Stake:</label>
            <div className="profit-box profit-box-inline">
              <h5 className="outcome-main">
                £{
                    result && result.stakes && result.stakes[idx] !== undefined 
                    ? result.stakes[idx].toFixed(2)
                    : " – "
                }
              </h5>
            </div>
          </div>

          {outcomes.length > 1 && (
            <button
              className="group-remove-button"
              onClick={() => removeOutcome(idx)}
              style={{
                position: "absolute",
                top: "10px",
                right: "-10px",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                backgroundColor: "#ff5555",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
                lineHeight: "20px",
                padding: 0,
              }}
            >
              &times;
            </button>
          )}
        </div>
      ))}
      <button className="add-btn" onClick={addOutcome} style={{padding: "12px"}}>
        Add Outcome
      </button>

      {/* Copyable min profit result box */}
      {result && !result.error && (
        <div
          className={`result-box ${copiedMinProfit ? "glow" : ""}`}
          onClick={copyMinProfitToClipboard}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <h5 className="outcome-main">
            <span>
              Minimum Guaranteed Profit: £
              {typeof result.minProfit === "number"
                ? result.minProfit.toFixed(2)
                : "0.00"}
            </span>
          </h5>
        </div>
      )}

      {result && result.error && (
        <div className="error-message">{result.error}</div>
      )}

      {/* Results table */}
      {result && !result.error && (
        <div className="best-selections-grid" style={{ marginTop: "30px" }}>
          <div className="grid-header first-col">Event</div>
          <div className="grid-header">Returns</div>
          <div className="grid-header">Profit</div>
          {outcomes.map((outcome, idx) => (
            <React.Fragment key={idx}>
              <div className="first-col">
                {outcome.name.trim() || "Untitled"}
              </div>
              <div>
                {result.returns && result.returns[idx] !== undefined
                  ? "£" + result.returns[idx].toFixed(2)
                  : "–"}
              </div>
              <div>
                {result.profits && result.profits[idx] !== undefined
                  ? result.profits[idx] >= 0
                    ? "£" + result.profits[idx].toFixed(2)
                    : "-£" + Math.abs(result.profits[idx]).toFixed(2)
                  : "–"}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default DutchingCalculator;
