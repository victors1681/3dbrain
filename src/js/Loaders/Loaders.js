import * as THREE from 'three'
import 'three/examples/js/loaders/OBJLoader'

class Loaders {
  constructor (startAnimation) {
    this.BRAIN_MODEL = {}
    this.AMELIA_MODEL = {}
    this.models = ['brain-parts-big_07.OBJ', 'amelia_standingv2.obj']
    this.loadingManager = new THREE.LoadingManager()
    this.startAnimation = startAnimation
    this.loadingManager.onLoad = this.handlerLoad.bind(this)
    this.loadingManager.onProgress = this.handlerProgress
    this.loadingManager.onError = this.handlerError
    this.loadingManager.onStart = this.handlerStart
    this.setModel = this.setModel.bind(this)
    this.loadOBJs()
  }

  handlerStart () {
    console.log('Starting')
  }
  handlerProgress (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.')
  }
  handlerLoad () {
    console.log('loading Complete!')
    this.startAnimation()
  }
  handlerError (url) {
    console.log('There was an error loading ' + url)
  }
  setModel (model, i) {
    switch (i) {
      case 0:
        this.BRAIN_MODEL = model
        break
      case 1:
        this.AMELIA_MODEL = model
        break
      default:
        this.BRAIN_MODEL = model
    }
  }

  loadOBJs () {
    let loader = new THREE.OBJLoader(this.loadingManager)
    this.models.forEach((m, i) => {
      loader.load(`static/models/${m}`, (model) => {
        this.setModel(model, i)
      })
    })
  }
}

export default Loaders
