uniform vec3 viewVector;
uniform float c;
uniform float p;
uniform float uTime;
uniform float uBubbleUp;
uniform bool uIsFlashing;
varying float intensity;
attribute float size;
attribute vec4 bubble;
varying float alpha;
 #extension GL_OES_standard_derivatives : enable

void main()
{
    if(uIsFlashing){

    vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), p );


    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    float m = mod(size, sin(uTime * 0.12 + size ));

    alpha = m;
    if(m > 0.5 && m < 0.7){
         gl_PointSize = 0.5 * size;
    }
    if(m > 0.8){
           gl_PointSize = 0.5 * size;
        }

    gl_Position = projectionMatrix * mvPosition;

    if(bubble.w > 0.0 && bubble.x != 0.0 && bubble.y != 0.0) {
        gl_PointSize = size + 20.0;
       // alpha = clamp(sin(uTime + uBurbleUp), 0.1, 1.0);
       alpha = 1.0;

        vec3 tranlated = mix(position, bubble.xyz, uBubbleUp);
        vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );

        gl_PointSize = clamp(uBubbleUp, 1.0, 0.0) * gl_PointSize ;
       // vec4 transformed = vec4(bubble.xyz, 1.0);
        gl_Position +=  projectionMatrix * bPosition ;
    }
    }

}