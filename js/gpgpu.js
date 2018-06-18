let customShader = [
  "../glsl/fragmentShaderText.frag",
  "../glsl/fs-particles-shadow.frag",
  "../glsl/posFShaderText.frag",
  "../glsl/velFShaderText.frag",
  "../glsl/vertexShaderText.vert",
];

function addInteractiveParticles() {
  let WIDTH = 128;
  particlesGeometry = new THREE.BufferGeometry();
  let clampCount = WIDTH * WIDTH;
  let positionsLength = WIDTH * WIDTH * 3 * 18;
  let cubeVerticesPositions = new Float32Array(positionsLength);
  let p = 0;
  for (let j = 0; j < positionsLength; j += 3) {
    cubeVerticesPositions[j] = p;
    cubeVerticesPositions[j + 1] = Math.floor(p / 18);
    cubeVerticesPositions[j + 2] = p % 18;
    p++;
  }
  particlesGeometry.addAttribute('position', new THREE.BufferAttribute(cubeVerticesPositions, 3));

  particleUniforms = {
    texturePosition: { type: "t", value: null },
    textureVelocity: { type: "t", value: null },
    width: { type: "f", value: WIDTH },
    height: { type: "f", value: WIDTH },

    windowSize: { type: "2fv", value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio) },
    // overlayTexture: { type: "t", value: new THREE.TextureLoader().load('img/overlay3.jpg') },

    boxScale: { type: 'v3', value: new THREE.Vector3(0.3, 0.2, 0.8) },
    meshScale: { type: 'f', value: 2.0 },

    depthTexture: { type: 't', value: this.shadowBuffer },
    shadowV: { type: 'm4', value: new THREE.Matrix4() },
    shadowP: { type: 'm4', value: new THREE.Matrix4() },
    resolution: { type: 'v2', value: new THREE.Vector2(this.shadowBufferSize, this.shadowBufferSize) },
    lightPosition: { type: 'v3', value: new THREE.Vector3() },

    boxVertices: {
      type: '3fv',
      value: [
        -1, -1, -1, -1, -1, 1, -1, 1, 1,
        -1, -1, -1, -1, 1, 1, -1, 1, -1,
        1, 1, -1, 1, -1, -1, -1, -1, -1,
        1, 1, -1, -1, -1, -1, -1, 1, -1,
        1, -1, 1, -1, -1, 1, -1, -1, -1,
        1, -1, 1, -1, -1, -1, 1, -1, -1,
        1, 1, 1, 1, -1, 1, 1, -1, -1,
        1, 1, -1, 1, 1, 1, 1, -1, -1,
        -1, -1, 1, 1, -1, 1, 1, 1, 1,
        -1, 1, 1, -1, -1, 1, 1, 1, 1,
        -1, 1, -1, -1, 1, 1, 1, 1, 1,
        1, 1, -1, -1, 1, -1, 1, 1, 1
      ]
    },
    boxNormals: {
      type: '3fv',
      value: [

        1, 0, 0,
        0, 0, 1,
        0, 1, 0

      ]
    },

  };


  particlesmaterial = new THREE.RawShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: customShader[4],
    fragmentShader: customShader[0],
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
  });

  interactiveParticles = new THREE.Mesh(particlesGeometry, particlesmaterial);
  scene.add(interactiveParticles);
}