import React, { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";

const PartialLayCalculator = () => {
  // Back bet inputs
  const [backStake, setBackStake] = useState("");
  const [backOdds, setBackOdds] = useState("");

  // Dynamic array for partial lay entries: each row has { layOdds, amount }
  const [partials, setPartials] = useState([{ layOdds: "", amount: "" }]);

  // Computed summary values
  const [totalMatched, setTotalMatched] = useState(0);
  const [weightedLayOdds, setWeightedLayOdds] = useState(0);
  const [totalLayLiability, setTotalLayLiability] = useState(0);
  const [remainingLiability, setRemainingLiability] = useState(0);
  const [suggestedAdditionalLay, setSuggestedAdditionalLay] = useState(0);

  // New state for copying the suggested additional lay value
  const [copiedAdditional, setCopiedAdditional] = useState(false);

  // Update computed values whenever any input changes
  useEffect(() => {
    const stake = parseFloat(backStake) || 0;
    const odds = parseFloat(backOdds) || 0;
    // The "liability" from the back bet (how much you effectively stand to lose if it wins)
    const backLiability = stake > 0 && odds > 1 ? stake * (odds - 1) : 0;

    let sumAmount = 0;
    let weightedSum = 0;
    let layLiability = 0;
    partials.forEach((row) => {
      const amt = parseFloat(row.amount) || 0;
      const lOdds = parseFloat(row.layOdds) || 0;
      sumAmount += amt;
      weightedSum += amt * lOdds;
      if (lOdds > 1) {
        layLiability += amt * (lOdds - 1);
      }
    });

    const total = sumAmount;
    const wAvg = total > 0 ? weightedSum / total : 0;
    const leftoverLiability = Math.max(0, backLiability - layLiability);

    setTotalMatched(total);
    setWeightedLayOdds(wAvg);
    setTotalLayLiability(layLiability);
    setRemainingLiability(leftoverLiability);

    // For "Suggested Additional Lay," use the last row’s odds.
    if (partials.length > 0) {
      const lastRow = partials[partials.length - 1];
      const lastOdds = parseFloat(lastRow.layOdds) || 0;
      if (lastOdds > 1) {
        const needed = leftoverLiability / (lastOdds - 1);
        setSuggestedAdditionalLay(needed);
      } else {
        setSuggestedAdditionalLay(0);
      }
    } else {
      setSuggestedAdditionalLay(0);
    }
  }, [backStake, backOdds, partials]);

  // Update a specific partial row
  const handlePartialChange = (index, field, value) => {
    const newPartials = [...partials];
    newPartials[index][field] = value;
    setPartials(newPartials);
  };

  // Add a new partial row
  const addPartialRow = () => {
    setPartials([...partials, { layOdds: "", amount: "" }]);
  };

  // New copy function for Suggested Additional Lay
  const copyAdditionalToClipboard = () => {
    navigator.clipboard.writeText(suggestedAdditionalLay.toString()).then(() => {
      setCopiedAdditional(true);
      setTimeout(() => setCopiedAdditional(false), 2000);
    });
  };

  // Handle key down for copying with "c"
  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") {
      copyAdditionalToClipboard();
    }
  };

  return (
    <div className="container">
      <h2 className="title">Partial Lay Calculator</h2>
      
      {/* Back Bet Details */}
      <div className="inline-fields">
        <div className="input-group-inline">
          <label>Back Bet Stake:</label>
          <div className="input-prefix-suffix only-prefix">
            <span className="prefix">£</span>
            <input 
              type="number" 
              value={backStake}
              onChange={(e) => setBackStake(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 100"
            />
          </div>
        </div>
        <div className="input-group-inline">
          <label>Back Bet Odds:</label>
          <input 
            type="number" 
            step="0.01"
            value={backOdds}
            onChange={(e) => setBackOdds(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 3.50"
          />
        </div>
      </div>
      
      {/* Partial Lay Entries */}
      <h3 style={{ marginBottom: "8px" }}>Partial Lay Entries</h3>
      {partials.map((row, index) => (
        <div key={index} className="inline-fields">
          <div className="input-group-inline">
            <label>Lay Odds:</label>
            <input 
              type="number" 
              step="0.01"
              value={row.layOdds}
              onChange={(e) => handlePartialChange(index, "layOdds", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 3.00"
            />
          </div>
          <div className="input-group-inline">
            <label>Amount Matched:</label>
            <div className="input-prefix-suffix only-prefix">
              <span className="prefix">£</span>
              <input 
                type="number"
                step="0.01"
                value={row.amount}
                onChange={(e) => handlePartialChange(index, "amount", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 30"
              />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addPartialRow} style={{ padding: "12px" }}>Add Partial Entry</button>
      
      {/* Additional Lay Required Box */}
      <div
        className={`result-box copyable ${copiedAdditional ? "glow" : ""}`}
        onClick={copyAdditionalToClipboard}
        title="Click to copy suggested additional lay"
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <span>
          Suggested Additional Lay:{" "}
          {(suggestedAdditionalLay === 0 && totalMatched < parseFloat(backStake))
            ? ""
            : `£${suggestedAdditionalLay.toFixed(2)}`}
        </span>
        {copiedAdditional ? (
          <ClipboardCheck size={24} color="#edff00" />
        ) : (
          <Clipboard size={24} color="#00aaff" />
        )}
      </div>
      
      {/* Summary Section */}
      <div className="profit-box" style={{ marginTop: "30px", textAlign: "left" }}>
        <h3 style={{ marginBottom: "12px" }}>Summary</h3>
        <div className="outcome-line">
          <span className="outcome-label">Total Lay:</span>
          <span className="outcome-value">£{totalMatched.toFixed(2)}</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Weighted Avg Lay Odds:</span>
          <span className="outcome-value">{weightedLayOdds.toFixed(2)}</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Total Lay Liability:</span>
          <span className="outcome-value">
            £{totalLayLiability.toFixed(2)}
          </span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Est. Remaining Liability:</span>
          <span className="outcome-value">
            £{remainingLiability.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PartialLayCalculator;
