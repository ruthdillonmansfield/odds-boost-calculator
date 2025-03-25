import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Use.css";
import Footer from "../Footer/Footer.jsx";
import { Zap, Rocket } from "lucide-react";

const ExplanationComponent = () => {
  const location = useLocation();
  const [showOverlay, setShowOverlay] = useState(false);

  // Example instructions
  const fractionalToDecimalInstructions = (
    <div>
      <p>Enter fractional odds (e.g. 5/2) to instantly see their decimal form.</p>
    </div>
  );
  const DecimalToFractionalInstructions = (
    <div>
      <p>Enter decimal odds (e.g. 3.5) to instantly see their fractional form.</p>
    </div>
  );
  const OddsCalculatorInstructions = (
    <div>
      <p>Convert instantly between decimal, fractional and American odds.</p>
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
  const riskFreeEBOInstructions = (
    <div>
      <p>
        Equivalent Boosted Odds (EBO) reframes risk‐free bets as value bets by converting the risk-free aspect of the bet into an odds boost.
      </p>
      <p>
        In other words, treating a risk-free bet as Advantage Play is equivalent to punting a bet at greatly improved odds.
      </p>
      <p>
        Use this calculator to decide whether to AP, lay it if possible, or skip. 
        Use sharp odds or a conservative guess for your true odds.
      </p>
    </div>
  );
  const partialLayInstructions = (
    <div>
      <p>Sometimes we need to lay our back bets at multiple odds, because there's limited lay liquidity.</p>
      <p>This calculator helps you work out how much more to lay at the available odds.</p>
    </div>
  );
  const enhancedOddsInstructions = (
    <div>
      <p>When bookies offer enhanced winnings, sometimes they don't tell you the new odds.</p>
      <p>Use this calculator to work out the original odds.</p>
    </div>
  );
  
  const MatchPickerCalculator = (
    <div>
      <p>Compare lay options quickly when you don't have a matcher available.</p>
    </div>
  );
  

  // Map instructions
  const instructionsMap = {
    "/fractional-to-decimal": fractionalToDecimalInstructions,
    "/boost-calculator": boostedOddsInstructions,
    "/boost-calculator-advanced": boostedAdvancedInstructions,
    "/risk-free-calculator": riskFreeCalculatorInstructions,
    "/risk-free-ebo": riskFreeEBOInstructions,
    "/lay-stake-calculator": layStakeCalculatorInstructions,
    "/odds-converter": OddsCalculatorInstructions,
    "/fractional-to-decimal": DecimalToFractionalInstructions,
    "/partial-lay": partialLayInstructions,
    "/enhanced-odds": enhancedOddsInstructions,
    "/match-picker": MatchPickerCalculator
  };

  const calculatorInstructions =
    instructionsMap[location.pathname] || <p>Use the calculator above to get started.</p>;

    return (
      <>
        <aside className="use">
          <div className="use-content">
            <div className="instructions-plain">
              <h3 className="title">Using this Calculator</h3>
              {calculatorInstructions}
    
              {location.pathname === "/risk-free-ebo" && (
                <button
                  className="learn-more-button"
                  onClick={() => setShowOverlay(true)}
                  style={{ marginTop: "12px" }}
                >
                  Read more about EBO
                </button>
              )}
            </div>
            <div className="calculator-instructions">
              <h3>Lightning-Fast Odds Calculations</h3>
              <ul className="use-list">
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={18} color="#00aaff" />
                  Matched betting? Quickly lock in profit before odds shift.
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Rocket size={18} color="#ff9900" />
                  <span>
                    Press <strong>"C"</strong> to <strong>copy</strong> instantly.
                  </span>
                </li>
              </ul>
            </div>
    
            {/* Disclaimer remains in .use-cta */}
            <div className="use-cta disclaimer">
              <p>
                <strong>Disclaimer:</strong> This website is a personal project. Calculators displayed are for entertainment purposes only.
                Their accuracy is not guaranteed. Always gamble responsibly.
              </p>
            </div>
          </div>
          <footer className="use-footer">
            <Footer />
          </footer>
        </aside>
    
        {showOverlay && (
          <div
            className="overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowOverlay(false);
            }}
          >
            <div className="overlay-content">
              <button
                className="close-button"
                onClick={() => setShowOverlay(false)}
                title="Close"
              >
                ✖
              </button>
              <h2>The Equivalent Boosted Odds Method</h2>
              <p>
                When you have a risk-free bet offer, you have two choices: lay it for a small 
                guaranteed profit, or take it as an Advantage Play (AP) bet and accept some variance.
              </p>
              <p>
                Instead of just looking at EV, we reframe the bet like a value bet by calculating 
                the Equivalent Boosted Odds (EBO). For example, with a £10 risk-free bet where you would expect to  
                retain 70% of the value of your free bet, your effective free bet value is £7. Your potential profit is £30 
                and your maximum loss is £3.
              </p>
              <p>
                The EBO is calculated as:
                <br />
                <em>True Odds + ((Potential Profit – Maximum Loss) × (True Odds – 1))</em>
              </p>
              <p>
                Compare the boosted odds to the true odds:
                <br />
                • If boosted odds exceed the true odds, the AP bet is more attractive.
                <br />
                • A higher ratio (EBO / True Odds) indicates stronger value.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }    

export default ExplanationComponent;
