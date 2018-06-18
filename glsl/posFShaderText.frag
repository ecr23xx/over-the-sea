uniform float delta;
uniform float floorPosY;
uniform bool isReset;
uniform sampler2D textureOriginPosition;
uniform vec3 interactPosition;

uniform vec3 interactTest[32];


vec3 getData(int id) {
    for (int i=0; i<32; i++) {
        if (i == id) return interactTest[i];
    }
}

void main()	{
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec4 position = texture2D( texturePosition, uv );
	vec4 originPosition = texture2D( textureOriginPosition, uv );
	vec4 velocity = texture2D( textureVelocity, uv );
	float lifeValue = 100.0;
    
	// if (distance(vec3(interactPosition.xy, position.z), position.xyz) < 12. && position.w == 0.) {
	// 	position.w = lifeValue;
	// }
    
    if(position.w < .1) {
        position.w = 100.0;
    }
    
	float newLife = position.w;
	if (position.w < 1.) {
		int temp = int(uv.x * 2.);
		// vec3 temp = vec3(interactTest[0], interactTest[1], interactTest[2]);
		position.xyz = getData(int(uv.x * 32.)) + originPosition.xyz;
		position.w = 100.0;
	}
	newLife = newLife - 1.0 * 0.1 * (uv.x + originPosition.x) - 0.5 ;

	newLife = clamp(newLife, 0., lifeValue);

	gl_FragColor = vec4( position.xyz + velocity.xyz, newLife );
}

