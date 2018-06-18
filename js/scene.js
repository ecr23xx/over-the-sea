let seaPlane;

let guiSceneParams = {
  showFish: false,
  seaPlaneColor: 0x70A5C5,
  skyAndFogColor: 0x93CFF3,
  islandColor: 0xffffff,
  collisionDetect: false
};

function getRandomColor() {
  let colorsLength = Object.keys(Colors).length;
  let index = Math.floor(Math.random() * colorsLength);
  let key = Object.keys(Colors)[index];
  return Colors[key];
}

function getMaterialbyColor(color) {
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    emissive: 0x270000,
    flatShading: true
    // side: THREE.DoubleSide
  });
}

function sceneInit() {
  // seaPlaneInit();
  islandInit();
  treeInit();
  // cloudInit();
  fishInit();
}

function guiSceneInit() {
  let guiScene = gui.addFolder("Scene Setting");
  guiScene
    .addColor(guiSceneParams, "seaPlaneColor")
    .name("sea")
    .onChange(function (value) {
      seaPlane.material.color.set(value);
    });
  guiScene
    .addColor(guiSceneParams, "skyAndFogColor")
    .name("sky & fog")
    .onChange(function (value) {
      renderer.setClearColor(value);
      scene.fog.color.set(value);
    });
  guiScene
    .addColor(guiSceneParams, "islandColor")
    .name("Island")
    .onChange(function (value) {
      mars.material.color.set(value);
    });
  guiScene
    .add(guiSceneParams, "showFish")
    .name("show Fish")
    .onChange(function (value) {
      for (let index = 0; index < fishSwim.fish.length; index++) {
        const element = fishSwim.fish[index];
        element.visible = value;
      }
    });
  guiScene
    .add(guiSceneParams, "collisionDetect");
}

// cloud
let cloudRoot = new THREE.Group();

function cloudInit() {
  let totalCloud = 50;
  let maxDist = 300;
  let minDist = 80;
  for (let i = 0; i < totalCloud; i++) {
    // const element = array[i];

    let angle = (Math.PI * 2 * i) / totalCloud;
    let dist = Math.random() * (maxDist - minDist) + minDist;

    let scale = Math.random() * 10 + 5;
    let rockGeo;
    let choose = Math.random();

    if (choose < 0.5) {
      rockGeo = new THREE.BoxGeometry(scale, scale, scale);
    } else {
      rockGeo = new THREE.OctahedronGeometry(scale, 1);
    }
    let rock = new THREE.Mesh(rockGeo, getMaterialbyColor(0xd8d0d1));
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.userData.dist = dist;
    rock.userData.angle = angle;
    rock.userData.y = (Math.random() - 0.5) * 5;
    // rock.receiveShadow = true;
    // rock.castShadow = true;
    cloudRoot.add(rock);
    updateCloud(rock);
  }
  scene.add(cloudRoot);
}

function cloudAnimation() {
  for (let i = 0; i < cloudRoot.children.length; i++) {
    const element = cloudRoot.children[i];
    updateCloud(element);
  }

  let intersects = raycaster.intersectObjects(cloudRoot.children);
  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.material.color.set(0xff0000);
  }
}

function updateCloud(rock) {
  let maxDist = 300;

  rock.userData.angle += (0.003 * rock.userData.dist) / maxDist;
  let tempX = 0 + Math.sin(rock.userData.angle) * rock.userData.dist;
  let tempY = 100 + rock.userData.y;
  let tempZ = 0 + Math.cos(rock.userData.angle) * rock.userData.dist;
  rock.position.set(tempX, tempY, tempZ);

  rock.rotation.x += Math.random() * 0.001;
}

// sea plane
function seaPlaneInit() {
  seaPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 800, 100, 100),
    getMaterialbyColor(guiSceneParams.seaPlaneColor)
  );
  seaPlane.rotation.set(-Math.PI * 0.5, 0, Math.PI * 0.5);
  seaPlane.position.set(0, -20.0, 0);
  seaPlane.castShadow = seaPlane.receiveShadow = true;
  seaPlane.name = 'seaPlane'
  scene.add(seaPlane)
}

function seaplaneAnimaiton() {
  for (let index = 0; index < seaPlane.geometry.vertices.length; index++) {
    let element = seaPlane.geometry.vertices[index];
    let tempHigh =
      10.0 *
      simplex.noise3D(
        element.x * 0.015,
        element.y * 0.015,
        performance.now() * 0.0003
      );
    seaPlane.geometry.vertices[index].z = tempHigh;
  }
  seaPlane.geometry.uvsNeedUpdate = true;
  seaPlane.geometry.verticesNeedUpdate = true;
}
