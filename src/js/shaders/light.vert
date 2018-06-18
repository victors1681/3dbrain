attribute float displacement;
varying vec3 vWorldPosition;
varying vec3 vNormal;

// chunk(shadowmap_pars_vertex);

void main() {

    vNormal = normal;

    vec3 newPosition = position + normal * vec3(displacement);

  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
     // chunk(shadowmap_vertex);

     // store the world position as varying for lighting
     vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;


}