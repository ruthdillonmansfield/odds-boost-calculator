import { useState } from "react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";

const MatchPickerCalculator = () => {
  const meta = pageConfig.matchPickerCalculator?.seo || {};

  const [stake, setStake] = useState(10);
  const [commission, setCommission] = useState(0);
  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);
  const [entries, setEntries] = useState([
    { match: "", back: "", lay: "" },
    { match: "", back: "", lay: "" },
    { match: "", back: "", lay: "" }
  ]);

  const commissionValue = parseFloat(commission) / 100 || 0;

  const calculateLayStake = (B, LO) => {
    const S = parseFloat(stake);
    if (freeBet && stakeReturned) return (S * B) / (LO - commissionValue);
    if (freeBet && !stakeReturned) return ((B - 1) * S) / (LO - commissionValue);
    return (S * B) / (LO - commissionValue);
  };

  const getWorstCaseProfit = (B, LO) => {
    const S = parseFloat(stake);
    const layStake = calculateLayStake(B, LO);
    const backWin = freeBet ? (stakeReturned ? B : B - 1) * S : S * (B - 1);
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
      <span className={value >= 0 ? "positive" : ""}>
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

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const renderEntry = (entry, i) => {
    return (
      <div
        className="group-container"
        key={i}
        style={{ position: "relative", marginBottom: "20px" }}
      >
        <button
          className="group-remove-button"
          onClick={() => removeEntry(i)}
          style={{
            position: "absolute",
            top: "-5px",
            left: "-10px",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            backgroundColor: "#ff5555",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            lineHeight: "20px",
            padding: 0
          }}
        >
          ×
        </button>
        <div className="entry-box">
          <div className="inline-fields" style={{ alignItems: "flex-end" }}>
            <div className="input-group-inline">
              <input
                className={entry.match ? "blue-bottom" : ""}
                type="text"
                value={entry.match}
                onChange={(e) => updateEntry(i, "match", e.target.value)}
                placeholder="Event (e.g. Arsenal v Chelsea)"
              />
            </div>
            <div
              className="profit-box profit-box-inline"
              style={{ marginTop: 0 }}
            >
              <h5 className="outcome-main">
                {entry.lay
                  ? formatOutcome(
                      getWorstCaseProfit(
                        parseFloat(entry.back),
                        parseFloat(entry.lay)
                      )
                    )
                  : "–"}
              </h5>
            </div>
          </div>
          <div className="inline-fields mb-16">
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
      </div>
    );
  };

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <div className="container">
        <h2 className="title with-subhead">Match Picker</h2>
        <h4 className="subhead">
          Compare lay options when you don't have a matcher tool.
        </h4>

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
        </div>

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

        <div className="divider" />

        {entries.map((entry, i) => renderEntry(entry, i))}

        <div className="button-group">
          <button
            className="add-entry-btn"
            style={{ padding: "12px", maxWidth: "100%"}}
            onClick={addEntry}
          >
            + Add Option
          </button>
        </div>
      </div>
    </>
  );
};

export default MatchPickerCalculator;
