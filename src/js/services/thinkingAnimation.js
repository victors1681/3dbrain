/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["bubbles"] }] */
import * as THREE from 'three';
import { Power1, TweenMax } from 'gsap';
import _ from 'lodash';
import flashingV from '../shaders/flashing.vert';
import flashingF from '../shaders/flashing.frag';
import flashingCoordinates from '../data/flashingCoordinates.json';

class ThinkingAnimation {
    constructor(mainBrain) {
        this.mainBrain = mainBrain;
        this.isFlashing = false;
        this.memorySelected = mainBrain.memorySelected;
    }


    getLoadingPosition(memories) {
        const loadingPosition = [];

        this.memorySelected.forEach((m) => {
            const memory = memories[m][0].attributes.position.array;
            const randomPos = THREE.Math.randInt(0, (memory.length / 3) - 4);

            const x = memory[(randomPos * 3) + 0] || 0;
            const y = memory[(randomPos * 3) + 1] || 0;
            const z = memory[(randomPos * 3) + 2] || 0;

            loadingPosition.push(x, y, z, 1.0);
        });
        return loadingPosition;
    }

    initAnimation() {
        const { scene, camera, memories } = this.mainBrain;

        const particles = 10;
        const geometry = new THREE.BufferGeometry();
        const sizes = [];
        const positions = [];
        const colors = [];
        const delay = [];
        const duration = 2.5;
        const maxPointDelay = 1.5;

        Object.keys(flashingCoordinates).forEach((memory, index) => {
            const light = flashingCoordinates[memory]

            positions.push(light.x, light.y, light.z);

            sizes[index] = light.size;

            delay[(index * 2) + 0] = THREE.Math.randFloat(0.5, maxPointDelay);
            delay[(index * 2) + 1] = duration;
        });

        geometry.addAttribute('aDelayDuration', new THREE.Float32Attribute(delay, 2));
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.computeBoundingSphere();
        const customMaterial = new THREE.ShaderMaterial({
            uniforms:
                {
                    c: { type: 'f', value: 0.9 },
                    p: { type: 'f', value: 2.8 },
                    glowColor: { type: 'c', value: new THREE.Color(0x2C3E93) },
                    viewVector: { type: 'v3', value: camera.position },
                    uTime: { type: 'f', value: 0.0 },
                    uFadeTime: { type: 'f', value: 0.0 },
                    uMouse: { type: 'f', value: new THREE.Vector2(0.0) },
                },
            vertexShader: flashingV,
            fragmentShader: flashingF,
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: true,
            transparent: true,

        });
        this.flashing = new THREE.Points(geometry, customMaterial);
        this.flashing.name = 'flashing';
        scene.add(this.flashing);
        console.log(this.flashing);
    }

    updateSubSystem(subsystemPayload) {
        this.bubbles.geometry.attributes.bubbles.needsUpdate = false;
        const cameraPos = this.mainBrain.camera.position;
        const { target } = this.mainBrain.orbitControls;
        const bubblesAttr = this.bubbles.geometry.attributes.bubbles.array;
        const progress = { p: 1.0 };

        this.mainBrain.font.removeText();
        TweenMax.fromTo(progress, 2.5, { p: 1.0 }, {
            p: 0.0,
            ease: Power1.easeInOut,
            onUpdate: () => {
                this.updateBurbleUp(progress.p);
                this.mainBrain.orbitControls.target.set(target.x, target.y - progress.p, target.z);
                this.mainBrain.camera.position.set(cameraPos.x, cameraPos.y - progress.p, cameraPos.z);
            },
            onComplete: () => {
                this.getBubblesSelected(bubblesAttr, subsystemPayload);
                this.flashing.geometry.attributes.flashing.needsUpdate = true;
                this.animate(true);
            },
        });
    }

    update(camera, delta) {
        this.flashing.material.uniforms.viewVector.value =
            new THREE.Vector3().subVectors(camera.position, this.flashing.position);
        this.flashing.material.uniforms.uTime.value = delta;
    }
    isActive(val) {
        if (val) {
            const progress = { p: 0.0 };
            TweenMax.fromTo(progress, 2.5, { p: 0.0 }, {
                p: 1.0,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    this.flashing.material.uniforms.uFadeTime.value = progress.p;
                    this.isFlashing = true;
                },
            });
        } else {
            const progress = { p: 1.0 };
            TweenMax.fromTo(progress, 2.5, { p: 1.0 }, {
                p: 0.0,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    this.flashing.material.uniforms.uFadeTime.value = progress.p;
                    this.isFlashing = false;
                },
            });
        }
    }
    updateMouse(coordinates) {
        this.flashing.material.uniforms.uMouse.value = coordinates;
    }

    flashingAnimation(isActive) {
        this.flashing.material.uniforms.uIsFlashing.value = isActive;

        if (isActive) {
            const progress = { p: 0.0 };
            TweenMax.fromTo(progress, 2.5, { p: 0.0 }, {
                p: 1.0,
                ease: Power1.easeInOut,
                onUpdate: (value) => {
                    this.flashing.material.uniforms.uFlashingAlpha.value = progress.p;
                    this.isFlashing = true;
                },
            });
        } else {
            const progress = { p: 1.0 };
            TweenMax.fromTo(progress, 2.5, { p: 1.0 }, {
                p: 0.0,
                ease: Power1.easeInOut,
                onUpdate: (value) => {
                    this.flashing.material.uniforms.uFlashingAlpha.value = progress.p;
                    this.isFlashing = false;
                },
            });
        }
    }

    animate(isActive) {
        const cameraPos = this.mainBrain.camera.position;
        const { target } = this.mainBrain.orbitControls;
        if (!this.isFlashing) {
            this.flashingAnimation(true);
        }
        if (isActive) {
            const progress = { p: 0.0 };
            TweenMax.fromTo(progress, 2.5, { p: 0.0 }, {
                p: 1.0,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    this.updateBurbleUp(progress.p);
                    this.mainBrain.orbitControls.target.set(target.x, target.y + progress.p, target.z);
                    this.mainBrain.camera.position.set(cameraPos.x, cameraPos.y + progress.p, cameraPos.z);
                },
            });
        } else {
            const progress = { p: 1.0 };
            TweenMax.fromTo(progress, 2.5, { p: 1.0 }, {
                p: 0.0,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    this.updateBurbleUp(progress.p);
                    this.mainBrain.orbitControls.target.set(target.x, target.y - progress.p, target.z);
                    this.mainBrain.camera.position.set(cameraPos.x, cameraPos.y - progress.p, cameraPos.z);
                },
            });
        }
    }
}

export default ThinkingAnimation;
