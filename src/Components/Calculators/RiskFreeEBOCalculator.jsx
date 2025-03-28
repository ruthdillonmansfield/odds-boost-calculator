import React, { useState, useEffect } from "react";
import "./calculators.css";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";

const RiskFreeEBOCalculator = () => {
  const meta = pageConfig.riskFreeEBOCalculator?.seo || {};

  const [stake, setStake] = useState("");
  const [riskFreeAmount, setRiskFreeAmount] = useState("");
  const [retention, setRetention] = useState("");
  const [bookieOdds, setBookieOdds] = useState("");
  const [trueOdds, setTrueOdds] = useState("");

  const [effectiveFreeBet, setEffectiveFreeBet] = useState(0);
  const [maxLoss, setMaxLoss] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [chanceOfProfit, setChanceOfProfit] = useState(0);
  const [ev, setEv] = useState(0);
  const [profitLossRatio, setProfitLossRatio] = useState(0);
  const [ebo, setEbo] = useState(0);
  const [rating, setRating] = useState(0);

  const [lockInLayOdds, setLockInLayOdds] = useState("");
  const [lockInCommission, setLockInCommission] = useState("");
  const [lockInProfit, setLockInProfit] = useState(null);

  useEffect(() => {
    const st = parseFloat(stake) || 0;
    const rfa = parseFloat(riskFreeAmount) || 0;
    const ret = parseFloat(retention) || 0;
    const bo = parseFloat(bookieOdds) || 0;
    const to = parseFloat(trueOdds) || 0;

    if (st > 0 && rfa > 0 && ret > 0 && bo > 1 && to > 1) {
      const effFreeBet = rfa * (ret / 100);
      setEffectiveFreeBet(effFreeBet);

      const mLoss = st - effFreeBet;
      setMaxLoss(mLoss);

      const potProfit = st * (bo - 1);
      setPotentialProfit(potProfit);

      setChanceOfProfit((1 / to) * 100);

      const expectedVal =
        (1 / to) * st * (bo - 1) - (1 - 1 / to) * mLoss;
      setEv(expectedVal);

      setProfitLossRatio(mLoss !== 0 ? potProfit / mLoss : 0);

      const calcEbo = bo + (potProfit - mLoss * (bo - 1)) / mLoss;
      setEbo(calcEbo);

      const betRating = to !== 0 ? (calcEbo / to) * 100 : 0;
      setRating(betRating);
    } else {
      setEffectiveFreeBet(0);
      setMaxLoss(0);
      setPotentialProfit(0);
      setChanceOfProfit(0);
      setEv(0);
      setProfitLossRatio(0);
      setEbo(0);
      setRating(0);
    }
  }, [stake, riskFreeAmount, retention, bookieOdds, trueOdds]);

  useEffect(() => {
    const st = parseFloat(stake) || 0;
    const bo = parseFloat(bookieOdds) || 0;
    const effFB = effectiveFreeBet;
    const layOdds = parseFloat(lockInLayOdds) || 0;
    const comm = (parseFloat(lockInCommission) || 0) / 100;

    if (ebo > 1 && st > 0 && bo > 1 && layOdds > 1) {
      const potProfit = st * (bo - 1);
      const realRisk = st - effFB;
      if (realRisk <= 0) {
        setLockInProfit(null);
        return;
      }

      // Calculate lay stake using symmetry:
      // netIfBookie = potProfit - Lstake*(layOdds-1)
      // netIfExchange = Lstake*(1-comm) - realRisk
      // Equate both: potProfit + realRisk = Lstake * (layOdds - comm)
      const denom = layOdds - comm;
      if (denom <= 1e-9) {
        setLockInProfit(null);
        return;
      }
      const Lstake = (potProfit + realRisk) / denom;

      const netIfBookie = potProfit - Lstake * (layOdds - 1);
      setLockInProfit(netIfBookie);
    } else {
      setLockInProfit(null);
    }
  }, [ebo, stake, bookieOdds, effectiveFreeBet, lockInLayOdds, lockInCommission]);

  const formatEV = (val) => (
    <span style={{ fontWeight: "bold", color: val >= 0 ? "#00ff00" : "#ff5555" }}>
      £{val.toFixed(2)}
    </span>
  );

  const formatRating = (val) => (
    <span style={{ fontWeight: "bold", color: val >= 100 ? "#00ff00" : "#ff5555" }}>
      {val.toFixed(0)}%
    </span>
  );

  return (
  <>
    <Seo 
        title={meta.title} 
        description={meta.description} 
      />
    
    <div className="container">
      <h2 className="title with-subhead">Risk-Free Advantage Play Calculator <em>(Experimental)</em></h2>
      <h4 className="subhead">For help deciding whether to AP, lock-in or decline a risk-free bet. I developed the concept of Equivalent Boosted Odds and it is experimental. I am not an expert.</h4>
      <div className="inline-fields lay-row">
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
          <label>Odds:</label>
          <input
            type="number"
            step="0.01"
            value={bookieOdds}
            onChange={(e) => setBookieOdds(e.target.value)}
            placeholder="3.5"
          />
        </div>
      </div>

      <div className="inline-fields lay-row">
        <div className="input-group-inline">
          <label>Free Bet Amount:
          <span className="info-icon">
              i
              <span className="tooltip-text">
                What is the value of the free bet you will receive if your back bet loses?
              </span>
            </span>
          </label>
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
        <div className="input-group-inline">
          <label>Free Bet Retention Rate:
          <span className="info-icon">
              i
              <span className="tooltip-text">
                This is the percentage of your free bet that you expect to secure as profit. If your stake would be returned as cash, enter 100%.
              </span>
            </span>
          </label>
          <div className="input-prefix-suffix only-suffix">
            <input
              type="number"
              step="0.1"
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              placeholder="70"
            />
            <span className="suffix">%</span>
          </div>
        </div>
      </div>

      <div className="inline-fields">
        <div className="input-group-inline">
          <label>True Odds:
            <span className="info-icon">
              i
              <span className="tooltip-text">
              Estimate true odds by stripping the bookie’s margin and considering market data. Use a sharp estimate if confident, or a conservative guess if not.
              </span>
            </span>
          </label>
          <input
            type="number"
            step="0.01"
            value={trueOdds}
            onChange={(e) => setTrueOdds(e.target.value)}
            placeholder="4.5"
          />
        </div>
      </div>

      {ebo > 1 && (
        <div className="result-box" style={{ textAlign: "left" }}>
          <div className="outcome-line">
            <span className="outcome-label outcome-primary">Equivalent Boosted Odds (EBO):</span>
            <span className="outcome-value">{parseFloat(ebo.toFixed(2))}</span>
          </div>
          <div className="outcome-line">
            <span className="outcome-info">This bet is equivalent to punting this outcome at these odds. For more info see the calculator details.</span>
          </div>
          <div className="outcome-line">
            <span className="outcome-label outcome-primary">Bet Rating:</span>
            <span className="outcome-value">{formatRating(rating)}</span>
          </div>
          <div className="outcome-line">
            <span className="outcome-info">Evaluate as you would a value bet.</span>
          </div>
          <div className="outcome-line">
            <span className="outcome-label outcome-primary">Expected Value (EV):</span>
            <span className="outcome-value">{formatEV(ev)}</span>
          </div>
        </div>
      )}

      {(maxLoss > 0 || potentialProfit > 0) && (
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
            <span className="outcome-value">
              {chanceOfProfit.toFixed(0)}%
            </span>
          </div>
          <div className="outcome-line">
            <span className="outcome-label">Profit : Loss:</span>
            <span className="outcome-value">
              1 : {parseFloat(profitLossRatio.toFixed(2))}
            </span>
          </div>
          <div className="outcome-line">
            <span className="outcome-label"><em>Or: Implied Odds</em>:</span>
            <span className="outcome-value">
              {parseFloat(profitLossRatio.toFixed(2))}
            </span>
          </div>
        </div>
      )}

      {ebo > 1 && (
        <div className="profit-box" style={{ textAlign: "left" }}>
          <h3 style={{ marginTop: 0 }}>Compare to Locking In Profit</h3>
          <p style={{ fontSize: "16px", marginBottom: "12px" }}>
            Enter the lay odds at which you could lock in profit, plus the exchange commission.
          </p>

          <div className="inline-fields">
            <div className="input-group-inline">
              <label>Lay Odds (Lock-In):</label>
              <input
                type="number"
                step="0.1"
                value={lockInLayOdds}
                onChange={(e) => setLockInLayOdds(e.target.value)}
                placeholder="4"
              />
            </div>
            <div className="input-group-inline">
              <label>Exchange Commission:</label>
              <div className="input-prefix-suffix only-suffix">
                <input
                  type="number"
                  step="1"
                  value={lockInCommission}
                  onChange={(e) => setLockInCommission(e.target.value)}
                  placeholder="2"
                />
                <span className="suffix">%</span>
              </div>
            </div>
          </div>

          {lockInProfit !== null && (
            <div className="result-box" style={{ marginTop: "12px", textAlign: "left" }}>
              <div className="outcome-line">
                <span className="outcome-label">Lock-In Profit:</span>
                <span
                  className="outcome-value"
                  style={{ color: lockInProfit >= 0 ? "#00ff00" : "#ff5555" }}
                >
                  £{lockInProfit.toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: "14px", marginTop: "8px", color: "#ccc" }}>
                This is how much you'd make if you chose to lock in your bet at the specified lay odds, regardless of the outcome.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default RiskFreeEBOCalculator;
