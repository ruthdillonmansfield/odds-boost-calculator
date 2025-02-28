import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import { formatNumber, formatMoney } from "../../helpers.js";

// Define conversion types with a value, label, and icon (choose from lucide-react)
const conversionTypes = [
  {
    value: "fractionalToDecimal",
    label: "Fractional → Decimal",
    // For example, use the Calculator icon as a placeholder
    Icon: () => <span style={{fontSize:"20px", color:"#00aaff"}}>5/2 →</span>,
  },
  {
    value: "decimalToFractional",
    label: "Decimal → Fractional",
    Icon: () => <span style={{fontSize:"20px", color:"#00aaff"}}>2.50 →</span>,
  },
  {
    value: "decimalToAmerican",
    label: "Decimal → American",
    Icon: () => <span style={{fontSize:"20px", color:"#00aaff"}}>2.50 →</span>,
  },
  {
    value: "americanToDecimal",
    label: "American → Decimal",
    Icon: () => <span style={{fontSize:"20px", color:"#00aaff"}}>+150 →</span>,
  },
];

const OddsConverter = () => {
  // Input state
  const [inputOdds, setInputOdds] = useState("");
  const [selectedType, setSelectedType] = useState("fractionalToDecimal");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Conversion functions
  const fractionalToDecimal = (fractionalStr) => {
    const parts = fractionalStr.split("/");
    if (parts.length !== 2) return null;
    const num = parseFloat(parts[0].trim());
    const den = parseFloat(parts[1].trim());
    if (isNaN(num) || isNaN(den) || den <= 0) return null;
    const decimal = num / den + 1;
    return parseFloat(decimal.toFixed(3));
  };

  const decimalToFractional = (decimal) => {
    if (decimal <= 1) return null;
    const value = decimal - 1;
    const numerator = Math.round(value * 100);
    const denominator = 100;
    return `${numerator}/${denominator}`;
  };

  const decimalToAmerican = (decimal) => {
    if (decimal < 1) return null;
    return decimal >= 2 ? `+${Math.round((decimal - 1) * 100)}` : `${Math.round(-100 / (decimal - 1))}`;
  };

  const americanToDecimal = (american) => {
    if (american >= 0) {
      return parseFloat((american / 100 + 1).toFixed(3));
    } else {
      return parseFloat((100 / Math.abs(american) + 1).toFixed(3));
    }
  };

  // Perform conversion based on the selected type
  const calculateConversion = () => {
    if (!inputOdds) return null;
    let output = null;
    if (selectedType === "fractionalToDecimal") {
      output = fractionalToDecimal(inputOdds);
    } else if (selectedType === "decimalToFractional") {
      const dec = parseFloat(inputOdds);
      if (isNaN(dec)) return null;
      output = decimalToFractional(dec);
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
  }, [inputOdds, selectedType]);

  const copyToClipboard = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "c") {
      copyToClipboard();
    }
  };

  return (
    <div className="container">
      <h2 className="title">Odds Converter</h2>
      
      {/* Conversion Type Selection as a Grid of Cards */}
      <div className="conversion-grid">
        {conversionTypes.map((type) => (
          <div
            key={type.value}
            className={`conversion-card ${selectedType === type.value ? "active" : ""}`}
            onClick={() => setSelectedType(type.value)}
          >
            <div className="conversion-icon">
              <type.Icon />
            </div>
            <div className="conversion-label">
              {type.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Odds Input */}
      <div className="inline-fields">
        <div className="input-group-inline">
          <label>
            {selectedType === "fractionalToDecimal"
              ? "Enter Fractional Odds:"
              : "Enter Odds:"}
          </label>
          <input
            type="text"
            value={inputOdds}
            onChange={(e) => setInputOdds(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedType === "fractionalToDecimal"
                ? "e.g. 5/2"
                : selectedType === "decimalToFractional"
                ? "e.g. 2.50"
                : selectedType === "decimalToAmerican"
                ? "e.g. 2.50"
                : "e.g. +150"
            }
          />
        </div>
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
