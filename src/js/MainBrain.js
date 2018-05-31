import * as THREE from 'three'
import 'three/examples/js/BufferGeometryUtils'
import Loaders from './Loaders/Loaders'
import AbstractApplication from 'views/AbstractApplication'
import BubblesAnimation from './services/bubblesAnimation'
import GUI from './services/gui'
import Font from './services/font'
import ParticleSystem from './services/particlesSystem'
import memories from './data/memories.json'

class MainBrain extends AbstractApplication {
  constructor () {
    super()

    this.clock = new THREE.Clock()
    this.addBrain = this.addBrain.bind(this)
    this.addFloor()
    this.addIllumination()

    this.deltaTime = 0
    this.particlesColor = new THREE.Color(0xffffff)
    this.particlesStartColor = new THREE.Color(0xffffff)
    this.loaders = new Loaders(this.runAnimation.bind(this))
    this.memories = memories
  }

  addFloor () {
    let geometry = new THREE.PlaneBufferGeometry(20000, 20000)
    let material = new THREE.MeshPhongMaterial({
      opacity: 0.1,
      transparent: true
    })
    this.plane = new THREE.Mesh(geometry, material)
    this.plane.receiveShadow = true
    this.plane.position.y = -160
    this.plane.rotation.x = -0.5 * Math.PI
    this.scene.add(this.plane)
  }
  addIllumination () {
    this.ambienlight = new THREE.AmbientLight(0xB8C5CF, 0)
    this.scene.add(this.ambienlight)

    this.spotLight = new THREE.SpotLight(0xB8C5CF, 1.45, 175, Math.PI / 2, 0.0, 0.0)
    this.spotLight.position.set(0, 500, -10)
    this.spotLight.castShadow = true

    this.spotLight.castShadow = true
    this.spotLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 1, 2000))
    this.spotLight.shadow.bias = -0.000222
    this.spotLight.shadow.mapSize.width = 1024
    this.spotLight.shadow.mapSize.height = 1024

    this.scene.add(this.spotLight)
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight)
  }

  addBrain () {
    console.error('Brain', this.loaders.BRAIN_MODEL)
    this.brainBufferGeometries = []

    this.loaders.BRAIN_MODEL.traverse((child) => {
      if (child instanceof THREE.LineSegments) {
        this.memories.lines = { ...this.memories.lines, ...this.addLinesPath(child, this.memories) }
      }
      if (!(child instanceof THREE.Mesh)) {
        return
      }
      child.geometry.verticesNeedUpdate = true
      this.brainBufferGeometries.push(child.geometry)

      this.memories = { ...this.memories, ...this.storeBrainVertices(child, this.memories) }
    })

    this.endPointsCollections = THREE.BufferGeometryUtils.mergeBufferGeometries(this.brainBufferGeometries)
    console.log('Unique Geometry', this.endPointsCollections)

    console.log('MEMORIES OBJECT', this.memories)
  }

  addLinesPath (mesh, memories) {
    const keys = Object.keys(memories.lines)
    const name = mesh.name

    keys.map(l => {
      if (name.includes(l)) {
        memories.lines[l] = mesh.geometry.attributes.position.array
        return memories.lines
      }
    })
  }

  storeBrainVertices (mesh, memories) {
    const keys = Object.keys(memories)
    const name = mesh.name

    keys.map(m => {
      if (name.includes(m)) {
        if (memories[m].length) {
          memories[m].push(mesh.geometry)
          memories[m] = [THREE.BufferGeometryUtils.mergeBufferGeometries(memories[m])]
          return memories
        }
        return memories[m].push(mesh.geometry)
      }
    })
  }

  loadAmelia () {
    const ameliaBuffer = []

    console.error('AMELIA', this.loaders.AMELIA_MODEL)
    //  this.scene.add(this.loaders.AMELIA_MODEL)
    this.loaders.AMELIA_MODEL.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.verticesNeedUpdate = true
        ameliaBuffer.push(child.geometry)
      }
    })

    this.endPointsCollectionsAmelia = THREE.BufferGeometryUtils.mergeBufferGeometries(ameliaBuffer)
    console.log('Amelia all Points buffer', this.endPointsCollectionsAmelia)
  }

  runAnimation () {
    this.gui = new GUI(this)
    this.addBrain()
    this.addParticlesSystem()
    this.font = new Font(this.loaders, this.scene)
    this.bubblesAnimation = new BubblesAnimation(this)
    this.bubblesAnimation.initAnimation('episodic')

    // Set Background
    this.scene.background = this.loaders.assets.get('sky')

    this.animate()
  }

  animate (timestamp) {
    this._orbitControls.update()
    this._orbitControls.autoRotateSpeed = this.gui.controls.rotationSpeed

    this.deltaTime += this.clock.getDelta()

    this.particlesSystem.update(this.deltaTime)
    this.bubblesAnimation.update(this.camera, this.deltaTime)

    this._stats.update()
    requestAnimationFrame(this.animate.bind(this))
    this._renderer.render(this._scene, this._camera)
    this.font.facingToCamera(this.camera)
  }
  onMouseMove (event) {
    const y = window.innerHeight - event.clientY
    const x = window.innerHeight - event.clientX
    this.bubblesAnimation.updateMouse(new THREE.Vector2(x, y))
  }
  addParticlesSystem () {
    this.particlesSystem = new ParticleSystem(this.endPointsCollections, this.memories)
    this.scene.add(this.particlesSystem.particles)
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
}

export default MainBrain
