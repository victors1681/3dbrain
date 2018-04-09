      uniform float interpolation;
      uniform float radius;
      uniform float u_time;
      attribute float phi;
      attribute float theta;
      attribute float speed;
      attribute float amplitude;
      attribute float frequency;

      vec3 rtp2xyz(){ // the magic is here
       float tmpTheta = theta + u_time * speed;
       float tmpPhi = phi + u_time * speed;
       float r = sin(u_time * frequency) * amplitude * sin(interpolation * 3.1415926);
       float x = sin(tmpTheta) * cos(tmpPhi) * r;
       float y = sin(tmpTheta) * sin(tmpPhi) * r;
       float z = cos(tmpPhi) * r;
       return vec3(x, y, z);
      }

      void main(){
       vec3 newPosition = mix(position, normalize(position) * radius, interpolation);
       newPosition += rtp2xyz();
      	vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
      	gl_PointSize = 1. * ( 1. / length( mvPosition.xyz ) );
      	gl_Position = projectionMatrix * mvPosition;
      }