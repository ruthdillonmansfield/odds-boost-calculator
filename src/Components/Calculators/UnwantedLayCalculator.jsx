import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatMoney } from "../../helpers.js";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";
import { calcUnwantedLayAdjustment } from "./calculations.js";

const UnwantedLayCalculator = () => {
  const meta = pageConfig.unwantedLayCalculator?.seo || {};

  // Toggle between direct input vs computed difference method
  const [useDirect, setUseDirect] = useState(false);
  // Direct unwanted lay input (e.g. £10 unwanted lay)
  const [unwantedLay, setUnwantedLay] = useState("");
  // Computed method inputs: total lay bet and intended lay bet
  const [totalLay, setTotalLay] = useState("");
  const [intendedLay, setIntendedLay] = useState("");

  // Back and lay details
  const [backOdds, setBackOdds] = useState("");
  const [layOdds, setLayOdds] = useState("");
  const [backCommission, setBackCommission] = useState("0");
  const [layCommission, setLayCommission] = useState("0");

  const [calcData, setCalcData] = useState(null);
  const [copied, setCopied] = useState(false);

const isInputValid = () => {
  let unwantedValue;
  if (useDirect) {
    const total = parseFloat(totalLay);
    const intended = parseFloat(intendedLay);
    if (!total || !intended) return false;
    unwantedValue = total - intended;
  } else {
    unwantedValue = parseFloat(unwantedLay);
  }
  if (!unwantedValue || unwantedValue <= 0) return false;
  const BO = parseFloat(backOdds);
  const LO = parseFloat(layOdds);
  if (!BO || BO <= 1) return false;
  if (!LO || LO <= 1) return false;
  return true;
};


useEffect(() => {
  if (isInputValid()) {
    const unwantedValue = useDirect
      ? parseFloat(totalLay) - parseFloat(intendedLay)
      : parseFloat(unwantedLay);
    const BO = parseFloat(backOdds);
    const LO = parseFloat(layOdds);
    const backComm = parseFloat(backCommission) || 0;
    const layComm = parseFloat(layCommission) || 0;
    const result = calcUnwantedLayAdjustment(unwantedValue, BO, LO, backComm, layComm);
    setCalcData(result);
    console.log(result);
  } else {
    setCalcData(null);
  }
}, [useDirect, unwantedLay, totalLay, intendedLay, backOdds, layOdds, backCommission, layCommission]);


  const copyToClipboard = () => {
    if (calcData !== null) {
      navigator.clipboard.writeText(calcData.backStake.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") copyToClipboard();
  };

  const formatValue = (val) => {
    if (val === null || isNaN(val)) return "";
    const absVal = Math.abs(val).toFixed(2);
    return val >= 0 ? (
      <span className="positive">£{absVal}</span>
    ) : (
      <span className="negative">-£{absVal}</span>
    );
  };

  const getBackStakeLabel = () => {
    if (!isInputValid() || calcData === null) return "";
    return `£${formatMoney(calcData.backStake)}`;
  };

  const breakdown = calcData?.breakdown;

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <div className="container">
        <h2 className="title with-subhead">Unwanted Lay Calculator</h2>
        <h4 className="subhead">Cancel out your unwanted lay bet to minimise loss.</h4>

        <div className="bet-type-headline">
          <div className="toggle-inline">
          <label className="switch">
            <input
              type="checkbox"
              checked={useDirect}
              onChange={() => {
                setUseDirect(!useDirect);
                if (!useDirect) {
                  setUnwantedLay("");
                } else {
                  setTotalLay("");
                  setIntendedLay("");
                }
              }}
            />
            <span className="slider"></span>
          </label>

            <label className="toggle-label">
              Help me calculate my unwanted lay amount
            </label>
          </div>
        </div>



        {!useDirect ? (
          <div className="inline-fields">
            <div className="input-group-inline">
              <label>Unwanted Lay:</label>
              <div className="input-prefix-suffix only-prefix">
                <span className="prefix">£</span>
                <input
                  type="number"
                  step="0.01"
                  value={unwantedLay}
                  onChange={(e) => setUnwantedLay(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="inline-fields">
            <div className="input-group-inline">
              <label>Total Lay Bet:</label>
              <div className="input-prefix-suffix only-prefix">
                <span className="prefix">£</span>
                <input
                  type="number"
                  step="0.01"
                  value={totalLay}
                  onChange={(e) => setTotalLay(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="20"
                />
              </div>
            </div>
            <div className="input-group-inline">
              <label>Intended Lay Bet:</label>
              <div className="input-prefix-suffix only-prefix">
                <span className="prefix">£</span>
                <input
                  type="number"
                  step="0.01"
                  value={intendedLay}
                  onChange={(e) => setIntendedLay(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        )}
        {useDirect && totalLay && intendedLay && (
          <div className="result-box" style={{ display: "flex", justifyContent: "space-between" }}>
            <h5 className="outcome-primary">
              <span>Unwanted Lay Amount:</span>
            </h5>
            <h5 className="outcome-primary">
              <span>
                £{formatMoney(parseFloat(totalLay) - parseFloat(intendedLay))}
              </span>
            </h5>
          </div>
        )}

        <div className="inline-fields lay-row">
          <div className="input-group-inline">
            <label>Lay Odds:</label>
            <input
              type="number"
              step="0.01"
              value={layOdds}
              onChange={(e) => setLayOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 2.8"
            />
          </div>
          <div className="input-group-inline">
            <label>Lay Commission:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                value={layCommission}
                onChange={(e) => setLayCommission(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 0"
              />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>
        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Back Odds:</label>
            <input
              type="number"
              step="0.01"
              value={backOdds}
              onChange={(e) => setBackOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 2.5"
            />
          </div>
          <div className="input-group-inline">
            <label>Back Commission:</label>
            <div className="input-prefix-suffix only-suffix">
              <input
                type="number"
                step="0.1"
                value={backCommission}
                onChange={(e) => setBackCommission(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 1.25"
              />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>



        {isInputValid() && calcData && (
          <div
            className={`result-box copyable ${copied ? "glow" : ""}`}
            onClick={copyToClipboard}
            title="Click to copy back stake"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "20px"
            }}
          >
            <h5 className="outcome-main">
              <span>Place a back bet: {getBackStakeLabel()}</span>
            </h5>
            {copied ? (
              <ClipboardCheck size={24} color="#edff00" />
            ) : (
              <Clipboard size={24} color="#00aaff" />
            )}
          </div>
        )}
{isInputValid() && calcData && breakdown && (  
  <div className="outcome-container" style={{ marginTop: "20px" }}>
    <div className="outcome-group">
      <div className="group-title">If Back Wins:</div>
      <div className="outcome-line">
        <span className="outcome-label">Back Profit:</span>
        <span className="outcome-value">
          {formatValue(breakdown.backWins.back)}
        </span>
      </div>
      <div className="outcome-line">
        <span className="outcome-label">Comm:</span>
        <span className="outcome-value">
          {formatValue(breakdown.backWins.backCommission)}
        </span>
      </div>
      <div className="outcome-line">
        <span className="outcome-label">Lay Loss:</span>
        <span className="outcome-value">
          {formatValue(breakdown.backWins.lay)}
        </span>
      </div>
      <div className="outcome-line net-outcome">
        <span className="outcome-label">Net Outcome:</span>
        <span className="outcome-value">
          {formatValue(breakdown.backWins.total)}
        </span>
      </div>
    </div>
    <div className="outcome-group">
      <div className="group-title">If Lay Wins:</div>
      <div className="outcome-line">
        <span className="outcome-label">Back Loss:</span>
        <span className="outcome-value">
          {formatValue(breakdown.layWins.back)}
        </span>
      </div>
      <div className="outcome-line">
        <span className="outcome-label">Comm:</span>
        <span className="outcome-value">
          {formatValue(breakdown.layWins.layCommission)}
        </span>
      </div>
      <div className="outcome-line">
        <span className="outcome-label">Lay Win:</span>
        <span className="outcome-value">
          {formatValue(breakdown.layWins.lay)}
        </span>
      </div>
      <div className="outcome-line net-outcome">
        <span className="outcome-label">Net Outcome:</span>
        <span className="outcome-value">
          {formatValue(breakdown.layWins.total)}
        </span>
      </div>
    </div>
  </div>
)}


      </div>
    </>
  );
};

export default UnwantedLayCalculator;
