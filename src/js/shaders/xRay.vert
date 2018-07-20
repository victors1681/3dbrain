uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main()
        {
              vec3 vNormal = normalize( normalMatrix * normal );
                  intensity = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), p);
                  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );


          //  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }