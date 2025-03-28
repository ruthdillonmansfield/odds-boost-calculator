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

  const [showOverlay, setShowOverlay] = useState(false);
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
    const isBest = bestMatch &&
      entry.match === bestMatch.match &&
      entry.back === bestMatch.back &&
      entry.lay === bestMatch.lay;
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
              className={`${entry.match ? "blue-bottom" : ""} ${isBest ? "green-bottom" : ""}`}
              type="text"
              value={entry.match}
              onChange={(e) => updateEntry(i, "match", e.target.value)}
              placeholder="Event (e.g. Arsenal v Chelsea)"
            />
            </div>
            <div className={`profit-box profit-box-inline ${isBest ? "highlighted" : ""}`}>
              <h5 className="outcome-main">
                {entry.lay
                  ? formatOutcome(getWorstCaseProfit(parseFloat(entry.back), parseFloat(entry.lay)))
                  : "–"}
              </h5>
            </div>

          </div>
          <div className="inline-fields mb-16">
            <div className="input-group-inline">
              <label>Back Odds:</label>
              <input
                type="number"
                step="0.1"
                value={entry.back}
                onChange={(e) => updateEntry(i, "back", e.target.value)}
              />
            </div>
            <div className="input-group-inline">
              <label>Lay Odds:</label>
              <input
                type="number"
                step="0.1"
                value={entry.lay}
                onChange={(e) => updateEntry(i, "lay", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

const bestMatch = useMemo(() => {
  let best = null;
  entries.forEach((entry) => {
    const b = parseFloat(entry.back);
    const l = parseFloat(entry.lay);
    if (!isNaN(b) && !isNaN(l) && b > 1 && l > 1) {
      const profit = getWorstCaseProfit(b, l);
      const combinedLayOdds = b * l; 
      if (
        best === null ||
        profit > best.profit ||
        (profit === best.profit && combinedLayOdds < best.combinedLayOdds)
      ) {
        best = { ...entry, profit, combinedLayOdds };
      }
    }
  });
  return best;
}, [entries, stake, commission, freeBet, stakeReturned]);


  const overlayCommissionValue = parseFloat(overlayCommission) / 100 || 0;
  const overlayBackOdds = bestMatch ? parseFloat(bestMatch.back) : 0;
  const overlayLayOdds = bestMatch ? parseFloat(bestMatch.lay) : 0;
  const effectiveLayOdds =
    overlayLayOddsOverride.trim() !== ""
      ? parseFloat(overlayLayOddsOverride)
      : overlayLayOdds;

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

  let profitIfExchangeWinsOverlay = "";
  if (overlayStake && effectiveLayOdds && recommendedLayStakeOverlay !== "") {
    const S = parseFloat(overlayStake);
    if (freeBet) {
      profitIfExchangeWinsOverlay = (recommendedLayStakeOverlay * (1 - overlayCommissionValue)).toFixed(2);
    } else {
      profitIfExchangeWinsOverlay = (recommendedLayStakeOverlay * (1 - overlayCommissionValue) - S).toFixed(2);
    }
  }

  let worstCaseProfitOverlay = "";
  if (profitIfBookieWinsOverlay !== "" && profitIfExchangeWinsOverlay !== "") {
    worstCaseProfitOverlay = Math.min(
      parseFloat(profitIfBookieWinsOverlay),
      parseFloat(profitIfExchangeWinsOverlay)
    ).toFixed(2);
  }

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      
      {bestMatch && (
        <button className="floating-button" onClick={() => setShowOverlay(true)}>
          Show Best Match
        </button>
      )}

      {showOverlay && bestMatch && (
        <div className="overlay">
          <div className="overlay-content m-20">
            <h3>Best Match</h3>
            <div className="best-selections-grid">
              <div className="grid-header first-col">Event</div>
              <div className="grid-header">Back</div>
              <div className="grid-header">Lay</div>
              <React.Fragment key={bestMatch.match + bestMatch.back}>
                <div className="first-col">{bestMatch.match || "Untitled"}</div>
                <div>{bestMatch.back || "–"}</div>
                <div>{bestMatch.lay || "–"}</div>
              </React.Fragment>
            </div>

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
                      placeholder="Enter stake"
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
                onKeyDown={handleKeyDown}
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="£10.00"
              />
            </div>
          </div>
          <div className="input-group-inline">
            <label>Exchange Commission:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                onKeyDown={handleKeyDown}
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="0"
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
            style={{ padding: "12px", maxWidth: "100%" }}
            onClick={addEntry}
          >
            + Add Option
          </button>
        </div>
        {bestMatch && (<div className="button-group">
          <button
            className="add-entry-btn"
            style={{ padding: "12px", maxWidth: "100%" }}
            onClick={() => setShowOverlay(true)}
          >
          Show Best Match
          </button>
        </div>
      )}
      </div>
    </>
  );
};

export default MatchPickerCalculator;
