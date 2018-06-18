varying vec3 vNormal;
varying vec3 vWorldPosition;
// chunk(shadowmap_pars_fragment);


void main(){

// calc the dot product and clamp
			// 0 -> 1 rather than -1 -> 1
			vec3 light = vec3(0.5,0.2,1.0);

			// ensure it's normalized
			light = normalize(light - vWorldPosition);

			 vec3 outgoingLight = vec3(1.0);
			// chunk(shadowmap_fragment);

			float dProd = max(0.0, dot(vNormal, light));

			// feed into our frag colour
			gl_FragColor = vec4(dProd, dProd, dProd, 1.0);

}