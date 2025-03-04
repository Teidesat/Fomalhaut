import React, { FC, useEffect, useRef, useState } from "react";
import "./Orbit.css";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as satellite from 'satellite.js';
import earthmap from '../../../../assets/earthmap-high4k.jpg';
import cubesatImage from '../../../../assets/teidesatCube.png';
import circle from '../../../../assets/circle.png';
import { set } from "date-fns";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion, AnimatePresence } from "framer-motion";


// simulated TLE data for TEIDESAT-1
const tleLine1 = '1 99999U 24051A   24051.50000000  .00000000  00000-0  00000-0 0  9992';
const tleLine2 = '2 99999  97.5000  50.0000 0002000   0.0000  90.0000 15.00000000  00001';


// Constants
const MinutesPerDay = 1440;
const ixpdotp = MinutesPerDay / (2.0 * 3.141592654);
const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
const earthRadius = 6371;
const raycaster = new THREE.Raycaster();
const tenerifeLat = 28.2916;
const tenerifeLon = -16.6291;


// Creation Functions
const createScene = () => new THREE.Scene();

const createRenderer = (width: number, height: number) => {
  const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, antialias: true });
  renderer.setSize(width, height);
  
  return renderer;
};


const createCamera = (width: number, height: number) => {
  const NEAR = 1e-6, FAR = 1e27;
  const camera = new THREE.PerspectiveCamera(60, width / height, NEAR, FAR);
  camera.position.set(20000, 0, 0);
  camera.lookAt(0, 0, 0);

  //change camera rotation to align with Three.js coordinate system
  camera.up.set(0, 0, 1);

  return camera;
};

const createControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, render: () => void) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.addEventListener('change', render);
  return controls;
};

const createLighting = (scene: THREE.Scene) => {
  const sun = new THREE.DirectionalLight(0xffffff, 4);
  sun.position.set(0, 1000000, 500000);
  scene.add(sun, new THREE.AmbientLight());
};

const createEarth = (scene: THREE.Scene, render: () => void) => {
  const textLoader = new THREE.TextureLoader();
  const geometry = new THREE.SphereGeometry(earthRadius, 50, 50);
  const material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, map: textLoader.load(earthmap, render) });
  const earthMesh = new THREE.Mesh(geometry, material);
  
  // Set rotation to align with Three.js coordinate system
  earthMesh.rotation.x = Math.PI / 2;
  
  scene.add(earthMesh);
};

const createSatelliteModel = (scene: THREE.Scene, render: () => void, satelliteRef: React.MutableRefObject<THREE.Group | null>) => {
  const loader = new GLTFLoader();
  loader.load(
    '/cubesat.glb',
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
      console.error('Error cargando el modelo:', error);
    }
  );
};

const addOrbit = (scene: THREE.Scene, render: () => void) => {
  const revsPerDay = satrec.no * ixpdotp;
  const intervalMinutes = 1;
  const minutes = MinutesPerDay / revsPerDay;
  const initialDate = new Date();
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x999999, opacity: 1.0, transparent: true });
  const points = [];

  for (let i = 0; i <= minutes; i += intervalMinutes) {
    const date = new Date(initialDate.getTime() + i * 60000);
    const positionEci = satellite.propagate(satrec, date).position as satellite.EciVec3<number>;
    const positionEcf = satellite.eciToEcf(positionEci, satellite.gstime(date)) as satellite.EcfVec3<number>;
    if (positionEcf) points.push(new THREE.Vector3(positionEcf.x, positionEcf.y, positionEcf.z));
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

const updateSatelliteLine = (line: THREE.Line, satellitePosition: THREE.Vector3) => {
  const positions = line.geometry.attributes.position.array as Float32Array;
  positions[0] = satellitePosition.x;
  positions[1] = satellitePosition.y;
  positions[2] = satellitePosition.z;
  positions[3] = 0;
  positions[4] = 0;
  positions[5] = 0;
  line.geometry.attributes.position.needsUpdate = true;
};

function getStarfield({ numStars = 1000 } = {}) {
  function randomSpherePoint() {
    const minRadius = 1000000;  
    const spread = 500000;
    const radius = Math.random() * spread + minRadius;

    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);

    return {
      pos: new THREE.Vector3(x, y, z),
      hue: 0.6,
      minDist: radius,
    };
  }

  const verts = [];
  const colors = [];
  const positions = [];
  let col;

  for (let i = 0; i < numStars; i += 1) {
    let p = randomSpherePoint();
    const { pos, hue } = p;
    positions.push(p);
    col = new THREE.Color().setHSL(hue, 0.2, Math.random());
    verts.push(pos.x, pos.y, pos.z);
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 4,
    vertexColors: true,
    map: new THREE.TextureLoader().load(circle),
    sizeAttenuation: false,
    transparent: true,
  });

  const points = new THREE.Points(geo, mat);
  return points;
}



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

  // Aplicar correción de posicion que el vertice del cono este en la posicion 'position'
  cone.position.addScaledVector(cone.getWorldDirection(new THREE.Vector3()), 600);
  
  // Aplicar la corrección de rotación para que apunte correctamente
  cone.rotateX(Math.PI + Math.PI / 2); 
}

