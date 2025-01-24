import React, { FC } from "react";
import { Link } from "react-router-dom";
import { IoMdLocate } from "react-icons/io";
import {
  FaEye,
  FaLock,
  FaUnlock,
  FaTemperatureHigh,
  FaSlidersH,
  FaCommentAlt,
  FaQuestion,
  FaSatellite,
  FaMicrochip,
} from "react-icons/fa";
import "./SidePanel.css";

interface SidePanelProps {}

const SidePanel: FC<SidePanelProps> = () => (
  <>
    <div className="SidePanel">
      <div className="family-section">
        <div className="family-header">
          <FaSatellite size={32} />
          <p>Satellite</p>
        </div>
        <ul className="family-pages">
          <li>
            <Link to="/communications" className="side-panel-link">
              <FaSatellite size={20} />
              Communications
            </Link>
          </li>
          <li>
            <Link to="/location" className="side-panel-link">
              <IoMdLocate size={20} />
              Location
            </Link>
          </li>
          <li>
            <Link to="/sensors" className="side-panel-link">
              <FaMicrochip size={20} />
              Status and Sensors
            </Link>
          </li>
        </ul>
      </div>

      <div className="family-section">
        <div className="family-header">
          <FaEye size={32} />
          <p>Ground Station</p>
        </div>
        <ul className="family-pages">
          <li>
            <Link to="/tracking" className="side-panel-link" aria-disabled>
              <FaEye size={20} />
              Station Tracking
            </Link>
          </li>
          <li>
            <Link to="/encoder" className="side-panel-link" aria-disabled>
              <FaLock size={20} />
              Station Encoder
            </Link>
          </li>
          <li>
            <Link to="/decoder" className="side-panel-link">
              <FaUnlock size={20} />
              Station Decoder
            </Link>
          </li>
        </ul>
      </div>

      <div className="lonely-pages">
        <div className="lonely-page">
          <Link to="/temperaturemap" className="side-panel-link">
            <FaTemperatureHigh size={20} />
            Temperature Map
          </Link>
        </div>
        <div className="lonely-page">
          <Link to="/configuration" className="side-panel-link">
            <FaSlidersH size={20} />
            Configuration
          </Link>
        </div>
        <div className="lonely-page">
          <Link to="/logs" className="side-panel-link">
            <FaCommentAlt size={20} />
            Logs
          </Link>
        </div>
        <div className="lonely-page">
          <Link to="/about" className="side-panel-link">
            <FaQuestion size={20} />
            About
          </Link>
        </div>
      </div>
    </div>
  </>
);

export default SidePanel;
