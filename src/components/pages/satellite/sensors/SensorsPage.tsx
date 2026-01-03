import React from "react";
import SatelliteFlow from "./SatelliteFlow.tsx";
import "./SensorsPage.css";


// Página de estado de sensores del satélite.
// Esta vista actúa como contenedor del componente de visualización 3D/2D
// SatelliteFlow, que representa el flujo/estado actual de los sensores.
const SensorsPage: React.FC = () => {
  return (
    <div className="sensors-page-background">
      <div className="sensors-page">
        {/* Título principal de la sección de estado de sensores */}
        <h2 className="section-title">Sensor Status</h2>

        {/* Contenedor de la visualización del satélite y sus sensores.
            SatelliteFlow encapsula la lógica de representación (posiciones,
            estados, colores, etc.), por lo que esta página se limita a
            maquetar el layout. */}
        <section className="satellite-visualizer">
          <SatelliteFlow />
        </section>
      </div>
    </div>
  );
};

export default SensorsPage;