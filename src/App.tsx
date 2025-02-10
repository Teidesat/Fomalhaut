import "./App.css";
import TopPanel from "./components/TopPanel/TopPanel";
import Home from "./components/pages/Home/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SidePanel from "./components/SidePanel/SidePanel";
import About from "./components/pages/About/About";
import TemperatureMap from "./components/pages/satellite/TemperatureMap/TemperatureMap";
import Logs from "./components/pages/Logs/Logs";

function App() {
  return (
    <BrowserRouter>
      <TopPanel />
      <div className="App">
        <SidePanel />
        <div className="App-body">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/temperaturemap" element={<TemperatureMap />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
