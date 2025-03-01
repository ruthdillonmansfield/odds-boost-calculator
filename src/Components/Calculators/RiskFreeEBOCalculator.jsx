import React, { useState, useEffect } from "react";
import "./calculators.css";
import { formatNumber, formatMoney } from "../../helpers.js";

const RiskFreeEBOCalculator = () => {
  // Input states
  const [stake, setStake] = useState("");
  const [riskFreeAmount, setRiskFreeAmount] = useState("");
  const [retention, setRetention] = useState("");
  const [bookieOdds, setBookieOdds] = useState("");
  const [trueOdds, setTrueOdds] = useState("");

  // Calculated output states
  const [effectiveFreeBet, setEffectiveFreeBet] = useState(0);
  const [maxLoss, setMaxLoss] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [chanceOfProfit, setChanceOfProfit] = useState(0);
  const [ev, setEv] = useState(0);
  const [profitLossRatio, setProfitLossRatio] = useState(0);
  const [ebo, setEbo] = useState(0);
  const [rating, setRating] = useState(0);

  // Modal state for "Learn More"
  const [showLearnMore, setShowLearnMore] = useState(false);

  useEffect(() => {
    const st = parseFloat(stake) || 0;
    const rfa = parseFloat(riskFreeAmount) || 0;
    const ret = parseFloat(retention) || 0;
    const bo = parseFloat(bookieOdds) || 0;
    const to = parseFloat(trueOdds) || 0;
    if (st > 0 && rfa > 0 && ret > 0 && bo > 1 && to > 1) {
      // Calculate effective free bet value
      const effFreeBet = rfa * (ret / 100);
      setEffectiveFreeBet(effFreeBet);
      // Maximum loss = stake minus effective free bet value
      const mLoss = st - effFreeBet;
      setMaxLoss(mLoss);
      // Potential bet profit (if the back bet wins)
      const potProfit = st * (bo - 1);
      setPotentialProfit(potProfit);
      // Chance of profit = 1/trueOdds as a percentage
      setChanceOfProfit((1 / to) * 100);
      // Expected value
      const expectedVal = (1 / to * st * (bo - 1)) - ((1 - 1 / to) * mLoss);
      setEv(expectedVal);
      // Profit:Loss ratio
      setProfitLossRatio(mLoss !== 0 ? potProfit / mLoss : 0);
      // Calculate Equivalent Boosted Odds (EBO) using the user‐provided formula:
      // EBO = Bookie odds + ((Potential Profit – (Maximum Loss × (Bookie odds – 1))) / Maximum Loss)
      const calcEbo = bo + ((potProfit - (mLoss * (bo - 1))) / mLoss);
      setEbo(calcEbo);
      // Bet Rating = (EBO / True Odds) * 100
      setRating(to !== 0 ? (calcEbo / to) * 100 : 0);
    }
  }, [stake, riskFreeAmount, retention, bookieOdds, trueOdds]);

  return (
    <div className="container">
      <h2 className="title">Risk-Free Advantage Play Calculator</h2>

      {/* === Inputs === */}
      <div className="inline-fields">
        <div className="input-group-inline">
          <label>Stake:</label>
          <div className="input-prefix-suffix only-prefix">
            <span className="prefix">£</span>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="10.00"
            />
          </div>
        </div>
        <div className="input-group-inline">
          <label>Risk-Free Bet Amount:</label>
          <div className="input-prefix-suffix only-prefix">
            <span className="prefix">£</span>
            <input
              type="number"
              value={riskFreeAmount}
              onChange={(e) => setRiskFreeAmount(e.target.value)}
              placeholder="10.00"
            />
          </div>
        </div>
      </div>

      <div className="inline-fields">
        <div className="input-group-inline">
          <label>Free Bet Retention Rate:</label>
          <div className="input-prefix-suffix only-suffix">
            <input
              type="number"
              step="0.1"
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              placeholder="70.00"
            />
            <span className="suffix">%</span>
          </div>
        </div>
        <div className="input-group-inline">
          <label>Bookie Odds:</label>
          <input
            type="number"
            step="0.01"
            value={bookieOdds}
            onChange={(e) => setBookieOdds(e.target.value)}
            placeholder="4.00"
          />
        </div>
      </div>

      <div className="inline-fields">
        <div className="input-group-inline">
          <label>True Odds:</label>
          <input
            type="number"
            step="0.01"
            value={trueOdds}
            onChange={(e) => setTrueOdds(e.target.value)}
            placeholder="5.00"
          />
        </div>
      </div>

      {/* === Top-line results in a "profit-box" style === */}
      <div className="profit-box" style={{ marginTop: "30px" }}>
        <div style={{ fontSize: "18px", marginBottom: "12px" }}>
          <strong>Equivalent Boosted Odds (EBO):</strong>{" "}
          <span style={{ fontSize: "24px", color: "#00d4ff" }}>
            {ebo.toFixed(2)}
          </span>
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Bet Rating:</strong>{" "}
          <span
            style={{
              fontWeight: "bold",
              color: rating >= 100 ? "#00ff00" : "#ff5555",
            }}
          >
            {rating.toFixed(0)}%
          </span>
        </div>
        <div>
          <strong>Expected Value (EV):</strong>{" "}
          <span style={{ fontWeight: "bold", color: ev >= 0 ? "#00ff00" : "#ff5555" }}>
            £{ev.toFixed(2)}
          </span>
        </div>
      </div>

      {/* === Detailed breakdown in a "result-box" style === */}
      <div className="result-box" style={{ textAlign: "left" }}>
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Breakdown</h3>
        <div className="outcome-line">
          <span className="outcome-label">Effective Free Bet Value:</span>
          <span className="outcome-value">£{effectiveFreeBet.toFixed(2)}</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Maximum Loss:</span>
          <span className="outcome-value">£{maxLoss.toFixed(2)}</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Potential Profit:</span>
          <span className="outcome-value">£{potentialProfit.toFixed(2)}</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Chance of Profit:</span>
          <span className="outcome-value">{chanceOfProfit.toFixed(0)}%</span>
        </div>
        <div className="outcome-line">
          <span className="outcome-label">Profit : Loss (1 : X):</span>
          <span className="outcome-value">1 : {profitLossRatio}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskFreeEBOCalculator;
