let camera, scene, renderer, composer;
let container, gui, controler, stats;
let lighthelper, axesHelper, gridHelper, shadowhelper;
let clock, raycaster, mouse, mousetargetpos;
let simplex = new SimplexNoise();

let Colors = {
  green: 0x8fc999,
  blue: 0x5fc4d0,
  orange: 0xee5624,
  yellow: 0xfaff70
};

function init() {
  threeInit();
  sceneInit();
  raycasterInit();
  PostprocessingInit();

  clothInit();
  fireworksInit();
  bubblesInit();
  // fish


  // fishSwim.fish
  // postprocessing();
  gui = new dat.GUI();
  guiThreeInit();
  guiSceneInit();
  guiPostprocessingInit();
  guiClothInit();
  guiFireworksInit();
  guiBubblesInit();

  clock = new THREE.Clock();
  stats = new Stats();
  clock.start();
  document.body.appendChild(stats.dom);
  requestAnimationFrame(this.animation.bind(this));
  // animation(this);
}

function animation(current) {
  // raycaster
  raycaster.setFromCamera(mouse, camera);
  let targetDeepth = 100 + 50 * Math.sin(performance.now() * 0.001);
  fishSwim.target = raycaster.ray.at(targetDeepth, new THREE.Vector3());

  seaplaneAnimaiton();
  cloudAnimation();
  fishAnimation();
  collisionDetection();

  clothAnimation(current);
  fireworksAnimation();
  bubblesAnimation();
  // composer.render();
  stats.begin();
  stats.end();

  // render
  if (guiPostProcessParams.postProcess) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }

  let delta = clock.getDelta();
  if (guiThreeParams.fly) controler.update(delta);

  requestAnimationFrame(this.animation.bind(this));
}

//////////////////////////
let guiThreeParams = {
  orbit: true,
  fly: false,
  helper: true
};

function guiThreeInit() {
  let guiThree = gui.addFolder("Three Setting");
  guiThree
    .add(guiThreeParams, "helper")
    .name("Show Helper")
    .onChange(function (value) {
      gridHelper.visible = value;
      lighthelper.visible = value;
      axesHelper.visible = value;
      shadowhelper.visible = value;
    });
  guiThree
    .add(guiThreeParams, "orbit")
    .name("Oribit Camera")
    .onChange(function (value) {
      if (value) {
        controler = new THREE.OrbitControls(camera, renderer.domElement);
      } else {
        controler = null;
      }
    });
  guiThree
    .add(guiThreeParams, "fly")
    .name("Fly Camera")
    .onChange(function (value) {
      if (value) {
        controler = new THREE.FlyControls(camera);
        controler.movementSpeed = 20;
        controler.domElement = container;
        controler.rollSpeed = Math.PI * 0.1;
        controler.autoForward = false;
        controler.dragToLook = false;
      } else {
        controler = null;
      }
    });
}

function threeInit() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x93CFF3, 50, 300);

  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.set(25, 20, 70);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x93CFF3);

  // light that case shadow
  //   scene.add(new THREE.AmbientLight(0x663344, 3.0));
  let shadowLight = new THREE.DirectionalLight(0xffffff, 1.0);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -100;
  shadowLight.shadow.camera.right = 100;
  shadowLight.shadow.camera.top = 100;
  shadowLight.shadow.camera.bottom = -100;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 8192;
  shadowLight.shadow.mapSize.height = 8192;
  scene.add(shadowLight);
  shadowLight.position.set(-500, 160, -200);

  // sun light with lensflare
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight.position.set(-500, 160, -200);
  directionalLight.castShadow = true;
  var textureLoader = new THREE.TextureLoader();
  var textureFlare0 = textureLoader.load("../asset/textures/lensflare0.png");
  var textureFlare3 = textureLoader.load("../asset/textures/lensflare3.png");
  var lensflare = new THREE.Lensflare();
  lensflare.addElement(
    new THREE.LensflareElement(textureFlare0, 500, 0, directionalLight.color)
  );
  lensflare.addElement(new THREE.LensflareElement(textureFlare3, 60, 0.6));
  lensflare.addElement(new THREE.LensflareElement(textureFlare3, 70, 0.7));
  lensflare.addElement(new THREE.LensflareElement(textureFlare3, 120, 0.9));
  lensflare.addElement(new THREE.LensflareElement(textureFlare3, 70, 1));
  directionalLight.add(lensflare);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight2.position.set(1, 2, 1);
  directionalLight2.castShadow = true;
  scene.add(directionalLight2);

  const ambientLight = new THREE.AmbientLight(0x808080, 0.5);
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xcefeff, 0xb3eaf0, 0.5);
  scene.add(hemisphereLight);

  // camera controler
  controler = new THREE.OrbitControls(camera, renderer.domElement);

  // helper
  lighthelper = new THREE.DirectionalLightHelper(shadowLight);
  shadowhelper = new THREE.CameraHelper(shadowLight.shadow.camera);
  scene.add(shadowhelper);

  axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);
  gridHelper = new THREE.GridHelper(100, 10);
  scene.add(gridHelper);

  window.addEventListener("resize", handleWindowResize, false);
}

function raycasterInit() {
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  document.addEventListener("mousemove", onDocumentMouseMove, false);
}

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function postprocessing() {
  renderer.autoClear = false;

  let renderPass = new THREE.RenderPass(scene, camera);

  let effectFilm = new THREE.DotScreenPass(
    new THREE.Vector2(0.5, 0.5),
    0.3,
    0.5
  );
  // effectFilm.goWild = true;

  effectFilm.renderToScreen = true;

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(effectFilm);
}

init();

/////////////////

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function collisionDetection() {
  let objects = scene.children
  let collideMeshList = []
  let island = Object()
  for (let i = 0; i < objects.length; i++) {
    let obj = objects[i]
    if (obj.name == 'island') {
      island = obj.clone()
    } else if (obj.name == 'fish') {
      collideMeshList.push(obj.children[0])
    }
  }

  let originPoint = island.position.clone();

  for (var vertexIndex = 0; vertexIndex < island.geometry.vertices.length; vertexIndex++) {
    var localVertex = island.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(island.matrix);
    var directionVector = globalVertex.sub(island.position);

    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(collideMeshList);
    if (collisionResults.length > 0) {

      for (let i = 0; i < collisionResults.length; i++) {
        island.material.color.add(collisionResults[i].object.material.color).multiplyScalar(0.5)
      }
    }
  }
}