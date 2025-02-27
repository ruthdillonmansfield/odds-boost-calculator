import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <aside className="sidebar">
      <h1 className="site-title">Matched Betting Calculators</h1>
      <button className="hamburger" onClick={toggleMenu}>
        ☰
      </button>
      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        <NavLink to="/lay-stake-calculator" className="nav-link">
          Lay Stake Calculator
        </NavLink>
        <NavLink to="/risk-free-calculator" className="nav-link">
          Risk-Free Bet Calculator
        </NavLink>
        <NavLink to="/boost-calculator-advanced" className="nav-link">
          Lay Stake Odds Boost Calculator        
        </NavLink>
        <NavLink to="/boost-calculator" className="nav-link">
          Odds Boost Calculator
        </NavLink>
        <NavLink to="/fractional-to-decimal" className="nav-link">
          Fractional to Decimal
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
