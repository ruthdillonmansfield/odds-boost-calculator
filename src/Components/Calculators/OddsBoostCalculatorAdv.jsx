import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber, formatMoney } from "../../helpers.js";

// Helper to format numeric outcome with sign & color
const formatValue = (value) => {
  if (value === null) return "";
  const absVal = Math.abs(value).toFixed(2);
  return value >= 0 ? (
    <span className="positive">£{absVal}</span>
  ) : (
    <span className="negative">–£{absVal}</span>
  );
};

// Helper for breakdown lines
const formatWithColor = (num) => {
  if (num === null) return "";
  const absVal = Math.abs(num).toFixed(2);
  return num >= 0 ? (
    <span className="positive">£{absVal}</span>
  ) : (
    <span className="negative">–£{absVal}</span>
  );
};

// Validate required fields (Stake, Odds, Lay Odds)
const isInputValid = (stake, odds, layOdds) => {
  const S = parseFloat(stake);
  const B = parseFloat(odds);
  const LO = parseFloat(layOdds);
  if (!S || !B || !LO) return false;
  if (S <= 0 || B <= 1 || LO <= 1) return false;
  return true;
};

const AdvancedOddsBoostCalculator = () => {
  // Toggles
  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);

  // Inputs
  const [odds, setOdds] = useState("");
  const [boost, setBoost] = useState(10);
  const [stake, setStake] = useState("");
  const [layOdds, setLayOdds] = useState("");
  const [commission, setCommission] = useState(""); // empty -> treated as 0

  // Calculated values
  const [boostedOdds, setBoostedOdds] = useState(null);
  const [layStake, setLayStake] = useState(null);
  const [copied, setCopied] = useState(false);

  // Commission fraction
  const commissionValue = (parseFloat(commission) || 0) / 100;

  // 1. Calculate boosted odds
  const calculateBoostedOdds = () => {
    const decOdds = parseFloat(odds);
    const boostPct = parseFloat(boost);
    if (!odds || !boost || isNaN(decOdds) || isNaN(boostPct) || decOdds <= 1 || boostPct < 0)
      return null;
    const newOdds = 1 + (decOdds - 1) * (1 + boostPct / 100);
    return parseFloat(newOdds.toFixed(3));
  };

  // 2. Calculate lay stake:
  // - freeBet + stakeReturned => layStake = stake.
  // - freeBet + not returned => ((odds - 1) * stake) / (layOdds - commissionValue)
  // - Otherwise => (stake * boostedOdds) / (layOdds - commissionValue)
  const calculateLayStake = (boostedOddsVal) => {
    if (!isInputValid(stake, odds, layOdds)) return null;
    const S = parseFloat(stake);
    const decOdds = parseFloat(odds);
    const LO = parseFloat(layOdds);

    if (freeBet && stakeReturned) {
      return S;
    }
    if (freeBet && !stakeReturned) {
      // Incorporate commission into the denominator so that the lay stake increases slightly when commission > 0.
      const rawLay = ((decOdds - 1) * S) / (LO - commissionValue);
      return parseFloat(rawLay.toFixed(2));
    }
    // Regular bet uses boosted odds.
    const rawLay = (S * boostedOddsVal) / (LO - commissionValue);
    return parseFloat(rawLay.toFixed(2));
  };

  // 3. Recalc on any input change
  const calculateAll = () => {
    const newBoosted = calculateBoostedOdds();
    setBoostedOdds(newBoosted);
    if (freeBet && stakeReturned) {
      setLayStake(parseFloat(stake));
    } else if (newBoosted !== null) {
      setLayStake(calculateLayStake(newBoosted));
    } else {
      setLayStake(null);
    }
  };

  useEffect(() => {
    calculateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [odds, boost, stake, layOdds, commission, freeBet, stakeReturned]);

  // 4. Profit if bookie wins:
  // - freeBet + stakeReturned => Profit = stake*(1 - commission)
  // - freeBet + not returned => Profit = (odds - 1)*stake - (layOdds - 1)*layStake
  // - Otherwise => Profit = (boostedOdds - 1)*stake - (layOdds - 1)*layStake
  const calculateProfitIfBookieWins = () => {
    if (!isInputValid(stake, odds, layOdds) || layStake === null) return null;
    const S = parseFloat(stake);
    const decOdds = parseFloat(odds);
    const LO = parseFloat(layOdds);
    if (freeBet && stakeReturned) {
      return parseFloat((S * (1 - commissionValue)).toFixed(2));
    }
    if (freeBet && !stakeReturned) {
      return parseFloat((((decOdds - 1) * S) - ((LO - 1) * layStake)).toFixed(2));
    }
    if (!boostedOdds) return null;
    return parseFloat((((boostedOdds - 1) * S) - ((LO - 1) * layStake)).toFixed(2));
  };

  // 5. Profit if bookie loses (Exchange wins):
  // - freeBet + stakeReturned => Profit = stake*(1 - commission)
  // - freeBet + not returned => Profit = layStake*(1 - commission)
  // - Otherwise => Profit = (layStake * (1 - commission)) - stake
  const calculateProfitIfBookieLoses = () => {
    if (!isInputValid(stake, odds, layOdds) || layStake === null) return null;
    const S = parseFloat(stake);
    if (freeBet && stakeReturned) {
      return parseFloat((S * (1 - commissionValue)).toFixed(2));
    }
    if (freeBet && !stakeReturned) {
      return parseFloat((layStake * (1 - commissionValue)).toFixed(2));
    }
    return parseFloat(((layStake * (1 - commissionValue)) - S).toFixed(2));
  };

  // 6. Guaranteed profit is the minimum of the two outcomes.
  const getGuaranteedProfit = () => {
    const pWin = calculateProfitIfBookieWins();
    const pLose = calculateProfitIfBookieLoses();
    if (pWin === null || pLose === null) return "";
    return Math.min(pWin, pLose);
  };

  // 7. Build breakdown object for side-by-side display.
  const buildBreakdown = () => {
    if (!isInputValid(stake, odds, layOdds) || layStake === null) return null;
    const S = parseFloat(stake);
    const decOdds = parseFloat(odds);
    const LO = parseFloat(layOdds);

    // Bookie Wins breakdown.
    let backProfit = S * (decOdds - 1);
    let layLoss = layStake * (LO - 1);
    let netBookie = backProfit - layLoss;
    if (freeBet && stakeReturned) {
      netBookie = parseFloat((S * (1 - commissionValue)).toFixed(2));
      backProfit = S; // you get your stake back
      layLoss = S * commissionValue;
    }
    // Exchange Wins breakdown.
    let backLoss = freeBet && !stakeReturned ? 0 : -S;
    let layWin = layStake * (1 - commissionValue);
    let netExchange = backLoss + layWin;
    if (freeBet && stakeReturned) {
      netExchange = parseFloat((S * (1 - commissionValue)).toFixed(2));
      backLoss = 0;
    }
    return {
      bookieOutcome: {
        backProfit,
        layLoss,
        net: parseFloat(netBookie.toFixed(2))
      },
      exchangeOutcome: {
        backLoss,
        layWin,
        net: parseFloat(netExchange.toFixed(2))
      }
    };
  };

  const breakdown = buildBreakdown();

  // 8. Format the lay stake for display
  const getLayStakeLabel = () => {
    if (!isInputValid(stake, odds, layOdds) || layStake === null) return "";
    return `£${formatMoney(layStake)}`;
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (layStake !== null) {
      navigator.clipboard.writeText(layStake.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") calculateAll();
    if (e.key.toLowerCase() === "c") copyToClipboard();
  };

  const isValid = isInputValid(stake, odds, layOdds) && layStake !== null;
  const guaranteedProfit = getGuaranteedProfit();

  return (
    <div className="container">
      <h2>Advanced Odds Boost Calculator</h2>

      {/* Free Bet Toggles */}
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

      {/* Main Inputs */}
      <div className="inline-fields">
        <div className="input-group-inline">
          <label>Odds:</label>
          <input
            type="number"
            step="0.01"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 10"
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
              placeholder="e.g. 10"
            />
            <span className="suffix">%</span>
          </div>
        </div>
      </div>

      {boostedOdds && (
        <div className="result-box" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Boosted Odds:</span>
          <span>{formatNumber(boostedOdds, 3)}</span>
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
            placeholder="e.g. 10"
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
              placeholder="e.g. 2"
            />
            <span className="suffix">%</span>
          </div>
        </div>
      </div>

      {/* Lay Stake Display */}
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
          <span>You should lay: {getLayStakeLabel()}</span>
          {copied ? (
            <ClipboardCheck size={24} color="#edff00" />
          ) : (
            <Clipboard size={24} color="#00aaff" />
          )}
        </div>
      )}

      {/* Profit Box */}
      {isValid && guaranteedProfit !== "" && (
        <div className="profit-box">
          Your Profit: {formatValue(guaranteedProfit)}
          <div className="profit-details">
            If bookie wins: {formatValue(calculateProfitIfBookieWins())} <br />
            If bookie loses: {formatValue(calculateProfitIfBookieLoses())}
          </div>
        </div>
      )}

      {/* Breakdown (side-by-side) */}
      {isValid && breakdown && (
        <div className="outcome-container" style={{ marginTop: "20px" }}>
          {/* If Bookie Wins */}
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
            <div className="outcome-line placeholder"></div>
            <div className="outcome-line net-outcome">
              <span className="outcome-label">Net Outcome:</span>
              <span className="outcome-value">
                {formatValue(breakdown.bookieOutcome.net)}
              </span>
            </div>
          </div>
          {/* If Exchange Wins */}
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
            <div className="outcome-line placeholder"></div>
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
  );
};

export default AdvancedOddsBoostCalculator;
