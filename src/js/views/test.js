/**
 * Very simple example rendering pure Three.js HUD on top of
 * a 3D scene.
 *
 * For more info, read the blog post about this experiment:
 * http://www.evermade.fi/pure-three-js-hud/
 *
 * For more fanciness, follor me on Twitter @jalajoki
 */
document.addEventListener('DOMContentLoaded', () => {
    // We start by creating our 3D content. In this case a
    // very simple spinning cube.

    // Create scene for 3D content.
    const scene = new THREE.Scene();

    // Create shortcuts for window size.
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create camera and move it a bit further. Make it to look to origo.
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 500);
    camera.position.y = 100;
    camera.position.z = 100;
    camera.position.x = 100;
    camera.lookAt(scene.position);

    // Create renderer.
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(width, height);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);

    // Let there be light!
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(50, 50, 50);
    scene.add(light);

    // And the box.
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    var material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);


    // Ok, now we have the cube. Next we'll create the hud. For that we'll
    // need a separate scene which we'll render on top of our 3D scene. We'll
    // use a dynamic texture to render the HUD.

    // We will use 2D canvas element to render our HUD.
    const hudCanvas = document.createElement('canvas');

    // Again, set dimensions to fit the screen.
    hudCanvas.width = width;
    hudCanvas.height = height;

    // Get 2D context and draw something supercool.
    const hudBitmap = hudCanvas.getContext('2d');
    hudBitmap.font = 'Normal 40px Arial';
    hudBitmap.textAlign = 'center';
    hudBitmap.fillStyle = 'rgba(245,245,245,0.75)';
    hudBitmap.fillText('Initializing...', width / 2, height / 2);

    // Create the camera and set the viewport to match the screen dimensions.
    const cameraHUD = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 30);

    // Create also a custom scene for HUD.
    sceneHUD = new THREE.Scene();

    // Create texture from rendered graphics.
    const hudTexture = new THREE.Texture(hudCanvas);
    hudTexture.needsUpdate = true;

    // Create HUD material.
    var material = new THREE.MeshBasicMaterial({ map: hudTexture });
    material.transparent = true;

    // Create plane to render the HUD. This plane fill the whole screen.
    const planeGeometry = new THREE.PlaneGeometry(width, height);
    const plane = new THREE.Mesh(planeGeometry, material);
    sceneHUD.add(plane);


    // Now we have two scenes. Only thing we need now is a render loop!
    function animate() {
        // Rotate cube.
        cube.rotation.x += 0.01;
        cube.rotation.y -= 0.01;
        cube.rotation.z += 0.03;

        // Update HUD graphics.
        hudBitmap.clearRect(0, 0, width, height);
        hudBitmap.fillText(`RAD [x:${(cube.rotation.x % (2 * Math.PI)).toFixed(1)}, y:${(cube.rotation.y % (2 * Math.PI)).toFixed(1)}, z:${(cube.rotation.z % (2 * Math.PI)).toFixed(1)}]`, width / 2, height / 2);
        hudTexture.needsUpdate = true;

        // Render scene.
        renderer.render(scene, camera);

        // Render HUD on top of the scene.
        renderer.render(sceneHUD, cameraHUD);

        // Request new frame.
        requestAnimationFrame(animate);
    }

    // Start animation.
    animate();
});

