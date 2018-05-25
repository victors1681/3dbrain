import * as THREE from 'three'
import 'three/examples/js/BufferGeometryUtils'
import * as dat from 'three/examples/js/libs/dat.gui.min'
import * as BAS from 'three-bas'
import { TweenMax, Power0 } from 'gsap'
import Loaders from './Loaders/Loaders'
import AbstractApplication from 'views/AbstractApplication'
import Chuncks from './services/chunks'

class Brain3 extends AbstractApplication {
  constructor () {
    super()
    this.chuncks = new Chuncks()
    this.OBJ_MODELS = {}
    this.clock = new THREE.Clock()
    this.addBrain = this.addBrain.bind(this)
    console.log(this.particleSystem, this.sinSimulation)
    this.createFloor()

    this.t = 0
    this.deltaTime = 0
    this.particlesColor = new THREE.Color(0xffffff)
    this.particlesStartColor = new THREE.Color(0xffffff)
    this.loaders = new Loaders(this.runAnimation.bind(this))
    this.pointSizeEffect = 0.1
    this.memories = {}
  }

  createFloor () {
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

    let geometry = new THREE.PlaneBufferGeometry(20000, 20000)
    // let material = new THREE.ShadowMaterial({ opacity: 0.w, color: '0xE7EBF3' })
    let material = new THREE.MeshPhongMaterial({
      // color: '0xCED7DF',
      // color: 0xE7EBF3,
      opacity: 0.1,
      transparent: true
    })
    this.plane = new THREE.Mesh(geometry, material)
    this.plane.receiveShadow = true
    this.plane.position.y = -160
    this.plane.rotation.x = -0.5 * Math.PI
    this.scene.add(this.plane)
  }

  initGui () {
    this.controls = new function () {
      this.rotationSpeed = 0.5
      this.color0 = 0xB8C5CF
      this.startColor = 0x3EA6F2
      this.floor = 0xDDE3E9
      this.transitioning = false
      this.autoRotate = false
      this.lightIntensity = 1.45
      this.lightDistance = 175
      this.lightAngle = Math.PI / 2
      this.lightPenumbra = 0.0
      this.lightDecay = 0.0
      this.lightHelper = false
      this.angle = 1.0
      this.pointSizeEffect = 0.0
    }()

    var gui = new dat.GUI()
    gui.add(this.controls, 'rotationSpeed', 0, 2.0)
    gui.add(this.controls, 'lightIntensity', 0.0, 2.0).onChange((val) => {
      this.spotLight.intensity = val
    })

    gui.add(this.controls, 'lightHelper').onChange((val) => {
      if (val) {
        this.scene.add(this.spotLightHelper)
      } else {
        this.scene.remove(this.spotLightHelper)
      }
    })
    gui.add(this.controls, 'lightDistance', 0.0, 1800.0).onChange((val) => {
      this.spotLight.position.set(0, val, -10)
    })
    gui.add(this.controls, 'lightAngle', 0.0, 5.0).onChange((val) => {
      this.spotLight.angle = val
    })
    gui.add(this.controls, 'lightPenumbra', 0.0, 1.0).onChange((val) => {
      this.spotLight.penumbra = val
    })
    gui.add(this.controls, 'lightDecay', 0.0, 2.0).onChange((val) => {
      this.spotLight.decay = val
    })
    gui.add(this.controls, 'pointSizeEffect', -500.0, 500.0).onChange((val) => {
      this.pointSizeEffect = val
    })

    gui.addColor(this.controls, 'color0').onChange((e) => this.particlesColor = new THREE.Color(e))

    gui.addColor(this.controls, 'startColor').onChange((e) => this.particlesStartColor = new THREE.Color(e))

    gui.addColor(this.controls, 'floor').onChange((e) => {
      console.log(this.plane.material.color)
      this.plane.material.color = new THREE.Color(e)
    })
    gui.add(this.controls, 'angle', 0.0, 2.0).onChange((val) => {
      this.material.uniforms['uAngle'].value = val
    })

    gui.add(this.controls, 'autoRotate').onChange((val) => {
      this._controls.autoRotate = val
    })

    gui.add(this.controls, 'transitioning').onChange((e) => {
      console.log(e)
      this.material.uniforms['test'].value = e
      if (e) {
        const progress = { p: 0.0 }
        TweenMax.fromTo(progress, 1.5, {p: 0.0}, { p: 1.5,
          ease: Power0.easeIn,
          onUpdate: (value) => {
            this.material.uniforms['uProgress'].value = progress.p
            this.system.customDepthMaterial.uniforms['uProgress'].value = progress.p
            this.system.customDistanceMaterial.uniforms['uProgress'].value = progress.p
          }})
      } else {
        const progress = { p: 1.0 }
        TweenMax.fromTo(progress, 1.5, {p: 1.5}, { p: 0.0,
          ease: Power0.easeIn,
          onUpdate: (value) => {
            this.material.uniforms['uProgress'].value = progress.p
            this.system.customDepthMaterial.uniforms['uProgress'].value = progress.p
            this.system.customDistanceMaterial.uniforms['uProgress'].value = progress.p
          }})
      }
      // return this.material.uniforms['test'].value = e
    })
  }

