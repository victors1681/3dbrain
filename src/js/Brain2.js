import * as THREE from 'three'
import 'three/examples/js/BufferGeometryUtils'
import * as BAS from 'three-bas'
import Loaders from './Loaders/Loaders'
import AbstractApplication from 'views/AbstractApplication'
import brainShadow from 'shaders/brainShadow.vert'
import shaderVert from 'shaders/custom.vert'
import shaderFrag from 'shaders/custom.frag'

class Brain2 extends AbstractApplication {
  constructor () {
    super()
    this.OBJ_MODELS = {}
    this.clock = new THREE.Clock()
    this.addBrain = this.addBrain.bind(this)
    console.log(this.particleSystem, this.sinSimulation)
    this.createFloor()

    this.t = 0
    this.deltaTime = 0

    this.loaders = new Loaders(this.runAnimation.bind(this))
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

  addBrain () {
    this.brainAllPoints = []
    console.error('brain', this.loaders.BRAIN_MODEL)

    this.shaderMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shaderVert,
      fragmentShader: shaderFrag
      // wireframe: true
    })

    this.brainGeometry = []
    this.brainBufferGeometries = []
    this.uniqueBrain = new THREE.BufferGeometry()
    this.loaders.BRAIN_MODEL.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // buffer.push(new THREE.BufferGeometry().fromGeometry(child.geometry))

