import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";
import { calcMinProfit, computeBackMatched } from "./calculations.js";

const ArbCalculator = () => {
  const meta = pageConfig.ArbCalculator?.seo || {};

  const [backOdds, setBackOdds] = useState("");
  const [stake, setStake] = useState("");
  const [layOdds, setLayOdds] = useState("");
  const [commission, setCommission] = useState(0);
  // New state for maximum lay stake available and toggle for "Find Maximum"
  const [maxLayStake, setMaxLayStake] = useState("");
  const [findMaximum, setFindMaximum] = useState(false);
  const [calcData, setCalcData] = useState(null);
  const [copied, setCopied] = useState(false);

  const isInputValid = () => {
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    if (!S || !B || !LO) return false;
    if (S <= 0 || B <= 1 || LO <= 1) return false;
    return true;
  };

  // Re-calc arbitrage results whenever the inputs change.
  useEffect(() => {
    if (isInputValid()) {
      const S = parseFloat(stake);
      const B = parseFloat(backOdds);
      const L = parseFloat(layOdds);
      const result = calcMinProfit(S, B, L, parseFloat(commission));
      setCalcData(result);
    } else {
      setCalcData(null);
    }
  }, [backOdds, stake, layOdds, commission]);

  // Auto-compute back stake using maximum lay stake if findMaximum is enabled.
  useEffect(() => {
    if (findMaximum) {
      const parsedMaxLay = parseFloat(maxLayStake);
      const B = parseFloat(backOdds);
      const L = parseFloat(layOdds);
      const comm = parseFloat(commission);
      if (!parsedMaxLay || !B || !L) return;
      // For arbitrage, freeBet and stakeReturned are false.
      const row = { amount: parsedMaxLay, layOdds: L, commission: comm };
      const computedStake = computeBackMatched(row, B, false, false);
      setStake(computedStake.toFixed(2));
    }
  }, [findMaximum, maxLayStake, backOdds, layOdds, commission]);

  const copyToClipboard = () => {
    if (calcData !== null) {
      navigator.clipboard.writeText(calcData.layStake.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") copyToClipboard();
  };

  const formatValue = (val) => {
    if (val === null) return "";
    const absVal = Math.abs(val).toFixed(2);
    return val >= 0 ? (
      <span className="positive">£{absVal}</span>
    ) : (
      <span className="negative">-£{absVal}</span>
    );
  };

  const getLayStakeLabel = () => {
    if (!isInputValid() || calcData === null) return "";
    return `£${formatMoney(calcData.layStake)}`;
  };

  const getGuaranteedProfit = () => {
    if (!isInputValid() || calcData === null) return "";
    return calcData.minProfit;
  };

  const buildBreakdown = () => {
    if (!isInputValid() || calcData === null) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);

    const bookieBackProfit = S * (B - 1);
    const layLoss = Math.abs(calcData.potExchangeLoss);
    const bookieOutcome = {
      backProfit: parseFloat(bookieBackProfit.toFixed(2)),
      layLoss: parseFloat(layLoss.toFixed(2)),
      net: parseFloat(calcData.profitIfBookieWins.toFixed(2))
    };

    const exchangeOutcome = {
      backLoss: -S,
      layWin: parseFloat(calcData.potExchangeWinnings.toFixed(2)),
      net: parseFloat(calcData.profitIfExchangeWins.toFixed(2))
    };

    return { bookieOutcome, exchangeOutcome };
  };

  const pureBetRating = (B, LO) => {
    if (!B || !LO || B <= 1 || LO <= 1) return null;
    return ((B - 1) / (LO - 1)) * 100;
  };

  const isValid = isInputValid() && calcData !== null;
  const guaranteedProfit = getGuaranteedProfit();
  const breakdown = buildBreakdown();

  return (
    <>
      <Seo 
        title={meta.title} 
        description={meta.description} 
      />
      <div className="container">
        <h2 className="title with-subhead">Arbitrage Calculator</h2>
        <h4 className="subhead">Calculate arbitrage opportunities to find guaranteed profit scenarios.</h4>

        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Back Odds:</label>
            <input
              type="number"
              step="0.01"
              value={backOdds}
              onChange={(e) => setBackOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="10"
            />
          </div>
          <div className="input-group-inline">
            <label>Stake:</label>
            <div className="input-prefix-suffix only-prefix">
              <span className="prefix">£</span>
              <input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="10"
              />
            </div>
          </div>
        </div>

        <div className="inline-fields lay-row">
          <div className="input-group-inline">
            <label>Lay Odds:</label>
            <input
              type="number"
              step="0.01"
              value={layOdds}
              onChange={(e) => setLayOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="10"
            />
          </div>
          <div className="input-group-inline">
            <label>Exchange Commission:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="0"
              />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>

        {/* Toggle for Find Maximum */}
        <div className="bet-type-headline mb-16">
          <div className="toggle-inline">
            <label className="toggle-label">Find Maximum
                <span className="info-icon" style={{ marginLeft: "4px" }}>
                    i
                    <span className="tooltip-text">
                      Enter the maximum lay liquidity available to find the maximum back stake.
                    </span>
                  </span>
            </label>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={findMaximum} 
                onChange={() => setFindMaximum(!findMaximum)} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* If Find Maximum is enabled, show the Max Lay Stake Available field */}
        {findMaximum && (
          <div className="inline-fields">
            <div className="input-group-inline">
              <label>Max Lay Stake Available:</label>
              <div className="input-prefix-suffix only-prefix">
                <span className="prefix">£</span>
                <input
                  type="number"
                  step="0.01"
                  value={maxLayStake}
                  onChange={(e) => setMaxLayStake(e.target.value)}
                  placeholder="Enter max lay stake"
                />
              </div>
            </div>
          </div>
        )}

        {isValid && (
          <div
            className={`result-box copyable ${copied ? "glow" : ""}`}
            onClick={copyToClipboard}
            title="Click to copy lay stake"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "20px"
            }}
          >
            <h5 className="outcome-main">
              <span>You could lay: {getLayStakeLabel()}</span>
            </h5>
            {copied ? (
              <ClipboardCheck size={24} color="#edff00" />
            ) : (
              <Clipboard size={24} color="#00aaff" />
            )}
          </div>
        )}

        {isValid && guaranteedProfit !== "" && (
          <div className="highlight-box">
            <div className="stats-row">
              <div className="stat-block">
                <div className="stat-label">Your Profit</div>
                <div className="stat-value">
                  {formatValue(guaranteedProfit)}
                </div>
              </div>
        
              <div className="stat-block">
                <div className="stat-label">
                  Bet Rating
                  <span className="info-icon" style={{ marginLeft: "4px" }}>
                    i
                    <span className="tooltip-text">
                      This tells us how close the back/lay odds are. If the back odds exceed the lay odds, the bet might be an arbitrage.
                    </span>
                  </span>
                </div>
                {(() => {
                  const rating = pureBetRating(parseFloat(backOdds), parseFloat(layOdds));
                  const isGood = rating >= 100;              
                  if (rating === null) {
                    return <div className="stat-value">–</div>;
                  }
                  return (
                    <div className={`stat-value ${isGood ? "positive" : "negative"}`}>
                      {rating.toFixed(1)}%
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {isValid && breakdown && (
          <div className="outcome-container" style={{ marginTop: "20px" }}>
            <div className="outcome-group">
              <div className="group-title">If Bookie Wins:</div>
              <div className="outcome-line">
                <span className="outcome-label">Back Profit:</span>
                <span className="outcome-value">{formatValue(breakdown.bookieOutcome.backProfit)}</span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Lay Loss:</span>
                <span className="outcome-value">{formatValue(-breakdown.bookieOutcome.layLoss)}</span>
              </div>
              <div className="outcome-line net-outcome">
                <span className="outcome-label">Net Outcome:</span>
                <span className="outcome-value">{formatValue(breakdown.bookieOutcome.net)}</span>
              </div>
            </div>
            <div className="outcome-group">
              <div className="group-title">If Exchange Wins:</div>
              <div className="outcome-line">
                <span className="outcome-label">Back Loss:</span>
                <span className="outcome-value">{formatValue(breakdown.exchangeOutcome.backLoss)}</span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Lay Win:</span>
                <span className="outcome-value">{formatValue(breakdown.exchangeOutcome.layWin)}</span>
              </div>
              <div className="outcome-line net-outcome">
                <span className="outcome-label">Net Outcome:</span>
                <span className="outcome-value">{formatValue(breakdown.exchangeOutcome.net)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArbCalculator;
