import * as THREE from 'three'
import 'three/examples/js/loaders/OBJLoader'

class Loaders {
  constructor (startAnimation) {
    this.BRAIN_MODEL = {}
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
  setModel (model) {
    this.BRAIN_MODEL = model
  }

  loadOBJs () {
    let loader = new THREE.OBJLoader(this.loadingManager)
    loader.load('static/models/brain-parts-big_06.OBJ', (model) => {
      this.setModel(model)
    })
  }
}

export default Loaders
