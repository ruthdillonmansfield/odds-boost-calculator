import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber, formatMoney } from "../../helpers.js";

// Define six conversion types
const conversionTypes = [
  {
    value: "fractionalToDecimal",
    label: "Fractional → Decimal",
    Icon: () => <span style={{ fontSize: "20px", color: "#00aaff" }}>5/2 →</span>,
  },
  {
    value: "decimalToFractional",
    label: "Decimal → Fractional",
    Icon: () => <span style={{ fontSize: "20px", color: "#00aaff" }}>2.50 →</span>,
  },
  {
    value: "fractionalToAmerican",
    label: "Fractional → American",
    Icon: () => <span style={{ fontSize: "20px", color: "#00aaff" }}>5/2 → +</span>,
  },
  {
    value: "americanToFractional",
    label: "American → Fractional",
    Icon: () => <span style={{ fontSize: "20px", color: "#00aaff" }}>+150 →</span>,
  },
  {
    value: "decimalToAmerican",
    label: "Decimal → American",
    Icon: () => <span style={{ fontSize: "20px", color: "#00aaff" }}>2.50 →</span>,
  },
  {
    value: "americanToDecimal",
    label: "American → Decimal",
    Icon: () => <span style={{ fontSize: "20px", color: "#00aaff" }}>+150 →</span>,
  },
];

// Conversion helper functions
const fractionalToDecimal = (numStr, denStr) => {
  if (!numStr || !denStr || isNaN(numStr) || isNaN(denStr)) return null;
  const num = parseFloat(numStr);
  const den = parseFloat(denStr);
  if (den <= 0) return null;
  return parseFloat((num / den + 1).toFixed(3));
};

const decimalToFractional = (decimal) => {
  if (decimal <= 1) return null;
  const value = decimal - 1;
  const numerator = Math.round(value * 100);
  const denominator = 100;
  return `${numerator}/${denominator}`;
};

const fractionalToAmerican = (numStr, denStr) => {
  const dec = fractionalToDecimal(numStr, denStr);
  return decimalToAmerican(dec);
};

const americanToFractional = (american) => {
  const dec = americanToDecimal(american);
  return decimalToFractional(dec);
};

const decimalToAmerican = (decimal) => {
  if (decimal < 1) return null;
  return decimal >= 2
    ? `+${Math.round((decimal - 1) * 100)}`
    : `${Math.round(-100 / (decimal - 1))}`;
};

const americanToDecimal = (american) => {
  if (american >= 0) {
    return parseFloat((american / 100 + 1).toFixed(3));
  } else {
    return parseFloat((100 / Math.abs(american) + 1).toFixed(3));
  }
};

const OddsConverter = () => {
  // For non-fractional conversions
  const [inputOdds, setInputOdds] = useState("");
  // For fractional conversions only:
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [selectedType, setSelectedType] = useState("fractionalToDecimal");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Perform conversion based on selected type
  const calculateConversion = () => {
    let output = null;
    if (selectedType === "fractionalToDecimal") {
      output = fractionalToDecimal(numerator, denominator);
    } else if (selectedType === "decimalToFractional") {
      const dec = parseFloat(inputOdds);
      if (isNaN(dec)) return null;
      output = decimalToFractional(dec);
    } else if (selectedType === "fractionalToAmerican") {
      output = fractionalToAmerican(numerator, denominator);
    } else if (selectedType === "americanToFractional") {
      const am = parseFloat(inputOdds);
      if (isNaN(am)) return null;
      output = americanToFractional(am);
    } else if (selectedType === "decimalToAmerican") {
      const dec = parseFloat(inputOdds);
      if (isNaN(dec)) return null;
      output = decimalToAmerican(dec);
    } else if (selectedType === "americanToDecimal") {
      const am = parseFloat(inputOdds);
      if (isNaN(am)) return null;
      output = americanToDecimal(am);
    }
    return output;
  };

  useEffect(() => {
    setResult(calculateConversion());
  }, [inputOdds, numerator, denominator, selectedType]);

  const copyToClipboard = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") copyToClipboard();
  };

  return (
    <div className="container">
      <h2 className="title">Odds Converter</h2>

      {/* Conversion Type Selection Grid */}
      <div className="conversion-grid">
        {conversionTypes.map((type) => (
          <div
            key={type.value}
            className={`conversion-card ${selectedType === type.value ? "active" : ""}`}
            onClick={() => {
              setSelectedType(type.value);
              // Clear inputs when switching type
              setInputOdds("");
              setNumerator("");
              setDenominator("");
            }}
          >
            <div className="conversion-icon">
              <type.Icon />
            </div>
            <div className="conversion-label">{type.label}</div>
          </div>
        ))}
      </div>

      {/* Odds Input Section */}
      <div className="inline-fields">
        {selectedType === "fractionalToDecimal" || selectedType === "fractionalToAmerican" ? (
          // Two input fields for fractional odds
          <div className="input-group-inline" style={{ flexBasis: "100%" }}>
            <label>Enter Fractional Odds:</label>
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
        ) : (
          // Single input for the other types
          <div className="input-group-inline">
            <label>Enter Odds:</label>
            <input
              type="text"
              value={inputOdds}
              onChange={(e) => setInputOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedType === "decimalToFractional"
                  ? "e.g. 2.50"
                  : selectedType === "decimalToAmerican"
                  ? "e.g. 2.50"
                  : "e.g. +150"
              }
            />
          </div>
        )}
      </div>

      {/* Result Box */}
      {result !== null && (
        <div
          className={`result-box copyable ${copied ? "glow" : ""}`}
          onClick={copyToClipboard}
          title="Click to copy result"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <span className="label">Converted Odds:</span>
          <span className="value">{result}</span>
          {copied ? (
            <ClipboardCheck size={22} color="#edff00" />
          ) : (
            <Clipboard size={22} />
          )}
        </div>
      )}
    </div>
  );
};

export default OddsConverter;
