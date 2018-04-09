import * as THREE from 'three'
import shaderVert from 'shaders/custom.vert'
import shaderFrag from 'shaders/custom.frag'
import lightV from 'shaders/light.vert'
import brainShadow from 'shaders/brainShadow.vert'
import deepVertex from 'shaders/deepVertex.vert'
import lightF from 'shaders/lightF.frag'
import Loaders from './Loaders/Loaders'
import AbstractApplication from 'views/AbstractApplication'

class Brain extends AbstractApplication {
  constructor () {
    super()
    this.OBJ_MODELS = {}
    this.clock = new THREE.Clock()
    // const texture = new THREE.TextureLoader().load('static/textures/crate.gif')

    // this.particleSystem = this.createParticles()
    // this.sinSimulation = this.createParticles()
    this.addBrain = this.addBrain.bind(this)
    console.log(this.particleSystem, this.sinSimulation)
    // this.scene.add(this.particleSystem)
    // this.scene.add(this.sinSimulation)
    this.fake = this.addFakePoint(new THREE.Vector3(-200, 150, 0))
    // this.scene.add(this.fake)
    this.createTemporalPath()
    this.createFloor()

    this.t = 0
    this.deltaTime = 0
    this.increase = Math.PI * 2
    this.counter = 0

    this.loaders = new Loaders(this.runAnimation.bind(this))
    this.testingShaders()

    // overwrite shadowmap code
  }

  replaceThreeChunkFn (a, b) {
    return THREE.ShaderChunk[b] + '\n'
  }
  shaderParse (glsl) {
    return glsl.replace(/\/\/\s?chunk\(\s?(\w+)\s?\);/g, this.replaceThreeChunkFn)
  }

