uniform vec3 viewVector;
uniform float c;
uniform float p;
uniform float uTime;
uniform vec2 uMouse;
uniform float uFadeTime;
attribute vec2 aDelayDuration;
attribute float size;
varying float intensity;
varying float alpha;

void main()
{
    if(uFadeTime > 0.00001){

    vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), p );

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );

    float m = mod(size, sin( uTime * 10.0 + (position.x + position.y) / 100.0));

        if(m > 0.5 && m < 0.7){
          alpha = clamp(abs(sin(uTime * 10.0)), 0.2, 0.5);
        }
        if(m > 0.8){
          alpha = clamp(abs(sin(uTime * 10.0)), 0.2, 0.5);
        }

        if(m > 0.0 && m < 0.5){
          alpha = clamp(abs(sin(uTime * 10.0)), 0.2, 0.7);
        }

    gl_PointSize = 9.5 * size;

    gl_Position += projectionMatrix * mvPosition;

   }

}