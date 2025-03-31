import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";
import { calcRiskFreeProfit } from "./calculations.js";

const RiskFreeBetCalculator = () => {
  const meta = pageConfig.riskFreeBetCalculator?.seo || {};

  const [backOdds, setBackOdds] = useState("");
  const [stake, setStake] = useState("");
  const [layOdds, setLayOdds] = useState("");
  const [commission, setCommission] = useState("");
  const [riskFree, setRiskFree] = useState("");
  const [retention, setRetention] = useState(80);

  const [layStake, setLayStake] = useState(null);
  const [guaranteedProfit, setGuaranteedProfit] = useState(null);
  const [breakdownData, setBreakdownData] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculateAll = () => {
    const S = parseFloat(stake);
    const B = parseFloat(backOdds);
    const LOdds = parseFloat(layOdds);
    const F = parseFloat(riskFree);
    const comm = parseFloat(commission);
    const ret = parseFloat(retention);

    if (!S || !B || !LOdds || S <= 0 || B <= 1 || LOdds <= 1 || !F || F <= 0) {
      setLayStake(null);
      setGuaranteedProfit(null);
      setBreakdownData(null);
      return;
    }

    const result = calcRiskFreeProfit(S, B, LOdds, comm, F, ret);
    setLayStake(result.layStake);
    setGuaranteedProfit(result.minProfit);

    const bookieOutcome = {
      backProfit: result.potBookieWinnings,
      layLoss: result.potExchangeLoss,
      net: result.profitIfBookieWins
    };
    const exchangeOutcome = {
      exchangeWin: result.potExchangeWinnings,
      freeBetRefund: result.freeBetRefund,
      net: result.profitIfExchangeWins,
      exchangeLoss: -S
    };
    setBreakdownData({ bookieOutcome, exchangeOutcome });
  };

  useEffect(() => {
    calculateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backOdds, stake, layOdds, commission, riskFree, retention]);

  const copyToClipboard = () => {
    if (!layStake) return;
    navigator.clipboard.writeText(layStake.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") calculateAll();
    if (e.key.toLowerCase() === "c") copyToClipboard();
  };

  const getLayStakeLabel = () => {
    if (!layStake) return "";
    return `£${formatMoney(layStake)}`;
  };

  const formatOutcome = (value) => {
    const formatted = formatMoney(Math.abs(value));
    return (
      <span className={value >= 0 ? "positive" : "negative"}>
        {value < 0 ? "–" : ""}£{formatted}
      </span>
    );
  };

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <div className="container">
        <h2 className="title with-subhead">Risk-Free Bet Calculator</h2>
        <h4 className="subhead">Lock in profit and find your lay stake.</h4>

        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Back Odds:</label>
            <input
              type="number"
              step="0.01"
              value={backOdds}
              onChange={(e) => setBackOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="10"
            />
          </div>

          <div className="input-group-inline">
            <label>Stake:</label>
            <div className="input-prefix-suffix only-prefix">
              <span className="prefix">£</span>
              <input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="10"
              />
            </div>
          </div>
        </div>

        <div className="inline-fields lay-row">
          <div className="input-group-inline">
            <label>Lay Odds:</label>
            <input
              type="number"
              step="0.01"
              value={layOdds}
              onChange={(e) => setLayOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="10"
            />
          </div>

          <div className="input-group-inline">
            <label>Exchange Commission:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="2"
              />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>

        <div className="inline-fields">
          <div className="input-group-inline">
            <label>
              Free Bet Amount:
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
                step="0.01"
                value={riskFree}
                onChange={(e) => setRiskFree(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="10"
              />
            </div>
          </div>

          <div className="input-group-inline">
            <label>
              Free Bet Retention Rate:
              <span className="info-icon">
                i
                <span className="tooltip-text">
                  This is the percentage of your free bet that you expect to secure as profit.
                </span>
              </span>
            </label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="1"
                value={retention}
                onChange={(e) => setRetention(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="80"
              />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>

        {layStake && (
          <div
            className={`result-box copyable ${copied ? "glow" : ""}`}
            onClick={copyToClipboard}
            title="Click to copy lay stake"
            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
          >
            <h5 className="outcome-main">
              <span>You could lay: {getLayStakeLabel()}</span>
            </h5>
            {copied ? (
              <ClipboardCheck size={24} color="#edff00" />
            ) : (
              <Clipboard size={24} color="#00aaff" />
            )}
          </div>
        )}

        {guaranteedProfit !== null && (
          <div className="profit-box">
            <h5 className="outcome-main">Your Profit: {formatOutcome(guaranteedProfit)}</h5>
            <div className="profit-details">This is your worst-case outcome.</div>
          </div>
        )}

        {breakdownData && (
          <div className="outcome-container">
            <div className="outcome-group">
              <div className="group-title">If Bookie Wins:</div>
              <div className="outcome-line">
                <span className="outcome-label">Back Win:</span>
                <span className="outcome-value">
                  {formatOutcome(breakdownData.bookieOutcome?.backProfit)}
                </span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Lay Loss:</span>
                <span className="outcome-value">
                  {formatOutcome(-breakdownData.bookieOutcome?.layLoss)}
                </span>
              </div>
              <div className="outcome-line placeholder"></div>
              <div className="outcome-line net-outcome">
                <span className="outcome-label">Net Profit:</span>
                <span className="outcome-value">
                  {formatOutcome(breakdownData.bookieOutcome?.net)}
                </span>
              </div>
            </div>
            <div className="outcome-group">
              <div className="group-title">If Exchange Wins:</div>
              <div className="outcome-line">
                <span className="outcome-label">Back Loss:</span>
                <span className="outcome-value">
                  {formatOutcome(-parseFloat(stake))}
                </span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Lay Win:</span>
                <span className="outcome-value">
                  {formatOutcome(breakdownData.exchangeOutcome?.exchangeWin)}
                </span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Free Bet:</span>
                <span className="outcome-value">
                  {formatOutcome(breakdownData.exchangeOutcome?.freeBetRefund)}
                </span>
              </div>
              <div className="outcome-line net-outcome">
                <span className="outcome-label">Net Profit:</span>
                <span className="outcome-value">
                  {formatOutcome(breakdownData.exchangeOutcome?.net)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RiskFreeBetCalculator;
