import * as THREE from 'three';
import io from 'socket.io-client';
import 'three/examples/js/controls/OrbitControls';
import Stats from 'three/examples/js/libs/stats.min';
import { EffectComposer, GlitchPass, BlurPass, RenderPass, ShaderPass, SepiaShader, BloomPass, OutlinePass } from 'postprocessing';

class AbstractApplication {
    constructor() {
        this.a_camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        this.a_camera.position.z = 1000;
        // this.ambienColor = '#E7EBF3'

        this.a_scene = new THREE.Scene();
        this.a_scene.background = new THREE.Color('#a7b6d2');
        // this.a_scene.fog = new THREE.Fog(0xcce0ff, 100, 10000)
        this.a_scene.fog = new THREE.Fog(0xa7b6d2, 300, 1300);

        this.a_renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
        this.a_renderer.setPixelRatio(window.devicePixelRatio);
        this.a_renderer.setSize(window.innerWidth, window.innerHeight);
        this.a_renderer.sortObjects = false;
        this.a_renderer.setClearColor(0x00000, 0.0);

        this.a_renderer.shadowMap.enabled = true;
        this.a_renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.a_renderer.gammaInput = true;
        this.a_renderer.gammaOutput = true;
        this.a_renderer.shadowDepthMaterialSide = THREE.BackSide;

        this.composer = new EffectComposer(this.a_renderer);

        //PASSES
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);



        //this.glitchPass = new GlitchPass();
        //this.composer.addPass(this.glitchPass);
        //this.glitchPass.renderToScreen = true;

        //this.filmPass = new FilmPass();
        //this.composer.addPass(this.filmPass);

        // this.blurPass = new BlurPass();
        // this.composer.addPass(this.blurPass);

        this.bloomPass = new BloomPass({
            resolutionScale: 0.7,
            resolution: 1.5,
            intensity: 2.2,
            distinction: 7.0,
            blend: true,
        });

        this.composer.addPass(this.bloomPass);
        this.bloomPass.renderToScreen = true;



        document.body.appendChild(this.a_renderer.domElement);

        this.stats = AbstractApplication.initStats(document.body);

        this.orbitControls = new THREE.OrbitControls(this.a_camera, this.a_renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.25;
        this.orbitControls.enableZoom = true;
        this.orbitControls.zoomSpeed = 0.1;
        this.orbitControls.panSpeed = 0.1;
        this.orbitControls.minDistance = 50;
        this.orbitControls.maxDistance = 2500;
        this.orbitControls.autoRotate = false;
        this.orbitControls.autoRotateSpeed = 1.0;
        this.orbitControls.rotateSpeed = 0.1;
        this.orbitControls.screenSpacePanning = true;

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);


        this.socket = io('http://localhost:3000');

        console.log('init');

        this.socket.on('connect', this.onConnect);
    }

    onConnect() {
        console.log(`connect ${this.socket}`);
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
