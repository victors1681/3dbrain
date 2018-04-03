import * as THREE from 'three'
import AbstractApplication from 'views/AbstractApplication'
import shaderVert from 'shaders/custom.vert'
import shaderFrag from 'shaders/custom.frag'
import FastSimplexNoise from '../../vendor/fast-simplex-noise'

class Main extends AbstractApplication {
  constructor () {
    super()
    this.clock = new THREE.Clock()
    // const texture = new THREE.TextureLoader().load('static/textures/crate.gif')

    const geometry = new THREE.BoxGeometry(200, 200, 200)
    // const material = new THREE.MeshBasicMaterial({ map: texture })

    const material2 = new THREE.ShaderMaterial({
      vertexShader: shaderVert,
      fragmentShader: shaderFrag
    })

    this.simplex = new FastSimplexNoise()
    // this._mesh = new THREE.Mesh(geometry, material2)
    // this._scene.add(this._mesh)

    this.particleSystem = this.createParticles()
    this.sinSimulation = this.createParticles()
    console.log(this.particleSystem, this.sinSimulation)
    this.scene.add(this.particleSystem)
    this.scene.add(this.sinSimulation)
    this.fake = this.addFakePoint(new THREE.Vector3(200, 150, 0))
    this.scene.add(this.fake)
    this.createTemporalPath()
    this.createFloor()
    this.animate()
    this.t = 0
    this.increase = Math.PI * 2
    this.counter = 0
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
    this.scene.add(line)
  }

  createFloor () {
    let light = new THREE.AmbientLight('#ffffff')
    this.scene.add(light)
    let geometry = new THREE.PlaneGeometry(5000, 5000, 5000)
    let material = new THREE.MeshPhongMaterial({
      color: '#d8e6ff',
      side: THREE.DoubleSide
    })
    let plane = new THREE.Mesh(geometry, material)
    plane.receiveShadow = true
    plane.position.y = -100
    plane.rotation.x = -0.5 * Math.PI
    this.scene.add(plane)
  }

  addFakePoint (pos) {
    let geometry = new THREE.CircleGeometry(10, 50, 0, 10)
    let material = new THREE.MeshBasicMaterial({color: 0xD22139})
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

  getQuadraticBezierXYatT (startPt, controlPt, endPt, T) {
    var x = Math.pow(1 - T, 2) * startPt.x + 2 * (1 - T) * T * controlPt.x + Math.pow(T, 2) * endPt.x
    var y = Math.pow(1 - T, 2) * startPt.y + 2 * (1 - T) * T * controlPt.y + Math.pow(T, 2) * endPt.y
    return ({x: x, y: y})
  }

  animate (timestamp) {
    let delta = this.clock.getDelta()
    this.particleSystem.geometry.vertices.forEach((vertex, index) => {
      let angle = index / this.particleSystem.geometry.vertices.length * Math.PI * 2

      let radio = Math.abs(Math.cos(this.t + 1)) * 20
      // console.log(radio)
      vertex.x = (50 + radio) * Math.cos(angle + this.t / 2)
      vertex.y = (50 + radio) * Math.sin(angle + this.t / 2)
      vertex.z = 0
    })

    // if (this.t < this.pathGeometry.geometry.vertices.length) {
    //   let pos = this.pathGeometry.geometry.vertices[Math.floor(this.t)]
    //
    //   this.sinSimulation.geometry.vertices[0].x = pos.x
    //   this.sinSimulation.geometry.vertices[0].x = pos.y
    // } else {
    //   this.t = 0
    // }
    this.sinSimulation.geometry.vertices.forEach((vertex, index) => {
      vertex.x = 8 * index
      vertex.y = 8 * Math.sin(index + this.t)
      vertex.z = 8 * Math.cos(index + this.t)
    })

    this.t += 0.06
    // let scale = Math.abs(Math.cos(this.t + 1))
    // this.particleSystem.scale.set(scale, scale, scale)
    this.particleSystem.geometry.verticesNeedUpdate = true
    this.sinSimulation.geometry.verticesNeedUpdate = true

    requestAnimationFrame(this.animate.bind(this))
    this._renderer.render(this._scene, this._camera)
  }

  createParticles () {
    let geo = new THREE.Geometry()
    let material = new THREE.PointCloudMaterial({
      size: 5,
      vertexColors: true,
      color: 0xffff
    })

    let noise1 = this.simplex.getRaw4DNoise(
      4,
      3,
      4,
      7
    ) * 0.5 + 0.5

    console.log(noise1)
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

export default Main
