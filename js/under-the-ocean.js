//海底场景渲染

let circle;
function underSeaInit() {
  initSeaScene();
  initSeaCamera();
  initSeaRender();

  initSeaLight();

  //放置植物
  placePlant(40, 1500, 1500);

  addParticle();
  addInteractiveParticles();

  initText();

  initFloor();

  let pos = [{ x: 50, y: 5 - 100, z: 40 }, { x: 185, y: 0 - 100, z: 30 }, { x: 145, y: 0 - 100, z: 40 }];
  let pos1 = [{ x: 140, y: 5 - 100, z: -20 }, { x: 235, y: 0 - 100, z: 40 }, { x: 250, y: 10 - 100, z: 45 }];
  loadCoral(pos);
  loadKelp(pos1);

  placeStone(200, 1500, 1500, 'range');
  placeSeaGrass(90, 1600, 1600, 3);

  //给定视角范围
  let geometry = new THREE.CircleGeometry(300, 32);
  let material = new THREE.MeshBasicMaterial({
    color: 0x5ec0a3,
  });
  circle = new THREE.Mesh(geometry, material);
  circle.z = -1000;
  circle.visible = false;
  circleScene.add(circle);
}

let guiSeaParams;
//初始化gui
function guiSeaInit() {
  let guiUnderSea = gui.addFolder("Under the Sea Setting");
  guiSeaParams = {
    fogColor: 0xcefaeb,
    sandColor: 0xe1c43f,
    stencilTest: false,
    underTheSea: false
  };
  guiUnderSea.add(guiSeaParams, 'underTheSea').name('under sea').onChange(function (value) {
    if (value) {
      controler = new THREE.OrbitControls(seaCamera, renderer.domElement);
    } else {
      controler = new THREE.OrbitControls(camera, renderer.domElement);
    }
  });
  guiUnderSea.addColor(guiSeaParams, 'sandColor').onChange(function (value) {
    if (guiSeaParams.underTheSea) {
      floor.material.color.set(value);
    }
  });
  guiUnderSea.addColor(guiSeaParams, 'fogColor').onChange(function (value) {
    if (guiSeaParams.underTheSea) {
      underScene.fog.color.set(value);
      circle.material.color.set(value);
    }
  });
  guiUnderSea.add(guiSeaParams, 'stencilTest').onChange(function (value) {
    if (!value) {

      circle.visible = false;

      //启用controler
      if (controler)
        controler.enabled = true;

      //打开深度测试
      stateBuffers.depth.setTest(true);
      stateBuffers.stencil.setTest(false);
      //设置模板可写
      stateBuffers.stencil.setMask(0xff);
    } else {
      circle.visible = true;

      //禁用controler
      if (controler)
        controler.enabled = false;
    }
  });
}

//初始化海底composer
let underComposer;
function initSeaRender() {

  underComposer = new THREE.EffectComposer(renderer);
  let renderPass1 = new THREE.RenderPass(underScene, seaCamera); //保存渲染结果，但不会输出到屏幕
  //renderPass1.clear = false;

  let renderPass2 = new THREE.RenderPass(circleScene, seaCamera);
  renderPass2.clear = false;

  let effectCopy = new THREE.ShaderPass(THREE.CopyShader); //传入了CopyShader着色器，用于拷贝渲染结果
  effectCopy.renderToScreen = true;  //设置输出到屏幕上

  underComposer.addPass(renderPass1);
  underComposer.addPass(renderPass2);
  underComposer.addPass(effectCopy);

  computeRendererInit();
}

//初始化海底场景
let underScene, circleScene;
function initSeaScene() {
  underScene = new THREE.Scene();

  circleScene = new THREE.Scene();

  underScene.fog = new THREE.FogExp2(0x5ec0a3, 0.0018);
  // let grid1=new THREE.GridHelper();
  // underScene.add(grid1);
  // let axes = new THREE.AxesHelper(1000);  
  // underScene.add(axes);


  var path = "../asset/textures/skybox/";       //设置路径
  var format = '.jpg';                        //设定格式
  var urls = [
    path + 'px1' + format,
    path + 'px1' + format,
    path + 'ny' + format,
    path + 'ny' + format,
    path + 'pz1' + format,
    path + 'pz1' + format
  ];
  var textureCube = new THREE.CubeTextureLoader().load(urls);

  underScene.background = textureCube; //作为背景贴图
}

//初始化海底摄像机
let seaCamera;
function initSeaCamera() {
  seaCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
  seaCamera.position.set(0, 90, 400);
}

