
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 resolution;
uniform vec3 cameraPosition;
uniform vec2 windowSize;
uniform sampler2D overlayTexture;
uniform sampler2D depthTexture;

varying vec3 vPosition;
varying vec4 vColor;
varying vec4 vShadowCoord;
varying vec3 vLightPosition;

float bias;
float unpackDepth( const in vec4 rgba_depth ) {
	const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
    return dot(rgba_depth, bit_shift);
}
float random(vec4 seed4){
    float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));
	return fract(sin(dot_product) * 43758.5453);
}
float sampleVisibility( vec3 coord ) {
	return step( coord.z, unpackDepth( texture2D( depthTexture, coord.xy + 0. * ( .5 - random( vec4( coord, bias ) ) ) / 2048. ) ) + bias );
}
mat2 rotationMatrix( float a ) {
	return mat2( cos( a ), sin( a ),
 			    -sin( a ), cos( a ) );
}
const float PI = 3.14159265358979323846264;
void main() {
	vec3 fdx = dFdx( vPosition );
	vec3 fdy = dFdy( vPosition );
	vec3 n = normalize(cross(fdx, fdy));
	vec4 base = vec4( 1. );
	vec3 L = normalize( vLightPosition - vPosition );
	vec3 E = normalize( cameraPosition - vPosition );
	float diffuse = max( 0., dot( L, n ) );
	float theta = clamp( -diffuse, 0., 1. );
    bias = 0.005 * tan( acos( theta ) );
    bias = clamp( bias, 0., 0.01 );

	// float shadow = 0.;
	// vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;
	// float step = 4.;
	// vec2 inc = vec2( step ) / resolution;
	// shadow += sampleVisibility( shadowCoord + vec3(     0., -inc.y, 0. ) );
	// shadow += sampleVisibility( shadowCoord + vec3( -inc.x,     0., 0. ) );
	// shadow += sampleVisibility( shadowCoord + vec3(     0.,     0., 0. ) );
	// shadow += sampleVisibility( shadowCoord + vec3(  inc.x,     0., 0. ) );
	// shadow += sampleVisibility( shadowCoord + vec3(     0.,  inc.y, 0. ) );
	// shadow /= 5.;
	//vec4 mask = texture2D( projector, vShadowCoord.xy );

	float shininess = 4.;
	vec3 halfVector = normalize(E + L );
	float specular = dot(n, halfVector);
	specular = max(0.0, specular);
	specular = pow(specular, shininess);
	float ambient = .3;
	float o = diffuse;
	vec3 color = mix( vColor.rgb, vec3( 1. ), .8 * clamp( -n.y, 0., 1. ) );
	vec3 diffuseColor = color * mix( vec3( o ), vec3( 1. ), ambient );
	vec3 specularColor = vec3( 1. );
	base.rgb = diffuseColor;

	// Overlay
	vec2 screenUv = (gl_FragCoord.xy - vec2(0.5, 0.5)) / windowSize.xx;
	screenUv = mod(screenUv, vec2(1., 1.));
	vec3 overlayColor = texture2D(overlayTexture, screenUv).xyz ;

	gl_FragColor = base/* * vec4(overlayColor, 1.0)*/;
}