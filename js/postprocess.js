let guiPostProcessParams = {
  noiseSpeed: 0.001,
  noiseScale: 1200,
  noiseSeparation: 0.7,

  rgbAmount: 0.002,
  rgbAngle: 0.005,
  glowSize: 0.1,
  vigDarkness: 1.0,
  vigOffset: 1.0,

  filmNIntensity: 0.2,
  filmSIntensity: 0.3,
  filmSCount: 800,
  grayscale: false,
  postProcess: false
};


function PostprocessingInit() {
    //create passes
    let renderPass = new THREE.RenderPass(scene, camera);

    //SuperPass adds glow and vignette
    superPass = new THREE.ShaderPass(THREE.SuperShader);
    superPass.uniforms.glowSize.value = 0.2;


    //FXAA smooths out jaggies
    fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
    fxaaPass.uniforms.resolution.value = new THREE.Vector2(
        1 / window.innerWidth,
        1 / window.innerHeight
    );



    rgbShift = new THREE.ShaderPass(THREE.RGBShiftShader);

    filmPass = new THREE.FilmPass(THREE.FilmShader);
    filmPass.uniforms.grayscale.value = false;

    ssaoPass = new THREE.SSAOPass(scene, camera);
    ssaoPass.uniforms.radius.value = 64;

    // filmPass.renderToScreen = true;

    copyShader = new THREE.ShaderPass(THREE.CopyShader);
    copyShader.renderToScreen = true;




    //Add passes to composer
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(fxaaPass);
    // composer.addPass(superPass);
    // composer.addPass(rgbShift);
    composer.addPass(filmPass);
    composer.addPass(ssaoPass);
    composer.addPass(copyShader);
}

function guiPostprocessingInit() {
  //INIT DAT GUI

  let postProcess = gui.addFolder("Post Processing");
  postProcess.add(guiPostProcessParams, "postProcess").name("enable");
//   let rgbParams = postProcess.addFolder("RGB & Vig Effect");
//   rgbParams
//     .add(guiPostProcessParams, "rgbAmount", 0, 0.5)
//     .name("RGB Amount")
//     .onChange(function(value) {
//       rgbShift.uniforms.amount.value = value;
//     });
//   rgbParams
//     .add(guiPostProcessParams, "rgbAngle", 0, Math.PI * 2)
//     .name("RGB Angle")
//     .onChange(function(value) {
//       rgbShift.uniforms.angle.value = value;
//     });
//   postProcess.add(guiPostProcessParams, 'glowSize', 0, 2.0).name('Glow Size').onChange(function(value) {
//       superPass.uniforms.glowSize.value = value;
//   });
//   rgbParams
//     .add(guiPostProcessParams, "vigDarkness", 0, 5.0)
//     .name("Vig Darkness")
//     .onChange(function(value) {
//       superPass.uniforms.vigDarkness.value = value;
//     });
//   rgbParams
//     .add(guiPostProcessParams, "glowSize", 0, 5.0)
//     .name("Vig Offset")
//     .onChange(function(value) {
//       superPass.uniforms.glowSize.value = value;
//     });

  let filmParams = postProcess.addFolder("Film Effect");
  filmParams
    .add(guiPostProcessParams, "filmNIntensity", 0, 5.0)
    .name("Noise Intensity")
    .onChange(function(value) {
      filmPass.uniforms.nIntensity.value = value;
    });
  filmParams
    .add(guiPostProcessParams, "filmSIntensity", 0, 5.0)
    .name("SL Intensity")
    .onChange(function(value) {
      filmPass.uniforms.sIntensity.value = value;
    });
  filmParams
    .add(guiPostProcessParams, "filmSCount", 0, 4096)
    .name("Scan Line")
    .onChange(function(value) {
      filmPass.uniforms.sCount.value = value;
    });
  filmParams
    .add(guiPostProcessParams, "grayscale")
    .name("Grayscale")
    .onChange(function(value) {
      filmPass.uniforms.grayscale.value = value;
    });
}