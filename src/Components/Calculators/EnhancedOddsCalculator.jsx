import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber } from "../../helpers.js";
import Seo from "../Seo.jsx";
import seoConfig from "../../config/seoConfig.js";

const EnhancedOddsCalculator = () => {
  const meta = seoConfig["EnhancedOddsCalculator"] || {};

  const [stake, setStake] = useState("");
  const [returnAmount, setReturnAmount] = useState("");
  const [enhancedOdds, setEnhancedOdds] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEnhancedOdds(calculateEnhancedOdds(stake, returnAmount));
  }, [stake, returnAmount]);

  const calculateEnhancedOdds = (stakeStr, returnStr) => {
    if (!stakeStr || !returnStr || isNaN(stakeStr) || isNaN(returnStr)) return null;
    const stakeValue = parseFloat(stakeStr);
    const returnValue = parseFloat(returnStr);
    if (stakeValue <= 0) return null;
    return parseFloat((returnValue / stakeValue).toFixed(3));
  };

  const getEnhancedOddsLabel = () => {
    if (!stake && !returnAmount) return "";
    if (enhancedOdds === null) return "";
    return formatNumber(enhancedOdds, 3);
  };

  const copyToClipboard = () => {
    if (enhancedOdds !== null) {
      navigator.clipboard.writeText(enhancedOdds.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") copyToClipboard();
  };

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <div className="container">
        <h2 className="title">Enhanced Odds Calculator</h2>
        <div className="inline-fields">
          <div className="input-group-inline" style={{ flexBasis: "40%" }}>
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
          <div className="input-group-inline" style={{ flexBasis: "40%" }}>
            <label>Total Return:</label>
            <div className="input-prefix-suffix only-prefix">
              <span className="prefix">£</span>
              <input
                type="number"
                step="0.01"
                value={returnAmount}
                onChange={(e) => setReturnAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="100"
              />
            </div>
          </div>
        </div>
        {getEnhancedOddsLabel() && (
          <div
            className={`result-box copyable ${copied ? "glow" : ""}`}
            onClick={copyToClipboard}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
            title="Click to copy"
          >
            <h5 className="outcome-main">
              <span className="label">Enhanced Odds:</span>
            </h5>
            <h5 className="outcome-main">
              <span className="value">{getEnhancedOddsLabel()}</span>
            </h5>
            {enhancedOdds !== null &&
              (copied ? <ClipboardCheck size={22} color="#edff00" /> : <Clipboard size={22} />)}
          </div>
        )}
      </div>
    </>
  );
};

export default EnhancedOddsCalculator;
