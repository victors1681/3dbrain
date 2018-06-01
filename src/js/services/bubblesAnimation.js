/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["bubbles"] }] */
import * as THREE from 'three';
import { Power1, TweenMax } from 'gsap';
import _ from 'lodash';
import glowVertex from '../shaders/glow.vert';
import glowFrag from '../shaders/glow.frag';

class BubblesAnimation {
    constructor(mainBrain) {
        this.mainBrain = mainBrain;
        this.isFlashing = false;
        this.memorySelected = mainBrain.memorySelected;
    }

    /**
     * memories //Array of 3 positions x y z
     * @param bubbles
     * @returns {Array} of 4 positions x y z w when 'w' is the selector bubble 2.0 = memory and 3.0 = winner
     */
    getBubblesSelected(bubbles, subsystem) {
        const { memories } = this.mainBrain;
        const bubbleList = [];
        this.memorySelected.forEach((m) => {
            const memory = memories[m][0].attributes.position.array;
            const randomPos = THREE.Math.randInt(0, (memory.length / 3) - 4);

            const x = memory[(randomPos * 3) + 0] || 0;
            const y = memory[(randomPos * 3) + 1] || 0;
            const z = memory[(randomPos * 3) + 2] || 0;

            const altitude = THREE.Math.randInt(150, 190);
            const parent = this.mainBrain.particlesSystem.particles;

            this.mainBrain.font.makeTextSprite(_.capitalize(m), parent, new THREE.Vector3(x, altitude - 15, z), 4);

            bubbleList.push(x, altitude, z, 2.0); // w = 2.0 for select biggest bubbles
        });

        // Inject bubbles selected in to the all flashing bubbles replace the older one
        let memoryPos = 0;
        for (let i = 0; i < bubbles.length / 4; i += 1) {
            const w = bubbles[(i * 4) + 3] || 0;

            // Reset old position
            if (w === 2.0 || w === 3.0) {
                if (memoryPos < bubbleList.length / 4) {
                    bubbles[(i * 4) + 0] = bubbleList[(memoryPos * 4) + 0];
                    bubbles[(i * 4) + 1] = bubbleList[(memoryPos * 4) + 1];
                    bubbles[(i * 4) + 2] = bubbleList[(memoryPos * 4) + 2];
                    memoryPos += 1;
                }
            }
        }
        return bubbleList;
    }


    initAnimation() {
        const { scene, camera, memories } = this.mainBrain;

        const particles = 100000;
        const geometry = new THREE.BufferGeometry();
        const sizes = [];
        const positions = [];
        const colors = [];
        const delay = [];
        const duration = 2.5;
        const maxPointDelay = 1.5;
        let bubbles = [];
        const memory = [];

        bubbles = this.getBubblesSelected(bubbles);

        for (let i = 0; i < particles - (this.memorySelected.length * 3); i += 1) {
            const r = THREE.Math.randInt(0, 4);
            const mSelector = this.memorySelected[r];
            const x = memories[mSelector][0].attributes.position.array[(i * 3) + 0] || 0;
            const y = memories[mSelector][0].attributes.position.array[(i * 3) + 1] || 0;
            const z = memories[mSelector][0].attributes.position.array[(i * 3) + 2] || 0;

            positions.push(x, y, z);
            memory.push(x, y, z, r);

            sizes[i] = THREE.Math.randFloat(10.0, 20.0);
            if ((i % 100) === 0) {
                const altitude = THREE.Math.randInt(100, 250) + y;
                bubbles.push(x, altitude, z, 1.0);
            } else {
                bubbles.push(x, y, z, 0.0);
            }

            delay[(i * 2) + 0] = THREE.Math.randFloat(0.5, maxPointDelay);
            delay[(i * 2) + 1] = duration;
        }

        geometry.addAttribute('aDelayDuration', new THREE.Float32Attribute(delay, 2));
        geometry.addAttribute('bubbles', new THREE.Float32Attribute(bubbles, 4));
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.addAttribute('aMemory', new THREE.Float32BufferAttribute(memory, 4));
        geometry.computeBoundingSphere();
        const customMaterial = new THREE.ShaderMaterial({
            uniforms:
                    {
                        c: { type: 'f', value: 0.9 },                           //Control the dynamically intensity.. Disabled
                        p: { type: 'f', value: 2.8 },                           //Control the dynamically intensity.. Disabled
                        glowColor: { type: 'c', value: new THREE.Color(0x2C3E93) },
                        viewVector: { type: 'v3', value: camera.position },     //To make intensity dynamically.. Disabled
                        uTime: { type: 'f', value: 0.0 },
                        uSlowTime: { type: 'f', value: 0.0 },                    //Slow time to make some particles blinking slowly
                        uBubblesUp: { type: 'f', value: 0.0 },                   //Start the animation bubbling up
                        uIsFlashing: { type: 'b', value: false },                //Make the whole brain flashin
                        isWinnerActive: { type: 'b', value: true },             //Active the winner section of the brain
                        uWinnerSelected: { type: 'f', value: 3.0 },              //activate secction of the brain from 0 - 4 ['analytic', 'episodic', 'process', 'semantic', 'affective'];
                        uFlashingAlpha: { type: 'f', value: 0.0 },               //Smooth fade out and fade in to activate or deactivate
                        uMouse: { type: 'f', value: new THREE.Vector2(0.0) },
                    },
            vertexShader: glowVertex,
            fragmentShader: glowFrag,
            //vertexColors: THREE.VertexColors,
            shading: THREE.SmoothShading,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthTest: false,
            vertexColors: false,
            depthWrite: true,
            transparent: true,

        });
        this.bubbles = new THREE.Points(geometry, customMaterial);
        this.bubbles.name = 'memory';
        scene.add(this.bubbles);
        console.log(this.bubbles);
    }

    updateSubSystem(subsystemPayload) {
        this.mainBrain.thinkingAnimation.isActive(true);
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
                this.bubbles.geometry.attributes.bubbles.needsUpdate = true;
                this.animate(true);
                this.mainBrain.thinkingAnimation.isActive(false);
            },
        });
    }

    update(camera) {
        this.bubbles.material.uniforms.viewVector.value =
          new THREE.Vector3().subVectors(camera.position, this.bubbles.position);
        this.bubbles.material.uniforms.uTime.value += 1 / 20;
        this.bubbles.material.uniforms.uSlowTime.value += (1 / 400);
    }
    updateBurbleUp(val) {
        this.bubbles.material.uniforms.uBubblesUp.value = val;
    }
    updateMouse(coordinates) {
        this.bubbles.material.uniforms.uMouse.value = coordinates;
    }

    flashingAnimation(isActive) {
        this.bubbles.material.uniforms.uIsFlashing.value = isActive;
        this.mainBrain.thinkingAnimation.isActive(false);
        if (isActive) {
            const progress = { p: 0.0 };
            TweenMax.fromTo(progress, 2.5, { p: 0.0 }, {
                p: 1.0,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    this.bubbles.material.uniforms.uFlashingAlpha.value = progress.p;
                    this.isFlashing = true;
                },
            });
        } else {
            const progress = { p: 1.0 };
            TweenMax.fromTo(progress, 2.5, { p: 1.0 }, {
                p: 0.0,
                ease: Power1.easeInOut,
                onUpdate: () => {
                    this.bubbles.material.uniforms.uFlashingAlpha.value = progress.p;
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

export default BubblesAnimation;
