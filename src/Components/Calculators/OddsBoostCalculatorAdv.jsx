import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber, formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";

const formatValue = (value) => {
  if (value === null) return "";
  const absVal = Math.abs(value).toFixed(2);
  return value >= 0 ? (
    <span className="positive">£{absVal}</span>
  ) : (
    <span className="negative">–£{absVal}</span>
  );
};

const formatWithColor = (num) => {
  if (num === null) return "";
  const absVal = Math.abs(num).toFixed(2);
  return num >= 0 ? (
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
  const [layStake, setLayStake] = useState(null);
  const [copied, setCopied] = useState(false);

  const commissionValue = (parseFloat(commission) || 0) / 100;

  // Calculate boosted odds based on decimal odds and boost percentage.
  const calculateBoostedOdds = () => {
    const decOdds = parseFloat(odds);
    const boostPct = parseFloat(boost);
    if (!odds || !boost || isNaN(decOdds) || isNaN(boostPct) || decOdds <= 1 || boostPct < 0)
      return null;
    const newOdds = 1 + (decOdds - 1) * (1 + boostPct / 100);
    return parseFloat(newOdds.toFixed(3));
  };

  // Calculate lay stake. For free bets the formula varies depending on whether stake is returned.
  const calculateLayStake = (boostedOddsVal) => {
    if (!isInputValid(stake, odds, layOdds)) return null;
    const S = parseFloat(stake);
    const LO = parseFloat(layOdds);
    if (freeBet && stakeReturned) {
      return parseFloat(((S * boostedOddsVal) / (LO - commissionValue)).toFixed(2));
    }
    if (freeBet && !stakeReturned) {
      return parseFloat((((boostedOddsVal - 1) * S) / (LO - commissionValue)).toFixed(2));
    }
    return parseFloat(((S * boostedOddsVal) / (LO - commissionValue)).toFixed(2));
  };

  const calculateAll = () => {
    const newBoosted = calculateBoostedOdds();
    setBoostedOdds(newBoosted);
    if (newBoosted !== null) {
      setLayStake(calculateLayStake(newBoosted));
    } else {
      setLayStake(null);
    }
  };

  useEffect(() => {
    calculateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [odds, boost, stake, layOdds, commission, freeBet, stakeReturned]);

  // Calculate profit if the bookie wins.
  const calculateProfitIfBookieWins = () => {
    if (!isInputValid(stake, odds, layOdds) || layStake === null) return null;
    const S = parseFloat(stake);
    const LO = parseFloat(layOdds);
    if (freeBet && stakeReturned) {
      return parseFloat((boostedOdds * S - (LO - 1) * layStake).toFixed(2));
    }
    if (freeBet && !stakeReturned) {
      return parseFloat(((boostedOdds - 1) * S - (LO - 1) * layStake).toFixed(2));
    }
    if (!boostedOdds) return null;
    return parseFloat(((boostedOdds - 1) * S - (LO - 1) * layStake).toFixed(2));
  };

  // Calculate profit if the exchange wins.
  const calculateProfitIfBookieLoses = () => {
    if (!isInputValid(stake, odds, layOdds) || layStake === null) return null;
    const S = parseFloat(stake);
    if (freeBet) {
      return parseFloat((layStake * (1 - commissionValue)).toFixed(2));
    }
    return parseFloat(((layStake * (1 - commissionValue)) - S).toFixed(2));
  };

  const getGuaranteedProfit = () => {
    const pWin = calculateProfitIfBookieWins();
    const pLose = calculateProfitIfBookieLoses();
    if (pWin === null || pLose === null) return "";
    return Math.min(pWin, pLose);
  };

  // Build a breakdown object for side-by-side display.
  const buildBreakdown = () => {
    if (!isInputValid(stake, odds, layOdds) || layStake === null) return null;
    const S = parseFloat(stake);
    const LO = parseFloat(layOdds);
    let backProfit, layLoss, netBookie, backLoss, layWin, netExchange;
    if (freeBet && stakeReturned) {
      backProfit = boostedOdds * S;
      layLoss = (LO - 1) * layStake;
      netBookie = parseFloat((backProfit - layLoss).toFixed(2));
      backLoss = 0;
      layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
      netExchange = layWin;
    } else if (freeBet && !stakeReturned) {
      backProfit = (boostedOdds - 1) * S;
      layLoss = (LO - 1) * layStake;
      netBookie = parseFloat((backProfit - layLoss).toFixed(2));
      backLoss = 0;
      layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
      netExchange = layWin;
    } else {
      backProfit = S * (boostedOdds - 1);
      layLoss = layStake * (LO - 1);
      netBookie = parseFloat((backProfit - layLoss).toFixed(2));
      backLoss = -S;
      layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
      netExchange = parseFloat((backLoss + layWin).toFixed(2));
    }
    return {
      bookieOutcome: { backProfit, layLoss, net: netBookie },
      exchangeOutcome: { backLoss, layWin, net: parseFloat(netExchange.toFixed(2)) },
    };
  };

  const breakdown = buildBreakdown();

  const getLayStakeLabel = () => {
    if (!isInputValid(stake, odds, layOdds) || layStake === null) return "";
    return `£${formatMoney(layStake)}`;
  };

  const pureBetRating = (B, LO) => {
    if (!B || !LO || B <= 1 || LO <= 1) return null;
    return ((B - 1) / (LO - 1)) * 100;
  };
  
  const copyToClipboard = () => {
    if (layStake !== null) {
      navigator.clipboard.writeText(layStake.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setLayStake(calculateLayStake(boostedOdds));
    }
    if (e.key.toLowerCase() === "c") {
      copyToClipboard();
    }
  };

  const isValid = isInputValid(stake, odds, layOdds) && layStake !== null;
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
          <h5 className="outcome-primary"><span>Boosted Odds:</span></h5>
          <h5 className="outcome-primary"><span>{formatNumber(boostedOdds, 3)}</span></h5>
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
          <h5 className="outcome-main"><span>You could lay: {getLayStakeLabel()}</span></h5>
          {copied ? (
            <ClipboardCheck size={24} color="#edff00" />
          ) : (
            <Clipboard size={24} color="#00aaff" />
          )}
        </div>
      )}

      {isValid && guaranteedProfit !== "" && (
        <div className="highlight-box">
        {/* Key stats row */}
        <div className="stats-row">
          <div className="stat-block">
            <div className="stat-label">Your Profit</div>
            {/* Example of a large, bold figure */}
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
                <div
                  className={`stat-value ${isGood ? "positive" : "negative"}`}
                >
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