        //  console.log("Brain Geometry", child.geometry)
        var points = new THREE.Points(child.geometry, this.shaderMat)
        points.castShadow = true
        points.customDepthMaterial = new THREE.ShaderMaterial({
          vertexShader: brainShadow,
          fragmentShader: THREE.ShaderLib.basic.fragmentShader,
          uniforms: this.uniforms
        })
        child.geometry.verticesNeedUpdate = true
        // this.brainBuffer.push(child.geometry)
        // this.scene.add(points)
        // this.brainAllPoints = this.brainAllPoints.concat(child.geometry.attributes.position.array)
        // console.log(child.geometry)
        // this.uniqueBrain.merge(child.geometry)
        this.brainBufferGeometries.push(child.geometry)
      }
    })

    this.uniqueBrain = THREE.BufferGeometryUtils.mergeBufferGeometries(this.brainBufferGeometries)
    console.log('Unique Geometry', this.uniqueBrain)
  }

  runAnimation () {
    this.addBrain()
    this.ParticleSystem()
    this.animate()
  }
  animate (timestamp) {
    // this.shaderMat.needsUpdate = true
    this.testBox.rotation.x += this.deltaTime * 0.02
    this.deltaTime += this.clock.getDelta()

    this.t += 0.06

    this.material.uniforms['uTime'].value = Math.sin(this.deltaTime)
    this.system.customDepthMaterial.uniforms['uTime'].value = Math.sin(this.deltaTime)
    this.system.customDistanceMaterial.uniforms['uTime'].value = Math.sin(this.deltaTime)

    requestAnimationFrame(this.animate.bind(this))
    // this._renderer.clear()
    this._renderer.render(this._scene, this._camera)
  }

  ParticleSystem () {
    var prefabGeometry = new THREE.TetrahedronGeometry(1)

    var prefabCount = this.uniqueBrain.attributes.position.array.length //5000

    console.log('shape vertices', prefabGeometry)
     var geometry = new BAS.PrefabBufferGeometry(prefabGeometry, prefabCount)
    //var geometry = new BAS.PointBufferGeometry(this.uniqueBrain.attributes.position.array.length)

    var i, j, offset

    // animation
    var aAnimation = geometry.createAttribute('aAnimation', 3)

    var minDuration = 1.0
    var maxDuration = 1.0
    var maxDelay = 0

    this.totalDuration = maxDuration + maxDelay

    for (i = 0, offset = 0; i < prefabCount; i++) {
      var delay = 0
      var duration = THREE.Math.randFloat(minDuration, maxDuration)

      for (j = 0; j < prefabGeometry.vertices.length; j++) {
        aAnimation.array[offset] = delay
        aAnimation.array[offset + 1] = duration

        offset += 3
      }
    }

    // position
    var aPosition = geometry.createAttribute('aPosition', 3)
    var position = new THREE.Vector3()

    console.log('BRain Position', this.brainBuffer)
    for (i = 0, offset = 0; i < prefabCount; i++) {
      position.x = THREE.Math.randFloatSpread(40)
      position.y = THREE.Math.randFloatSpread(40)
      position.z = THREE.Math.randFloatSpread(40)

      for (j = 0; j < prefabGeometry.vertices.length; j++) {
        // aPosition.array[offset] = position.x
        // aPosition.array[offset + 1] = position.y
        // aPosition.array[offset + 2] = position.z

        aPosition.array[offset] = this.uniqueBrain.attributes.position.array[offset]
        aPosition.array[offset + 1] = this.uniqueBrain.attributes.position.array[offset + 1]
        aPosition.array[offset + 2] = this.uniqueBrain.attributes.position.array[offset + 2]

        offset += 3
      }
    }

    // Position
    var aStartPosition = geometry.createAttribute('aStartPosition', 3)
    var aEndPosition = geometry.createAttribute('aEndPosition', 3)

    var startPosition = new THREE.Vector3()
    var endPosition = new THREE.Vector3()
    var range = 1000
    var prefabData = []

    for (var x = 0; x < prefabCount; x += 1) {
      startPosition.x = THREE.Math.randFloatSpread(40)
      startPosition.y = THREE.Math.randFloatSpread(40)
      startPosition.z = THREE.Math.randFloatSpread(40)

      endPosition.x = THREE.Math.randFloatSpread(range) - range * 0.5
      endPosition.y = THREE.Math.randFloatSpread(range)
      endPosition.z = THREE.Math.randFloatSpread(range)

      geometry.setPrefabData(aStartPosition, x, startPosition.toArray(prefabData))
      geometry.setPrefabData(aEndPosition, x, endPosition.toArray(prefabData))
    }

    console.log('GEOMETRY', geometry, THREE.Math.randFloatSpread(40))

    // axis angle
    // var aAxisAngle = geometry.createAttribute('aAxisAngle', 4)
    // var axis = new THREE.Vector3()
    // var angle
    //
    // for (i = 0, offset = 0; i < prefabCount; i++) {
    //   axis.x = THREE.Math.randFloatSpread(2)
    //   axis.y = THREE.Math.randFloatSpread(2)
    //   axis.z = THREE.Math.randFloatSpread(2)
    //   axis.normalize()
    //   angle = Math.PI * 2
    //
    //   for (j = 0; j < prefabGeometry.vertices.length; j++) {
    //     aAxisAngle.array[offset] = axis.x
    //     aAxisAngle.array[offset + 1] = axis.y
    //     aAxisAngle.array[offset + 2] = axis.z
    //     aAxisAngle.array[offset + 3] = angle
    //
    //     offset += 4
    //   }
    // }

    this.material = new BAS.PhongAnimationMaterial(
      {
        flatShading: true,
        transparent: true,
        uniforms: {
          uTime: {value: 0}
        },
        uniformValues: {
        },
        vertexFunctions: [
          BAS.ShaderChunk['ease_cubic_in_out'],
          BAS.ShaderChunk['ease_quad_out'],
          BAS.ShaderChunk['quaternion_rotation']
        ],
        vertexParameters: [
          'uniform float uTime;',
          'attribute vec2 aAnimation;',
          'attribute vec3 aPosition;',
          'attribute vec4 aAxisAngle;',
          'attribute vec3 aStartPosition;',
          'attribute vec3 aEndPosition;'
        ],
        vertexInit: [
          'float tProgress = clamp(uTime - aAnimation.x, 0.0, aAnimation.y) / aAnimation.y;'
        ],
        vertexPosition: [
          'vec4 tQuat = quatFromAxisAngle(aAxisAngle.xyz, aAxisAngle.w * tProgress);',
          'transformed = rotateVector(tQuat, transformed);',

          'transformed += aPosition;',
          'transformed += mix(aStartPosition, aEndPosition, tProgress);'
        ]
      }
    )

    // THREE.Mesh.call(this, geometry, material)
    this.system = new THREE.Mesh(geometry, this.material)
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
  }
}

export default Brain2
