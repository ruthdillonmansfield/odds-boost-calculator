import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber, formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";
import { calcMinProfit } from "./calculations.js";

const formatValue = (value) => {
  if (value === null) return "";
  const absVal = Math.abs(value).toFixed(2);
  return value >= 0 ? (
    <span className="positive">£{absVal}</span>
  ) : (
    <span className="negative">–£{absVal}</span>
  );
};

const isInputValid = (stake, odds, layOdds) => {
  const S = parseFloat(stake);
  const B = parseFloat(odds);
  const LO = parseFloat(layOdds);
  if (!S || !B || !LO) return false;
  if (S <= 0 || B <= 1 || LO <= 1) return false;
  return true;
};

const AdvancedOddsBoostCalculator = () => {
  const meta = pageConfig.advancedOddsBoostCalculator?.seo || {};

  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);
  const [odds, setOdds] = useState("");
  const [boost, setBoost] = useState(10);
  const [stake, setStake] = useState("");
  const [layOdds, setLayOdds] = useState("");
  const [commission, setCommission] = useState("");
  const [boostedOdds, setBoostedOdds] = useState(null);
  const [calcData, setCalcData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Compute boosted odds and recalc all outcome values via calcMinProfit.
  useEffect(() => {
    const S = parseFloat(stake);
    const decOdds = parseFloat(odds);
    const boostPct = parseFloat(boost);
    const LO = parseFloat(layOdds);
    const comm = parseFloat(commission) || 0;
    if (!isInputValid(stake, odds, layOdds) || isNaN(boostPct)) {
      setBoostedOdds(null);
      setCalcData(null);
      return;
    }
    const newBoostedOdds = 1 + (decOdds - 1) * (1 + boostPct / 100);
    const roundedBoostedOdds = parseFloat(newBoostedOdds.toFixed(3));
    setBoostedOdds(roundedBoostedOdds);
    const result = calcMinProfit(S, roundedBoostedOdds, LO, comm, freeBet, stakeReturned);
    setCalcData(result);
  }, [odds, boost, stake, layOdds, commission, freeBet, stakeReturned]);

  const copyToClipboard = () => {
    if (calcData !== null) {
      navigator.clipboard.writeText(calcData.layStake.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Calculations update automatically via useEffect.
    }
    if (e.key.toLowerCase() === "c") {
      copyToClipboard();
    }
  };

  const getLayStakeLabel = () => {
    if (!isInputValid(stake, odds, layOdds) || calcData === null) return "";
    return `£${formatMoney(calcData.layStake)}`;
  };

  const getGuaranteedProfit = () => {
    if (!isInputValid(stake, odds, layOdds) || calcData === null) return "";
    return calcData.minProfit;
  };

  // Build a breakdown for display using calcData values.
  const buildBreakdown = () => {
    if (!isInputValid(stake, odds, layOdds) || calcData === null) return null;
    const S = parseFloat(stake);
    const B = boostedOdds; // boosted odds used in place of the original odds
    const LO = parseFloat(layOdds);

    let bookieOutcome, exchangeOutcome;
    if (freeBet && stakeReturned) {
      bookieOutcome = {
        backProfit: parseFloat((S * B).toFixed(2)),
        layLoss: parseFloat(((LO - 1) * calcData.layStake).toFixed(2)),
        net: parseFloat(calcData.profitIfBookieWins.toFixed(2))
      };
      exchangeOutcome = {
        backLoss: 0,
        layWin: parseFloat(calcData.potExchangeWinnings.toFixed(2)),
        net: parseFloat(calcData.profitIfExchangeWins.toFixed(2))
      };
    } else if (freeBet && !stakeReturned) {
      bookieOutcome = {
        backProfit: parseFloat((S * (B - 1)).toFixed(2)),
        layLoss: parseFloat(((LO - 1) * calcData.layStake).toFixed(2)),
        net: parseFloat(calcData.profitIfBookieWins.toFixed(2))
      };
      exchangeOutcome = {
        backLoss: 0,
        layWin: parseFloat(calcData.potExchangeWinnings.toFixed(2)),
        net: parseFloat(calcData.profitIfExchangeWins.toFixed(2))
      };
    } else {
      bookieOutcome = {
        backProfit: parseFloat((S * (B - 1)).toFixed(2)),
        layLoss: parseFloat(((LO - 1) * calcData.layStake).toFixed(2)),
        net: parseFloat(calcData.profitIfBookieWins.toFixed(2))
      };
      exchangeOutcome = {
        backLoss: -S,
        layWin: parseFloat(calcData.potExchangeWinnings.toFixed(2)),
        net: parseFloat(calcData.profitIfExchangeWins.toFixed(2))
      };
    }
    return { bookieOutcome, exchangeOutcome };
  };

  const breakdown = buildBreakdown();

  const pureBetRating = (B, LO) => {
    if (!B || !LO || B <= 1 || LO <= 1) return null;
    return ((B - 1) / (LO - 1)) * 100;
  };

  const isValid = isInputValid(stake, odds, layOdds) && calcData !== null;
  const guaranteedProfit = getGuaranteedProfit();

  return (
    <>
      <Seo 
        title={meta.title} 
        description={meta.description} 
      />
      <div className="container">
        <h2 className="title with-subhead">Lay Stake Calculator</h2>
        <h4 className="subhead">
          Work out how much you could lay when your back bet is boosted.
        </h4>

        <div className="bet-type-headline">
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

        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Odds:</label>
            <input
              type="number"
              step="0.01"
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="10"
            />
          </div>
          <div className="input-group-inline">
            <label>Boost:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                value={boost}
                onChange={(e) => setBoost(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="10"
              />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>

        {boostedOdds && (
          <div
            className="result-box"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <h5 className="outcome-primary">
              <span>Boosted Odds:</span>
            </h5>
            <h5 className="outcome-primary">
              <span>{formatNumber(boostedOdds, 3)}</span>
            </h5>
          </div>
        )}

        <div className="inline-fields">
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
        </div>

        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Exchange Commission:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="2"
              />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>

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
              marginTop: "20px",
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
                      This tells us how close the back/lay odds are after the back odds are boosted. If the unboosted back odds exceed the lay odds, the bet might be an arbitrage.
                    </span>
                  </span>
                </div>
                {(() => {
                  const rating = pureBetRating(parseFloat(odds), parseFloat(layOdds));
                  const isGood = rating >= 100 && parseFloat(odds) <= parseFloat(layOdds);
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
                <span className="outcome-value">
                  {formatValue(breakdown.bookieOutcome.backProfit)}
                </span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Lay Loss:</span>
                <span className="outcome-value">
                  {formatValue(-breakdown.bookieOutcome.layLoss)}
                </span>
              </div>
              <div className="outcome-line net-outcome">
                <span className="outcome-label">Net Outcome:</span>
                <span className="outcome-value">
                  {formatValue(breakdown.bookieOutcome.net)}
                </span>
              </div>
            </div>
            <div className="outcome-group">
              <div className="group-title">If Exchange Wins:</div>
              <div className="outcome-line">
                <span className="outcome-label">Back Loss:</span>
                <span className="outcome-value">
                  {freeBet && !stakeReturned
                    ? formatValue(0)
                    : formatValue(breakdown.exchangeOutcome.backLoss)}
                </span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Lay Win:</span>
                <span className="outcome-value">
                  {formatValue(breakdown.exchangeOutcome.layWin)}
                </span>
              </div>
              <div className="outcome-line net-outcome">
                <span className="outcome-label">Net Outcome:</span>
                <span className="outcome-value">
                  {formatValue(breakdown.exchangeOutcome.net)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdvancedOddsBoostCalculator;
