import * as THREE from 'three'
import glowVertex from '../shaders/glow.vert'
import glowFrag from '../shaders/glow.frag'
import {Power1, TweenMax} from 'gsap'

class BubbleAnimation {
  constructor (mainBrain) {
    this._mainBrain = mainBrain
    this.isFlashing = false
  }
  initAnimation (scene, camera, memories, selector) {
    const particles = memories[selector][0].attributes.position.array.length
    const geometry = new THREE.BufferGeometry()
    const sizes = []
    const positions = []
    const colors = []
    // var color = new THREE.Color()
    const bubble = []
    const bubbleFor = ['analytic', 'episodic', 'process', 'semantic', 'affective']
    for (var i = 0; i < particles; i++) {
      const mSelector = bubbleFor[THREE.Math.randInt(0, 4)]
      var x = memories[mSelector][0].attributes.position.array[i * 3 + 0] || 0
      var y = memories[mSelector][0].attributes.position.array[i * 3 + 1] || 0
      var z = memories[mSelector][0].attributes.position.array[i * 3 + 2] || 0

      positions.push(x, y, z)

      sizes[ i ] = THREE.Math.randFloat(10.0, 20.0)
      if ((i % 100) === 0) {
        const altitude = THREE.Math.randInt(110, 300) + y
        bubble.push(x, altitude, z, 1.0)
      } else {
        bubble.push(x, y, z, 0.0)
      }
    }

    geometry.addAttribute('bubble', new THREE.Float32Attribute(bubble, 4))
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    geometry.computeBoundingSphere()
    var customMaterial = new THREE.ShaderMaterial(
      {
        uniforms:
                    {
                      'c': { type: 'f', value: 0.9 },
                      'p': { type: 'f', value: 2.8 },
                      glowColor: { type: 'c', value: new THREE.Color(0x2C3E93) },
                      viewVector: { type: 'v3', value: camera.position },
                      uTime: { type: 'f', value: 0.0 },
                      uBubbleUp: { type: 'f', value: 0.0 },
                      uIsFlashing: { type: 'b', value: false },
                      uFlashingAlpha: { type: 'f', value: 0.0 }
                    },
        vertexShader: glowVertex,
        fragmentShader: glowFrag,
        vertexColors: THREE.VertexColors,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: true,
        transparent: true

      })

    // this.moonGlow = new THREE.Points(sphereGeom.clone(), customMaterial)
    // this.moonGlow.position.set(moon.position.x, moon.position.y, moon.position.z)
    // this.moonGlow.scale.multiplyScalar(1.2)
    // scene.add(this.moonGlow)

    this.bubble = new THREE.Points(geometry, customMaterial)
    this.bubble.name = 'memory'
    scene.add(this.bubble)
  }

  update (camera, delta) {
    this.bubble.material.uniforms.viewVector.value =
          new THREE.Vector3().subVectors(camera.position, this.bubble.position)
    this.bubble.material.uniforms.uTime.value += (1 / 400)
  }
  updateBurbleUp (val) {
    this.bubble.material.uniforms.uBubbleUp.value = val
  }

  flashingAnimation (isActive) {
    this.bubble.material.uniforms.uIsFlashing.value = isActive

    if (isActive) {
      const progress = { p: 0.0 }
      TweenMax.fromTo(progress, 2.5, {p: 0.0}, {
        p: 1.0,
        ease: Power1.easeInOut,
        onUpdate: (value) => {
          this.bubble.material.uniforms.uFlashingAlpha.value = progress.p
          this.isFlashing = true
        }
      })
    } else {
      const progress = { p: 1.0 }
      TweenMax.fromTo(progress, 2.5, {p: 1.0}, {
        p: 0.0,
        ease: Power1.easeInOut,
        onUpdate: (value) => {
          this.bubble.material.uniforms.uFlashingAlpha.value = progress.p
          this.isFlashing = false
        }
      })
    }
  }

  animate (isActive) {
    const cameraPos = this._mainBrain.camera.position
    const target = this._mainBrain._orbitControls.target
    if (!this.isFlashing) {
      this.flashingAnimation(true)
    }
    if (isActive) {
      const progress = { p: 0.0 }
      TweenMax.fromTo(progress, 2.5, {p: 0.0}, {p: 1.0,
        ease: Power1.easeInOut,
        onUpdate: (value) => {
          this.updateBurbleUp(progress.p)
          this._mainBrain._orbitControls.target.set(target.x, target.y + progress.p, target.z)
          this._mainBrain.camera.position.set(cameraPos.x, cameraPos.y + progress.p, cameraPos.z)
        }
      })
    } else {
      const progress = { p: 1.0 }
      TweenMax.fromTo(progress, 2.5, {p: 1.0}, {p: 0.0,
        ease: Power1.easeInOut,
        onUpdate: (value) => {
          this.updateBurbleUp(progress.p)
          this._mainBrain._orbitControls.target.set(target.x, target.y - progress.p, target.z)
          this._mainBrain.camera.position.set(cameraPos.x, cameraPos.y - progress.p, cameraPos.z)
        }
      })
    }
  }
}

export default BubbleAnimation
