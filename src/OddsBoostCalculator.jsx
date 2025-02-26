import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./OddsBoostCalculator.css";

const OddsBoostCalculator = () => {
  const [odds, setOdds] = useState("");
  const [boost, setBoost] = useState(10);
  const [boostedOdds, setBoostedOdds] = useState(1);
  const [copied, setCopied] = useState(false);


  const calculateBoostedOdds = () => {
    if (!odds || isNaN(boost)) return;
    const decimalOdds = parseFloat(odds);
    const boostPercentage = parseFloat(boost);

    if (isNaN(decimalOdds) || isNaN(boostPercentage) || decimalOdds <= 1 || boostPercentage < 0) {
      setBoostedOdds("Invalid input");
      return;
    }

    const newOdds = 1 + (decimalOdds - 1) * (1 + boostPercentage / 100);
    setBoostedOdds(parseFloat(newOdds.toFixed(3)));
  };

  useEffect(() => {
    const result = calculateBoostedOdds(odds, boost);
    setBoostedOdds(result);
  }, [odds, boost]);

  const copyToClipboard = () => {
    if (!boostedOdds) return;

    navigator.clipboard.writeText(boostedOdds).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      calculateBoostedOdds();
    }
    if (e.key.toLowerCase() === "c") {
      copyToClipboard();
    }
  };
  

  return (
    <div className="container">
      <h2>Decimal Odds Boost Calculator</h2>
      <div className="input-group">
        <label>Odds:</label>
        <input
          type="number"
          step="0.01"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 2.50"
        />
      </div>
      <div className="input-group">
        <label>Boost %:</label>
        <input
          type="number"
          step="0.1"
          value={boost}
          onChange={(e) => setBoost(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 10"
        />
      </div>
      <button onClick={calculateBoostedOdds}>Calculate</button>
        <div
          className={`result-box ${copied ? "glow" : ""}`}
          onClick={copyToClipboard}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          Boosted Odds: {boostedOdds}
          {boostedOdds && (
            copied ? <ClipboardCheck size={20} color="green" /> : <Clipboard size={20} />
          )}
        </div>
    </div>
  );
};

export default OddsBoostCalculator;
