import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import pageConfig from "./config/pageConfig.js";
import Sidebar from "./Components/Sidebar/Sidebar.js";
import Use from "./Components/Use/Use.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import "./App.css";

function App() {
  useEffect(() => {
    const handleFocus = (event) => {
      if (event.target.tagName === "INPUT") {
        event.target.select();
      }
    };
    // Add the event listener on the capture phase
    document.addEventListener("focus", handleFocus, true);
    return () => {
      document.removeEventListener("focus", handleFocus, true);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="content">
          <Routes>
            {Object.values(pageConfig)
              .filter((page) => page.component)
              .map((page) => {
                const Component = page.component;
                return (
                  <Route
                    key={page.route}
                    path={page.route}
                    element={<Component />}
                  />
                );
              })}
            <Route
              path="*"
              element={
                pageConfig.layStakeCalculator &&
                pageConfig.layStakeCalculator.component ? (
                  <pageConfig.layStakeCalculator.component />
                ) : (
                  <div>Page not found</div>
                )
              }
            />
          </Routes>
        </main>
        <Use />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
