import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OddsBoostCalculator from "./Components/Calculators/OddsBoostCalculator.jsx";
import FractionalToDecimalConverter from "./Components/Calculators/FractionalToDecimalConverter.jsx";
import DecimalToFractionalConverter from "./Components/Calculators/DecimalToFractionalConverter.jsx";
import OddsConverter from "./Components/Calculators/OddsConverter.jsx";
import RiskFreeEBOCalculator from "./Components/Calculators/RiskFreeEBOCalculator.jsx";
import PartialLayCalculator from "./Components/Calculators/PartialLayCalculator.jsx";


import OddsBoostCalculatorAdv from "./Components/Calculators/OddsBoostCalculatorAdv.jsx";
import LayStakeCalculator from "./Components/Calculators/LayStakeCalculator.jsx";
import RiskFreeCalculator from "./Components/Calculators/RiskFreeCalculator.jsx";
import Use from "./Components/Use/Use.jsx";
import Sidebar from "./Components/Sidebar/Sidebar.js";
import Footer from "./Components/Footer/Footer.jsx";
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
            <Route path="/decimal-to-fractional" element={<DecimalToFractionalConverter />} />
            <Route path="/partial-lay" element={<PartialLayCalculator />} />
            <Route path="/risk-free-ebo" element={<RiskFreeEBOCalculator />} />
            <Route path="/odds-converter" element={<OddsConverter />} />
            <Route path="/boost-calculator-advanced" element={<OddsBoostCalculatorAdv />} />
            <Route path="/risk-free-calculator" element={<RiskFreeCalculator />} />
            <Route path="/lay-stake-calculator" element={<LayStakeCalculator />} />
            <Route path="*" element={<LayStakeCalculator />} />
          </Routes>
        </main>
          <Use />
          <Footer />
      </div>
    </Router>
  );
}

export default App;
