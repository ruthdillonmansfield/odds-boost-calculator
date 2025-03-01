import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";

const LayStakeCalculator = () => {
  // Toggles
  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);

  // Inputs
  const [backOdds, setBackOdds] = useState("");
  const [stake, setStake] = useState("");
  const [layOdds, setLayOdds] = useState("");
  const [commission, setCommission] = useState(0); // can default to 0

  // Calculated
  const [layStake, setLayStake] = useState(null);
  const [copied, setCopied] = useState(false);

  // Commission fraction
  const commissionValue = parseFloat(commission) / 100 || 0;

  // Validate fields (except commission)
  const isInputValid = () => {
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    if (!S || !B || !LO) return false;
    if (S <= 0 || B <= 1 || LO <= 1) return false;
    return true;
  };

  /**
   * For a regular bet:
   * Lay Stake = (Stake * BackOdds) / (LayOdds - commissionValue)
   */
  const calculateRegularLayStake = () => {
    if (!isInputValid()) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    const rawLay = (S * B) / (LO - commissionValue);
    return parseFloat(rawLay.toFixed(2));
  };

  /**
   * Master function for lay stake:
   * - freeBet + stakeReturned => (Stake * BackOdds)/(LayOdds - commissionValue)
   * - freeBet + stake not returned => ((BackOdds - 1)*Stake)/(LayOdds - commissionValue)
   * - otherwise => regular
   */
  const calculateLayStake = () => {
    if (!isInputValid()) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);

    // Free Bet + stake returned => treat as "normal" bet but with total returns = B*S
    if (freeBet && stakeReturned) {
      const rawLay = (S * B) / (LO - commissionValue);
      return parseFloat(rawLay.toFixed(2));
    }

    // Free Bet + stake not returned => (B - 1)*S / (LayOdds - commission)
    if (freeBet && !stakeReturned) {
      const rawLay = ((B - 1) * S) / (LO - commissionValue);
      return parseFloat(rawLay.toFixed(2));
    }

    // Otherwise => regular
    return calculateRegularLayStake();
  };

  // Recompute lay stake whenever inputs or toggles change
  useEffect(() => {
    setLayStake(calculateLayStake());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backOdds, stake, layOdds, commission, freeBet, stakeReturned]);

  // For a regular bet: Profit if Bookie Wins
  const calculateRegularProfitIfBookieWins = () => {
    if (!isInputValid() || layStake === null) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);

    const profit = S * (B - 1) - layStake * (LO - 1);
    return parseFloat(profit.toFixed(2));
  };

  // For a regular bet: Profit if Bookie Loses
  const calculateRegularProfitIfBookieLoses = () => {
    if (!isInputValid() || layStake === null) return null;
    const S = parseFloat(stake);

    const profit = layStake * (1 - commissionValue) - S;
    return parseFloat(profit.toFixed(2));
  };

  /**
   * Profit if Bookie Wins, combining free bet logic:
   * - stake not returned => (B - 1)*S - (LayOdds - 1)*LayStake
   * - stake returned => B*S - (LayOdds - 1)*LayStake
   * - otherwise => normal bet
   */
  const calculateProfitIfBookieWins = () => {
    if (!isInputValid() || layStake === null) return null;

    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);

    // free bet + stake returned => B*S - (LO - 1)*LayStake
    if (freeBet && stakeReturned) {
      const profit = B * S - (LO - 1) * layStake;
      return parseFloat(profit.toFixed(2));
    }

    // free bet + notReturned => (B - 1)*S - (LayOdds - 1)*LayStake
    if (freeBet && !stakeReturned) {
      const profit = (B - 1) * S - (LO - 1) * layStake;
      return parseFloat(profit.toFixed(2));
    }

    // otherwise => regular
    return calculateRegularProfitIfBookieWins();
  };

  /**
   * Profit if Bookie Loses, combining free bet logic:
   * - stake not returned => layStake*(1 - commission)
   * - stake returned => layStake*(1 - commission)
   *   (But user wants e.g. +£9.82 if B=10 => 
   *    => we do layStake*(1-comm). Because user isn't out-of-pocket for stake)
   */
  const calculateProfitIfBookieLoses = () => {
    if (!isInputValid() || layStake === null) return null;
    const S = parseFloat(stake);

    // freeBet + stake returned => layStake*(1 - commission)
    // yields the user’s ~ +£9.82 scenario if B=10, LO=10, S=10, comm=2%
    if (freeBet && stakeReturned) {
      const profit = layStake * (1 - commissionValue);
      return parseFloat(profit.toFixed(2));
    }

    // freeBet + notReturned => layStake*(1 - commission)
    if (freeBet && !stakeReturned) {
      const profit = layStake * (1 - commissionValue);
      return parseFloat(profit.toFixed(2));
    }

    // otherwise => regular
    return calculateRegularProfitIfBookieLoses();
  };

  // Guaranteed profit => min(win, lose)
  const getGuaranteedProfit = () => {
    const pWin = calculateProfitIfBookieWins();
    const pLose = calculateProfitIfBookieLoses();
    if (pWin === null || pLose === null) return "";
    return Math.min(pWin, pLose);
  };

  /**
   * Build the breakdown for side-by-side display
   * - If stake returned => BookieWins => B*S - (LO - 1)*LayStake
   *                      ExchangeWins => layStake*(1 - commission)
   * - If stake not returned => same but (B - 1)*S for BookieWins, no backLoss on ExchangeWins
   */
  const buildBreakdown = () => {
    if (!isInputValid() || layStake === null) return null;
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LO = parseFloat(layOdds);

    // Default to normal bet logic
    let backProfit = S * (B - 1);
    let layLoss = layStake * (LO - 1);
    let netBookie = parseFloat((backProfit - layLoss).toFixed(2));

    let backLoss = -S;
    let layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
    let netExchange = parseFloat((backLoss + layWin).toFixed(2));

    // If free bet + stake not returned
    if (freeBet && !stakeReturned) {
      backProfit = (B - 1) * S;
      layLoss = (LO - 1) * layStake;
      netBookie = parseFloat((backProfit - layLoss).toFixed(2));

      backLoss = 0; // no actual cost at the bookie
      layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
      netExchange = layWin;
    }
    // If free bet + stake returned => 
    //   BookieWins => B*S - (LO - 1)*LayStake
    //   ExchangeWins => layStake*(1 - commission)
    else if (freeBet && stakeReturned) {
      backProfit = B * S; 
      layLoss = (LO - 1) * layStake;
      netBookie = parseFloat((backProfit - layLoss).toFixed(2));

      backLoss = 0; 
      layWin = parseFloat((layStake * (1 - commissionValue)).toFixed(2));
      netExchange = layWin;
    }

    return {
      bookieOutcome: {
        backProfit,
        layLoss,
        net: netBookie
      },
      exchangeOutcome: {
        backLoss,
        layWin,
        net: parseFloat(netExchange.toFixed(2))
      }
    };
  };

  // Format numeric with sign & color
  const formatValue = (val) => {
    if (val === null) return "";
    const absVal = Math.abs(val).toFixed(2);
    return val >= 0 ? (
      <span className="positive">£{absVal}</span>
    ) : (
      <span className="negative">-£{absVal}</span>
    );
  };

  // For side-by-side breakdown lines
  const getLayStakeLabel = () => {
    if (!isInputValid() || layStake === null) return "";
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

  // On keydown
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setLayStake(calculateLayStake());
    }
    if (e.key.toLowerCase() === "c") {
      copyToClipboard();
    }
  };

  // Check if results are valid
  const isValid = isInputValid() && layStake !== null;
  const guaranteedProfit = getGuaranteedProfit();
  const breakdown = buildBreakdown();

  return (
    <div className="container">
      <h2 className="title with-subhead">Lay Stake Calculator</h2>
      <h4 className="subhead">Work out how much you could lay</h4>

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
        {/* Back Odds => normal input */}
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

        {/* Stake => prefix “£” only */}
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

      {/* Lay Odds & Commission Row */}
      <div className="inline-fields lay-row">
        {/* Lay Odds => normal input */}
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

        {/* Exchange Commission => suffix “%” only */}
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

      {/* Lay Stake (copyable) */}
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
          <span>You could lay: {getLayStakeLabel()}</span>
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
          Your Profit: 
          {guaranteedProfit >= 0 ? (
            <span className="positive"> £{guaranteedProfit.toFixed(2)}</span>
          ) : (
            <span className="negative">-£{Math.abs(guaranteedProfit).toFixed(2)}</span>
          )}

          <div className="profit-details">
            If bookie wins: {calculateProfitIfBookieWins() !== null && formatValue(calculateProfitIfBookieWins())}
            <br />
            If bookie loses: {calculateProfitIfBookieLoses() !== null && formatValue(calculateProfitIfBookieLoses())}
          </div>
        </div>
      )}

      {/* Breakdown */}
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

export default LayStakeCalculator;
