import React from "react";
import "./CommStatusCard.css";

const CommStatusCard: React.FC = () => {
  const radioStatus = {
    isActive: true,
    lastMessage: "2025-03-31 14:32:10",
  };

  const opticalStatus = {
    isActive: false,
    lastMessage: "2025-03-31 13:58:42",
  };

  return (
    <div>
      <div className="comm-status-container">
        {/* Radio */}
        <div className="comm-channel">
          <h2>Radio Link 📡</h2>
          <p>
            <span className="comm-label">Status:</span>
            <span
              className={
                radioStatus.isActive
                  ? "comm-status-active"
                  : "comm-status-inactive"
              }
            >
              {radioStatus.isActive ? "Active" : "Inactive"}
            </span>
          </p>
          <p>
            <span className="comm-label">Last Message:</span>
            {radioStatus.lastMessage}
          </p>
        </div>

        {/* Optical */}
        <div className="comm-channel">
          <h2>Optical Link 💡</h2>
          <p>
            <span className="comm-label">Status:</span>
            <span
              className={
                opticalStatus.isActive
                  ? "comm-status-active"
                  : "comm-status-inactive"
              }
            >
              {opticalStatus.isActive ? "Active" : "Inactive"}
            </span>
          </p>
          <p>
            <span className="comm-label">Last Message:</span>
            {opticalStatus.lastMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommStatusCard;
