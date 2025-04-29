import React, { useState } from "react";


const GrafanaDashboard = () => {
  const baseUrl = "http://grafana:3000<<YOUR_GRAFANA_DASHBOARD_URL>>"; // Aquí la URL de tu dashboard de Grafana
  const iframeUrl = `${baseUrl}?orgId=1&theme=dark&fullscreen&kiosk&refresh=10s&panelId=1`;
  const grafanaLink = `${baseUrl}?orgId=1&from=now-6h&to=now&timezone=browser`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <iframe
        src={iframeUrl}
        width="100%"
        height="650"
        frameBorder="0"
        title="Grafana Dashboard"
      />
      <div style={{ textAlign: "right" }}>
        <a
          href={grafanaLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "white",
            backgroundColor: "#3f51b5",
            padding: "10px 16px",
            borderRadius: "6px",
            fontWeight: "bold",
            fontFamily: "monospace",
          }}
        >
          View on Grafana
        </a>
      </div>
    </div>
  );
};

export default GrafanaDashboard;
