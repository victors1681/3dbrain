import * as THREE from 'three';
import { Power2, TweenLite } from 'gsap';

class Font {
    constructor(loader, scene) {
        this.font = loader.FONT;
        this.scene = scene;
    }

    makeTextSprite(_message, _parentObject, _position, size = 2) {
        const message = _message;
        const parentObject = _parentObject;
        const position = _position;
        if (parentObject) {
            const group = new THREE.Group();
            this.scene.add(group);
            const textMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1, 2, 1),
                side: THREE.DoubleSide,
                wireframe: false,
            });
            const textShapes = this.font.generateShapes(message, size, size);
            const text3d = new THREE.ShapeGeometry(textShapes);
            text3d.computeBoundingBox();
            const text = new THREE.Mesh(text3d, textMaterial);
            const centerOffset = text.geometry.boundingBox.max.x / 2.0;
            text.position.set(position.x - centerOffset, position.y - 10, position.z);
            text.type = 'Font';

            text.material.opacity = 0;
            text.material.transparent = true;
            parentObject.add(text);

            TweenLite.to(text.material, 2.5, { ease: Power2.easeOut, opacity: 1.0 });
            TweenLite.to(text.position, 2.5, { ease: Power2.easeOut, y: position.y + 2 });
        }
    }

    removeText(parentGroup) {
        const removeFrom = parentGroup || this.scene || [];

        removeFrom.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.type === 'Font') {
                TweenLite.to(obj.material, 2.5, { ease: Power2.easeOut, opacity: 0.0 });
                TweenLite.to(obj.position, 2.5, { ease: Power2.easeOut, y: obj.position.y - 10, onComplete: () => { obj.parent.remove(obj); } });
            }
        });
    }

    facingToCamera(camera, parentGroup) {
        const facing = parentGroup || this.scene || [];

        facing.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.type === 'Font') {
                obj.lookAt(camera.position);
            }
        });
    }
}
export default Font;
