/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["bubbles"] }] */
import * as THREE from 'three';
import { Power1, TweenMax, Power2 } from 'gsap';
import _ from 'lodash';
import flashingV from '../shaders/flashing.vert';
import flashingF from '../shaders/flashing.frag';
import flashingCoordinates from '../data/flashingCoordinates.json';

class ThinkingAnimation {
    constructor(mainBrain) {
        this.mainBrain = mainBrain;
        this.isFlashing = false;
        this.memorySelected = mainBrain.memorySelected;
        this.alphaAnimation = { v: 0.0 };
        this.secuenceAnimation = 0;
    }

    initAnimation() {
        const { scene, camera } = this.mainBrain;

        const particles = 10;
        const geometry = new THREE.BufferGeometry();
        const sizes = [];
        const positions = [];
        const colors = [];
        const delay = [];
        const duration = 2.5;
        const maxPointDelay = 1.5;

        Object.keys(flashingCoordinates).forEach((memory, index) => {
            const light = flashingCoordinates[memory];

            positions.push(light.x, light.y, light.z);

            sizes[index] = light.size;

            delay[index * 2 + 0] = THREE.Math.randFloat(0.5, maxPointDelay);
            delay[index * 2 + 1] = duration;
        });

        geometry.addAttribute(
            'aDelayDuration',
            new THREE.Float32BufferAttribute(delay, 2),
        );
        geometry.addAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3),
        );
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.computeBoundingSphere();
        const customMaterial = new THREE.ShaderMaterial({
            uniforms: {
                c: { type: 'f', value: 0.9 },
                p: { type: 'f', value: 2.8 },
                glowColor: { type: 'c', value: new THREE.Color(0x2c3e93) },
                viewVector: { type: 'v3', value: camera.position },
                uTime: { type: 'f', value: 0.0 },
                uFadeTime: { type: 'f', value: 0.0 },
                uMouse: { type: 'f', value: new THREE.Vector2(0.0) },
                isCustomAlpha: { type: 'b', value: false },
                uAlpha: { type: 'float', value: 0.0 },
                uResolution: {
                    type: 'v2',
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
                },
            },
            vertexShader: flashingV,
            fragmentShader: flashingF,
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthTest: false,
            transparent: true,
        });
        this.flashing = new THREE.Points(geometry, customMaterial);
        this.flashing.name = 'flashing';
        scene.add(this.flashing);
    }

    animationCamera(val) {
        this.mainBrain.isRecording = false;
        // this.isActive(true);
        this.flashing.material.uniforms.uFadeTime.value = 1;
        this.isFlashing = true;

        if (this.alphaAnimation.v === 0.0) {
            TweenMax.fromTo(
                this.alphaAnimation,
                2.5,
                { v: 0.0 },
                {
                    v: 1.0,
                    ease: Power1.easeInOut,
                    onStart: () => {
                        this.selectMemoryThinking(val);
                    },
                    onUpdate: () => {
                        this.flashing.material.uniforms.uAlpha.value = this.alphaAnimation.v;
                    },
                },
            );
        } else {
            TweenMax.fromTo(
                this.alphaAnimation,
                1.0,
                { v: 1.0 },
                {
                    v: 0.0,
                    ease: Power1.easeInOut,
                    onUpdate: () => {
                        this.flashing.material.uniforms.uAlpha.value = this.alphaAnimation.v;
                    },
                    onComplete: () => {
                        this.thinkingFadeIn(val);
                    },
                },
            );
        }

        this.flashing.geometry.setDrawRange(0, 1);
    }

    selectMemoryThinking(val) {
        const lights = Object.keys(flashingCoordinates);
        const light = lights[Math.floor(val)];

        const locations = flashingCoordinates[light];
        if (!locations) {
            return;
        }

        const positions = this.flashing.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 1) {
            positions[i * 3] = locations.x;
            positions[i * 3 + 1] = locations.y;
            positions[i * 3 + 2] = locations.z;
        }

        this.flashing.material.uniforms.isCustomAlpha.value = true;

        const { camera } = this.mainBrain;

        const cameraPos = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
        };

        TweenMax.fromTo(
            cameraPos,
            1.5,
            { x: cameraPos.x, y: cameraPos.y, z: cameraPos.z },
            {
                x: locations.camera.x,
                y: locations.camera.y,
                z: locations.camera.z,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    camera.position.x = cameraPos.x;
                    camera.position.y = cameraPos.y;
                    camera.position.z = cameraPos.z;
                },
                onComplete: () => {
                    this.secuenceAnimation += 1;
                    this.animationCamera(this.secuenceAnimation);
                },
            },
        );
    }

    thinkingFadeIn(val) {
        TweenMax.fromTo(
            this.alphaAnimation,
            2.5,
            { v: 0.0 },
            {
                v: 1.0,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    this.flashing.material.uniforms.uAlpha.value = this.alphaAnimation.v;
                },
                onStart: () => {
                    this.selectMemoryThinking(val);
                },
            },
        );
    }

    updateSubSystem(subsystemPayload) {
        this.bubbles.geometry.attributes.bubbles.needsUpdate = false;
        const cameraPos = this.mainBrain.camera.position;
        const { target } = this.mainBrain.orbitControls;
        const bubblesAttr = this.bubbles.geometry.attributes.bubbles.array;
        const progress = { p: 1.0 };

        this.mainBrain.font.removeText();
        TweenMax.fromTo(
            progress,
            2.5,
            { p: 1.0 },
            {
                p: 0.0,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    this.updateBurbleUp(progress.p);
                    this.mainBrain.orbitControls.target.set(
                        target.x,
                        target.y - progress.p,
                        target.z,
                    );
                    this.mainBrain.camera.position.set(
                        cameraPos.x,
                        cameraPos.y - progress.p,
                        cameraPos.z,
                    );
                },
                onComplete: () => {
                    this.getBubblesSelected(bubblesAttr, subsystemPayload);
                    this.flashing.geometry.attributes.flashing.needsUpdate = true;
                    this.animate(true);
                },
            },
        );
    }

    update(camera, delta) {
        this.flashing.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
            camera.position,
            this.flashing.position,
        );
        this.flashing.material.uniforms.uTime.value = delta;
    }
    isActive(val) {
        if (val) {
            const progress = { p: 0.0 };
            TweenMax.fromTo(
                progress,
                2.5,
                { p: 0.0 },
                {
                    p: 1.0,
                    ease: Power1.easeInOut,
                    onUpdate: () => {
                        this.flashing.material.uniforms.uFadeTime.value = progress.p;
                        this.isFlashing = true;
                    },
                },
            );
        } else {
            const progress = { p: 1.0 };
            TweenMax.fromTo(
                progress,
                2.5,
                { p: 1.0 },
                {
                    p: 0.0,
                    ease: Power1.easeInOut,
                    onUpdate: () => {
                        this.flashing.material.uniforms.uFadeTime.value = progress.p;
                        this.isFlashing = false;
                    },
                },
            );
        }
    }
    updateMouse(coordinates) {
        this.flashing.material.uniforms.uMouse.value = coordinates;
    }

    flashingAnimation(isActive) {
        this.flashing.material.uniforms.uIsFlashing.value = isActive;

        if (isActive) {
            const progress = { p: 0.0 };
            TweenMax.fromTo(
                progress,
                2.5,
                { p: 0.0 },
                {
                    p: 1.0,
                    ease: Power1.easeInOut,
                    onUpdate: (value) => {
                        this.flashing.material.uniforms.uFlashingAlpha.value = progress.p;
                        this.isFlashing = true;
                    },
                },
            );
        } else {
            const progress = { p: 1.0 };
            TweenMax.fromTo(
                progress,
                2.5,
                { p: 1.0 },
                {
                    p: 0.0,
                    ease: Power1.easeInOut,
                    onUpdate: (value) => {
                        this.flashing.material.uniforms.uFlashingAlpha.value = progress.p;
                        this.isFlashing = false;
                    },
                },
            );
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
            TweenMax.fromTo(
                progress,
                2.5,
                { p: 0.0 },
                {
                    p: 1.0,
                    ease: Power1.easeInOut,
                    onUpdate: () => {
                        this.updateBurbleUp(progress.p);
                        this.mainBrain.orbitControls.target.set(
                            target.x,
                            target.y + progress.p,
                            target.z,
                        );
                        this.mainBrain.camera.position.set(
                            cameraPos.x,
                            cameraPos.y + progress.p,
                            cameraPos.z,
                        );
                    },
                },
            );
        } else {
            const progress = { p: 1.0 };
            TweenMax.fromTo(
                progress,
                2.5,
                { p: 1.0 },
                {
                    p: 0.0,
                    ease: Power1.easeInOut,
                    onUpdate: () => {
                        this.updateBurbleUp(progress.p);
                        this.mainBrain.orbitControls.target.set(
                            target.x,
                            target.y - progress.p,
                            target.z,
                        );
                        this.mainBrain.camera.position.set(
                            cameraPos.x,
                            cameraPos.y - progress.p,
                            cameraPos.z,
                        );
                    },
                },
            );
        }
    }
}

export default ThinkingAnimation;
