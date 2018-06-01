import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import Stats from 'three/examples/js/libs/stats.min';
import { EffectComposer, GlitchPass, BlurPass, RenderPass } from 'postprocessing';

class AbstractApplication {
    constructor() {
        this.a_camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        this.a_camera.position.z = 500;
        // this.ambienColor = '#E7EBF3'

        this.a_scene = new THREE.Scene();
        this.a_scene.background = new THREE.Color('#C7D0E2');
        // this.a_scene.fog = new THREE.Fog(0xcce0ff, 100, 10000)
        this.a_scene.fog = new THREE.Fog(0xC7D0E2, 300, 1300);

        this.a_renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.a_renderer.setPixelRatio(window.devicePixelRatio);
        this.a_renderer.setSize(window.innerWidth, window.innerHeight);
        this.a_renderer.sortObjects = false;
        this.a_renderer.setClearColor(0x00000, 0.0);

        this.a_renderer.shadowMap.enabled = true;
        this.a_renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.a_renderer.gammaInput = true;
        this.a_renderer.gammaOutput = true;

        this.composer = new EffectComposer(this.a_renderer);
        this.composer.addPass(new RenderPass(this.a_scene, this.a_camera));

        const pass = new GlitchPass();
        pass.renderToScreen = true;
        this.composer.addPass(pass);

        document.body.appendChild(this.a_renderer.domElement);

        this.stats = AbstractApplication.initStats(document.body);

        this.orbitControls = new THREE.OrbitControls(this.a_camera, this.a_renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.25;
        this.orbitControls.enableZoom = true;
        this.orbitControls.zoomSpeed = 0.1;
        this.orbitControls.panSpeed = 0.1;
        this.orbitControls.minDistance = 500;
        this.orbitControls.maxDistance = 700;
        this.orbitControls.autoRotate = true;
        this.orbitControls.autoRotateSpeed = 1.0;
        this.orbitControls.rotateSpeed = 0.1;
        this.orbitControls.screenSpacePanning = true;

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    }

    get renderer() {
        return this.a_renderer;
    }

    get camera() {
        return this.a_camera;
    }

    get scene() {
        return this.a_scene;
    }

    static initStats(render) {
        const stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.tip = '0px';
        render.appendChild(stats.domElement);
        return stats;
    }

    static onMouseMove(e) {}
    onWindowResize() {
        this.a_camera.aspect = window.innerWidth / window.innerHeight;
        this.a_camera.updateProjectionMatrix();

        this.a_renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate(timestamp) {
        requestAnimationFrame(this.animate.bind(this));
        this.a_renderer.render(this.a_scene, this.a_camera);
    }
}

export default AbstractApplication;