//初始化海底光照
function initSeaLight() {

  let seaGlobalLight = new THREE.HemisphereLight(0xdddddd, 0xdddddd, .5);
  underScene.add(seaGlobalLight);

  let seaLight = new THREE.DirectionalLight(0xffffff, 0.2);
  seaLight.position.set(0, 150, 50);
  underScene.add(seaLight);
}

//打开模板测试
function StencilTest() {

  let gl = renderer.getContext();

  //打开深度测试和模板测试
  stateBuffers.depth.setTest(true);
  stateBuffers.stencil.setTest(true);
  //设置模板可写
  stateBuffers.stencil.setMask(0xff);
  //设置深度测试和模板测试都通过时设为1
  stateBuffers.stencil.setOp(gl.KEEP, gl.KEEP, gl.REPLACE);

  renderer.clear();

  //写入模板buffer
  stateBuffers.stencil.setFunc(gl.ALWAYS, 1, 0xff);
  stateBuffers.stencil.setMask(0xff);

  renderer.render(circleScene, seaCamera);

  //模板buffer为1时才渲染
  stateBuffers.stencil.setFunc(gl.EQUAL, 1, 0xff);
  stateBuffers.stencil.setMask(0x00);
  stateBuffers.depth.setTest(false);
}

//加载文字
function initText() {
  let loader = new THREE.FontLoader();
  loader.load('./asset/fonts/helvetiker_bold.typeface.json',

    function (font) {

      let geometry1 = new THREE.TextGeometry('Your', {
        font: font,
        size: 60,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelSegments: 5
      });

      let geometry2 = new THREE.TextGeometry('Ocean', {
        font: font,
        size: 60,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelSegments: 5
      });
      let meshMaterial = new THREE.MeshNormalMaterial({
        flatShading: THREE.FlatShading,
        transparent: true,
        opacity: 1.0
      });

      let mesh1 = new THREE.Mesh(geometry1, meshMaterial);
      mesh1.position.set(-220, 80 - 100, 0);

      underScene.add(mesh1);

      let mesh2 = new THREE.Mesh(geometry2, meshMaterial);
      mesh2.position.set(20, 80 - 100, 0);

      underScene.add(mesh1);
      underScene.add(mesh2);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (err) {
      console.log(err);
    }
  );
}

//放置石头
function placeStone(stoneCount, width, height, mode) {
  let Colors = [0xda5823, 0xea7156, 0x148428, 0x781155, 0x2a2664, 0x1154a0];
  for (let i = 0; i < stoneCount; i++) {
    let type = Math.floor(Math.random() * 3);
    let geometry;
    let materials = new THREE.MeshPhongMaterial({
      color: Colors[Math.floor(Math.random() * 6)],
      flatShading: true
    });
    let radius = Math.max(15, Math.random() * 30);
    if (type == 0) {
      geometry = new THREE.OctahedronGeometry(radius, 1);
    } else if (type == 1) {
      geometry = new THREE.DodecahedronGeometry(radius, 0);
    } else {
      geometry = new THREE.TetrahedronGeometry(radius, 1);
    }
    let stone = new THREE.Mesh(geometry, materials);
    //暂时不用加阴影
    //stone.castShadow = true;
    stone.receiveShadow = true;
    if (mode == 'range') {
      let x = (Math.random() - 0.5) * width;
      let z = (Math.random() - 0.5) * height;
      while (x < 300 && x > -50 && z < 150 && z > -50) {
        x = x + 50;
      }
      stone.position.set(x, radius / 2 - Math.random() * 2 - 100, z);
    } else {
      stone.position.set(width + radius, radius / 2 - Math.random() * 3 - 100, height + Math.random() * 20 + radius);
    }

    underScene.add(stone);
  }
}

//浮游生物
let plankton;
function addParticle() {
  let geometry = new THREE.BufferGeometry();
  let vertices = [];
  let textureLoader = new THREE.TextureLoader();
  let sprite = textureLoader.load('./asset/textures/circle.png');

  for (i = 0; i < 3000; i++) {
    let x = Math.random() * 2000 - 1000;
    let y = Math.random() * 2000 - 1000;
    let z = Math.random() * 2000 - 1000;
    vertices.push(x, y, z);
  }
  geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  let materials = new THREE.PointsMaterial({ size: 5, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true });
  materials.color.set(0xffff00);
  plankton = new THREE.Points(geometry, materials);
  plankton.position.set(0, 0, 0);
  plankton.rotation.x = Math.random() * 6;
  plankton.rotation.y = Math.random() * 6;
  plankton.rotation.z = Math.random() * 6;
  underScene.add(plankton);
}

let floor;
function initFloor() {
  floor = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600, 24, 16),
    new THREE.MeshLambertMaterial({
      color: 0xe1c43f,
      side: THREE.DoubleSide,
      flatShading: true
    })
  );
  let vertices = floor.geometry.vertices;
  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i];
    let rand = Math.random() * 20;
    rand = (rand > 10) ? -2 : rand;
    v.z += rand;
  }
  floor.receiveShadow = true;
  floor.geometry.computeVertexNormals();
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0 - 100;
  underScene.add(floor);
}

