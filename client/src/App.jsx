import { BrowserRouter, Route, Routes } from "react-router-dom";
import Mission1 from "./components/Mission 1/Mission1";
import Mission10 from "./components/Mission 10/Mission10";
import Mission2 from "./components/Mission 2/Mission2";
import Mission3 from "./components/Mission 3/Mission3";
import Mission4 from "./components/Mission 4/Mission4";
import Mission5 from "./components/Mission 5/Mission5";
import Mission6 from "./components/Mission 6/Mission6";
import Mission7 from "./components/Mission 7/Mission7";
import Mission8 from "./components/Mission 8/Mission8";
import Mission9 from "./components/Mission 9/Mission9";
import SideMenu from "./components/SideMenu.jsx";


// Optional Home Page
import Home from "./components/pages/Home";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Dashboard + Nested Missions */}
        <Route path="/dashboard" element={<SideMenu />}>
          <Route index element={<Mission1 />} /> {/* Default Mission */}
          <Route path="mission1" element={<Mission1 />} />
          <Route path="mission2" element={<Mission2 />} />
          <Route path="mission3" element={<Mission3 />} />
          <Route path="mission4" element={<Mission4 />} />
          <Route path="mission5" element={<Mission5 />} />
          <Route path="mission6" element={<Mission6 />} />
          <Route path="mission7" element={<Mission7 />} />
          <Route path="mission8" element={<Mission8 />} />
          <Route path="mission9" element={<Mission9 />} />
          <Route path="mission10" element={<Mission10 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;