  lightShader () {
    this.uniformsLight = {
      lightPosition: {type: 'v3', value: new THREE.Vector3(700, 700, 700)},
      time: {type: 'f', value: 0}
    }

    const geometry = new THREE.SphereBufferGeometry(40, 32, 32)
    this.displacement = new Float32Array(geometry.attributes.position.count)
    geometry.addAttribute('displacement', new THREE.BufferAttribute(this.displacement, 1))

    for (var i = 0; i < this.displacement.length; i++) {
      this.displacement[i] = Math.random() * 5
    }

    console.log('displacement', this.displacement)
    console.error('THIS IS THE BUFFER', geometry)

    this.materialLight = new THREE.ShaderMaterial({
      vertexShader: lightV,
      fragmentShader: lightF,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.shadowmap,
        {
          lightPosition: {type: 'v3', value: new THREE.Vector3(700, 700, 700)},
          time: {type: 'f', value: 0}
        }
      ])
    })

    this.meshLight = new THREE.Mesh(geometry, this.materialLight)
    this.meshLight.castShadow = true
    this.meshLight.receiveShadow = true
    this.meshLight.position.x = -50
    this.meshLight.position.y = -50

    this.meshLight.customDepthMaterial = new THREE.ShaderMaterial({
      vertexShader: deepVertex,
      fragmentShader: THREE.ShaderLib.basic.fragmentShader,
      uniforms: this.materialLight.uniforms
    })

    console.log('deep', this.meshLight)
    this.scene.add(this.meshLight)
  }

  testingShaders () {
    this.uniforms = {
      lightPosition: {type: 'v3', value: new THREE.Vector3(-200, 150, 0)},
      interpolation: {
        value: 0.5
      },
      radius: {
        value: 150.5
      },
      color: {
        value: new THREE.Color(0x00ff00)
      },
      time: { type: 'f', value: 0 }
    }

    var sideLenght = 200
    var sideDivision = 100
    var cubeGeom = new THREE.BoxBufferGeometry(sideLenght, sideLenght, sideLenght, sideDivision, sideDivision, sideDivision)
    var attrPhi = new Float32Array(cubeGeom.attributes.position.count)
    var attrTheta = new Float32Array(cubeGeom.attributes.position.count)
    var attrSpeed = new Float32Array(cubeGeom.attributes.position.count)
    var attrAmplitude = new Float32Array(cubeGeom.attributes.position.count)
    var attrFrequency = new Float32Array(cubeGeom.attributes.position.count)
    for (var attr = 0; attr < cubeGeom.attributes.position.count; attr++) {
      attrPhi[attr] = Math.random() * Math.PI * 2
      attrTheta[attr] = Math.random() * Math.PI * 2
      attrSpeed[attr] = THREE.Math.randFloatSpread(6)
      attrAmplitude[attr] = Math.random() * 5
      attrFrequency[attr] = Math.random() * 5
    }
    cubeGeom.addAttribute('phi', new THREE.BufferAttribute(attrPhi, 1))
    cubeGeom.addAttribute('theta', new THREE.BufferAttribute(attrTheta, 1))
    cubeGeom.addAttribute('speed', new THREE.BufferAttribute(attrSpeed, 1))
    cubeGeom.addAttribute('amplitude', new THREE.BufferAttribute(attrAmplitude, 1))
    cubeGeom.addAttribute('frequency', new THREE.BufferAttribute(attrFrequency, 1))

    var shaderMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shaderVert,
      fragmentShader: shaderFrag
      // wireframe: true
    })
    var points = new THREE.Points(cubeGeom, shaderMat)
    // this.scene.add(points)
  }

  createTemporalPath () {
    var path = new THREE.Path()

    path.lineTo(0, 0.8)
    path.quadraticCurveTo(200, 0, this.fake.position.x, this.fake.position.y)
    path.lineTo(this.fake.position.x, this.fake.position.y)

    var points = path.getPoints()

    this.pathGeometry = new THREE.BufferGeometry().setFromPoints(points)
    var material3 = new THREE.LineBasicMaterial({ color: 0xffffff })

    console.log('path', this.pathGeometry)
    const line = new THREE.Line(this.pathGeometry, material3)
    // this.scene.add(line)
  }

  createFloor () {
    let light = new THREE.AmbientLight(0xffffff, 0.2)
    this.scene.add(light)

    this.spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2)
    this.spotLight.position.set(0, 500, -10)
    this.spotLight.castShadow = true

    this.spotLight.castShadow = true
    this.spotLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 1, 1000))
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
    this.scene.add(this.testBox)

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

  addFakePoint (pos) {
    let geometry = new THREE.CircleGeometry(10, 50, 0, 10)
    let material = new THREE.MeshBasicMaterial({color: 0xCED7DF})
    let fake = new THREE.Mesh(geometry, material)
    fake.position.set(pos.x, pos.y, pos.z)
    // console.log(fake)
    return fake
  }

  mapPoint (lat, lng, scale) {
    if (!scale) {
      scale = 500
    }
    var phi = (90 - lat) * Math.PI / 180
    var theta = (180 - lng) * Math.PI / 180
    var x = scale * Math.sin(phi) * Math.cos(theta)
    var y = scale * Math.cos(phi)
    var z = scale * Math.sin(phi) * Math.sin(theta)
    return {x: x, y: y, z: z}
  }

  addBrain () {
    this.brainBuffer = []
    console.error('brain', this.loaders.BRAIN_MODEL)

    this.shaderMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shaderVert,
      fragmentShader: shaderFrag
      // wireframe: true
    })

    this.loaders.BRAIN_MODEL.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // buffer.push(new THREE.BufferGeometry().fromGeometry(child.geometry))
        var points = new THREE.Points(child.geometry, this.shaderMat)
        points.castShadow = true
        points.customDepthMaterial = new THREE.ShaderMaterial({
          vertexShader: brainShadow,
          fragmentShader: THREE.ShaderLib.basic.fragmentShader,
          uniforms: this.uniforms
        })
        child.geometry.verticesNeedUpdate = true
        this.brainBuffer.push(child)
        this.scene.add(points)
      }
    })
  }

  runAnimation () {
    this.addBrain()
    this.lightShader()
    this.animate()
  }
  animate (timestamp) {
    // this.shaderMat.needsUpdate = true
    this.testBox.rotation.x += this.deltaTime * 0.02
    this.deltaTime += this.clock.getDelta()
    this.uniforms.interpolation.value = Math.sin(this.deltaTime)
    // this.uniforms.time = timestamp

    // this.uniformsLight.amplitude = Math.sin(this.t)
    for (var i = 0; i < this.displacement.length; i++) {
      this.displacement[i] = Math.random() * 5
    }

    this.meshLight.geometry.attributes.displacement.needsUpdate = true

    this.meshLight.material.uniforms.time.value = this.t


    this.t += 0.06

    requestAnimationFrame(this.animate.bind(this))
    // this._renderer.clear()
    this._renderer.render(this._scene, this._camera)
  }

  createParticles () {
    let geo = new THREE.Geometry()
    let material = new THREE.PointCloudMaterial({
      size: 5,
      vertexColors: true,
      color: 0xffff
    })

    let radio = 50

    for (var i = 0; i < 200; i += 1) {
      let angle = i / 20 * Math.PI * 2

      let x = radio * Math.cos(angle)
      let y = radio * Math.sin(angle)

      let particle = new THREE.Vector3(x, y, 3)
      geo.vertices.push(particle)
      let color = new THREE.Color(Math.random() * 0xfffff)
      geo.colors.push(color)
    }

    let cloud = new THREE.PointCloud(geo, material)
    return cloud
  }
}

export default Brain
