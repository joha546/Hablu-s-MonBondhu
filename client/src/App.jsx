import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import SideMenu from "./components/sidebar/SideMenu";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Dashboard Page (Sidebar view) */}
        <Route path="/dashboard" element={<SideMenu />} />
      </Routes>
    </Router>
  );
};

export default App;
