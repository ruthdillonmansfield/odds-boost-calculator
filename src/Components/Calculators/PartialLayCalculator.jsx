import React, { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";

const PartialLayCalculator = () => {
  // Back bet inputs
  const [backStake, setBackStake] = useState("");
  const [backOdds, setBackOdds] = useState("");

  // Free bet toggles
  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);

  // Dynamic array for partial lay entries: each row now has { layOdds, amount, commission, locked }
  const [partials, setPartials] = useState([
    { layOdds: "", amount: "", commission: "0", locked: false },
  ]);

  // Computed summary values
  const [totalMatched, setTotalMatched] = useState(0);
  const [weightedLayOdds, setWeightedLayOdds] = useState(0);
  const [totalLayLiability, setTotalLayLiability] = useState(0);
  const [remainingLiability, setRemainingLiability] = useState(0);
  const [suggestedAdditionalLay, setSuggestedAdditionalLay] = useState(0);
  const [minProfit, setMinProfit] = useState(null);

  // State for copying suggested additional lay value
  const [copiedAdditional, setCopiedAdditional] = useState(false);

  // Helper: Validate that back bet inputs are valid
  const isInputValid = () => {
    const S = parseFloat(backStake);
    const B = parseFloat(backOdds);
    return S > 0 && B > 1;
  };

  // Update computed values whenever inputs or partials change
  useEffect(() => {
    const S = parseFloat(backStake) || 0;
    const B = parseFloat(backOdds) || 0;
    if (S === 0 || B === 0) {
      setSuggestedAdditionalLay(0);
      setTotalMatched(0);
      setWeightedLayOdds(0);
      setTotalLayLiability(0);
      setRemainingLiability(0);
      setMinProfit(null);
      return;
    }
    // For free bet (stake not returned), effective back liability is (B-1)*S;
    // otherwise, it's S*B.
    const backLiability = freeBet && !stakeReturned ? S * (B - 1) : S * B;

    let sumAmount = 0;
    let weightedSum = 0;
    let layLiability = 0;
    partials.forEach((row, i) => {
      const amt = parseFloat(row.amount) || 0;
      let lOdds = parseFloat(row.layOdds);
      // If this row's layOdds is empty, use the most recent defined value.
      if (!lOdds && i > 0) {
        for (let j = i - 1; j >= 0; j--) {
          const candidate = parseFloat(partials[j].layOdds);
          if (candidate && candidate > 1) {
            lOdds = candidate;
            break;
          }
        }
      }
      lOdds = lOdds || 0;
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

    // Determine effective (final) odds and commission from the last row with valid layOdds.
    let finalOdds = 0;
    let finalComm = 0;
    for (let i = partials.length - 1; i >= 0; i--) {
      const candidate = parseFloat(partials[i].layOdds);
      if (candidate && candidate > 1) {
        finalOdds = candidate;
        finalComm = parseFloat(partials[i].commission) || 0;
        break;
      }
    }
    // Use the commission factor as 1 - (commission/100)
    const commFactor = 1 - finalComm / 100;

    // Compute ideal total lay stake based on back bet type.
    let idealLay = 0;
    if (freeBet) {
      if (stakeReturned) {
        // Free bet, stake returned: idealLay = (S * B) / (finalOdds - (finalComm/100))
        idealLay = (S * B) / (finalOdds - finalComm / 100);
      } else {
        // Free bet, stake NOT returned: idealLay = (S * (B - 1)) / (finalOdds - finalComm / 100)
        idealLay = (S * (B - 1)) / (finalOdds - finalComm / 100);
      }
    } else {
      // Normal bet: idealLay = (S * B) / (finalOdds - finalComm / 100)
      idealLay = (S * B) / (finalOdds - finalComm / 100);
    }
    const additional = idealLay - total;
    setSuggestedAdditionalLay(additional > 0 ? additional : 0);

    // For profit calculations, total lay is what’s matched plus the suggested additional lay.
    const totalLay = total + (additional > 0 ? additional : 0);

    // Calculate profit if the back bet wins:
    // For normal bet: profit = S*(B - 1) - totalLay*(finalOdds - 1)
    // For free bet with stake returned: profit = B*S - totalLay*(finalOdds - 1)
    // For free bet with stake not returned: profit = (B - 1)*S - totalLay*(finalOdds - 1)
    let profitIfBackWins = 0;
    if (!freeBet) {
      profitIfBackWins = S * (B - 1) - totalLay * (finalOdds - 1);
    } else if (freeBet && stakeReturned) {
      profitIfBackWins = B * S - totalLay * (finalOdds - 1);
    } else {
      profitIfBackWins = (B - 1) * S - totalLay * (finalOdds - 1);
    }

    // Calculate profit if the exchange (lay) bet wins:
    // For normal bet: profit = totalLay * commFactor - S
    // For free bet: profit = totalLay * commFactor (since you don’t lose your stake)
    let profitIfExchangeWins = 0;
    if (!freeBet) {
      profitIfExchangeWins = totalLay * commFactor - S;
    } else {
      profitIfExchangeWins = totalLay * commFactor;
    }

    // Worst-case profit is the lower of the two.
    const worstProfit = Math.min(profitIfBackWins, profitIfExchangeWins);
    setMinProfit(worstProfit);
  }, [backStake, backOdds, partials, freeBet, stakeReturned]);

  // Update a specific partial row
  const handlePartialChange = (index, field, value) => {
    const newPartials = [...partials];
    newPartials[index][field] = value;
    setPartials(newPartials);
  };

  // Add a new partial row and lock the previous one
  const addPartialRow = () => {
    const newPartials = [...partials];
    if (newPartials.length > 0) {
      newPartials[newPartials.length - 1].locked = true;
    }
    newPartials.push({ layOdds: "", amount: "", commission: "0", locked: false });
    setPartials(newPartials);
  };

  // Copy function for Suggested Additional Lay
  const copyAdditionalToClipboard = () => {
    navigator.clipboard.writeText(suggestedAdditionalLay.toFixed(2)).then(() => {
      setCopiedAdditional(true);
      setTimeout(() => setCopiedAdditional(false), 2000);
    });
  };

  // Keydown handler for copying with "c"
  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") {
      copyAdditionalToClipboard();
    }
  };

  // Helper to format the total matched as the lay stake label
  const getLayStakeLabel = () => {
    return `£${formatMoney(totalMatched)}`;
  };

  // Format numeric values with sign and color
  const formatValue = (val) => {
    if (val === null || isNaN(val)) return "";
    const absVal = Math.abs(val).toFixed(2);
    return val >= 0 ? (
      <span className="positive">£{absVal}</span>
    ) : (
      <span className="negative">-£{absVal}</span>
    );
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

      {/* Free Bet Toggles */}
      <div className="bet-type-headline" style={{ marginBottom: "16px" }}>
        <div className="toggle-inline">
          <label className="toggle-label">Free Bet</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={freeBet}
              onChange={() => setFreeBet(!freeBet)}
            />
            <span className="slider"></span>
          </label>
        </div>
        {freeBet && (
          <div className="toggle-inline">
            <label className="toggle-label">Stake Returned</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={stakeReturned}
                onChange={() => setStakeReturned(!stakeReturned)}
              />
              <span className="slider"></span>
            </label>
          </div>
        )}
      </div>

      {/* Partial Lay Entries */}
      <h3 style={{ marginBottom: "8px" }}>Partial Lay Entries</h3>
      {partials.map((row, idx) => (
        <div key={idx} className="inline-fields partial-row">
          <div className="input-group-inline">
            <label>Lay Odds:</label>
            <input
              type="number"
              step="0.01"
              value={row.layOdds}
              onChange={(e) => handlePartialChange(idx, "layOdds", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 3.00"
              disabled={row.locked}
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
                onChange={(e) => handlePartialChange(idx, "amount", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 30"
                disabled={row.locked}
              />
            </div>
          </div>
          <div className="input-group-inline">
            <label>Commission:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                value={row.commission}
                onChange={(e) => handlePartialChange(idx, "commission", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={row.locked}
              />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addPartialRow} style={{ padding: "12px" }}>
        Add Partial Entry
      </button>

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
          Suggested Additional Lay: £
          {typeof suggestedAdditionalLay === "number"
            ? suggestedAdditionalLay.toFixed(2)
            : "0.00"}
        </span>
        {copiedAdditional ? (
          <ClipboardCheck size={24} color="#edff00" />
        ) : (
          <Clipboard size={24} color="#00aaff" />
        )}
      </div>

      {/* Summary Section */}
      <div className="profit-box" style={{ marginTop: "30px", textAlign: "left" }}>
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
          <span className="outcome-value">£{totalLayLiability.toFixed(2)}</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Est. Remaining Liability:</span>
          <span className="outcome-value">£{remainingLiability.toFixed(2)}</span>
        </div>
        <div className="outcome-line min-profit-row">
          <span className="outcome-label">
            {remainingLiability > 0
              ? "If you keep laying at these odds, your minimum profit will be:"
              : "Your minimum profit is:"}
          </span>
          <span className="outcome-value">
            {minProfit !== null ? formatValue(minProfit) : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PartialLayCalculator;
