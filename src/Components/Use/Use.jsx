import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import pageConfig from "../../config/pageConfig";
import "./Use.css";
import { Zap, Rocket, Sparkles, Crown } from "lucide-react";

const ExplanationComponent = () => {
  const location = useLocation();
  const [showOverlay, setShowOverlay] = useState(false);

  const currentPage = Object.values(pageConfig).find(
    (page) => page.route === location.pathname
  );

  const calculatorInstructions =
    currentPage && currentPage.instructions ? currentPage.instructions : (
      <p>Use the calculator above to get started.</p>
    );

  return (
    <>
      <aside className="use">
        <div className="use-content">
          <div className="instructions-plain">
            <h3 className="title">Using the {`${currentPage && currentPage.use.title ? currentPage.use.title : "Calculator"}`}</h3>
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
              
              {currentPage.use.matched && <li style={{ display: "flex", alignItems: "flex-start", gap: "8px"}}>
                <Zap size={18} style={{marginTop: "5px"}} color="#00aaff" />
                Matched betting? Quickly lock in profit before odds shift.
              </li>}
              {currentPage.use.advantage && <li style={{ display: "flex", alignItems: "flex-start", gap: "8px"}}>
                <Crown size={18} style={{marginTop: "5px"}} color="#00aaff" />
                Assess the underlying value of bets for advantage play.
              </li>}
              {currentPage.use.copyable && <li style={{ display: "flex", alignItems: "flex-start", gap: "8px"}}>
                <Rocket size={18} style={{marginTop: "5px"}} color="#ff9900" />
                <span>
                  Press <strong>"C"</strong> to <strong>copy</strong> instantly.
                </span>
              </li>}
              {currentPage.use.experimental && <li style={{ display: "flex", alignItems: "flex-start", gap: "8px"}}>
                <Sparkles size={18} style={{marginTop: "5px"}} color="#e1d154" />
                <span>
                  This tool is experimental. It might be conceptually untested, or yield unexpected results.
                </span>
              </li>}
            </ul>
          </div>

          <div className="use-cta disclaimer">
            <p>
              <strong>Disclaimer:</strong> This website is a personal project.
              Calculators displayed are for entertainment purposes only.
              Their accuracy is not guaranteed. Always gamble responsibly.
            </p>
          </div>
        </div>
        <footer className="use-footer">
          <div className="lg-footer">
            <p>
              Made by{" "}
              <a
                href="https://ruth-dm.co.uk/?utm_source=odds-calculator&utm_medium=affiliate&utm_campaign=odds-calculator"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ruth Dillon-Mansfield
              </a>
            </p>
          </div>
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
};

export default ExplanationComponent;
