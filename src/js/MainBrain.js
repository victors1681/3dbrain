/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["child", memories] }] */
import * as THREE from "three";
import { Power4, TweenMax } from "gsap";
import "three/examples/js/BufferGeometryUtils";
import AbstractApplication from "./views/AbstractApplication";
import Loaders from "./Loaders/Loaders";
import BubblesAnimation from "./services/bubblesAnimation";
import ThinkingAnimation from "./services/thinkingAnimation";
import GUI from "./services/gui";
import Font from "./services/font";
import ParticleSystem from "./services/particlesSystem";
import Memories from "./data/memories.json";

class MainBrain extends AbstractApplication {
  constructor() {
    super();

    this.clock = new THREE.Clock();
    this.addBrain = this.addBrain.bind(this);
    this.addFloor();
    this.addIllumination();

    this.deltaTime = 0;
    this.particlesColor = new THREE.Color(0xffffff);
    this.particlesStartColor = new THREE.Color(0xffffff);
    this.loaders = new Loaders(this.runAnimation.bind(this));
    this.memories = Memories;
    this.memorySelected = [
      "analytic",
      "episodic",
      "process",
      "semantic",
      "affective",
    ];
    this.frame = 0;
    this.frameName = 0;
    this.isRecording = false;
    setTimeout(() => {
      this.startIntro();
    }, 1000);
  }

  addFloor() {
    const geometry = new THREE.PlaneBufferGeometry(20000, 20000);
    const material = new THREE.MeshPhongMaterial({
      opacity: 0.1,
      transparent: true,
    });
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.receiveShadow = true;
    this.plane.position.y = -160;
    this.plane.rotation.x = -0.5 * Math.PI;
    this.scene.add(this.plane);
  }
  addIllumination() {
    this.ambienlight = new THREE.AmbientLight(0xb8c5cf, 0);
    this.scene.add(this.ambienlight);

    this.spotLight = new THREE.SpotLight(
      0xb8c5cf,
      1.45,
      175,
      Math.PI / 2,
      0.0,
      0.0
    );
    this.spotLight.position.set(0, 500, -10);
    this.spotLight.castShadow = true;

    this.spotLight.castShadow = true;
    this.spotLight.shadow = new THREE.LightShadow(
      new THREE.PerspectiveCamera(
        54,
        window.innerWidth / window.innerHeight,
        1,
        2000
      )
    );
    this.spotLight.shadow.bias = -0.000222;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;

    this.scene.add(this.spotLight);
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
  }

  addBrain() {
    this.brainBufferGeometries = [];

    this.loaders.BRAIN_MODEL.traverse((child) => {
      if (child instanceof THREE.LineSegments) {
        this.memories.lines = {
          ...this.memories.lines,
          ...MainBrain.addLinesPath(child, this.memories),
        };
      }
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      child.geometry.verticesNeedUpdate = true;
      // child.material.map = this.loaders.lightTexture;
      this.brainBufferGeometries.push(child.geometry);

      this.memories = {
        ...this.memories,
        ...MainBrain.storeBrainVertices(child, this.memories),
      };
    });

    this.endPointsCollections = THREE.BufferGeometryUtils.mergeBufferGeometries(
      this.brainBufferGeometries
    );
  }

  startIntro() {
    const progress = { p: 1000 };
    TweenMax.fromTo(
      progress,
      6.5,
      { p: 1000 },
      {
        p: 380,
        ease: Power4.easeInOut,
        onUpdate: () => {
          this.camera.position.z = progress.p;
        },
        onStart: () => {
          this.particlesSystem.transform(true);
        },
        onComplete: () => {
          //hide xray
          this.particlesSystem.xRay.material.uniforms.c.value = 1.0;
          this.startAutoDemo();
        }
      }
    );
  }

  startAutoDemo() {
    let memoryCount = 1;
    this.scene.add(this.particlesSystem.xRay);
    let memoryTimer;
    const me = this;
    setTimeout(() => {
      //enable xRay Animation
      this.particlesSystem.isXRayActive(true);
      setTimeout(() => {
        //remove animation
        this.particlesSystem.isXRayActive(false);
        //Enable Memories
        memoryTimer = setInterval(() => {
          if (memoryCount < 5) {
            this.bubblesAnimation.updateSubSystem(memoryCount);
            memoryCount += 1;
          } else {
            this.bubblesAnimation.updateSubSystem(0);
            clearInterval(memoryTimer);
          }
        }, 9000);
      }, 4000);
    }, 2000);
  }

  static addLinesPath(mesh, memories) {
    const keys = Object.keys(memories.lines);
    keys.map((l) => {
      if (mesh.name.includes(l)) {
        memories.lines[l] = mesh.geometry.attributes.position.array;
        return memories.lines;
      }
      return [];
    });
  }

  static storeBrainVertices(mesh, memories) {
    const keys = Object.keys(memories);

    keys.map((m) => {
      if (mesh.name.includes(m)) {
        if (memories[m].length) {
          memories[m].push(mesh.geometry);
          memories[m] = [
            THREE.BufferGeometryUtils.mergeBufferGeometries(memories[m]),
          ];
          return memories;
        }
        return memories[m].push(mesh.geometry);
      }
      return [];
    });
  }

  runAnimation() {
    this.gui = new GUI(this);
    this.addBrain();
    this.addParticlesSystem();
    this.font = new Font(this.loaders, this.scene);
    this.bubblesAnimation = new BubblesAnimation(this);
    this.bubblesAnimation.initAnimation();

    this.thinkingAnimation = new ThinkingAnimation(this);
    this.thinkingAnimation.initAnimation();

    // Set Background
    //this.scene.background = this.loaders.assets.get('sky');

    this.animate();
  }

  animate(timestamp) {
    this.orbitControls.update();
    this.orbitControls.autoRotateSpeed = this.gui.controls.rotationSpeed;

    this.deltaTime += this.clock.getDelta();

    this.particlesSystem.update(
      this.deltaTime,
      this.camera,
      this.particlesSystem.xRay
    );
    this.bubblesAnimation.update(this.camera, this.deltaTime);
    this.thinkingAnimation.update(this.camera, this.deltaTime);

    this.stats.update();
    requestAnimationFrame(this.animate.bind(this));

    //this.renderer.render(this.a_scene, this.a_camera);

    this.font.facingToCamera(this.camera);
    this.camera.updateProjectionMatrix();

    this.thinkingAnimation.flashing.geometry.verticesNeedUpdate = true;
    this.thinkingAnimation.flashing.geometry.attributes.position.needsUpdate = true;

    // composer
    this.composer.render();

    if (this.isRecording) {
      if (this.frame > 10) {
        this.socket.emit("render-frame", {
          frame: (this.frameName += 1),
          file: document.querySelector("canvas").toDataURL(),
        });
      }
      this.frame += 1;
    }
  }
  onMouseMove(event) {
    const y = window.innerHeight - event.clientY;
    const x = window.innerHeight - event.clientX;
    //  this.bubblesAnimation.updateMouse(new THREE.Vector2(x, y));
  }
  addParticlesSystem() {
    this.particlesSystem = new ParticleSystem(
      this,
      this.endPointsCollections,
      this.memories
    );
    this.scene.add(this.particlesSystem.particles);
  }

  static getRandomPointOnSphere(r) {
    const u = THREE.Math.randFloat(0, 1);
    const v = THREE.Math.randFloat(0, 1);
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = r * Math.sin(theta) * Math.sin(phi);
    const y = r * Math.cos(theta) * Math.sin(phi);
    const z = r * Math.cos(phi);
    return {
      x,
      y,
      z,
    };
  }
}

export default MainBrain;
