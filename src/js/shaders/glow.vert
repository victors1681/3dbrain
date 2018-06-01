uniform vec3 viewVector;
uniform float c;
uniform float p;
uniform float uTime;
uniform float uSlowTime;
uniform float uBubblesUp;
uniform bool uIsFlashing;
uniform vec2 uMouse;
varying float intensity;
attribute vec2 aDelayDuration;
attribute float size;
attribute vec4 bubbles;
varying float alpha;
varying vec4 vBubbles;

 #extension GL_OES_standard_derivatives : enable

float easeExpoInOut(float p) {
    return ((p *= 2.0) < 1.0) ? 0.5 * pow(2.0, 10.0 * (p - 1.0)) : 0.5 * (2.0 - pow(2.0, -10.0 * (p - 1.0)));
}

void main()
{
    if(uIsFlashing){

    vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), p );


    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    float m = mod(size, sin(uSlowTime * 0.12 + size ));

    alpha = step(0.5, abs(m));
    if(m > 0.5 && m < 0.7){
         gl_PointSize = 0.5 * size;
    }
    if(m > 0.8){
           gl_PointSize = 0.5 * size;
        }


    gl_Position = projectionMatrix * mvPosition;

    //vec4 mPosition = modelViewMatrix * vec4( uMouse, 1.0 , 1.0);
    //gl_Position = projectionMatrix * mPosition;

    if(bubbles.w > 0.0 && bubbles.w < 2.0 && bubbles.x != 0.0 && bubbles.y != 0.0) {
        gl_PointSize = size + 15.0;
       // alpha = clamp(sin(uTime + uBurbleUp), 0.1, 1.0);
       //alpha = 1.0;
       alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 1.0);

        //float tProgress = clamp(ububblesUp - aDelayDuration.x, 0.0, aDelayDuration.y);
        float tProgress = smoothstep(0.0, aDelayDuration.x, uBubblesUp);// / aDelayDuration.y;
        //tProgress = easeExpoInOut(tProgress);

        vec3 tranlated = mix(position, bubbles.xyz, tProgress);
        vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );

        gl_PointSize = clamp(uBubblesUp, 1.0, 0.0) * gl_PointSize ;
       // vec4 transformed = vec4(bubbles.xyz, 1.0);
        gl_Position +=  projectionMatrix * bPosition ;
    }

    if(bubbles.w == 2.0) {
           alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 1.0);
           gl_PointSize = size + 85.0;

           gl_PointSize = clamp(uBubblesUp, 1.0, 0.0) * gl_PointSize ;
           float normalized = clamp(uBubblesUp, 0.0, 2.0)* 2.0;
           vec3 tranlated = mix(position, bubbles.xyz, normalized);
           vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );
           gl_Position +=  projectionMatrix * bPosition ;
    }
    vBubbles = bubbles;

    }

}