function seaAnimaiton() {

  plankton.position.set(100 * Math.cos(0.1 * time), 0 - 100, 100 * Math.sin(0.1 * time));

  if (guiSeaParams.stencilTest) {
    StencilTest();
  }
}


// 着色器
let customShader = [
  "../glsl/fragmentShaderText.frag",
  "../glsl/fs-particles-shadow.frag",
  "../glsl/posFShaderText.frag",
  "../glsl/velFShaderText.frag",
  "../glsl/vertexShaderText.vert",
];

// 粒子
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

function calculateInteractivePosition() {

  // interactive position
  raycaster.setFromCamera(mouse, camera);
  let interactPosition = raycaster.ray.at(100, new THREE.Vector3(1, 1, 1));

  let tempArray = [];
  for (let index = 0; index < 32; index++) {
      if (index < 30) {
          tempArray.push(new THREE.Vector3(((index / 5) - 3) * 30, ((index % 5) - 2) * 30, 1));
      } else {
          tempArray.push(interactPosition);
      }
  }
  return tempArray;
}



function computeRendererInit() {
  let WIDTH = 128;
  gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

  let dtPosition = gpuCompute.createTexture();
  let dtVelocity = gpuCompute.createTexture();
  // this.fillPositionTexture(dtPosition);
  // this.fillVelocityTexture(dtVelocity);

  for (let k = 0, kl = dtPosition.image.data.length; k < kl; k += 4) {


      let index = k / 4;
      dtPosition.image.data[k + 0] = Math.random() * 1.; //oriPositions[index * 3];
      dtPosition.image.data[k + 1] = Math.random() * 1.; //oriPositions[index * 3 + 1];
      dtPosition.image.data[k + 2] = Math.random() * 1.; //oriPositions[index * 3 + 2];
      dtPosition.image.data[k + 3] = -1;

  }

  // velocityVariable = gpuCompute.addVariable("textureOriginPosition", customShader[3], dtVelocity);
  velocityVariable = gpuCompute.addVariable("textureVelocity", customShader[3], dtVelocity);
  positionVariable = gpuCompute.addVariable("texturePosition", customShader[2], dtPosition);

  gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
  gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);

  positionUniforms = positionVariable.material.uniforms;
  velocityUniforms = velocityVariable.material.uniforms;

  positionUniforms.delta = { value: 0.0 };
  positionUniforms.floorPosY = { value: -100000. };
  positionUniforms.isReset = { value: false };
  positionUniforms.textureOriginPosition = { value: dtPosition };
  positionUniforms.interactPosition = { value: new THREE.Vector3(9999, 9999, 9999) };


  // let testMatrix1 = new THREE.Matrix4();
  // testMatrix1.set(.1, .2, 13., 14.,
  //     21., 22., 23., 24.,
  //     31., 32., 33., 34.,
  //     41., 42., 43., 44.);
  let tempArray = [];
  for (let index = 0; index < 32; index++) {
      tempArray.push(new THREE.Vector3());
  }
  positionUniforms.interactTest = { value: tempArray };

  velocityUniforms.delta = { value: 0.0 };
  velocityUniforms.floorPosY = { value: -100000. };
  velocityUniforms.forcePos = { value: new THREE.Vector3() };
  velocityUniforms.forceRadius = { value: 100.0 };
  velocityUniforms.isReset = { value: false };
  velocityUniforms.timeScale = { value: 10.0 };
  velocityUniforms.life = { value: 150.0 };
  velocityUniforms.evolution = { value: new THREE.Vector3() };


  velocityVariable.wrapS = THREE.RepeatWrapping;
  velocityVariable.wrapT = THREE.RepeatWrapping;
  positionVariable.wrapS = THREE.RepeatWrapping;
  positionVariable.wrapT = THREE.RepeatWrapping;
  var error = gpuCompute.init();
  if (error !== null) {
      console.error(error);
  }
}