  addBrain () {
    console.error('brain', this.loaders.BRAIN_MODEL)
    this.brainBufferGeometries = []
    this.uniqueBrain = new THREE.BufferGeometry()

    var memories = {
      afective: [],
      analitic: [],
      process: [],
      semantic: [],
      episodic: [],
      cerebellum: [],
      bridge: [],
      amigdala: []
    }

    this.loaders.BRAIN_MODEL.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return
      }
      child.geometry.verticesNeedUpdate = true
      this.brainBufferGeometries.push(child.geometry)

      memories = { ...memories, ...this.storeBrainVertices(child, memories) }
    })

    this.endPointsCollections = THREE.BufferGeometryUtils.mergeBufferGeometries(this.brainBufferGeometries)
    console.log('Unique Geometry', this.endPointsCollections)

    this.memories = memories
    console.log('Unique Geometry', this.memories)
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
    this.initGui()
    this.addBrain()
    // this.loadAmelia()
    this.startAnimation()
    this.animate()
  }
  animate (timestamp) {
    this._controls.update()
    this._controls.autoRotateSpeed = this.controls.rotationSpeed
    this.deltaTime += this.clock.getDelta()

    this.material.uniforms['uTime'].value = this.deltaTime
    // console.log("tiime", Math.sin(this.deltaTime))
    this.system.customDepthMaterial.uniforms['uTime'].value = Math.sin(this.deltaTime)
    this.system.customDistanceMaterial.uniforms['uTime'].value = Math.sin(this.deltaTime)

    this.material.uniforms['uPointSizeEffect'].value = this.pointSizeEffect

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
        var aStartPos = animation.geometry.attributes.aStartPos

        var aEndColor = animation.geometry.attributes.aEndColor
        var aStartColor = animation.geometry.attributes.aStartColor

        // for (var i = 0; i < aStartPos.array.length; i++) {
        //   aStartColor.array[i * 3 + 0] = me.particlesStartColor.r
        //   aStartColor.array[i * 3 + 1] = me.particlesStartColor.g
        //   aStartColor.array[i * 3 + 2] = me.particlesStartColor.b
        // }

        for (var i = 0; i < aEndPos.array.length; i++) {
          // use current picture info to set aEndPos and aEndColor of buffer geometry,
          // if picture info length is less than geometry points length, set default value
          if (i < curPicPoints.length) {
            aEndPos.array[i * 3 + 0] = curPicPoints[i * 3 + 0] || 0
            aEndPos.array[i * 3 + 1] = curPicPoints[i * 3 + 1] || 0
            aEndPos.array[i * 3 + 2] = curPicPoints[i * 3 + 2] || 0

            aEndColor.array[i * 3 + 0] = me.particlesColor.r
            aEndColor.array[i * 3 + 1] = me.particlesColor.g
            aEndColor.array[i * 3 + 2] = me.particlesColor.b
          } else {
            aEndPos.array[i * 3 + 0] = 0
            aEndPos.array[i * 3 + 1] = 0
            aEndPos.array[i * 3 + 2] = 0
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

  getLoadingPoints () {
    // const geometry = new THREE.TorusBufferGeometry(30, 15, 80, 300, 0, 7)
    var geometry = new THREE.RingBufferGeometry(100, 40, 150, 150, 20)
    // const geometry = new THREE.BoxBufferGeometry(150, 150, 150, 50, 50, 50)
    console.log('turos', geometry)
    return geometry.attributes.position.array
  }

  ParticleSystem () {
    var brainPoints = this.endPointsCollections.attributes.position.array
    // var ameliaPoints = this.endPointsCollectionsAmelia.attributes.position.array

    const count = brainPoints.length
    const me = this

    const geometry = new BAS.PointBufferGeometry(count)

    const shineGeometry = new BAS.PointBufferGeometry(this.memories.episodic[0].attributes.position.array.length)

    shineGeometry.createAttribute('aEpisodic', 3, (data, index) => {
      const v = new THREE.Vector3()
      v.x = me.memories.episodic[0].attributes.position.array[index * 3 + 0] || 0
      v.y = me.memories.episodic[0].attributes.position.array[index * 3 + 1] || 0
      v.z = me.memories.episodic[0].attributes.position.array[index * 3 + 2] || 0
      v.toArray(data)
    })

    const loadingCircle = this.getLoadingPoints()
    geometry.createAttribute('aStartLoading', 3, (data, index, num) => {
      const startVec3 = new THREE.Vector3()
      startVec3.x = loadingCircle[index * 3 + 0] || 0
      startVec3.y = loadingCircle[index * 3 + 1] || 0
      startVec3.z = THREE.Math.randFloat(-80.0, 80.0) // loadingCircle[index * 3 + 2] || 0
      startVec3.toArray(data)
    })

    // geometry.createAttribute('aStartPos', 3, (data, index, num) => {
    //   var startVec3 = new THREE.Vector3()
    //   startVec3.x = ameliaPoints[index * 3 + 0]
    //   startVec3.y = ameliaPoints[index * 3 + 1] - 150
    //   startVec3.z = ameliaPoints[index * 3 + 2]
    //   startVec3.toArray(data)
    // })

    var color = new THREE.Color()
    this.aStartColor = geometry.createAttribute('aStartColor', 3, (data, index, num) => {
      const r = me.particlesStartColor.r
      const g = me.particlesStartColor.g
      const b = me.particlesStartColor.b

      color.setRGB(r, g, b)
      color.toArray(data)
    })

    this.aEndColor = geometry.createAttribute('aEndColor', 3, (data, index, num) => {
      const r = me.particlesColor.r
      const g = me.particlesColor.g
      const b = me.particlesColor.b

      color.setRGB(r, g, b)
      color.toArray(data)
    })

    geometry.createAttribute('aEndPos', 3, (data, index, num) => {
      var startVec3 = new THREE.Vector3()
      // var randSphere = ameliaPoints[index]
      startVec3.x = brainPoints[index * 3 + 0] || 0
      startVec3.y = brainPoints[index * 3 + 1] || 0
      startVec3.z = brainPoints[index * 3 + 2] || 0
      startVec3.toArray(data)
    })

    var duration = 1.0
    var maxPointDelay = 0.3
    this.totalDuration = duration + maxPointDelay

    geometry.createAttribute('aDelayDuration', 3, (data, index, num) => {
      data[0] = Math.random() * maxPointDelay
      data[1] = duration
    })

    this.material = new BAS.PointsAnimationMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: THREE.VertexColors,
      deptWrite: false,
      uniforms: {
        uTime: { type: 'f', value: 0 },
        test: { type: 'bool', value: false },
        uProgress: { type: 'float', value: 0.0 },
        uBackColor: {value: new THREE.Color().setHSL(0, 100.0, 96)},
        uAngle: { type: 'f', value: 1.0 },
        uPointSizeEffect: { type: 'f', value: 0.1 }
      },
      uniformValues: {
        size: 2.5,
        sizeAttenuation: true
      },
      vertexFunctions: [
        BAS.ShaderChunk['ease_expo_in_out'],
        BAS.ShaderChunk['quaternion_rotation'],
        this.chuncks.rotate,
        this.chuncks.random,
        this.chuncks.noise
      ],

      vertexParameters: [
        'uniform float uTime;',
        'uniform bool test;',
        'uniform float uPointSizeEffect;',
        'uniform float uProgress;',
        'uniform float uAngle;',
        'attribute vec2 aDelayDuration;',
        'attribute vec3 aStartLoading;',
        'attribute vec3 aStartPos;',
        'attribute vec3 aEndPos;',
        'attribute vec3 aStartColor;',
        'attribute vec3 aEndColor;',
        'attribute float aStartOpacity;',
        'attribute float aEndOpacity;'
      ],
      varyingParameters: [
        `
          varying vec3 vParticle;
          `
      ],
      // this chunk is injected 1st thing in the vertex shader main() function
      // variables declared here are available in all subsequent chunks
      vertexInit: [
        // calculate a progress value between 0.0 and 1.0 based on the vertex delay and duration, and the uniform time
        'float tProgress = clamp(uProgress - aDelayDuration.x, 0.0, aDelayDuration.y) / aDelayDuration.y;',
        // // ease the progress using one of the available easing functions
        'tProgress = easeExpoInOut(tProgress);'
        // 'tProgress = uProgress;'
        // 'if(test){ tProgress = 0.0; } else { tProgress = 1.0 ;}'
      ],
      // this chunk is injected before all default position calculations (including the model matrix multiplication)
      vertexPosition: [`
        // linearly interpolate between the start and end position based on tProgress
        // and add the value as a delta
        //transformed += mix(aStartPos, aEndPos, tProgress);
        
        //transformed += mix(aStartLoading, aEndPos, tProgress);
        
        if(tProgress < 0.5){ 
         vec2 pos = vec2(aStartLoading.xy*5.0);

        // Use the noise function
        float n = noise(aStartLoading.yx);
     vec2 test;
      if(mod(aStartLoading.x, 2.0) < 0.2){
            test = rotate2D(aStartLoading.xy, PI*2.0 * uTime * uAngle * n);
             transformed += vec3(test.x, test.y, aStartLoading.z * n);
        }else if (mod(aStartLoading.x, 2.0) >= 0.2 && mod(aStartLoading.x, 2.0) < 1.5){
            test = rotate2D(aStartLoading.xy + n, PI*2.0 * uTime * 0.05 * uAngle * n);
            transformed += vec3(test.x, test.y, aStartLoading.z * n);
        }else {
            test = rotate2D(aStartLoading.xy + n, PI*2.0 * uTime * 0.01 * uAngle * n);
            transformed += vec3(test.x, test.y , aStartLoading.z * n);
        }
        }else{
          transformed = mix(aStartLoading, aEndPos, tProgress);
        } 
        
       
        `
      ],
      // this chunk is injected before all default color calculations
      vertexColor: [
        // linearly interpolate between the start and end position based on tProgress
        // and add the value as a delta
        `
        vColor = mix(aStartColor, aEndColor, tProgress);
        // for(int i = -100; i <=  100 ; i++){
          gl_PointSize = size;
          
          //for(var i = 0.0 ; i < )
          
        //  if(aEndPos.y < 0.0) {
            gl_PointSize = clamp( aEndPos.y * sin( -uPointSizeEffect/1000.0 + 3.1416 ), 1.0, size);
            // not working gl_PointSize = smoothstep( 1.0, size, aEndPos.y * sin( -uPointSizeEffect/1000.0 + 3.1416 ));
          //float pct += sin( -uPointSizeEffect/1000.0 + uTime );
          //float pct += sin( -uPointSizeEffect/1000.0 + uTime );
          
          //gl_PointSize = mix(size, 0.1, pct * sin(uTime));
            
        //  }else{
             //gl_PointSize = smoothstep(1.0,4.0, ceil(aEndPos.y) * sin(uTime));
         // }
          //}
          // float test;
          //  for(float i = 0.0; i <=  12.0 ; i+= 1.0){
          //   test += abs(1.0 / (100.0 * aEndPos.y));
          //  }
          
        
           gl_PointSize = 2.5;
             
           vParticle = aEndPos;
        `

        // 'vColor = vec3(abs(sin(uTime)) * 0.1 *n, abs(sin(uTime)) * n2, abs(sin(uTime))*n);'
      ],

      fragmentParameters: [
        'uniform vec3 uBackColor;',
        'uniform float uTime;'
      ],
      // convert the point (default is square) to circle shape, make sure transparent of material is true
      // you can create more shapes: https://thebookofshaders.com/07/
      fragmentShape: [
        ` 
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float pct = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
  
        vec3 color = gl_FragColor.rgb;
         
        gl_FragColor = vec4(color, pct * gl_FragColor.a);
 
         
       `],

      fragmentDiffuse: [
        // gl_FrontFacing is a built-in glsl variable that indicates if the current fragment is front-facing
        // if its not front facing, set diffuse color to uBackColor
        ' diffuseColor.rgb = uBackColor.xyz;'
      ]
    })

    // Use THREE.point to create particles

    this.frustumCulled = false

    this.system = new THREE.Points(geometry, this.material)
    this.system.castShadow = true
    this.scene.add(this.system)
    console.error(this.system)

    // depth material is used for directional & spot light shadows
    this.system.customDepthMaterial = BAS.Utils.createDepthAnimationMaterial(this.material)
    // distance material is used for point light shadows
    this.system.customDistanceMaterial = BAS.Utils.createDistanceAnimationMaterial(this.material)

    return this.system
  }
}

export default Brain3
