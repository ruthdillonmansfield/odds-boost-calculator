import { useState, useEffect } from "react";
import "./OddsBoostCalculator.css";

const OddsBoostCalculator = () => {
  const [odds, setOdds] = useState("");
  const [boost, setBoost] = useState("");
  const [boostedOdds, setBoostedOdds] = useState("");

  const calculateBoostedOdds = () => {
    if (!odds || !boost) return;
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

  return (
    <div className="container">
      <h2>Odds Boost Calculator</h2>
      <div className="input-group">
        <label>Odds:</label>
        <input
          type="number"
          step="0.01"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
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
          placeholder="e.g. 10"
        />
      </div>
      <button onClick={calculateBoostedOdds}>Calculate</button>
      <div className="result-box">Boosted Odds: {boostedOdds}</div>
    </div>
  );
};

export default OddsBoostCalculator;
