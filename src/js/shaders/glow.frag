uniform vec3 glowColor;
varying float intensity;
varying float alpha;
uniform float uFlashingAlpha;
uniform bool uIsFlashing;
varying vec4 vBubbles;
varying vec4 vMemory;
uniform bool isWinnerActive;
uniform float uWinnerSelected;
void main()
{

        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float pct = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
        vec3 color = vec3(1.0) * gl_FragColor.rgb;

        vec3 glow = glowColor * intensity;
        if(vBubbles.w == 3.0){ //Winner Bubble
            // glow = vec3(0.0,0.9,0.0) * intensity;
        }

        if(alpha == 5.0) {
            //discard;
        }

        gl_FragColor = vec4(glow, clamp(alpha, 0.0, 1.0));
        gl_FragColor = vec4(glow, pct * gl_FragColor.a);

        if(uIsFlashing){
             gl_FragColor = vec4(glow, pct * gl_FragColor.a * uFlashingAlpha);
        }

        //Show only the brain section activate
        if(vMemory.w == uWinnerSelected && isWinnerActive){
            gl_FragColor += vec4(glow,pct * gl_FragColor.a);
        }

}