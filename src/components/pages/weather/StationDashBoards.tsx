import React from "react";
import { useLocation } from "react-router-dom";

// Vista de dashboards de estación de tierra.
// Esta pantalla incrusta en un iframe un dashboard externo (por ejemplo Grafana)
// cuya URL se recibe vía query string en el parámetro `dashboardUrl`.
// Ejemplo de uso: /station-dashboards?dashboardUrl=https://grafana.example.com/d/abc123
const StationDashboards: React.FC = () => {
  // Obtenemos la ubicación actual para leer los parámetros de la URL.
  // Se usa useLocation en lugar de useSearchParams porque en este caso
  // solo necesitamos leer una vez los parámetros y no modificarlos.
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // URL del dashboard que se va a incrustar en el iframe.
  // Importante: se asume que esta URL ya viene validada
  // desde la navegación previa; aquí solo se consume.
  const dashboardUrl = params.get("dashboardUrl");

  return (
    <div className="iframe-container">
      {dashboardUrl ? (
        <>
          {/* iframe que muestra el dashboard externo de monitorización.*/}
          <iframe
            src={dashboardUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Grafana Panel"
            style={{ overflow: "hidden" }}
          />
        </>
      ) : (
        // Mensaje de fallback cuando no se proporciona la URL del dashboard.
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
