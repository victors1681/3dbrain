import * as THREE from 'three'
import 'three/examples/js/controls/OrbitControls'
import * as Stats from 'three/examples/js/libs/stats.min'
import { EffectComposer, GlitchPass, BlurPass, RenderPass } from 'postprocessing'

class AbstractApplication {
  constructor () {
    this._camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000)
    this._camera.position.z = 500
    // this.ambienColor = '#E7EBF3'

    this._scene = new THREE.Scene()
    this._scene.background = new THREE.Color('#C7D0E2')
    // this._scene.fog = new THREE.Fog(0xcce0ff, 100, 10000)
    this._scene.fog = new THREE.Fog(0xC7D0E2, 300, 1300)

    this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    this._renderer.sortObjects = false
    this._renderer.setClearColor(0x00000, 0.0)

    this._renderer.shadowMap.enabled = true
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this._renderer.gammaInput = true
    this._renderer.gammaOutput = true

    this._composer = new EffectComposer(this._renderer)
    this._composer.addPass(new RenderPass(this._scene, this._camera))

    const pass = new GlitchPass()
    pass.renderToScreen = true
    this._composer.addPass(pass)

    document.body.appendChild(this._renderer.domElement)

    this._stats = this.initStats(document.body)

    this._orbitControls = new THREE.OrbitControls(this._camera, this._renderer.domElement)
    this._orbitControls.enableDamping = true
    this._orbitControls.dampingFactor = 0.25
    this._orbitControls.enableZoom = true
    this._orbitControls.minDistance = 0
    this._orbitControls.maxDistance = 1000

    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  }

  get renderer () {
    return this._renderer
  }

  get camera () {
    return this._camera
  }

  get scene () {
    return this._scene
  }

  initStats (render) {
    const stats = new Stats()
    stats.setMode(0)
    stats.domElement.style.position = 'absolute'
    stats.domElement.style.left = '0px'
    stats.domElement.style.tip = '0px'
    render.appendChild(stats.domElement)
    return stats
  }

  onWindowResize () {
    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()

    this._renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate (timestamp) {
    requestAnimationFrame(this.animate.bind(this))
    this._renderer.render(this._scene, this._camera)
  }
}

export default AbstractApplication
