import React, { FC, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./TopPanel.css";

import { FaSatelliteDish } from "react-icons/fa";
import { MdSatelliteAlt } from "react-icons/md";

interface TopPanelProps {}

const TopPanel: FC<TopPanelProps> = () => {
  const formatCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${timezone}`;
  };

  const [currentTime, setCurrentTime] = useState<string>(formatCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="TopPanel">
      <Link to="/">
        <img
          className="corner-icon"
          src="src\assets\fomalhaut_logo.png"
          alt="Fomalhaut Logo"
        />
      </Link>
      <div className="system-status">
        <div className="ground-station">
          <FaSatelliteDish />
          <p>Ground Station: </p>
          <p className="ground-station-status">Online</p>
        </div>
        <div className="satellite">
          <MdSatelliteAlt />
          <p>Next Satellite Window: </p>
          <p className="satellite-status">{currentTime}</p>
        </div>
      </div>
    </div>
  );
};

export default TopPanel;
