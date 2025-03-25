import { useState } from "react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import seoConfig from "../../config/seoConfig.js";

const MatchPickerCalculator = () => {
  const meta = seoConfig["MatchPickerCalculator"] || {};

  const [stake, setStake] = useState(10);
  const [commission, setCommission] = useState(0);
  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);
  const [entries, setEntries] = useState([
    { match: "", back: "", lay: "" },
    { match: "", back: "", lay: "" },
    { match: "", back: "", lay: "" },
  ]);
  const [top, setTop] = useState(1); // Track how many top profit boxes to highlight

  const commissionValue = parseFloat(commission) / 100 || 0;

  const calculateLayStake = (B, LO) => {
    const S = parseFloat(stake);
    if (freeBet && stakeReturned) return (S * B) / (LO - commissionValue);
    if (freeBet && !stakeReturned) return ((B - 1) * S) / (LO - commissionValue);
    return (S * B) / (LO - commissionValue);
  };

  const calculateQualifyingLoss = (B, LO) => {
    const S = parseFloat(stake);
    const layStake = calculateLayStake(B, LO);
    const backWin = freeBet ? ((stakeReturned ? B : B - 1) * S) : S * (B - 1);
    const layLoss = layStake * (LO - 1);
    const bookieNet = backWin - layLoss;
    const backLoss = freeBet ? 0 : -S;
    const layWin = layStake * (1 - commissionValue);
    const exchangeNet = backLoss + layWin;
    const guaranteed = Math.min(bookieNet, exchangeNet);
    return isNaN(guaranteed) ? "" : formatMoney(guaranteed);
  };

  const getWorstCaseProfit = (B, LO) => {
    const S = parseFloat(stake);
    const layStake = calculateLayStake(B, LO);
    const backWin = freeBet ? ((stakeReturned ? B : B - 1) * S) : S * (B - 1);
    const layLoss = layStake * (LO - 1);
    const bookieNet = backWin - layLoss;
    const backLoss = freeBet ? 0 : -S;
    const layWin = layStake * (1 - commissionValue);
    const exchangeNet = backLoss + layWin;
    return Math.min(bookieNet, exchangeNet);
  };

  const formatOutcome = (value) => {
    const formatted = formatMoney(Math.abs(value));
    return (
      <span className={value >= 0 ? "positive" : "negative"}>
        {value < 0 ? "–" : ""}£{formatted}
      </span>
    );
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...entries, { match: "", back: "", lay: "" }]);
  };

  // Calculate the top N profits and apply a class to the corresponding profit boxes
  const getHighlightedProfits = () => {
    const profits = entries.map((entry) => getWorstCaseProfit(parseFloat(entry.back), parseFloat(entry.lay)));
    const sortedProfits = [...profits].sort((a, b) => b - a); // Sort profits in descending order
    const topValue = sortedProfits[top - 1]; // The value of the Nth highest profit
    const highlightedIndexes = profits
      .map((profit, index) => (profit >= topValue ? index : -1))
      .filter((index) => index !== -1);

    return highlightedIndexes;
  };

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <div className="container">
        <h2 className="title with-subhead">Match Picker</h2>
        <h4 className="subhead">Compare lay options when you don't have a matcher tool.</h4>

        <div className="inline-fields partial-row-trio">
          <div className="input-group-inline">
            <label>Stake:</label>
            <div className="input-prefix-suffix only-prefix">
              <span className="prefix">£</span>
              <input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group-inline">
            <label>Exchange Commission:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
              <span className="suffix">%</span>
            </div>
          </div>
          <div className="input-group-inline">
            <label>Highlight:
            <span className="info-icon">
              i
              <span className="tooltip-text">
                How many results do you want to highlight?
              </span>
            </span>
            </label>
            <input
              type="number"
              value={top}
              onChange={(e) => setTop(Math.max(1, parseInt(e.target.value)))}
            />
          </div>
        </div>

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

        {entries.map((entry, i) => {
          const worstCase = getWorstCaseProfit(parseFloat(entry.back), parseFloat(entry.lay));
          const highlighted = getHighlightedProfits().includes(i) ? "highlighted" : ""; // Apply class if needed
          return (
            <div key={i} className="entry-box">
              <div className="inline-fields" style={{ alignItems: 'flex-end' }}>
                <div className="input-group-inline">
                  <input
                    type="text"
                    value={entry.match}
                    onChange={(e) => updateEntry(i, "match", e.target.value)}
                    placeholder="Event Outcome"
                  />
                </div>
                <div className={`profit-box profit-box-inline ${highlighted}`} style={{ marginTop: 0 }}>
                  <h5 className="outcome-main">
                    {formatOutcome(worstCase)}
                  </h5>
                </div>
              </div>
              <div className="inline-fields mb-32">
                <div className="input-group-inline">
                  <label>Back Odds:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entry.back}
                    onChange={(e) => updateEntry(i, "back", e.target.value)}
                  />
                </div>
                <div className="input-group-inline">
                  <label>Lay Odds:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entry.lay}
                    onChange={(e) => updateEntry(i, "lay", e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button className="add-entry-btn" style={{ padding: "12px" }} onClick={addEntry}>
          + Add Entry
        </button>
      </div>
    </>
  );
};

export default MatchPickerCalculator;
