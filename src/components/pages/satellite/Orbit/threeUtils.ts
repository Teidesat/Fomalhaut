import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EARTH_RADIUS } from './constants/index';
import earthmap from '../../../../assets/earthmap-high4k.jpg';
import circle from '../../../../assets/circle.png';

export const createScene = () => new THREE.Scene();

export const createRenderer = (width: number, height: number) => {
  const renderer = new THREE.WebGLRenderer({ 
    logarithmicDepthBuffer: true, 
    antialias: true 
  });
  renderer.setSize(width, height);
  return renderer;
};

export const createCamera = (width: number, height: number) => {
  const camera = new THREE.PerspectiveCamera(60, width / height, 1e-6, 1e27);
  camera.position.set(20000, 0, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  return camera;
};

export const createControls = (
  camera: THREE.PerspectiveCamera, 
  renderer: THREE.WebGLRenderer, 
  render: () => void
) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.addEventListener('change', render);
  return controls;
};

export const createLighting = (scene: THREE.Scene) => {
    const sun = new THREE.DirectionalLight(0xffffff, 4);
    sun.position.set(0, 1000000, 500000);
    scene.add(sun, new THREE.AmbientLight());
};

export const createEarth = (scene: THREE.Scene, render: () => void) => {
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 50, 50);
  const material = new THREE.MeshPhongMaterial({ 
    side: THREE.DoubleSide, 
    map: loader.load(earthmap, render) 
  });
  const earth = new THREE.Mesh(geometry, material);
  earth.rotation.x = Math.PI / 2;
  scene.add(earth);
};

export function getStarfield({ numStars = 1000 } = {}) {
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

  