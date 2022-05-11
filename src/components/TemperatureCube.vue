<template>
  <div id="container" style="height: 100%"></div>
</template>

<script>
import * as Three from "three";
import TrackballControls from "three-trackballcontrols";

let scene = new Three.Scene();
let camera;
let renderer;
// let mesh;
let ambientLight;
let directionalLight;
let controls;

export default {
  name: "FaceSensorMap",
  data() {
    return {};
  },
  methods: {
    init: function () {
      let container = document.getElementById("container");
      camera = new Three.PerspectiveCamera(
        70,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.z = 20;
      renderer = new Three.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
      controls = new TrackballControls(camera, renderer.domElement);

      // Scene background
      const spaceTexture = new Three.TextureLoader().load(
        require("@/assets/images/background.png")
      );
      scene.background = spaceTexture;

      // -------------------- LIGHTS --------------------
      ambientLight = new Three.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      directionalLight = new Three.DirectionalLight(0xfafafa, 0.5);
      directionalLight.position.set(0, 10, 10);
      scene.add(directionalLight);

      // -------------------- BOX --------------------
      // Temperature Map
      let geometryBox = new Three.BoxGeometry(8, 8, 8);
      let facesOfBox = [];
      for (let i = 1; i <= 6; i++) {
        const uvTexture = new Three.TextureLoader().load(
          require("@/assets/images/textures/texture" + i + ".png")
        );
        facesOfBox.push(
          new Three.MeshStandardMaterial({
            map: uvTexture,
          })
        );
      }
      const boxm0 = new Three.Mesh(geometryBox, facesOfBox);
      boxm0.position.x = 0;
      boxm0.position.y = 0;
      boxm0.rotation.z = Math.PI / 4;
      boxm0.rotation.y = Math.PI / 3;
      scene.add(boxm0);
    },
    animate: function () {
      requestAnimationFrame(this.animate);
      controls.update();
      renderer.render(scene, camera);
    },
  },
  mounted() {
    this.init();
    this.animate();
  },
};
</script>
<style scoped></style>
