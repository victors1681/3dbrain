uniform vec3 viewVector;
uniform float c;
uniform float p;
uniform float uTime;
uniform float uSlowTime;
uniform float uBubblesUp;
uniform bool uIsFlashing;
uniform vec2 uMouse;
uniform bool isWinnerActive;
uniform float uWinnerSelected;
uniform float uWinnerAlpha;
varying float intensity;
varying vec4 vMemory;
attribute vec2 aDelayDuration;
attribute float size;
attribute vec4 aMemory;
attribute vec4 bubbles;
varying float alpha;
varying vec4 vBubbles;



float easeExpoInOut(float p) {
    return ((p *= 2.0) < 1.0) ? 0.5 * pow(2.0, 10.0 * (p - 1.0)) : 0.5 * (2.0 - pow(2.0, -10.0 * (p - 1.0)));
}

void main()
{

	intensity = 0.9;

    if(uIsFlashing){

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    float m = mod(size, sin(uSlowTime * 0.12 + size ));

    alpha = step(0.5, abs(m));
    if(m > 0.5 && m < 0.7){
         gl_PointSize = 0.9 * size;
    }
    if(m > 0.8){
           gl_PointSize = 0.9 * size;
        }

    gl_Position = projectionMatrix * mvPosition;

    if(bubbles.w > 0.0 && bubbles.w < 2.0 && bubbles.x != 0.0 && bubbles.y != 0.0 ) {
        gl_PointSize = size + 15.0;
        alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 1.0);

        float tProgress = smoothstep(0.0, aDelayDuration.x, uBubblesUp);
        vec3 tranlated = mix(position, bubbles.xyz, tProgress);
        vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );

        gl_PointSize = uBubblesUp * gl_PointSize;
        gl_Position +=  projectionMatrix * bPosition ;
        alpha = 5.0;
    }

    if(bubbles.w == 2.0) {
           alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 0.6);
           gl_PointSize = size + 60.0;

           gl_PointSize = uBubblesUp * gl_PointSize;
           float normalized = clamp(uBubblesUp, 0.0, 2.0)* 2.0;
           vec3 tranlated = mix(position, bubbles.xyz, normalized);
           vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );
           gl_Position +=  projectionMatrix * bPosition ;
    }
      if(bubbles.w == 3.0) {
               alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 1.0);
               gl_PointSize = size + 90.0;

               gl_PointSize = uBubblesUp * gl_PointSize;
               float normalized = clamp(uBubblesUp, 0.0, 2.0)* 2.0;
               vec3 tranlated = mix(position, bubbles.xyz, normalized);
               vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );
               gl_Position +=  projectionMatrix * bPosition ;
        }
    vBubbles = bubbles;

    }

    //Show only the brain section activate and hide all blinking dots ecept memory bubbles
    if(aMemory.w == uWinnerSelected && isWinnerActive){
        vMemory = aMemory;
        intensity = 0.9;
    }else if(bubbles.w != 2.0  && bubbles.w != 3.0 && isWinnerActive ){
        alpha = mix(1.0, 0.0, uWinnerAlpha);
    }

}