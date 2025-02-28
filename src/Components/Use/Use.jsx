import { useLocation } from "react-router-dom";
import "./Use.css";
import Footer from "../Footer/Footer";
import { Zap, Rocket } from "lucide-react"; // We'll use "Zap" and "Rocket" icons from lucide-react

const ExplanationComponent = () => {
  const location = useLocation();

  // Example instructions...
  const fractionalToDecimalInstructions = (
    <div>
      <p>Enter fractional odds (e.g. 5/2) to instantly see their decimal form.</p>
    </div>
  );
  const boostedOddsInstructions = (
    <div>
      <p>Enter decimal odds and a boost percentage to see the improved odds instantly.</p>
    </div>
  );
  const boostedAdvancedInstructions = (
    <div>
      <p>Get your optimum lay stake and expected profit from boosted odds bets.</p>
    </div>
  );
  const riskFreeCalculatorInstructions = (
    <div>
      <p>Calculate your lay stake and potential profit from risk-free bet offers.</p>
      <p>Free bet retention is how much of that bet you can lock in if it loses.</p>
    </div>
  );
  const layStakeCalculatorInstructions = (
    <div>
      <p>Find the optimum lay stake and profit from your matched bets.</p>
    </div>
  );

  const instructionsMap = {
    "/fractional-to-decimal": fractionalToDecimalInstructions,
    "/boost-calculator": boostedOddsInstructions,
    "/boost-calculator-advanced": boostedAdvancedInstructions,
    "/risk-free-calculator": riskFreeCalculatorInstructions,
    "/lay-stake-calculator": layStakeCalculatorInstructions,
  };

  const calculatorInstructions = instructionsMap[location.pathname] || (
    <p>Use the calculator above to get started.</p>
  );

  return (
    <aside className="use">
      <div className="use-content">
        <h3 className="title">Lightning-Fast Odds Calculations</h3>

        <ul className="use-list">
          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={18} color="#00aaff" />
            Matched betting? Quickly lock in profit before odds shift.
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Rocket size={18} color="#ff9900" />
            Press <strong>"C"</strong> to <strong>copy</strong> instantly.
          </li>
        </ul>

        <div className="calculator-instructions">
          <h3>Using this Calculator</h3>
          {calculatorInstructions}
        </div>

        {/* Disclaimer box (similar style to .use-cta) */}
        <div className="use-cta disclaimer">
          <p>
            <strong>Disclaimer:</strong> These calculators are for informational purposes 
            only. I don't guarantee their accuracy or completeness. Always gamble 
            responsibly.
          </p>
        </div>
      </div>

      <Footer />
    </aside>
  );
};

export default ExplanationComponent;