const createTenerifePoint = (scene: THREE.Scene) => {
  const geometry = new THREE.SphereGeometry(20, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const tenerifePoint = new THREE.Mesh(geometry, material);

  const latRad = THREE.MathUtils.degToRad(tenerifeLat);
  const lonRad = THREE.MathUtils.degToRad(tenerifeLon);
  const x = earthRadius * Math.cos(latRad) * Math.cos(lonRad);
  const y = earthRadius * Math.cos(latRad) * Math.sin(lonRad);
  const z = earthRadius * Math.sin(latRad);

  tenerifePoint.position.set(x, y, z);

  scene.add(tenerifePoint);
};

const isOverTenerife = (positionGd: satellite.GeodeticLocation) => {
  const latDiff = Math.abs(positionGd.latitude * (180 / Math.PI) - tenerifeLat);
  const lonDiff = Math.abs(positionGd.longitude * (180 / Math.PI) - tenerifeLon);
  return (latDiff + lonDiff) < 36;
};

const calculateNextPass = () => {
  const now = new Date();
  const step = 60 * 1000; // 1 minute in milliseconds
  let nextPass = null;

  for (let i = 0; i < MinutesPerDay; i++) {
    const date = new Date(now.getTime() + i * step);
    const positionEci = satellite.propagate(satrec, date).position as satellite.EciVec3<number>;
    const positionGd = satellite.eciToGeodetic(positionEci, satellite.gstime(date));

    if (isOverTenerife(positionGd)) {
      nextPass = date;
      break;
    }
  }

  return nextPass;
};




// Principal component
const Orbit: FC = () => {

  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const orbitRef = useRef<THREE.Line | null>(null);
  const coneRef = useRef<THREE.Mesh | null>(null);
  const satelliteModel = useRef<THREE.Group | null>(null);
  const lineRef = useRef<THREE.Line | null>(null);
  const [satelliteInfo, setSatelliteInfo] = useState<JSX.Element | null>(null);
  const [hovered, setHovered] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [nextPass, setNextPass] = useState<Date | null>(null);
  const [isEarthView, setIsEarthView] = useState<boolean>(true);

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');

    const width = mainContent ? mainContent.clientWidth : window.innerWidth;
    const height = mainContent ? mainContent.clientHeight : window.innerHeight;
    const scene = createScene();
    sceneRef.current = scene;
    const renderer = createRenderer(width, height);
    const camera = createCamera(width, height);
    cameraRef.current = camera;
    const render = () => renderer.render(scene, camera);


    controlsRef.current = createControls(camera, renderer, render);
    createLighting(scene);
    createEarth(scene, render);
    createTenerifePoint(scene);
    lineRef.current = createSatelliteLine(scene);
    scene.add(getStarfield());
    createSatelliteModel(scene, render, satelliteModel);


    const cone = createLightCone(scene);
    coneRef.current = cone;


    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      const date = new Date();
      const positionEci = satellite.propagate(satrec, date).position as satellite.EciVec3<number>;
      const positionEcf = satellite.eciToEcf(positionEci, satellite.gstime(date)) as satellite.EcfVec3<number>;
      const positionGd = satellite.eciToGeodetic(positionEci, satellite.gstime(date));
      if (satelliteModel.current) {
        satelliteModel.current.position.set(positionEcf.x, positionEcf.y, positionEcf.z);
        satelliteModel.current.lookAt(0, 0, 0);
      }
      if (lineRef.current && satelliteModel.current) updateSatelliteLine(lineRef.current, satelliteModel.current.position);
      if (coneRef.current && satelliteModel.current) updateLightCone(coneRef.current, satelliteModel.current!.position);
      if (isOverTenerife(positionGd)) {
        (coneRef.current!.material as THREE.MeshBasicMaterial).color.set(0x00ff00);
      } else {
        (coneRef.current!.material as THREE.MeshBasicMaterial).color.set(0xff0000);
      }
      render();
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = mountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      setHovered(intersects.length > 0 && (intersects[0].object.parent?.type === 'Group' || intersects[0].object.parent?.type === 'Object3D'));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = mountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      if (intersects.length > 0 && (intersects[0].object.parent?.type === 'Group' || intersects[0].object.parent?.type === 'Object3D')) {
        const gmst = satellite.gstime(new Date());
        const positionAndVelocity = satellite.propagate(satrec, new Date());
        const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
        const velocityEci = positionAndVelocity.velocity as satellite.EciVec3<number>;
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const altitude = positionGd.height;
        const velocity = Math.sqrt(velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2);
        const nextPassDate = calculateNextPass();
        setNextPass(nextPassDate);

        const satelliteInfo = (
          <div>
            <h3>Satellite Information: TEIDESAT-1</h3>
            <img src={cubesatImage} alt="Satellite" style={{ width: '230px', height: '130px' }} />
            <p><strong>Position (Lat, Lon):</strong></p>
            <ul>
              <li>Latitude: {(positionGd.latitude * (180 / Math.PI)).toFixed(2)}°</li>
              <li>Longitude: {(positionGd.longitude * (180 / Math.PI)).toFixed(2)}°</li>
            </ul>
            <p><strong>Altitude:</strong> {altitude.toFixed(2)} km</p>
            <p><strong>Velocity:</strong> {velocity.toFixed(2)} km/s</p>
          </div>
        );
        setSatelliteInfo(satelliteInfo);
        if (orbitRef.current) sceneRef.current.remove(orbitRef.current);
        orbitRef.current = addOrbit(sceneRef.current, render);
        if (lineRef.current) lineRef.current.visible = true;
      }
    };

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerdown', handleMouseDown);

    const handleResize = () => {
      if (cameraRef.current && renderer) {
        if (document.fullscreenElement) {
          renderer.setSize(window.innerWidth, window.innerHeight);
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        } else {
          if (mainContent && cameraRef.current) {
            const width = mainContent.clientWidth;
            const height = mainContent.clientHeight;
            renderer.setSize(width, height);
            cameraRef.current.aspect = width / height;
          }
        }
        cameraRef.current.updateProjectionMatrix();
        render();
      }
    };

    window.addEventListener('resize', handleResize);

    


    return () => {
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);

    };
  }, []);

  useEffect(() => {
    if (satelliteModel.current) {
      satelliteModel.current.scale.set(hovered ? 1200 : 1000, hovered ? 1200 : 1000, hovered ? 1200 : 1000);
      satelliteModel.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.transparent = true;
          child.material.opacity = hovered ? 0.5 : 1;
        }
      });
    }
  }, [hovered]);

  const handleCloseInfo = () => {
    setSatelliteInfo(null);
    if (orbitRef.current && sceneRef.current) {
      sceneRef.current.remove(orbitRef.current);
      orbitRef.current = null;
      lineRef.current!.visible = false;
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (mountRef.current) {
        if (mountRef.current.requestFullscreen) {
          mountRef.current.requestFullscreen();
        }
      };
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const handleToggleView = () => {
  const center = new THREE.Vector3(0, 0, 0);
  if (cameraRef.current && controlsRef.current && satelliteModel.current) {
    if (!isEarthView) {
      const targetPosition = satelliteModel.current.position.clone();
      targetPosition.add(satelliteModel.current.position.clone());
      targetPosition.add(satelliteModel.current.position.clone());
      const duration = 2000; // Transition duration in ms
      const startPosition = cameraRef.current.position.clone();
      const startTime = performance.now();

      const animateTransition = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        const easedT = easeInOutQuad(t);

        cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easedT);
        cameraRef.current!.lookAt(center);
        controlsRef.current!.target.copy(center);
        controlsRef.current!.update();

        if (t < 1) {
          requestAnimationFrame(animateTransition);
        } else {
          controlsRef.current!.rotateSpeed = 1;
          controlsRef.current!.zoomSpeed = 1;
          controlsRef.current!.panSpeed = 1;
          setIsEarthView(true);
        }
      };

      requestAnimationFrame(animateTransition);
    } else {
      const pos = satelliteModel.current.position;
      const direction = new THREE.Vector3().subVectors(pos, center).normalize();
      const distance = 3000;
      const targetPosition = new THREE.Vector3().addVectors(pos, direction.multiplyScalar(distance));
      const duration = 2000;
      const startPosition = cameraRef.current.position.clone();
      const startTime = performance.now();

      const animateTransition = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        const easedT = easeInOutQuad(t);

        cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easedT);
        cameraRef.current!.lookAt(pos);
        controlsRef.current!.target.copy(pos);
        controlsRef.current!.update();

        if (t < 1) {
          requestAnimationFrame(animateTransition);
        } else {
          controlsRef.current!.rotateSpeed = 0.2;
          controlsRef.current!.zoomSpeed = 0.2;
          controlsRef.current!.panSpeed = 0.2;
          setIsEarthView(false);
        }
      };

      requestAnimationFrame(animateTransition);
    }
  }
};


  return (
    <div className="Orbit" ref={mountRef}>
      {satelliteInfo && (
  <AnimatePresence>
    <motion.div
      className="satellite-info"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <button className="close-button" onClick={handleCloseInfo}>X</button>
      <pre>{satelliteInfo}</pre>
      <h4>Next Pass Over Tenerife:</h4>
      <p>{nextPass ? nextPass.toLocaleString() : 'Not available'}</p>
    </motion.div>
  </AnimatePresence>
)}
      <button className="fullscreen-button" onClick={handleFullscreen}>
        {isFullscreen ? "Exit" : '⛶'}
      </button>
      <button className="toggle-view-button" onClick={handleToggleView}>
        {isEarthView ? '🛰️ View' : '🌎 View'}
      </button>
    </div>
  );
};

export default Orbit;