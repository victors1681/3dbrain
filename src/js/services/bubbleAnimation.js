import * as THREE from 'three'
import glowVertex from '../shaders/glow.vert'
import glowFrag from '../shaders/glow.frag'

class BubbleAnimation {
  initGlow (scene, camera, memories, selector) {
    const particles = memories[selector][0].attributes.position.array.length
    const geometry = new THREE.BufferGeometry()
    const sizes = []
    const positions = []
    const colors = []
    // var color = new THREE.Color()
    const burble = []
    for (var i = 0; i < particles; i++) {
      var x = memories[selector][0].attributes.position.array[i * 3 + 0] || 0
      var y = memories[selector][0].attributes.position.array[i * 3 + 1] || 0
      var z = memories[selector][0].attributes.position.array[i * 3 + 2] || 0

      positions.push(x, y, z)

      sizes[ i ] = THREE.Math.randFloat(10.0, 20.0)
      if ((i % 50) === 0) {
        const altitude = THREE.Math.randInt(110, 300) + y
        burble.push(x, altitude, z, 1.0)
      } else {
        burble.push(x, y, z, 0.0)
      }
    }

    geometry.addAttribute('burble', new THREE.Float32Attribute(burble, 4))
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
                      uBurbleUp: { type: 'f', value: 0.0 }
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

    this.glow = new THREE.Points(geometry, customMaterial)
    this.glow.name = 'memory'
    scene.add(this.glow)
  }

  update (camera, delta) {
    this.glow.material.uniforms.viewVector.value =
          new THREE.Vector3().subVectors(camera.position, this.glow.position)
    this.glow.material.uniforms.uTime.value += (1 / 400)
  }
  updateBurbleUp (val) {
    this.glow.material.uniforms.uBurbleUp.value = val
  }
}

export default BubbleAnimation
