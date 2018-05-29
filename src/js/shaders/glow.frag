uniform vec3 glowColor;
varying float intensity;
varying float alpha;
void main()
{

 float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float pct = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
        vec3 color = vec3(1.0) * gl_FragColor.rgb;

        vec3 glow = glowColor * intensity;

        gl_FragColor = vec4(glow, step(0.5, abs(alpha)));
        //gl_FragColor.rgb = glow;
        //gl_FragColor.a = clamp(abs(alpha), 0.0, 1.0);
        gl_FragColor = vec4(glow, pct * gl_FragColor.a);


        // gl_FragColor = vec4( glow, 1.0);

}