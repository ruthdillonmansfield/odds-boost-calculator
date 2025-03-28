import { useState, useMemo, useEffect } from "react";
import React from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";

import "./calculators.css";
import { formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";

const GroupContainer = ({ group, children, removeGroup }) => (
  <div className="group-container" style={{ position: "relative" }}>
    <button
      className="group-remove-button"
      onClick={() => removeGroup(group)}
      style={{
        position: "absolute",
        top: "-10px",
        right: "-10px",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        backgroundColor: "#ff5555",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "bold",
        lineHeight: "20px",
        padding: 0,
      }}
    >
      ×
    </button>
    {children}
  </div>
);

const AccaPickerCalculator = () => {
  const meta = pageConfig.accaPickerCalculator?.seo || {};

  // Main calculator state
  const [stake, setStake] = useState(10);
  const [commission, setCommission] = useState(0);
  const [freeBet, setFreeBet] = useState(false);
  const [stakeReturned, setStakeReturned] = useState(false);
  const [entries, setEntries] = useState([]);
  const [nextEntryId, setNextEntryId] = useState(1);
  const [top, setTop] = useState(3);
  const [minOdds, setMinOdds] = useState(4);
  const [nextEventId, setNextEventId] = useState(1);

  // Overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  // Overlay Lay Calculator state (separate from main inputs)
  const [overlayStake, setOverlayStake] = useState(10);
  const [overlayCommission, setOverlayCommission] = useState(commission);
  const [overlayLayOddsOverride, setOverlayLayOddsOverride] = useState("");
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    if (recommendedLayStakeOverlay !== "") {
      navigator.clipboard.writeText(recommendedLayStakeOverlay.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") copyToClipboard();
  };

  const commissionValue = parseFloat(commission) / 100 || 0;

  // Functions from your Acca Picker calculations
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
      <span className={value >= 0 ? "positive" : "negative"}>
        {value < 0 ? "–" : ""}£{formatted}
      </span>
    );
  };

  const updateEntry = (id, field, value) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: nextEntryId, match: "", back: "", lay: "", eventId: null },
    ]);
    setNextEntryId((id) => id + 1);
  };

  const addEvent = () => {
    const eventId = nextEventId;
    const newEntry1 = { id: nextEntryId, match: "", back: "", lay: "", eventId };
    const newEntry2 = { id: nextEntryId + 1, match: "", back: "", lay: "", eventId };
    setEntries((prev) => [...prev, newEntry1, newEntry2]);
    setNextEntryId((id) => id + 2);
    setNextEventId((id) => id + 1);
  };

  const add3WayEvent = () => {
    const eventId = nextEventId;
    const newEntry1 = { id: nextEntryId, match: "", back: "", lay: "", eventId };
    const newEntry2 = { id: nextEntryId + 1, match: "", back: "", lay: "", eventId };
    const newEntry3 = { id: nextEntryId + 2, match: "", back: "", lay: "", eventId };
    setEntries((prev) => [...prev, newEntry1, newEntry2, newEntry3]);
    setNextEntryId((id) => id + 3);
    setNextEventId((id) => id + 1);
  };

  const groupEntries = (list) => {
    const grouped = [];
    for (let i = 0; i < list.length; i++) {
      const current = list[i];
      if (current.eventId !== null) {
        if (
          i + 2 < list.length &&
          list[i + 1].eventId === current.eventId &&
          list[i + 2].eventId === current.eventId
        ) {
          grouped.push({
            type: "triple",
            entries: [current, list[i + 1], list[i + 2]],
          });
          i += 2;
        } else if (
          i + 1 < list.length &&
          list[i + 1].eventId === current.eventId
        ) {
          grouped.push({
            type: "pair",
            entries: [current, list[i + 1]],
          });
          i += 1;
        } else {
          grouped.push({ type: "single", entry: current });
        }
      } else {
        grouped.push({ type: "single", entry: current });
      }
    }
    return grouped;
  };

  const groupedEntries = useMemo(() => groupEntries(entries), [entries]);

  const removeGroup = (group) => {
    setEntries((prev) => {
      if (group.type === "single") {
        return prev.filter((e) => e.id !== group.entry.id);
      } else {
        const eventId = group.entries[0].eventId;
        return prev.filter((e) => e.eventId !== eventId);
      }
    });
  };

  /**
   * getBestCombo returns an object with { outcomes, productOdds, totalProfit }
   */
  const getBestCombo = () => {
    const minOddsVal = parseFloat(minOdds);
    const groups = groupedEntries
      .map((g) => {
        if (g.type === "single") {
          return { groupId: g.entry.id, options: [g.entry] };
        } else {
          return {
            groupId: g.entries[0].eventId,
            options: g.entries,
          };
        }
      })
      .filter((x) => x !== null);
    if (groups.length < top) return null;
    let bestCombo = null;
    const groupIndices = [];
    const chooseGroups = (start, combo) => {
      if (combo.length === top) {
        groupIndices.push([...combo]);
        return;
      }
      for (let i = start; i < groups.length; i++) {
        combo.push(i);
        chooseGroups(i + 1, combo);
        combo.pop();
      }
    };
    chooseGroups(0, []);
    const cartesianProduct = (arrays) => {
      let result = [[]];
      for (const arr of arrays) {
        const temp = [];
        for (const res of result) {
          for (const el of arr) {
            temp.push([...res, el]);
          }
        }
        result = temp;
      }
      return result;
    };
    for (const comboIndices of groupIndices) {
      const optionsArrays = comboIndices.map((idx) => groups[idx].options);
      const combos = cartesianProduct(optionsArrays);
      for (const candidate of combos) {
        let productOdds = 1;
        let totalProfit = 0;
        let valid = true;
        candidate.forEach((outcome) => {
          const b = parseFloat(outcome.back);
          const l = parseFloat(outcome.lay);
          if (isNaN(b) || isNaN(l)) {
            valid = false;
          }
          productOdds *= b;
          totalProfit += getWorstCaseProfit(b, l);
        });
        if (!valid) continue;
        if (productOdds >= minOddsVal) {
          if (bestCombo === null || totalProfit > bestCombo.totalProfit) {
            bestCombo = {
              outcomes: candidate,
              productOdds,
              totalProfit,
            };
          }
        }
      }
    }
    return bestCombo;
  };

  const bestCombo = useMemo(() => getBestCombo(), [
    entries,
    top,
    minOdds,
    freeBet,
    stakeReturned,
    stake,
    commission,
    groupedEntries,
  ]);

  const highlightedEntries = bestCombo
    ? bestCombo.outcomes.map((o) => o.id)
    : [];

  const combinedBackOdds = bestCombo
    ? bestCombo.outcomes
        .reduce((acc, o) => acc * parseFloat(o.back || 1), 1)
        .toFixed(2)
    : null;
  const combinedLayOdds = bestCombo
    ? bestCombo.outcomes
        .reduce((acc, o) => acc * parseFloat(o.lay || 1), 1)
        .toFixed(2)
    : null;

  // ---- Overlay Lay Calculator Calculations ----
  const overlayCommissionValue = parseFloat(overlayCommission) / 100 || 0;
  const overlayBackOdds = parseFloat(combinedBackOdds) || 0;
  const overlayLayOdds = parseFloat(combinedLayOdds) || 0;
  const effectiveLayOdds =
    overlayLayOddsOverride.trim() !== ""
      ? parseFloat(overlayLayOddsOverride)
      : overlayLayOdds;
  
  // Incorporate free bet / stake returned logic for the overlay recommended lay stake
  let recommendedLayStakeOverlay = "";
  if (
    overlayStake &&
    overlayBackOdds &&
    effectiveLayOdds &&
    effectiveLayOdds - overlayCommissionValue !== 0
  ) {
    const S = parseFloat(overlayStake);
    const B = overlayBackOdds;
    const LO = effectiveLayOdds;
    if (freeBet && stakeReturned) {
      recommendedLayStakeOverlay = ((S * B) / (LO - overlayCommissionValue)).toFixed(2);
    } else if (freeBet && !stakeReturned) {
      recommendedLayStakeOverlay = (((B - 1) * S) / (LO - overlayCommissionValue)).toFixed(2);
    } else {
      recommendedLayStakeOverlay = ((S * B) / (LO - overlayCommissionValue)).toFixed(2);
    }
  }
  
  // Profit if Bookie Wins Calculation
  let profitIfBookieWinsOverlay = "";
  if (overlayStake && overlayBackOdds && effectiveLayOdds && recommendedLayStakeOverlay !== "") {
    const S = parseFloat(overlayStake);
    const B = overlayBackOdds;
    const LO = effectiveLayOdds;
    if (freeBet && stakeReturned) {
      profitIfBookieWinsOverlay = (B * S - (LO - 1) * recommendedLayStakeOverlay).toFixed(2);
    } else if (freeBet && !stakeReturned) {
      profitIfBookieWinsOverlay = (((B - 1) * S) - (LO - 1) * recommendedLayStakeOverlay).toFixed(2);
    } else {
      profitIfBookieWinsOverlay = (S * (B - 1) - recommendedLayStakeOverlay * (LO - 1)).toFixed(2);
    }
  }
  
  // Profit if Exchange Wins Calculation
  let profitIfExchangeWinsOverlay = "";
  if (overlayStake && effectiveLayOdds && recommendedLayStakeOverlay !== "") {
    const S = parseFloat(overlayStake);
    if (freeBet) {
      profitIfExchangeWinsOverlay = (recommendedLayStakeOverlay * (1 - overlayCommissionValue)).toFixed(2);
    } else {
      profitIfExchangeWinsOverlay = (recommendedLayStakeOverlay * (1 - overlayCommissionValue) - S).toFixed(2);
    }
  }
  
  // Worst Case Profit Calculation
  let worstCaseProfitOverlay = "";
  if (profitIfBookieWinsOverlay !== "" && profitIfExchangeWinsOverlay !== "") {
    worstCaseProfitOverlay = Math.min(
      parseFloat(profitIfBookieWinsOverlay),
      parseFloat(profitIfExchangeWinsOverlay)
    ).toFixed(2);
  }

  // ---- Render Helpers for entries ----
  const renderSingleEntry = (entry, placeholder) => {
    const isHighlighted = highlightedEntries.includes(entry.id);
    return (
      <div className="entry-box" key={entry.id}>
        <div className="inline-fields" style={{ alignItems: "flex-end" }}>
          <div className="input-group-inline">
            <input
              className={isHighlighted ? "green-bottom" : entry.match ? "blue-bottom" : ""}
              type="text"
              value={entry.match}
              onChange={(e) => updateEntry(entry.id, "match", e.target.value)}
              placeholder={placeholder}
            />
          </div>
          <div
            className={`profit-box profit-box-inline ${isHighlighted ? "highlighted" : ""}`}
            style={{ marginTop: 0 }}
          >
            <h5 className="outcome-main">
              {entry.lay
                ? formatOutcome(getWorstCaseProfit(parseFloat(entry.back), parseFloat(entry.lay)))
                : "–"}
            </h5>
          </div>
        </div>
        <div className="inline-fields mb-16">
          <div className="input-group-inline input-prefix-suffix only-suffix">
            <input
              type="number"
              step="0.1"
              placeholder="2"
              value={entry.back}
              onChange={(e) => updateEntry(entry.id, "back", e.target.value)}
            />
            <span className="suffix">Back</span>
          </div>
          <div className="input-group-inline input-prefix-suffix only-suffix">
            <input
              type="number"
              step="0.1"
              placeholder="2.1"
              value={entry.lay}
              onChange={(e) => updateEntry(entry.id, "lay", e.target.value)}
            />
            <span className="suffix">Lay</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSingleEntryGroup = (entry, placeholder) => (
    <div className="event-pair-container" key={entry.id}>
      {renderSingleEntry(entry, placeholder)}
    </div>
  );

  const renderEventPair = (pairEntries) => (
    <div className="event-pair-container" key={`pair-${pairEntries.map((e) => e.id).join("-")}`}>
      {renderSingleEntry(pairEntries[0], "Outcome (e.g. Swiatek win)")}
      {renderSingleEntry(pairEntries[1], "Outcome (e.g. Raducanu win)")}
    </div>
  );

  const renderEventTriple = (tripleEntries) => (
    <div className="event-pair-container" key={`triple-${tripleEntries.map((e) => e.id).join("-")}`}>
      {renderSingleEntry(tripleEntries[0], "Outcome #1 (e.g. Arsenal win)")}
      {renderSingleEntry(tripleEntries[1], "Outcome #2 (e.g. Draw)")}
      {renderSingleEntry(tripleEntries[2], "Outcome #3 (e.g. Chelsea win)")}
    </div>
  );

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      
      {/* Floating Button for Overlay */}
      {bestCombo && (
        <button className="floating-button" onClick={() => setShowOverlay(true)}>
          Show Best Selections
        </button>
      )}

      {/* Overlay Modal */}
      {showOverlay && bestCombo && (
        <div className="overlay">
          <div className="overlay-content m-20">
            <h3>Best Combination</h3>
            <div className="best-selections-grid">
              <div className="grid-header first-col">Event</div>
              <div className="grid-header">Back</div>
              <div className="grid-header">Lay</div>
              {bestCombo.outcomes.map((o) => (
                <React.Fragment key={o.id}>
                  <div className="first-col">{o.match || "Untitled"}</div>
                  <div>{o.back || "–"}</div>
                  <div>{o.lay || "–"}</div>
                </React.Fragment>
              ))}
            </div>

            <div className="combined-odds center">
              Combined Back Odds: <strong>{parseFloat(combinedBackOdds)}</strong>
              <br />
              Combined Lay Odds: <strong>{parseFloat(combinedLayOdds)}</strong>
            </div>

            {/* Lay Calculator Section */}
            <div className="lay-calculator-section">
              <h4>Lay Stake Calculator</h4>
              <div className="inline-fields partial-row-trio">
                <div className="input-group-inline">
                  <label>Stake:</label>
                  <div className="input-prefix-suffix only-prefix">
                    <span className="prefix">£</span>
                    <input
                      type="number"
                      step="1"
                      onKeyDown={handleKeyDown}
                      value={overlayStake}
                      onChange={(e) => setOverlayStake(e.target.value)}
                      placeholder="£10.00"
                    />
                  </div>
                </div>
                <div className="input-group-inline">
                  <label>Exchange Commission:</label>
                  <div className="input-prefix-suffix only-suffix">
                    <input
                      type="number"
                      step="1"
                      onKeyDown={handleKeyDown}
                      value={overlayCommission}
                      onChange={(e) => setOverlayCommission(e.target.value)}
                      placeholder="0"
                    />
                    <span className="suffix">%</span>
                  </div>
                </div>
                <div className="input-group-inline">
                  <label>Use Lay Odds:</label>
                  <input
                    type="number"
                    step="0.1"
                    onKeyDown={handleKeyDown}
                    value={overlayLayOddsOverride}
                    onChange={(e) => setOverlayLayOddsOverride(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              {recommendedLayStakeOverlay !== "" && (
                <div
                  className={`result-box copyable ${copied ? "glow" : ""}`}
                  onClick={copyToClipboard}
                  title="Click to copy recommended lay stake"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "20px"
                  }}
                >
                  <h5 className="outcome-main">
                    <span>
                      You could lay: £{recommendedLayStakeOverlay}
                    </span>
                  </h5>
                  {copied ? (
                    <ClipboardCheck size={24} color="#edff00" />
                  ) : (
                    <Clipboard size={24} color="#00aaff" />
                  )}
                </div>
              )}

              <div
                className="profit-box copyable center"
                onClick={copyToClipboard}
                title="Click to copy recommended lay stake"
              >
                <h5 className="outcome-primary">
                  Your minimum profit would be:{" "}
                  <span
                    className={
                      parseFloat(worstCaseProfitOverlay) >= 0 ? "positive" : "negative"
                    }
                  >
                    £{parseFloat(worstCaseProfitOverlay).toFixed(2)}
                  </span>
                </h5>
                <div className="profit-details">
                  Profit if bookie wins:{" "}
                  {profitIfBookieWinsOverlay !== "" && (
                    <span
                      className={
                        parseFloat(profitIfBookieWinsOverlay) >= 0 ? "positive" : "negative"
                      }
                    >
                      £{parseFloat(profitIfBookieWinsOverlay).toFixed(2)}
                    </span>
                  )}
                  <br />
                  Profit if exchange wins:{" "}
                  {profitIfExchangeWinsOverlay !== "" && (
                    <span
                      className={
                        parseFloat(profitIfExchangeWinsOverlay) >= 0 ? "positive" : "negative"
                      }
                    >
                      £{parseFloat(profitIfExchangeWinsOverlay).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button className="close-overlay-btn" onClick={() => setShowOverlay(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="container">
        <h2 className="title with-subhead">Acca Picker</h2>
        <h4 className="subhead">
          Find the best acca combination from a set of available events.
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
              Legs:
              <span className="info-icon">
                i
                <span className="tooltip-text">
                  How many legs are needed for your acca?
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
            <label>Min Odds:</label>
            <input
              type="number"
              step="1"
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

        {groupedEntries.map((group) => {
          let groupKey = "";
          if (group.type === "single") {
            groupKey = `single-${group.entry.id}`;
          } else if (group.type === "pair") {
            groupKey = `pair-${group.entries.map((e) => e.id).join("-")}`;
          } else if (group.type === "triple") {
            groupKey = `triple-${group.entries.map((e) => e.id).join("-")}`;
          }
          return (
            <div key={groupKey}>
              <GroupContainer group={group} removeGroup={removeGroup}>
                {group.type === "single" &&
                  renderSingleEntryGroup(group.entry, "Outcome (e.g. Constitution Hill)")}
                {group.type === "pair" && renderEventPair(group.entries)}
                {group.type === "triple" && renderEventTriple(group.entries)}
              </GroupContainer>
              <div className="divider" />
            </div>
          );
        })}

        <div className="button-group">
          <button
            className="add-entry-btn"
            style={{ padding: "12px" }}
            onClick={addEntry}
          >
            + Add Single Outcome
          </button>
          <button
            className="add-event-btn"
            style={{ padding: "12px" }}
            onClick={addEvent}
          >
            + Add 2-Way Event
          </button>
          <button
            className="add-event-btn"
            style={{ padding: "12px" }}
            onClick={add3WayEvent}
          >
            + Add 3-Way Event
          </button>
        </div>
        {bestCombo && (<div className="button-group">
          <button
            className="add-entry-btn"
            style={{ padding: "12px", maxWidth: "100%" }}
            onClick={() => setShowOverlay(true)}
          >
          Show Best Selections
          </button>
        </div>
      )}
      </div>
    </>
  );
};

export default AccaPickerCalculator;
