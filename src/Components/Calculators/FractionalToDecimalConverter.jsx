import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber } from "../../helpers.js";
import Seo from "../Seo.jsx";
import seoConfig from "../../config/seoConfig.js";

const FractionalToDecimalConverter = () => {
  const meta = seoConfig["FractionalToDecimalConverter"] || {};

  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [decimalOdds, setDecimalOdds] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDecimalOdds(calculateDecimalOdds(numerator, denominator));
  }, [numerator, denominator]);

  const calculateDecimalOdds = (numStr, denStr) => {
    if (!numStr || !denStr || isNaN(numStr) || isNaN(denStr)) return null;
    const num = parseFloat(numStr);
    const den = parseFloat(denStr);
    if (den <= 0) return null;
    return parseFloat((num / den + 1).toFixed(3));
  };

  const getDecimalOddsLabel = () => {
    if (!numerator && !denominator) return "";
    if (decimalOdds === null) return "";
    return formatNumber(decimalOdds, 3);
  };

  const copyToClipboard = () => {
    if (decimalOdds !== null) {
      navigator.clipboard.writeText(decimalOdds.toString()).then(() => {
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
    <Seo 
        title={meta.title} 
        description={meta.description} 
      />
    <div className="container">
      <h2 className="title">Fractional to Decimal Odds Converter</h2>
      <div className="inline-fields">
        <div className="input-group-inline" style={{ flexBasis: "40%" }}>
          <label>Fractional Odds:</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="number"
              value={numerator}
              onChange={(e) => setNumerator(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="5"
            />
            <span style={{ fontSize: "20px", color: "white" }}>/</span>
            <input
              type="number"
              value={denominator}
              onChange={(e) => setDenominator(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="2"
            />
          </div>
        </div>
      </div>
      {getDecimalOddsLabel() && (
        <div
          className={`result-box copyable ${copied ? "glow" : ""}`}
          onClick={copyToClipboard}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px"
          }}
          title="Click to copy"
        >
          <span className="label">Decimal Odds:</span>
          <span className="value">{getDecimalOddsLabel()}</span>
          {decimalOdds !== null &&
            (copied ? <ClipboardCheck size={22} color="#edff00" /> : <Clipboard size={22} />)}
        </div>
      )}
    </div>
    </>
  );
};

export default FractionalToDecimalConverter;
