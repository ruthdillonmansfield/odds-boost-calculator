import React, { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { calculateAdditionalLayNew, calculateOverallProfit, computeBackMatched,calcMinProfit } from "./calculations.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";

const PartialLayCalculator = () => {
  const meta = pageConfig.riskFreeEBOCalculator?.seo || {};

  const [backStake, setBackStake] = useState("");
  const [backOdds, setBackOdds] = useState("");
  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);
  const [partials, setPartials] = useState([
    { layOdds: "", amount: "", commission: "0", locked: false },
  ]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [totalLayed, setTotalLayed] = useState(0);
  const [weightedLayOdds, setWeightedLayOdds] = useState(0);
  const [totalLayLiability, setTotalLayLiability] = useState(0);
  const [remainingLiability, setRemainingLiability] = useState(0);
  const [suggestedAdditionalLay, setSuggestedAdditionalLay] = useState(0);
  const [minProfit, setMinProfit] = useState(null);
  const [copiedAdditional, setCopiedAdditional] = useState(false);
  const [finishedLaying, setFinishedLaying] = useState(false);

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
    // Back bet liability: if free bet and stake not returned, effective liability = S*(B-1); otherwise S*B.
    const backLiability = freeBet && !stakeReturned ? S * (B - 1) : S * B;

    let weightedSum = 0;
    let layLiability = 0;
    let totalBackMatched = 0;
    let totalLayMatched = 0;
    partials.forEach((row, i) => {
      const amt = parseFloat(row.amount) || 0;
      let lOdds = parseFloat(row.layOdds);
      // If this row's layOdds is empty, try to use the most recent defined value.
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
      weightedSum += amt * lOdds;
      if (lOdds > 1) {
        layLiability += amt * (lOdds - 1);
      }
      totalLayMatched += parseFloat(row.amount) || 0;
      totalBackMatched += computeBackMatched(row, backOdds, freeBet, stakeReturned);
    });

    let totalAmount = 0;
    let effectiveOddsSum = 0;
    partials.forEach(row => {
      const amt = parseFloat(row.amount) || 0;
      const lOdds = parseFloat(row.layOdds) || 0;
      const comm = parseFloat(row.commission) || 0;
      const effectiveOdds = lOdds + comm / 100;
      totalAmount += amt;
      effectiveOddsSum += amt * effectiveOdds;
    });
    const wAvg = totalAmount > 0 ? effectiveOddsSum / totalAmount : 0;    
    const leftoverLiability = Math.max(0, backLiability - layLiability);

    setTotalMatched(totalBackMatched);
    setTotalLayed(totalLayMatched);
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
    if (finalOdds === 0) {
      finalOdds = wAvg;
      finalComm = 0;
    }
    const chosenOdds = finalOdds || wAvg;
    // Calculate additional lay using the total back bet matched.
    const additionalNew = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalBackMatched, chosenOdds, finalComm);
    setSuggestedAdditionalLay(additionalNew > 0 ? additionalNew : 0);
    setFinishedLaying(additionalNew <= 0);

    const { minProfit: newMinProfit } = calcMinProfit(S, B, chosenOdds, finalComm, freeBet, stakeReturned);
    setMinProfit(Number.isFinite(newMinProfit) ? newMinProfit : null);  }, [backStake, backOdds, partials, freeBet, stakeReturned]);

  const handlePartialChange = (index, field, value) => {
    const newPartials = [...partials];
    newPartials[index][field] = value;
    setPartials(newPartials);
  };

  const addPartialRow = () => {
    if (suggestedAdditionalLay === 0) {
      setFinishedLaying(true);
      setSuggestedAdditionalLay(0);
      return;
    }
    const newPartials = [...partials];
    if (newPartials.length > 0) {
      newPartials[newPartials.length - 1].locked = true;
    }
    newPartials.push({ layOdds: "", amount: "", commission: "0", locked: false });
    setPartials(newPartials);
    setFinishedLaying(false);
  };

  const copyAdditionalToClipboard = () => {
    navigator.clipboard.writeText(suggestedAdditionalLay.toFixed(2)).then(() => {
      setCopiedAdditional(true);
      setTimeout(() => setCopiedAdditional(false), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") {
      copyAdditionalToClipboard();
    }
  };

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
    <>
    <Seo 
        title={meta.title} 
        description={meta.description} 
      />
    <div className="container">
      <h2 className="title with-subhead">Partial Lay Calculator</h2>
      <h4 className="subhead">Lock in profit when you'll need to lay partially at multiple odds.</h4>
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
              placeholder="10"
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
            placeholder="3.5"
          />
        </div>
      </div>

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

      <h3 style={{ marginBottom: "8px" }}>Partial Lay Entries</h3>
      {partials.map((row, idx) => (
  <div
    key={idx}
    className={`inline-fields partial-row partial-row-trio ${row.locked ? "locked" : ""}`}
  >
    <div className="input-group-inline">
      <label>Lay Odds:</label>
      <input
        type="number"
        step="0.01"
        value={row.layOdds}
        onChange={(e) => handlePartialChange(idx, "layOdds", e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="3.7"
        disabled={row.locked}
      />
    </div>
    <div className="input-group-inline">
      <label>Lay Stake:</label>
      <div className="input-prefix-suffix only-prefix">
        <span className="prefix">£</span>
        <input
          type="number"
          step="0.01"
          value={row.amount}
          onChange={(e) => handlePartialChange(idx, "amount", e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="5"
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
<button className={finishedLaying ? "frozen" : ""} onClick={addPartialRow} style={{ padding: "12px" }} disabled={finishedLaying}>
  {finishedLaying ? "Finished Laying" : "Add Partial Entry"}
</button>


      {!finishedLaying && (
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
    <h5 className="outcome-main">
    <span>
      Suggested Additional Lay: £
      {typeof suggestedAdditionalLay === "number"
        ? suggestedAdditionalLay.toFixed(2)
        : "0.00"}
    </span>
    </h5>
    {copiedAdditional ? (
      <ClipboardCheck size={24} color="#edff00" />
    ) : (
      <Clipboard size={24} color="#00aaff" />
    )}
  </div>
)}

      <div className="profit-box" style={{ marginTop: "30px", textAlign: "left" }}>
        <div className="outcome-line">
            <span className="outcome-label">Total layed:</span>
            <span className="outcome-value">£{totalLayed.toFixed(2)}</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Total back bet matched:</span>
          <span className="outcome-value">
            £{totalMatched.toFixed(2)} / £{(parseFloat(backStake) || 0).toFixed(2)}
        </span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Avg. lay odds (weighted):</span>
          <span className="outcome-value">{parseFloat(weightedLayOdds.toFixed(3))}</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Total lay liability:</span>
          <span className="outcome-value">£{totalLayLiability.toFixed(2)}</span>
        </div>
        <div className="outcome-line min-profit-row">
          <span className="outcome-label">
            {!finishedLaying
              ? "If you keep laying at these odds, your minimum profit will be:"
              : "Your minimum profit will be:"}
          </span>
          <span className="outcome-value">
            {minProfit !== null && Number.isFinite(minProfit)
              ? formatValue(minProfit)
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
    </>
  );
};

export default PartialLayCalculator;
