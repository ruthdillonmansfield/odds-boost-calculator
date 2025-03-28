import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { sidebarCategories } from "./SidebarData.js"; // from step #1

const Sidebar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleNavClick = () => setMenuOpen(false);

  return (
    <>
      <div className="mobile-header">
        <button className="hamburger" onClick={toggleMenu}>
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>
      <aside className={`sidebar ${menuOpen ? "active" : ""}`}>
        <h1 className="site-title">Matched Betting Calculators</h1>

        {sidebarCategories.map((category, catIdx) => (
          <div key={catIdx} className="category-section">
            <h2 className="category-title">{category.title}</h2>

            <div className="calculator-grid">
            {category.items
              .filter(item => item.link !== "*")
              .map((item, idx) => (
                <NavLink
                  key={idx}
                  onClick={handleNavClick}
                  to={item.link}
                  className="grid-item"
                >
                  <div className="icon">{item.icon}</div>
                  <div className="label">{item.label}</div>
                  {item.sub && <div className="sub">{item.sub}</div>}
                </NavLink>
              ))}

            </div>
          </div>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
