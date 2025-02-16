import React, { FC, useEffect, useRef, useState } from "react";
import "./Orbit.css";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as satellite from 'satellite.js';
import earthmap from '../../../../assets/earthmap-high4k.jpg';
import cubesatTexture from '../../../../assets/cubesat.png';
import cubesatImage from '../../../../assets/teidesatCube.png';
import circle from '../../../../assets/circle.png';

// simulated TLE data for TEIDESAT-1
const tleLine1 = '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992';
const tleLine2 = '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442';

// Constants
const MinutesPerDay = 1440;
const ixpdotp = MinutesPerDay / (2.0 * 3.141592654);
const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
const earthRadius = 6371;
const raycaster = new THREE.Raycaster();

// Creation Functions
const createScene = () => new THREE.Scene();

const createRenderer = (width: number, height: number) => {
  const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, antialias: true });
  //renderer.setClearColor(new THREE.Color(defaultOptions.backgroundColor));
  renderer.setSize(width, height);
  return renderer;
};

const createCamera = (width: number, height: number) => {
  const NEAR = 1e-6, FAR = 1e27;
  const camera = new THREE.PerspectiveCamera(54, width / height, NEAR, FAR);
  camera.position.set(15000, 0, -15000);
  camera.lookAt(0, 0, 0);
  return camera;
};

const createControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, render: () => void) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.addEventListener('change', render);
  return controls;
};

const createLighting = (scene: THREE.Scene) => {
  const sun = new THREE.DirectionalLight(0xffffff, 5);
  sun.position.set(0, 59333894, -137112541);
  scene.add(sun, new THREE.AmbientLight());
};

const createEarth = (scene: THREE.Scene, render: () => void) => {
  const textLoader = new THREE.TextureLoader();
  const geometry = new THREE.SphereGeometry(earthRadius, 50, 50);
  const material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, map: textLoader.load(earthmap, render) });
  const earthMesh = new THREE.Mesh(geometry, material);
  scene.add(earthMesh);
};

const createSatelliteSprite = (texturePath: string, render: () => void) => {
  const texture = new THREE.TextureLoader().load(texturePath, render);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(300, 300, 1);
  return sprite;
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
    if (positionEci) points.push(new THREE.Vector3(positionEci.x, positionEci.y, positionEci.z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const orbitCurve = new THREE.Line(geometry, orbitMaterial);
  scene.add(orbitCurve);
  render();
  return orbitCurve;
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

// Principal component
const Orbit: FC = () => {

  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const satelliteSpriteRef = useRef<THREE.Sprite | null>(null);
  const orbitRef = useRef<THREE.Line | null>(null);
  const [satelliteInfo, setSatelliteInfo] = useState<JSX.Element | null>(null);
  const [hovered, setHovered] = useState<boolean>(false);

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

    createControls(camera, renderer, render);
    createLighting(scene);
    createEarth(scene, render);
    scene.add(getStarfield());
    const satelliteSprite = createSatelliteSprite(cubesatTexture, render);
    satelliteSpriteRef.current = satelliteSprite;
    scene.add(satelliteSprite);

    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      const positionEci = satellite.propagate(satrec, new Date()).position as satellite.EciVec3<number>;
      if (satelliteSpriteRef.current) satelliteSpriteRef.current.position.set(positionEci.x, positionEci.y, positionEci.z);
      render();
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = mountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      setHovered(intersects.length > 0 && intersects[0].object === satelliteSpriteRef.current);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = mountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0 && intersects[0].object === satelliteSpriteRef.current) {
        const gmst = satellite.gstime(new Date());
        const positionAndVelocity = satellite.propagate(satrec, new Date());
        const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
        const velocityEci = positionAndVelocity.velocity as satellite.EciVec3<number>;
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const altitude = positionGd.height;
        const velocity = Math.sqrt(velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2);

        const satelliteInfo = (
          <div>
            <h3>Satellite Information: TEIDESAT-1</h3>
            <img src={cubesatImage} alt="Satellite" style={{ width: '150px', height: '100px' }} />
            <p><strong>Inclination:</strong> {satrec.inclo.toFixed(2)}°</p>
            <p><strong>Eccentricity:</strong> {satrec.ecco.toFixed(4)}</p>
            <p><strong>RAAN:</strong> {satrec.nodeo.toFixed(2)}°</p>
            <p><strong>Argument of Perigee:</strong> {satrec.argpo.toFixed(2)}°</p>
            <p><strong>Mean Anomaly:</strong> {satrec.mo.toFixed(2)}°</p>
            <p><strong>Mean Motion:</strong> {satrec.no.toFixed(4)} revs/day</p>
            <p><strong>Position (ECI):</strong> x: {positionEci.x.toFixed(2)} km, y: {positionEci.y.toFixed(2)} km, z: {positionEci.z.toFixed(2)} km</p>
            <p><strong>Altitude:</strong> {altitude.toFixed(2)} km</p>
            <p><strong>Velocity:</strong> {velocity.toFixed(2)} km/s</p>
          </div>
        );
        setSatelliteInfo(satelliteInfo);
        if (orbitRef.current) sceneRef.current.remove(orbitRef.current);
        orbitRef.current = addOrbit(sceneRef.current, render);
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
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);

    };
  }, []);

  useEffect(() => {
    if (satelliteSpriteRef.current) {
      satelliteSpriteRef.current.material.color.set(hovered ? 0xffff00 : 0xffffff);
    }
  }, [hovered]);

  const handleCloseInfo = () => {
    setSatelliteInfo(null);
    if (orbitRef.current && sceneRef.current) {
      sceneRef.current.remove(orbitRef.current);
      orbitRef.current = null;
    }
  };

  const handleCenterSatellite = () => {
    if (cameraRef.current && satelliteSpriteRef.current) {
      const pos = satelliteSpriteRef.current.position;
      const center = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3().subVectors(pos, center).normalize();
      const distance = 3000;
      const newPos = new THREE.Vector3().addVectors(pos, direction.multiplyScalar(distance));
      cameraRef.current.position.copy(newPos);
      cameraRef.current.lookAt(pos);
    }
  };

  const handleFullscreen = () => {
    if (mountRef.current) {
      if (mountRef.current.requestFullscreen) {
        mountRef.current.requestFullscreen();
      }
    };
  };

  return (
    <div className="Orbit" ref={mountRef}>
      {satelliteInfo && (
        <div className="satellite-info">
          <button className="close-button" onClick={handleCloseInfo}>X</button>
          <pre>{satelliteInfo}</pre>
        </div>
      )}
      <button className="center-button" onClick={handleCenterSatellite}>Center Satellite 📍</button>
      <button className="fullscreen-button" onClick={handleFullscreen}>⛶</button>
    </div>
  );
};

export default Orbit;