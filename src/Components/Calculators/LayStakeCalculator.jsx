import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";

const LayStakeCalculator = () => {
  const meta = pageConfig.layStakeCalculator?.seo || {};

  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);
  const [backOdds, setBackOdds] = useState("");
  const [stake, setStake] = useState("");
  const [layOdds, setLayOdds] = useState("");
  const [commission, setCommission] = useState(0);
  const [layStake, setLayStake] = useState(null);
  const [copied, setCopied] = useState(false);

  const commissionValue = parseFloat(commission) / 100 || 0;

  const isInputValid = () => {
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    if (!S || !B || !LO) return false;
    if (S <= 0 || B <= 1 || LO <= 1) return false;
    return true;
  };

  const calculateRegularLayStake = () => {
    if (!isInputValid()) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    const rawLay = (S * B) / (LO - commissionValue);
    return parseFloat(rawLay.toFixed(2));
  };

  const calculateLayStake = () => {
    if (!isInputValid()) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    if (freeBet && stakeReturned) {
      return parseFloat(((S * B) / (LO - commissionValue)).toFixed(2));
    }
    if (freeBet && !stakeReturned) {
      return parseFloat((((B - 1) * S) / (LO - commissionValue)).toFixed(2));
    }
    return calculateRegularLayStake();
  };

  useEffect(() => {
    setLayStake(calculateLayStake());
  }, [backOdds, stake, layOdds, commission, freeBet, stakeReturned]);

  const calculateRegularProfitIfBookieWins = () => {
    if (!isInputValid() || layStake === null) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    const profit = S * (B - 1) - layStake * (LO - 1);
    return parseFloat(profit.toFixed(2));
  };

  const calculateRegularProfitIfBookieLoses = () => {
    if (!isInputValid() || layStake === null) return null;
    const S = parseFloat(stake);
    const profit = layStake * (1 - commissionValue) - S;
    return parseFloat(profit.toFixed(2));
  };

  const calculateProfitIfBookieWins = () => {
    if (!isInputValid() || layStake === null) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    if (freeBet && stakeReturned) {
      const profit = B * S - (LO - 1) * layStake;
      return parseFloat(profit.toFixed(2));
    }
    if (freeBet && !stakeReturned) {
      const profit = (B - 1) * S - (LO - 1) * layStake;
      return parseFloat(profit.toFixed(2));
    }
    return calculateRegularProfitIfBookieWins();
  };

  const calculateProfitIfBookieLoses = () => {
    if (!isInputValid() || layStake === null) return null;
    if (freeBet) {
      const profit = layStake * (1 - commissionValue);
      return parseFloat(profit.toFixed(2));
    }
    return calculateRegularProfitIfBookieLoses();
  };

  const getGuaranteedProfit = () => {
    const pWin = calculateProfitIfBookieWins();
    const pLose = calculateProfitIfBookieLoses();
    if (pWin === null || pLose === null) return "";
    return Math.min(pWin, pLose);
  };

  const buildBreakdown = () => {
    if (!isInputValid() || layStake === null) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);

    let backProfit = S * (B - 1);
    let layLoss = layStake * (LO - 1);
    let netBookie = parseFloat((backProfit - layLoss).toFixed(2));
    let backLoss = -S;
    let layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
    let netExchange = parseFloat((backLoss + layWin).toFixed(2));

    if (freeBet && !stakeReturned) {
      backProfit = (B - 1) * S;
      layLoss = (LO - 1) * layStake;
      netBookie = parseFloat((backProfit - layLoss).toFixed(2));
      backLoss = 0;
      layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
      netExchange = layWin;
    } else if (freeBet && stakeReturned) {
      backProfit = B * S;
      layLoss = (LO - 1) * layStake;
      netBookie = parseFloat((backProfit - layLoss).toFixed(2));
      backLoss = 0;
      layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
      netExchange = layWin;
    }

    return {
      bookieOutcome: { backProfit, layLoss, net: netBookie },
      exchangeOutcome: { backLoss, layWin, net: parseFloat(netExchange.toFixed(2)) }
    };
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
    if (!isInputValid() || layStake === null) return "";
    return `£${formatMoney(layStake)}`;
  };

  const copyToClipboard = () => {
    if (layStake !== null) {
      navigator.clipboard.writeText(layStake.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const pureBetRating = (B, LO) => {
    if (!B || !LO || B <= 1 || LO <= 1) return null;
    return ((B - 1) / (LO - 1)) * 100;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") setLayStake(calculateLayStake());
    if (e.key.toLowerCase() === "c") copyToClipboard();
  };

  const isValid = isInputValid() && layStake !== null;
  const guaranteedProfit = getGuaranteedProfit();
  const breakdown = buildBreakdown();

  return (
    <>
    <Seo 
        title={meta.title} 
        description={meta.description} 
      />
    <div className="container">
      <h2 className="title with-subhead">Lay Stake Calculator</h2>
      <h4 className="subhead">Work out how much you could lay.</h4>

      <div className="bet-type-headline">
        <div className="toggle-inline">
          <label className="toggle-label">Free Bet</label>
          <label className="switch">
            <input type="checkbox" checked={freeBet} onChange={() => setFreeBet(!freeBet)} />
            <span className="slider"></span>
          </label>
        </div>
        {freeBet && (
          <div className="toggle-inline">
            <label className="toggle-label">Stake Returned</label>
            <label className="switch">
              <input type="checkbox" checked={stakeReturned} onChange={() => setStakeReturned(!stakeReturned)} />
              <span className="slider"></span>
            </label>
          </div>
        )}
      </div>

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
              <span className="outcome-value">
                {freeBet && !stakeReturned
                  ? formatValue(0)
                  : formatValue(breakdown.exchangeOutcome.backLoss)}
              </span>
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

export default LayStakeCalculator;
