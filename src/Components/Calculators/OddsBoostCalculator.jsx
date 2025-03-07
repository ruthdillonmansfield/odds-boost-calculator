import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber } from "../../helpers.js";

const OddsBoostCalculator = () => {
  const [odds, setOdds] = useState("");
  const [boost, setBoost] = useState(10);
  const [boostedOdds, setBoostedOdds] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculateBoostedOdds = () => {
    const decimalOdds = parseFloat(odds);
    const boostPercentage = parseFloat(boost);
    if (!odds || isNaN(decimalOdds) || decimalOdds <= 1 || !boost || isNaN(boostPercentage) || boostPercentage < 0) {
      return null;
    }
    const newOdds = 1 + (decimalOdds - 1) * (1 + boostPercentage / 100);
    return parseFloat(newOdds.toFixed(3));
  };

  useEffect(() => {
    setBoostedOdds(calculateBoostedOdds());
  }, [odds, boost]);

  const copyToClipboard = () => {
    if (boostedOdds !== null) {
      navigator.clipboard.writeText(boostedOdds.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") {
      copyToClipboard();
    }
  };

  const getBoostedOddsLabel = () => {
    if (!odds && !boost) return "";
    if (boostedOdds === null) return "";
    return formatNumber(boostedOdds, 3);
  };

  return (
    <div className="container">
      <h2 className="title">Decimal Odds Boost Calculator</h2>
      <div className="inline-fields">
        <div className="input-group-inline">
          <label>Odds:</label>
          <input
            type="number"
            step="0.01"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="2.50"
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
      {getBoostedOddsLabel() && (
        <div
          className={`result-box copyable ${copied ? "glow" : ""}`}
          onClick={copyToClipboard}
          title="Click to copy"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px"
          }}
        >
          <span className="label">Boosted Odds:</span>
          <span className="value">{getBoostedOddsLabel()}</span>
          {boostedOdds !== null &&
            (copied ? <ClipboardCheck size={22} color="#edff00" /> : <Clipboard size={22} />)}
        </div>
      )}
    </div>
  );
};

export default OddsBoostCalculator;
