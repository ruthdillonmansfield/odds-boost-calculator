import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber } from "../../helpers.js"; // Imported helper

const FractionalToDecimalConverter = () => {
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [decimalOdds, setDecimalOdds] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auto-calculate whenever numerator or denominator changes
  useEffect(() => {
    setDecimalOdds(calculateDecimalOdds(numerator, denominator));
  }, [numerator, denominator]);

  // Helper function to do the fractional -> decimal conversion
  const calculateDecimalOdds = (numStr, denStr) => {
    // If either field is empty or not numeric, don't calculate anything
    if (!numStr || !denStr || isNaN(numStr) || isNaN(denStr)) {
      return null;
    }

    const num = parseFloat(numStr);
    const den = parseFloat(denStr);

    if (den <= 0) {
      return null; // invalid denominator
    }

    const result = num / den + 1;
    // Store with up to 3 decimals internally
    return parseFloat(result.toFixed(3));
  };

  // Safely format the decimal odds label using our imported formatter.
  const getDecimalOddsLabel = () => {
    // If both fields are empty, don't show any message.
    if (!numerator && !denominator) {
      return "";
    }
    // If the result is null (inputs invalid), don't show any result.
    if (decimalOdds === null) {
      return "";
    }
    // Otherwise, format the result.
    return formatNumber(decimalOdds, 3);
  };

  // Copy to clipboard if valid
  const copyToClipboard = () => {
    if (decimalOdds !== null) {
      navigator.clipboard.writeText(decimalOdds.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Optional: Pressing 'c' copies to clipboard
  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") {
      copyToClipboard();
    }
  };

  return (
    <div className="container">
      <h2 className="title">Fractional to Decimal Odds Converter</h2>

      {/* Single inline row for numerator / denominator */}
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

      {/* Result Box (click to copy) */}
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
            (copied ? (
              <ClipboardCheck size={22} color="#edff00" />
            ) : (
              <Clipboard size={22} />
            ))}
        </div>
      )}
    </div>
  );
};

export default FractionalToDecimalConverter;
