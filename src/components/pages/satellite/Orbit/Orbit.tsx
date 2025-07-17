import { FC, useEffect, useRef, useState } from "react";
import "./Orbit.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as satellite from "satellite.js";
import cubesatImage from "../../../../assets/teidesatCube.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  createSatelliteModel,
  addOrbit,
  createSatelliteLine,
  updateSatelliteLine,
  createLightCone,
  updateLightCone,
  createTenerifePoint,
  calculateNextPass,
  isOverTenerife,
} from "./satelliteUtils";
import {
  createScene,
  createRenderer,
  createCamera,
  createControls,
  createLighting,
  createEarth,
  getStarfield,
} from "./threeUtils";
import { TLE } from "./constants";

const tleLine1 = TLE.line1;
const tleLine2 = TLE.line2;

const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

const raycaster = new THREE.Raycaster();

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
    const mainContent = document.querySelector(".main-content");

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
      const positionEci = satellite.propagate(satrec, date)
        .position as satellite.EciVec3<number>;
      const positionEcf = satellite.eciToEcf(
        positionEci,
        satellite.gstime(date),
      );
      const positionGd = satellite.eciToGeodetic(
        positionEci,
        satellite.gstime(date),
      );
      if (satelliteModel.current) {
        satelliteModel.current.position.set(
          positionEcf.x,
          positionEcf.y,
          positionEcf.z,
        );
        satelliteModel.current.lookAt(0, 0, 0);
      }
      if (lineRef.current && satelliteModel.current)
        updateSatelliteLine(lineRef.current, satelliteModel.current.position);
      if (coneRef.current && satelliteModel.current)
        updateLightCone(coneRef.current, satelliteModel.current.position);
      if (isOverTenerife(positionGd)) {
        (coneRef.current!.material as THREE.MeshBasicMaterial).color.set(
          0x00ff00,
        );
      } else {
        (coneRef.current!.material as THREE.MeshBasicMaterial).color.set(
          0xff0000,
        );
      }
      render();
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = mountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(
        sceneRef.current.children,
        true,
      );
      setHovered(
        intersects.length > 0 &&
          (intersects[0].object.parent?.type === "Group" ||
            intersects[0].object.parent?.type === "Object3D"),
      );
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = mountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(
        sceneRef.current.children,
        true,
      );
      if (
        intersects.length > 0 &&
        (intersects[0].object.parent?.type === "Group" ||
          intersects[0].object.parent?.type === "Object3D")
      ) {
        const gmst = satellite.gstime(new Date());
        const positionAndVelocity = satellite.propagate(satrec, new Date());
        const positionEci =
          positionAndVelocity.position as satellite.EciVec3<number>;
        const velocityEci =
          positionAndVelocity.velocity as satellite.EciVec3<number>;
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const altitude = positionGd.height;
        const velocity = Math.sqrt(
          velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2,
        );
        const nextPassDate = calculateNextPass();
        setNextPass(nextPassDate);

        const satelliteInfo = (
          <div>
            <h3>Satellite Information: TEIDESAT-1</h3>
            <img
              src={cubesatImage}
              alt="Satellite"
              style={{ width: "230px", height: "130px" }}
            />
            <p>
              <strong>Position (Lat, Lon):</strong>
            </p>
            <ul>
              <li>
                Latitude: {(positionGd.latitude * (180 / Math.PI)).toFixed(2)}°
              </li>
              <li>
                Longitude: {(positionGd.longitude * (180 / Math.PI)).toFixed(2)}
                °
              </li>
            </ul>
            <p>
              <strong>Altitude:</strong> {altitude.toFixed(2)} km
            </p>
            <p>
              <strong>Velocity:</strong> {velocity.toFixed(2)} km/s
            </p>
          </div>
        );
        setSatelliteInfo(satelliteInfo);
        if (orbitRef.current) sceneRef.current.remove(orbitRef.current);
        orbitRef.current = addOrbit(sceneRef.current, render);
        if (lineRef.current) lineRef.current.visible = true;
      }
    };

    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerdown", handleMouseDown);

    const handleResize = () => {
      if (cameraRef.current && renderer) {
        if (document.fullscreenElement) {
          renderer.setSize(window.innerWidth, window.innerHeight);
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        } else if (mainContent && cameraRef.current) {
          const width = mainContent.clientWidth;
          const height = mainContent.clientHeight;
          renderer.setSize(width, height);
          cameraRef.current.aspect = width / height;
        }
        cameraRef.current.updateProjectionMatrix();
        render();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerdown", handleMouseDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (satelliteModel.current) {
      satelliteModel.current.scale.set(
        hovered ? 1200 : 1000,
        hovered ? 1200 : 1000,
        hovered ? 1200 : 1000,
      );
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
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const easeInOutQuad = (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

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

          cameraRef.current!.position.lerpVectors(
            startPosition,
            targetPosition,
            easedT,
          );
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
        const direction = new THREE.Vector3()
          .subVectors(pos, center)
          .normalize();
        const distance = 3000;
        const targetPosition = new THREE.Vector3().addVectors(
          pos,
          direction.multiplyScalar(distance),
        );
        const duration = 2000;
        const startPosition = cameraRef.current.position.clone();
        const startTime = performance.now();

        const animateTransition = (time: number) => {
          const elapsed = time - startTime;
          const t = Math.min(elapsed / duration, 1);
          const easedT = easeInOutQuad(t);

          cameraRef.current!.position.lerpVectors(
            startPosition,
            targetPosition,
            easedT,
          );
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
            <button className="close-button" onClick={handleCloseInfo}>
              X
            </button>
            <pre>{satelliteInfo}</pre>
            <h4>Next Pass Over Tenerife:</h4>
            <p>{nextPass ? nextPass.toLocaleString() : "Not available"}</p>
          </motion.div>
        </AnimatePresence>
      )}
      <button className="fullscreen-button" onClick={handleFullscreen}>
        {isFullscreen ? "Exit" : "⛶"}
      </button>
      <button className="toggle-view-button" onClick={handleToggleView}>
        {isEarthView ? "🛰️ View" : "🌎 View"}
      </button>
    </div>
  );
};

export default Orbit;
