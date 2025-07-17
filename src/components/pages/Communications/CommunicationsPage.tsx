// src/pages/communications/CommunicationsPage.tsx
import React from "react";
import CommStatusCard from "./CommStatusCard";
import MessageHistoryTable from "./MessageHistoryTable";
import CommandForm from "./CommandForm";
import "./CommunicationsPage.css";

const CommunicationsPage: React.FC = () => {
  return (
    <div className="communications-page">
      <div className="commStatus">
        <h2 className="section-title">Communication Status</h2>
        <CommStatusCard />
      </div>

      <div className="messHistory">
        <h2 className="section-title">Message History</h2>
        <MessageHistoryTable />
      </div>

      <div className="sendCommand">
        <h2 className="section-title">Send Command</h2>
        <CommandForm />
      </div>
    </div>
  );
};

export default CommunicationsPage;
