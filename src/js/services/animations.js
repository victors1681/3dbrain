import * as THREE from 'three';
import * as BAS from 'three-bas';

const Rotation = (scene) => {
    const prefab = new THREE.SphereGeometry(1.0, 20, 20);
    const prefabCount = 50;
    const geometry = new BAS.PrefabBufferGeometry(prefab, prefabCount);

    geometry.createAttribute('aOffset', 1, (data, i, count) => {
        data[0] = i / count;
    });

    geometry.createAttribute('aStartPosition', 3);
    geometry.createAttribute('aEndPosition', 3);

    const data = [];

    for (var i = 0; i < prefabCount; i++) {
        data[0] = THREE.Math.randFloat(48, 150) * (Math.random() > 0.5 ? 1 : -1);
        data[1] = THREE.Math.randFloat(48, 150) * (Math.random() > 0.5 ? 1 : -1);
        data[2] = -26;
        geometry.setPrefabData('aStartPosition', i, data);

        data[2] = 180;
        data[0] = 0;
        data[1] = 0;
        geometry.setPrefabData('aEndPosition', i, data);
    }

    const axis = new THREE.Vector3();
    geometry.createAttribute('aRotation', 4, (data) => {
        BAS.Utils.randomAxis(axis).toArray(data);
        data[3] = Math.PI * 2 * THREE.Math.randInt(-8, 8);
    });

    axis.set(0, 0, 1);
    geometry.createAttribute('aRotation2', 4, (data) => {
        axis.toArray(data);
        data[3] = Math.PI * 2;
    });

    geometry.createAttribute('aScale', 1, (data) => {
        data[0] = THREE.Math.randFloat(0.1, 4.0);
    });

    const aOscillation = geometry.createAttribute('aOscillation', 2);
    let offset = 0;

    for (var i = 0; i < prefabCount; i++) {
        const a = Math.random() * 0.25;

        for (let j = 0; j < geometry.prefabVertexCount; j++) {
            const o = Math.random() * 10;

            aOscillation.array[offset++] = o;
            aOscillation.array[offset++] = a;
        }
    }

    const material = new BAS.PointsAnimationMaterial({
    // shading: THREE.FlatShading,
        vertexColors: THREE.VertexColors,
        // blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        flatShading: true,
        uniformValues: {

            diffuse: new THREE.Color(0x3ea6f2),
            roughness: 0.9,
            metalness: 0.8,
            opacity: 0.3,
        },
        uniforms: {
            uTime: { value: 0 },
            uOscTime: { value: 0 },
            uDuration: { value: 1 },
            uProgress: { vaue: 0.0 },
            uViewVector: { value: THREE.Vector3(0.0, 0.0, 0.0) },
        },
        vertexFunctions: [
            BAS.ShaderChunk.quaternion_rotation,
        ],
        vertexParameters: [
            'uniform float uTime;',
            'uniform float uDuration;',
            'uniform float uOscTime;',
            'uniform float uProgress;',

            'attribute float aOffset;',
            'attribute vec3 aStartPosition;',
            'attribute vec3 aEndPosition;',
            'attribute vec4 aRotation;',
            'attribute vec4 aRotation2;',
            'attribute float aScale;',
            'attribute vec2 aOscillation;',
            'attribute vec3 aColor1;',
            'attribute vec3 aColor2;',
            'uniform vec3 uViewVector;',
        ],
        vertexColor: [
            ` 

`,
        ],
        vertexPosition: [
            // 'float tProgress = uProgress; //mod((uProgress + aOffset), uDuration) / uDuration;',
            `
  	    vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * uViewVector );
	 intensity = pow( 0.8 - dot(vNormal, vNormel), 7.2 );


      float tProgress = clamp(uProgress - aOffset, 0.0, uDuration) / uDuration;
      float osc = 1.0 + sin(aOscillation.x + uOscTime) * aOscillation.y;
      transformed *= aScale * osc * tProgress;

      transformed = rotateVector(quatFromAxisAngle(aRotation.xyz, aRotation.w * tProgress), transformed);
      transformed += mix(aStartPosition, aEndPosition, tProgress);

      transformed = rotateVector(quatFromAxisAngle(aRotation2.xyz, aRotation2.w * tProgress), transformed);
 
	`,
        ],
        varyingParameters: [
            `
  varying float intensity;  
`,
        ],
        fragmentShape: [
            ` 
       float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float pct = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);

       vec3 glow = vec3(1.0,0.0,0.0) * intensity; 
        gl_FragColor = vec4(glow,intensity * gl_FragColor.a);
      `,
        ],
    });

    const stars = new THREE.Mesh(geometry, material);
    stars.rotation.x = Math.PI * 1.5;
    stars.position.x = 1;
    stars.position.z = 5;
    scene.add(stars);

    return { geometry, material };
};

export default Rotation;
