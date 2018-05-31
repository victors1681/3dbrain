import * as THREE from 'three';
import * as BAS from 'three-bas';
import { TweenMax, Power0 } from 'gsap';

const BezierAnimation = (scene) => {
    const animation = (scene, startPosition, control0Range, control1Range, endPosition) => {
    // each prefab is a plane
        const prefabGeometry = new THREE.PlaneGeometry(4.0, 4.0);
        const prefabCount = 1000;

        // create the buffer geometry with all the prefabs
        const geometry = new BAS.PrefabBufferGeometry(prefabGeometry, prefabCount);

        // ANIMATION

        // the actual duration of the animation is controlled by Animation.animate
        // this duration can be set to any value
        // let's set it to 1.0 to keep it simple
        const totalDuration = this.totalDuration = 1.0;

        geometry.createAttribute('aDelayDuration', 2, (data, i, count) => {
            // calculating the delay based on index will spread the prefabs over the 'timeline'
            data[0] = i / count * totalDuration;
            // all prefabs have the same animation duration, so we could store it as a uniform instead
            // storing it as an attribute takes more memory,
            // but for the sake of this demo it's easier in case we want to give each prefab a different duration
            data[1] = totalDuration;
        });

        // START & END POSITIONS

        // copy the start and end position for each prefab
        // these could be stored as uniforms as well, but we will keep them as attributes for the same reason as aDelayDuration
        geometry.createAttribute('aStartPosition', 3, (data) => {
            data[0] = startPosition.x;
            data[1] = startPosition.y;
            data[2] = startPosition.z;
        });

        geometry.createAttribute('aEndPosition', 3, (data) => {
            data[0] = endPosition.x;
            data[1] = endPosition.y;
            data[2] = endPosition.z;
        });

        // CONTROL POINTS

        // a temp point so we don't create exessive objects inside the factories (they will be called once for each prefab)
        const point = new THREE.Vector3();

        // while the start & end positions for each prefab are the same,
        // the control points are spread out within their respective ranges
        // because of this each prefab will have a different path

        geometry.createAttribute('aControl0', 3, (data) => {
            // pick a random point inside the given range for the first control point
            BAS.Utils.randomInBox(control0Range, point).toArray(data);
        });

        geometry.createAttribute('aControl1', 3, (data) => {
            // pick a random point inside the given range for the second control point
            BAS.Utils.randomInBox(control1Range, point).toArray(data);
        });

        // ROTATION

        // each prefab will get a random axis and an angle around that axis
        const axis = new THREE.Vector3();
        let angle = 0;

        geometry.createAttribute('aAxisAngle', 4, (data) => {
            axis.x = THREE.Math.randFloatSpread(2);
            axis.y = THREE.Math.randFloatSpread(2);
            axis.z = THREE.Math.randFloatSpread(2);
            axis.normalize();

            angle = Math.PI * THREE.Math.randInt(16, 32);

            data[0] = axis.x;
            data[1] = axis.y;
            data[2] = axis.z;
            data[3] = angle;
        });

        // COLOR

        // each prefab will get a psudo-random vertex color
        const color = new THREE.Color();
        let h,
            s,
            l;

        // we will use the built in VertexColors to give each prefab its own color
        // note you have to set Material.vertexColors to THREE.VertexColors for this to work
        geometry.createAttribute('color', 3, (data, i, count) => {
            // modulate the hue
            h = i / count;
            s = THREE.Math.randFloat(0.4, 0.6);
            l = THREE.Math.randFloat(0.4, 0.6);

            color.setHSL(h, s, l);
            color.toArray(data);
        });

        const material = new BAS.PhongAnimationMaterial({
            flatShading: true,
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { type: 'f', value: 0 },
            },
            uniformValues: {
                specular: new THREE.Color(0xff0000),
                shininess: 20,
            },
            vertexFunctions: [
                // cubic_bezier defines the cubicBezier function used in the vertexPosition chunk
                BAS.ShaderChunk.cubic_bezier,
                BAS.ShaderChunk.quaternion_rotation,
            ],
            // note we do not have to define 'color' as a uniform because THREE.js will do this for us
            // trying to define it here will throw a duplicate declaration error
            vertexParameters: [
                'uniform float uTime;',
                'attribute vec2 aDelayDuration;',
                'attribute vec3 aStartPosition;',
                'attribute vec3 aEndPosition;',
                'attribute vec3 aControl0;',
                'attribute vec3 aControl1;',
                'attribute vec4 aAxisAngle;',
            ],
            vertexInit: [
                // tProgress is in range 0.0 to 1.0
                // we want each prefab to restart at 0.0 if the progress is < 1.0, creating a continuous motion
                // the delay is added to the time uniform to spread the prefabs over the path
                'float tProgress = mod((uTime + aDelayDuration.x), aDelayDuration.y) / aDelayDuration.y;',

                'vec4 tQuat = quatFromAxisAngle(aAxisAngle.xyz, aAxisAngle.w * tProgress);',
            ],
            vertexPosition: [
                'transformed = rotateVector(tQuat, transformed);',
                // cubicBezier will return a vec3 on a cubic bezier curve defined by four points
                'transformed += cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);',
            ],
        });

        const system = new THREE.Points(geometry, material);

        scene.add(system);
        return material;
    };

    const pointHelper = (color, size, position) => {
        const point = new THREE.Mesh(
            new THREE.SphereGeometry(size || 1.0, 16, 16),
            new THREE.MeshBasicMaterial({
                color: color || 0xff0000,
                wireframe: true,
            }),
        );

        position && point.position.copy(position);
        return point;
    };

    const lineHelper = (points, params) => {
        const g = new THREE.Geometry();
        const m = new THREE.LineBasicMaterial(params);

        g.vertices = points;

        const line = new THREE.Line(g, m);
        return line;
    };

    // each prefab will start at startPosition (the red point)
    const startPosition = new THREE.Vector3(0, 0, 0);
    // the 1st control point for each prefab will be in control0Range (the red box)
    // the range is defined as a Box3 for easy visualisation
    const control0Range = new THREE.Box3(
        new THREE.Vector3(-400, 400, -1200),
        new THREE.Vector3(400, 600, -800),
    );
    // the 2nd control point for each prefab will be in control1Range (the green box)
    const control1Range = new THREE.Box3(
        new THREE.Vector3(-400, -600, 800),
        new THREE.Vector3(400, -400, 1200),
    );
    // each prefab will end at endPosition (the green point)
    const endPosition = new THREE.Vector3(0, 180, 0);

    // pass the path definition to the animation
    const material = animation(scene, startPosition, control0Range, control1Range, endPosition);
    // animation.animate(8.0, {ease: Power0.easeIn, repeat: -1})

    // debug helpers / visuals
    const debug = new THREE.Group();
    const control0RangeCenter = control0Range.center();
    const control1RangeCenter = control1Range.center();

    debug.add(new pointHelper(0xff0000, 4.0, startPosition));
    debug.add(new pointHelper(0xff0000, 4.0, control0RangeCenter));
    debug.add(new THREE.Box3Helper(control0Range, 0xff0000));
    debug.add(new THREE.Box3Helper(control1Range, 0x00ff00));
    debug.add(new pointHelper(0x00ff00, 4.0, endPosition));
    debug.add(new pointHelper(0x00ff00, 4.0, control1RangeCenter));

    const curve = new THREE.CubicBezierCurve3(
        startPosition,
        control0RangeCenter,
        control1RangeCenter,
        endPosition,
    );
    debug.add(new lineHelper(curve.getPoints(100), {
        color: 0xffff00,
        depthTest: false,
        depthWrite: false,
    }));

    debug.add(new lineHelper([startPosition, control0RangeCenter], {
        color: 0xff0000,
        depthTest: false,
        depthWrite: false,
    }));
    debug.add(new lineHelper([endPosition, control1RangeCenter], {
        color: 0x00ff00,
        depthTest: false,
        depthWrite: false,
    }));

    scene.add(debug);
    return material;
};

export default BezierAnimation;
