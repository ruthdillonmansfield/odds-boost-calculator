import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OddsBoostCalculator from "./Components/Calculators/OddsBoostCalculator.jsx";
import FractionalToDecimalConverter from "./Components/Calculators/FractionalToDecimalConverter.jsx";
import OddsBoostCalculatorAdv from "./Components/Calculators/OddsBoostCalculatorAdv.jsx";
import LayStakeCalculator from "./Components/Calculators/LayStakeCalculator.jsx";
import RiskFreeCalculator from "./Components/Calculators/RiskFreeCalculator.jsx";
import Use from "./Components/Use/Use";
import Sidebar from "./Components/Sidebar/Sidebar";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/boost-calculator" element={<OddsBoostCalculator />} />
            <Route path="/fractional-to-decimal" element={<FractionalToDecimalConverter />} />
            <Route path="/boost-calculator-advanced" element={<OddsBoostCalculatorAdv />} />
            <Route path="/risk-free-calculator" element={<RiskFreeCalculator />} />
            <Route path="/lay-stake-calculator" element={<LayStakeCalculator />} />
            <Route path="*" element={<OddsBoostCalculator />} />
          </Routes>
        </main>
        <aside className="instructions">
          <Use />
        </aside>
      </div>
    </Router>
  );
}

export default App;
