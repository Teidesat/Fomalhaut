// import React from 'react';

// const SensorsPage: React.FC = () => {
//   return (
//     <div className="sensors-page">
//       <div className="sensorStatus">
//         <h2 className="section-title">Sensor Status</h2>
//         <p>Status: Active</p>
//       </div>
//     </div>
//   );
// };

// export default SensorsPage;

import React from "react";
import SatelliteFlow from "./SatelliteFlow.tsx";
import "./SensorsPage.css";

const SensorsPage: React.FC = () => {
  return (
    <div className="sensors-page-background">
      <div className="sensors-page">
        <h2 className="section-title">Sensor Status</h2>

        <section className="satellite-visualizer">
          <SatelliteFlow />
        </section>
      </div>
    </div>
  );
};

export default SensorsPage;