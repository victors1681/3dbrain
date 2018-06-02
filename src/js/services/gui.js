import * as THREE from 'three';
import { Power1, Back, TweenMax } from 'gsap';
import * as dat from 'three/examples/js/libs/dat.gui.min';
import testPayload from '../data/testPayload';

class GUI {
    constructor(props) {
        this.initGui(props);
    }

    initGui(props) {
        const mainBrain = props;
        this.controls = new function c() {
            this.rotationSpeed = 0.5;

            this.floor = 0xDDE3E9;
            this.transitioning = false;
            this.autoRotate = true;
            this.lightIntensity = 1.45;
            this.lightDistance = 175;

            this.lightHelper = false;
            this.angle = 1.0;
            this.uBurbleUp = 0.0;
            this.burbleProgress = 0.1;

            this.showBubbles = false;
            this.particleGlow = 0xDDE3E9;
            this.memory = 1;
            this.thinking = false;
            this.startIntro = false;
        }();

        const gui = new dat.GUI();
        gui.add(this.controls, 'rotationSpeed', 0.1, 2.0);
        gui.add(this.controls, 'autoRotate').onChange((val) => {
            mainBrain.orbitControls.autoRotate = val;
        });

        gui.add(this.controls, 'lightIntensity', 0.0, 2.0).onChange((val) => {
            this.spotLight.intensity = val;
        });

        gui.add(this.controls, 'lightHelper').onChange((val) => {
            if (val) {
                this.scene.add(this.spotLightHelper);
            } else {
                this.scene.remove(this.spotLightHelper);
            }
        });
        gui.add(this.controls, 'lightDistance', 0.0, 1800.0).onChange((val) => {
            this.spotLight.position.set(0, val, -10);
        });

        gui.add(this.controls, 'uBurbleUp', 0.0, 1.0).onChange((val) => {
            mainBrain.bubblesAnimation.updateBurbleUp(val);
        });

        gui.add(this.controls, 'memory', 0, 4).onChange((val) => {
            // mainBrain.bubblesAnimation.initAnimation(mainBrain.bubblesAnimation.memorySelected[ Math.floor(val) ])
            mainBrain.bubblesAnimation.updateSubSystem(testPayload);
        });

        gui.addColor(this.controls, 'particleGlow').onChange((e) => { mainBrain.material.uniforms.uBackColor.value = new THREE.Color(e); });

        gui.addColor(this.controls, 'floor').onChange((e) => {
            console.log(this.plane.material.color);
            mainBrain.plane.material.color = new THREE.Color(e);
        });

        gui.add(this.controls, 'burbleProgress', 0.0, 1.0).onChange((val) => {
            mainBrain.bubblesAnimation.updateBurbleUp(val);
        });

        gui.add(this.controls, 'showBubbles').onChange((val) => {
            mainBrain.bubblesAnimation.animate(val);
        });

        gui.add(this.controls, 'startIntro').onChange((val) => {
            mainBrain.startIntro(val);
        });

        gui.add(this.controls, 'thinking').onChange((e) => { mainBrain.thinkingAnimation.isActive(e); });

        gui.add(this.controls, 'transitioning').onChange((e) => {
            if (e) {
                const progress = { p: 0.0 };
                TweenMax.fromTo(progress, 2.0, { p: 0.0 }, {
                    p: 1.5,
                    ease: Power1.easeIn,
                    onUpdate: (value) => {
                        mainBrain.particlesSystem.updateTransitioning(progress.p);
                    },
                });
            } else {
                const progress = { p: 1.0 };
                TweenMax.fromTo(progress, 2.0, { p: 1.0 }, {
                    p: 0.5,
                    ease: Power1.easeIn,
                    onUpdate: (value) => {
                        mainBrain.particlesSystem.updateTransitioning(progress.p);
                    },
                });
            }
            // return this.material.uniforms['test'].value = e
        });
    }
}

export default GUI;
