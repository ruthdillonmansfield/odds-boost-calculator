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
  const [entries, setEntries] = useState([]);
  const [top, setTop] = useState(1);
  const [minOdds, setMinOdds] = useState(1);
  const [nextEventId, setNextEventId] = useState(1);

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

  // Add single entry (no eventId)
  const addEntry = () => {
    setEntries([...entries, { match: "", back: "", lay: "", eventId: null }]);
  };

  // Add event pair (two entries sharing the same eventId)
  const addEvent = () => {
    const eventId = nextEventId;
    setEntries([
      ...entries,
      { match: "", back: "", lay: "", eventId },
      { match: "", back: "", lay: "", eventId },
    ]);
    setNextEventId(nextEventId + 1);
  };

  // Combination logic for highlighted entries
  const getHighlightedEntries = () => {
    const n = entries.length;
    const minOddsVal = parseFloat(minOdds);
    let bestCombo = null;

    const combine = (start, combo) => {
      if (combo.length === top) {
        const usedEvents = {};
        for (const idx of combo) {
          const eId = entries[idx].eventId;
          if (eId !== null) {
            if (usedEvents[eId]) return;
            usedEvents[eId] = true;
          }
        }
        let productOdds = 1;
        let totalProfit = 0;
        for (const idx of combo) {
          const { back, lay } = entries[idx];
          const b = parseFloat(back);
          const l = parseFloat(lay);
          if (isNaN(b) || isNaN(l)) return;
          productOdds *= b;
          totalProfit += getWorstCaseProfit(b, l);
        }
        if (productOdds >= minOddsVal) {
          if (bestCombo === null || totalProfit > bestCombo.totalProfit) {
            bestCombo = { indices: [...combo], totalProfit, productOdds };
          }
        }
        return;
      }
      for (let i = start; i < n; i++) {
        combo.push(i);
        combine(i + 1, combo);
        combo.pop();
      }
    };
    combine(0, []);
    return bestCombo ? bestCombo.indices : [];
  };

  const getDefaultHighlightedEntries = () => {
    const profits = entries.map((e) =>
      getWorstCaseProfit(parseFloat(e.back), parseFloat(e.lay))
    );
    const sorted = [...profits].sort((a, b) => b - a);
    const topValue = sorted[top - 1];
    return profits
      .map((p, i) => (p >= topValue ? i : -1))
      .filter((i) => i !== -1);
  };

  const highlightedEntries = minOdds
    ? getHighlightedEntries()
    : getDefaultHighlightedEntries();

  // Group entries: single or pair
  const groupEntries = (list) => {
    const grouped = [];
    for (let i = 0; i < list.length; i++) {
      const current = list[i];
      if (
        current.eventId !== null &&
        i < list.length - 1 &&
        list[i + 1].eventId === current.eventId
      ) {
        // It's a pair
        grouped.push({
          type: "pair",
          entries: [current, list[i + 1]],
          indices: [i, i + 1],
        });
        i++; // Skip the next
      } else {
        // Single
        grouped.push({ type: "single", entry: current, index: i });
      }
    }
    return grouped;
  };

  const groupedEntries = groupEntries(entries);

  // Renders a single "entry-box" with a custom placeholder
  const renderSingleEntry = (entry, i, placeholder) => {
    return (
      <div className="entry-box" key={i}>
        <div className="inline-fields" style={{ alignItems: "flex-end" }}>
          <div className="input-group-inline">
            <input
              className={
                highlightedEntries.includes(i)
                  ? "green-bottom"
                  : entry.match
                  ? "blue-bottom"
                  : ""
              }
              type="text"
              value={entry.match}
              onChange={(e) => updateEntry(i, "match", e.target.value)}
              placeholder={placeholder}
            />
          </div>
          <div
            className={`profit-box profit-box-inline ${
              highlightedEntries.includes(i) ? "highlighted" : ""
            }`}
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
    );
  };

  // Renders both entries in a pair
  const renderEventPair = (pairEntries, pairIndices) => {
    return (
      <div className="event-pair-container" key={pairIndices[0]}>
        {/* For the first outcome in the pair */}
        {renderSingleEntry(
          pairEntries[0],
          pairIndices[0],
          "Outcome (e.g. Arsenal win)"
        )}
        {/* For the second outcome in the pair */}
        {renderSingleEntry(
          pairEntries[1],
          pairIndices[1],
          "Outcome (e.g. Chelsea win)"
        )}
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
        <div className="inline-fields">
          <div className="input-group-inline">
            <label>
              Highlight:
              <span className="info-icon">
                i
                <span className="tooltip-text">
                  Optional. How many options do you want to highlight?
                </span>
              </span>
            </label>
            <input
              type="number"
              value={top}
              onChange={(e) => setTop(Math.max(1, parseInt(e.target.value)))}
            />
          </div>
          <div className="input-group-inline">
            <label>
              Min Odds:
              <span className="info-icon">
                i
                <span className="tooltip-text">
                  Optional. For when you need a combination, such as laying an
                  acca. The tool will find the most profitable combination.
                </span>
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              value={minOdds}
              onChange={(e) => setMinOdds(e.target.value)}
            />
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

        {/* Render each group with a divider in between groups (not inside pairs) */}
        {groupedEntries.map((group, gIdx) => {
          const isFirstGroup = gIdx === 0;
          return (
            <div key={gIdx}>
              {!isFirstGroup && <div className="divider" />}
              {group.type === "single"
                ? renderSingleEntry(
                    group.entry,
                    group.index,
                    // Single entry placeholder
                    "Event (e.g. Arsenal v Chelsea)"
                  )
                : renderEventPair(group.entries, group.indices)}
            </div>
          );
        })}

        <div className="button-group">
          <button className="add-entry-btn" style={{ padding: "12px" }} onClick={addEntry}>
            + Add Entry
          </button>
          <button className="add-event-btn" style={{ padding: "12px" }} onClick={addEvent}>
            + Add Event
          </button>
        </div>
      </div>
    </>
  );
};

export default MatchPickerCalculator;
