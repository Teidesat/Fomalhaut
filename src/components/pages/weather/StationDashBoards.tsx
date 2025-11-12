import React from "react";
import { useLocation } from "react-router-dom";

const StationDashboards: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const dashboardUrl = params.get("dashboardUrl");

  return (
    <div className="iframe-container">
      {dashboardUrl ? (
        <iframe
          src={dashboardUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          title="Grafana Panel"
          style={{ overflow: "hidden" }}
        />
      ) : (
        <p>No se ha proporcionado ninguna URL de dashboard.</p>
      )}
    </div>
  );
};

export default StationDashboards;

// Para paneles individuales de grafana

// import React from "react";

// const StationDashboards: React.FC = () => {

//   return (
// Aqui se inserta la URL del panel individual de grafana
// <iframe src="http://localhost:3000/d-solo/adkrmc7/panel-teidesat?orgId=1&from=1762171200000&to=1762592400000&timezone=browser&refresh=15m&panelId=panel-2&__feature.dashboardSceneSolo=true" width="450" height="200" frameBorder="0"></iframe>
//   );
// };

// export default StationDashboards;
