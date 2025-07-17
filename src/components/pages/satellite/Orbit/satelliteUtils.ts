import * as THREE from "three";
import * as satellite from "satellite.js";
import {
  TLE,
  EARTH_RADIUS,
  TENERIFE_COORDS,
  MINUTES_PER_DAY,
} from "./constants";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MutableRefObject } from "react";

const tleLine1 = TLE.line1;
const tleLine2 = TLE.line2;

const tenerifeLat = TENERIFE_COORDS.lat;
const tenerifeLon = TENERIFE_COORDS.lon;

const ixpdotp = MINUTES_PER_DAY / (2.0 * 3.141592654);
const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

const createSatelliteModel = (
  scene: THREE.Scene,
  render: () => void,
  satelliteRef: MutableRefObject<THREE.Group | null>,
) => {
  const loader = new GLTFLoader();
  loader.load(
    "/cubesat.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(1000, 1000, 1000);

      // Asignar el modelo a la referencia
      satelliteRef.current = model;

      scene.add(model);
      render();
    },
    undefined,
    (error) => {
      console.error("Error cargando el modelo:", error);
    },
  );
};

const addOrbit = (scene: THREE.Scene, render: () => void) => {
  const revsPerDay = satrec.no * ixpdotp;
  const intervalMinutes = 1;
  const minutes = MINUTES_PER_DAY / revsPerDay;
  const initialDate = new Date();
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x999999,
    opacity: 1.0,
    transparent: true,
  });
  const points = [];

  for (let i = 0; i <= minutes; i += intervalMinutes) {
    const date = new Date(initialDate.getTime() + i * 60000);
    const positionEci = satellite.propagate(satrec, date)
      .position as satellite.EciVec3<number>;
    const positionEcf = satellite.eciToEcf(positionEci, satellite.gstime(date));
    if (positionEcf)
      points.push(
        new THREE.Vector3(positionEcf.x, positionEcf.y, positionEcf.z),
      );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const orbitCurve = new THREE.Line(geometry, orbitMaterial);
  scene.add(orbitCurve);
  render();
  return orbitCurve;
};

const createSatelliteLine = (scene: THREE.Scene) => {
  const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const points = [new THREE.Vector3(), new THREE.Vector3()];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  line.visible = false;
  scene.add(line);
  return line;
};

const updateSatelliteLine = (
  line: THREE.Line,
  satellitePosition: THREE.Vector3,
) => {
  const positions = line.geometry.attributes.position.array as Float32Array;
  positions[0] = satellitePosition.x;
  positions[1] = satellitePosition.y;
  positions[2] = satellitePosition.z;
  positions[3] = 0;
  positions[4] = 0;
  positions[5] = 0;
  line.geometry.attributes.position.needsUpdate = true;
};

const createLightCone = (scene: THREE.Scene) => {
  const coneGeometry = new THREE.ConeGeometry(2700, 1100, 32);

  const coneMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  scene.add(cone);

  return cone;
};

const updateLightCone = (cone: THREE.Mesh, position: THREE.Vector3) => {
  cone.position.copy(position);
  cone.lookAt(new THREE.Vector3(0, 0, 0));

  // Aplicar corrección de posición que el vertice del cono este en la posición 'position'
  cone.position.addScaledVector(
    cone.getWorldDirection(new THREE.Vector3()),
    600,
  );

  // Aplicar la corrección de rotación para que apunte correctamente
  cone.rotateX(Math.PI + Math.PI / 2);
};

const createTenerifePoint = (scene: THREE.Scene) => {
  const geometry = new THREE.SphereGeometry(20, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const tenerifePoint = new THREE.Mesh(geometry, material);

  const latRad = THREE.MathUtils.degToRad(tenerifeLat);
  const lonRad = THREE.MathUtils.degToRad(tenerifeLon);
  const x = EARTH_RADIUS * Math.cos(latRad) * Math.cos(lonRad);
  const y = EARTH_RADIUS * Math.cos(latRad) * Math.sin(lonRad);
  const z = EARTH_RADIUS * Math.sin(latRad);

  tenerifePoint.position.set(x, y, z);

  scene.add(tenerifePoint);
};

const isOverTenerife = (positionGd: satellite.GeodeticLocation) => {
  const latDiff = Math.abs(positionGd.latitude * (180 / Math.PI) - tenerifeLat);
  const lonDiff = Math.abs(
    positionGd.longitude * (180 / Math.PI) - tenerifeLon,
  );
  return latDiff + lonDiff < 36;
};

const calculateNextPass = () => {
  const now = new Date();
  const step = 60 * 1000; // 1 minute in milliseconds
  let nextPass = null;

  for (let i = 0; i < MINUTES_PER_DAY; i++) {
    const date = new Date(now.getTime() + i * step);
    const positionEci = satellite.propagate(satrec, date)
      .position as satellite.EciVec3<number>;
    const positionGd = satellite.eciToGeodetic(
      positionEci,
      satellite.gstime(date),
    );

    if (isOverTenerife(positionGd)) {
      nextPass = date;
      break;
    }
  }

  return nextPass;
};

export {
  createSatelliteModel,
  addOrbit,
  createSatelliteLine,
  updateSatelliteLine,
  createLightCone,
  updateLightCone,
  createTenerifePoint,
  calculateNextPass,
  isOverTenerife,
};
