import { useLocation } from "react-router-dom";
import "./Use.css";
import Footer from "../Footer/Footer";

const ExplanationComponent = () => {
    const location = useLocation();

// Instructions for converting fractional to decimal odds
const fractionalToDecimalInstructions = (
  <div>
    <p>Enter the bookies' fractional odds (e.g. 5/2).</p>
    <p>Convert to decimal instantly.</p>
  </div>
);

// Instructions for the basic boost calculator
const boostedOddsInstructions = (
  <div>
    <p>Enter the bookies' original decimal odds (e.g. 2.5).</p>
    <p>Enter the boost percentage (e.g. 10%).</p>
    <p>Get the boosted odds instantly.</p>
  </div>
);

// Instructions for the advanced boost calculator (with free bet options)
const boostedAdvancedInstructions = (
  <div>
    <p>Find the optimum lay stake and expected profit from your matched bets on boosted odds.</p>
  </div>
);

// Instructions for the risk-free bet calculator
const riskFreeCalculatorInstructions = (
  <div>
    <p>Find the optimum lay stake and expected profit from risk free bet offers.</p>
    <p>Free bet retention is the percentage of your free bet you expect to be able to lock in a profit from if you lose.</p>
  </div>
);

// Instructions for the lay stake calculator
const layStakeCalculatorInstructions = (
  <div>
    <p>Find the optimum lay stake and expected profit from your matched bets.</p>
  </div>
);


// Define instructions for each calculator page via a mapping
const instructionsMap = {
  "/fractional-to-decimal": fractionalToDecimalInstructions,
  "/boost-calculator": boostedOddsInstructions,
  "/boost-calculator-advanced": boostedAdvancedInstructions,
  "/risk-free-calculator": riskFreeCalculatorInstructions,
  "/lay-stake-calculator": layStakeCalculatorInstructions,
};


    // Get instructions for the current page, default to a general message
    const calculatorInstructions = instructionsMap[location.pathname] || "Use the calculator above to get started.";

    return (
        <div className="use">
            <h3>Lightning fast odds calculations</h3>
            <ul>
                <li>Matched betting? Calculate your odds and lock in your profit before the odds change.</li>
                <li>🚀 Hit <strong>"C"</strong> to <strong>copy</strong>.</li>
            </ul>

            {/* Page-Specific Instructions */}
            <div className="calculator-instructions">
              <h3>Using this calculator</h3>
                {calculatorInstructions}
            </div>

            <Footer />
        </div>
    );
};

export default ExplanationComponent;
