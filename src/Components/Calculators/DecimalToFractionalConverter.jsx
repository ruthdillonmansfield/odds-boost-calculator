import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import "./calculators.css";
import Seo from "../Seo.jsx";
import pageConfig from "../../config/pageConfig.js";

const convertDecimalToFraction = (decimal) => {
  if (isNaN(decimal) || decimal <= 1) return "";
  const frac = decimal - 1;
  const tolerance = 1.0e-6;
  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = frac;
  while (true) {
    const a = Math.floor(b);
    const h = a * h1 + h2;
    const k = a * k1 + k2;
    const approx = h / k;
    if (Math.abs(frac - approx) < tolerance) {
      return `${h}/${k}`;
    }
    h2 = h1;
    h1 = h;
    k2 = k1;
    k1 = k;
    b = 1 / (b - a);
  }
};

const DecimalToFractionalConverter = () => {
  const meta = pageConfig.decimalToFractionConverter?.seo || {};

  const [decimalOdds, setDecimalOdds] = useState("");
  const [fractionalOdds, setFractionalOdds] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dec = parseFloat(decimalOdds);
    if (!decimalOdds || isNaN(dec) || dec <= 1) {
      setFractionalOdds("");
    } else {
      setFractionalOdds(convertDecimalToFraction(dec));
    }
  }, [decimalOdds]);

  const copyToClipboard = () => {
    if (fractionalOdds !== "") {
      navigator.clipboard.writeText(fractionalOdds).then(() => {
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
        <h2 className="title">Decimal to Fractional Odds Converter</h2>
        <div className="inline-fields" style={{ justifyContent: "center" }}>
          <div className="input-group-inline" style={{ flexBasis: "100%" }}>
            <label>Decimal Odds:</label>
            <input
              type="number"
              step="0.01"
              value={decimalOdds}
              onChange={(e) => setDecimalOdds(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="2.5"
            />
          </div>
        </div>
        {fractionalOdds && (
          <div
            className={`result-box copyable ${copied ? "glow" : ""}`}
            onClick={copyToClipboard}
            title="Click to copy fractional odds"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <h5 className="outcome-main">
              <span className="label">Fractional Odds:</span>
            </h5>
            <h5 className="outcome-main">
              <span className="value">{fractionalOdds}</span>
            </h5>
            {fractionalOdds &&
              (copied ? (
                <ClipboardCheck size={22} color="#edff00" />
              ) : (
                <Clipboard size={22} />
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DecimalToFractionalConverter;
