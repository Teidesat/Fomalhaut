import "./App.css";
import TopPanel from "./components/TopPanel/TopPanel";
import Home from "./components/pages/Home/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SidePanel from "./components/SidePanel/SidePanel";
import About from "./components/pages/About/About";
import TemperatureMap from "./components/pages/satellite/TemperatureMap/TemperatureMap";
import Logs from "./components/pages/Logs/Logs";
import Orbit from "./components/pages/satellite/Orbit/Orbit";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <TopPanel />
        <div className="content-wrapper">
          <SidePanel />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/temperaturemap" element={<TemperatureMap />} />
              <Route path="/location" element={<Orbit />} />
              <Route path="/logs" element={<Logs />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}


export default App;
