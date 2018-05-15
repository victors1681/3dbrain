import * as THREE from 'three'
import 'three/examples/js/BufferGeometryUtils'
import * as dat from 'three/examples/js/libs/dat.gui.min'
import * as BAS from 'three-bas'
import { TweenMax, Power0 } from 'gsap'
import Loaders from './Loaders/Loaders'
import AbstractApplication from 'views/AbstractApplication'

class Brain3 extends AbstractApplication {
  constructor () {
    super()
    this.initGui()
    this.OBJ_MODELS = {}
    this.clock = new THREE.Clock()
    this.addBrain = this.addBrain.bind(this)
    console.log(this.particleSystem, this.sinSimulation)
    this.createFloor()

    this.t = 0
    this.deltaTime = 0
    this.particlesColor = new THREE.Color(0xffffff)

    this.loaders = new Loaders(this.runAnimation.bind(this))
  }

  createFloor () {
    let light = new THREE.AmbientLight(0xffffff, 0.2)
    this.scene.add(light)

    this.spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2)
    this.spotLight.position.set(0, 500, -10)
    this.spotLight.castShadow = true

    this.spotLight.castShadow = true
    this.spotLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 1, 2000))
    this.spotLight.shadow.bias = 0.0001
    this.spotLight.shadow.mapSize.width = 1024
    this.spotLight.shadow.mapSize.height = 1024

    this.scene.add(this.spotLight)
    var spotLightHelper = new THREE.SpotLightHelper(this.spotLight)
    this.scene.add(spotLightHelper)

    let testG = new THREE.BoxGeometry(50, 50, 50)
    let testM = new THREE.MeshLambertMaterial({color: 0xff0000})
    this.testBox = new THREE.Mesh(testG, testM)
    this.testBox.castShadow = true
    this.testBox.receiveShadow = true
    // this.scene.add(this.testBox)

    let geometry = new THREE.PlaneBufferGeometry(20000, 20000)
    let material = new THREE.MeshPhongMaterial({
      color: '0xCED7DF',
      specular: 0x111111
    })
    let plane = new THREE.Mesh(geometry, material)
    plane.receiveShadow = true
    plane.position.y = -160
    plane.rotation.x = -0.5 * Math.PI
    this.scene.add(plane)
  }

  initGui () {
    this.controls = new function () {
      this.rotationSpeed = 0.5
      this.color0 = 0xffffff
    }()

    var gui = new dat.GUI()
    gui.add(this.controls, 'rotationSpeed', 0, 2.0)
    gui.addColor(this.controls, 'color0').onChange((e) => {
      console.log(new THREE.Color(e))
      return this.particlesColor = new THREE.Color(e)
    })
  }

  addBrain () {
    console.error('brain', this.loaders.BRAIN_MODEL)
    this.brainBufferGeometries = []
    this.uniqueBrain = new THREE.BufferGeometry()
    this.loaders.BRAIN_MODEL.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.verticesNeedUpdate = true
        this.brainBufferGeometries.push(child.geometry)
      }
    })

    this.endPointsCollections = THREE.BufferGeometryUtils.mergeBufferGeometries(this.brainBufferGeometries)
    console.log('Unique Geometry', this.endPointsCollections)
  }

  runAnimation () {
    this.addBrain()
    this.startAnimation()
    this.animate()
  }
  animate (timestamp) {
    this._controls.update()
    this._controls.autoRotateSpeed = this.controls.rotationSpeed
    this.deltaTime += this.clock.getDelta()
    this.material.uniforms['uTime'].value = Math.sin(this.deltaTime)
    this.system.customDepthMaterial.uniforms['uTime'].value = Math.sin(this.deltaTime)
    this.system.customDistanceMaterial.uniforms['uTime'].value = Math.sin(this.deltaTime)

    this._stats.update()
    requestAnimationFrame(this.animate.bind(this))
    this._renderer.render(this._scene, this._camera)
  }

  startAnimation () {
    const me = this
    var animation = this.ParticleSystem()

    TweenMax.fromTo(this, 1.0, {time: 0.0}, {
      ease: Power0.easeIn,
      repeat: -1,
      repeatDelay: 1.5,
      yoyo: true,
      onRepeat: function () {
        // change all points's aEndPos and aEndColor, when transform from ball state to picture state, not reverse
        animation.reverse = !animation.reverse
        if (animation.reverse) {
          return
        }

        // randomly pick one picture info
        var curPicPoints = me.endPointsCollections.attributes.position.array

        var aEndPos = animation.geometry.attributes.aEndPos
        var aEndColor = animation.geometry.attributes.aEndColor

        for (var i = 0; i < aEndPos.array.length; i++) {
          // use current picture info to set aEndPos and aEndColor of buffer geometry,
          // if picture info length is less than geometry points length, set default value
          if (i < curPicPoints.length) {
            aEndPos.array[i * 3 + 0] = curPicPoints[i * 3 + 0]
            aEndPos.array[i * 3 + 1] = curPicPoints[i * 3 + 1]
            aEndPos.array[i * 3 + 2] = curPicPoints[i * 3 + 2]

            aEndColor.array[i * 3 + 0] = me.particlesColor.r
            aEndColor.array[i * 3 + 1] = me.particlesColor.g
            aEndColor.array[i * 3 + 2] = me.particlesColor.b
          } else {
            aEndPos.array[i * 3 + 0] = 0
            aEndPos.array[i * 3 + 1] = 0
            aEndPos.array[i * 3 + 2] = 0
            aEndColor.array[i * 3 + 0] = 0
            aEndColor.array[i * 3 + 1] = 0
            aEndColor.array[i * 3 + 2] = 0
          }
        }
        aEndPos.needsUpdate = true
        aEndColor.needsUpdate = true
      }
    })

    console.error('Animation', animation)
  }

  getRandomPointOnSphere (r) {
    var u = THREE.Math.randFloat(0, 1)
    var v = THREE.Math.randFloat(0, 1)
    var theta = 2 * Math.PI * u
    var phi = Math.acos(2 * v - 1)
    var x = r * Math.sin(theta) * Math.sin(phi)
    var y = r * Math.cos(theta) * Math.sin(phi)
    var z = r * Math.cos(phi)
    return {
      x,
      y,
      z
    }
  }

  ParticleSystem () {
    var curPicPoints = this.endPointsCollections.attributes.position.array
    const me = this
    const count = curPicPoints.length
    const radius = 200
    const offset = radius
    const geometry = new BAS.PointBufferGeometry(count)

    geometry.createAttribute('aStartPos', 3, (data, index, num) => {
      var startVec3 = new THREE.Vector3()
      var randSphere = this.getRandomPointOnSphere(radius)
      startVec3.x = randSphere.x
      startVec3.y = randSphere.y
      startVec3.z = randSphere.z
      startVec3.toArray(data)
    })

    console.log('STAGE1!!!!')
    var color = new THREE.Color()
    geometry.createAttribute('aStartColor', 3, (data, index, count) => {
      // console.log(me.particlesColor)
      // const r = me.particlesColor.r
      // const g = me.particlesColor.g
      // const b = me.particlesColor.b
      //
      // color.setRGB(r, g, b)
      // color.toArray()

      const h = index / count
      const s = THREE.Math.randFloat(0.4, 0.6)
      const l = THREE.Math.randFloat(0.4, 0.6)

      color.setHSL(h, s, l)
      color.toArray(data)
    })

    console.log('STAGE2!!!!')
    // in end state, all points from a picture
    this.aEndPos = geometry.createAttribute('aEndPos', 3)
    this.aEndColor = geometry.createAttribute('aEndColor', 3)

    // collect the brain Info

    this.aEndPos = curPicPoints.slice()

    var duration = 1
    var maxPointDelay = 0.1
    this.totalDuration = duration + maxPointDelay

    geometry.createAttribute('aDelayDuration', 3, (data, index, num) => {
      data[0] = Math.random() * maxPointDelay
      data[1] = duration
    })

    console.log('STAGE3!!!!')
    this.material = new BAS.PointsAnimationMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: THREE.VertexColors,
      deptWrite: false,
      uniforms: {
        uTime: { type: 'f', value: 0 }
      },
      uniformValues: {
        size: 2.0,
        sizeAttenuation: true
      },
      vertexFunctions: [
        BAS.ShaderChunk['ease_expo_in_out']
      ],
      vertexParameters: [
        'uniform float uTime;',
        'attribute vec2 aDelayDuration;',
        'attribute vec3 aStartPos;',
        'attribute vec3 aEndPos;',
        'attribute vec3 aStartColor;',
        'attribute vec3 aEndColor;',
        'attribute float aStartOpacity;',
        'attribute float aEndOpacity;'
      ],
      // this chunk is injected 1st thing in the vertex shader main() function
      // variables declared here are available in all subsequent chunks
      vertexInit: [
        // calculate a progress value between 0.0 and 1.0 based on the vertex delay and duration, and the uniform time
        'float tProgress = clamp(uTime - aDelayDuration.x, 0.0, aDelayDuration.y) / aDelayDuration.y;',
        // ease the progress using one of the available easing functions
        'tProgress = easeExpoInOut(tProgress);'
      ],
      // this chunk is injected before all default position calculations (including the model matrix multiplication)
      vertexPosition: [
        // linearly interpolate between the start and end position based on tProgress
        // and add the value as a delta
        'transformed += mix(aStartPos, aEndPos, tProgress);'
      ],
      // this chunk is injected before all default color calculations
      vertexColor: [
        // linearly interpolate between the start and end position based on tProgress
        // and add the value as a delta
        'vColor = mix(aStartColor, aEndColor, tProgress);'
      ],

      // convert the point (default is square) to circle shape, make sure transparent of material is true
      // you can create more shapes: https://thebookofshaders.com/07/
      fragmentShape: [
        `
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float pct = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
        gl_FragColor = vec4(gl_FragColor.rgb, pct * gl_FragColor.a);
      `
      ]
    })

    // Use THREE.point to create particles

    this.frustumCulled = false

    this.system = new THREE.Points(geometry, this.material)
    this.system.castShadow = true
    this.scene.add(this.system)
    console.error(this.system)

    this.frustumCulled = false
    this.castShadow = true
    this.receiveShadow = true

    // depth material is used for directional & spot light shadows
    this.system.customDepthMaterial = BAS.Utils.createDepthAnimationMaterial(this.material)
    // distance material is used for point light shadows
    this.system.customDistanceMaterial = BAS.Utils.createDistanceAnimationMaterial(this.material)

    return this.system
  }
}

export default Brain3
