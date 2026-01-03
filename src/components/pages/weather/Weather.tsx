import React from "react";
import { useNavigate } from "react-router-dom";
import "./Weather.css";

// Lista de estaciones basadas en Open Weather Map con sus URLs
// de dashboards públicos de Grafana.
// Nota: actualmente las URLs apuntan a localhost; revisar antes de despliegues
// en otros entornos (staging/producción) o centralizar en configuración/env.
const stations = [
  {
    id: 1,
    name: "La Laguna Station",
    url: "http://localhost:3000/d/lalagunaowm/open-weather-map-la-laguna?kiosk",
  },
  {
    id: 2,
    name: "Observatorio del Teide Station",
    url: "http://localhost:3000/d/teideowm/open-weather-map-teide?kiosk",
  },
  {
    id: 3,
    name: "Observatorio del Roque de los Muchachos Station",
    url: "http://localhost:3000/d/roquemuchachosowm/open-weather-map-roque-de-los-muchachos?kiosk",
  },
];

// Lista de futuras estaciones TEIDESAT con sus URLs de dashboards públicos de Grafana.
// Estas entradas sirven como placeholders; las URLs deberán actualizarse cuando
// existan los dashboards reales o se externalice la configuración.
const stations2 = [
  {
    id: 1,
    name: "TEIDESAT - Station 1",
    url: "http://localhost:3000/public-dashboards/teidesat-station-1",
  },
  {
    id: 2,
    name: "TEIDESAT - Station 2",
    url: "http://localhost:3000/public-dashboards/teidesat-station-2",
  },
  {
    id: 3,
    name: "TEIDESAT - Station 3",
    url: "http://localhost:3000/public-dashboards/teidesat-station-3",
  },
];

// Página de selección de estaciones meteorológicas externas.
// Permite al operador elegir una estación y navegar al dashboard correspondiente
// que se mostrará incrustado en la vista StationDashboards.
const WeatherPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="weather-page">
      {/* Sección de estaciones basadas en datos de Open Weather Map */}
      <h2 className="section-title">External Weather Stations</h2>
      <div className="stations-list">
        {stations.map((station) => (
          <button
            className="station-btn"
            key={station.id}
            // Navegamos a la ruta de dashboards pasando la URL de Grafana
            // como parámetro de query `dashboardUrl`. Se usa encodeURIComponent
            // para evitar problemas con caracteres especiales en la URL.
            onClick={() =>
              navigate(
                `/Weather/StationDashboards?dashboardUrl=${encodeURIComponent(
                  station.url
                )}`
              )
            }
          >
            {station.name}
          </button>
        ))}
      </div>

      {/* Sección de estaciones TEIDESAT (planificadas / futuras) */}
      <h2 className="section-title">TEIDESAT Stations (coming soon)</h2>
      <div className="stations-list">
        {stations2.map((station2) => (
          <button
            className="station-btn"
            key={station2.id}
            onClick={() =>
              navigate(
                `/Weather/StationDashboards?dashboardUrl=${encodeURIComponent(
                  station2.url
                )}`
              )
            }
          >
            {station2.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeatherPage;