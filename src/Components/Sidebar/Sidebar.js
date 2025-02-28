import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleNavClick = () => setMenuOpen(false);

  return (
    <>
      {/* Mobile Header (always rendered, but we style/hide it on desktop) */}
      <div className="mobile-header">
        <button className="hamburger" onClick={toggleMenu}>
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Sidebar overlay (slides in) */}
      <aside className={`sidebar ${menuOpen ? "active" : ""}`}>
        <h1 className="site-title">Matched Betting Calculators</h1>
        <nav className="nav-links">
          <NavLink onClick={handleNavClick} to="/lay-stake-calculator" className="nav-link">
            Lay Stake Calculator
          </NavLink>
          <NavLink onClick={handleNavClick} to="/risk-free-calculator" className="nav-link">
            Risk-Free Bet Calculator
          </NavLink>
          <NavLink onClick={handleNavClick} to="/boost-calculator-advanced" className="nav-link">
            Lay Stake Odds Boost Calculator
          </NavLink>
          <NavLink onClick={handleNavClick} to="/boost-calculator" className="nav-link">
            Odds Boost Calculator
          </NavLink>
          <NavLink onClick={handleNavClick} to="/fractional-to-decimal" className="nav-link">
            Fractional to Decimal
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
