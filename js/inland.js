let island;
let tree = [];

function islandInit() {
  // island
  let islandGeo = new THREE.TetrahedronGeometry(150, 4);
  island = new THREE.Mesh(islandGeo, getMaterialbyColor(0xffffff));
  island.position.set(30, -25, -100);
  island.scale.set(1, 0.3, 0.7);
  island.receiveShadow = true;
  island.castShadow = true;
  island.name = 'island'
  scene.add(island);
  let noise = 10;
  for (let i = 0; i < islandGeo.vertices.length; i++) {
    const element = islandGeo.vertices[i];
    element.x += (Math.random() - 0.5) * noise;
    element.y += (Math.random() - 0.5) * noise;
    element.z += (Math.random() - 0.5) * noise;
  }
}

function treeInit() {
  let loader = new THREE.ObjectLoader();
  loader.load("../asset/tree/tree1.json", function (object) {
    object.children[0].material.color.set(0x5f0b);
    object.children[1].material.color.set(0x5f0b);
    object.children[2].material.color.set(0x5f0b);
    object.children[3].material.color.set(0x1b0900);
    putTree(object, 10.0);
  });

  loadTreebyName("tree2", 0.7);
  loadTreebyName("tree03", 0.6);
  loadTreebyName("tree04", 1);
  loadTreebyName("tree05", 0.08);
  loadTreebyName("tree06", 0.06);
}

function loadTreebyName(input, tempSca) {
  new THREE.MTLLoader()
    .setPath("../asset/tree/")
    .load(input + ".mtl", function (materials) {
      materials.preload();
      new THREE.OBJLoader()
        .setMaterials(materials)
        .setPath("../asset/tree/")
        .load(input + ".obj", function (object) {
          putTree(object, tempSca);
        });
    });
}

function putTree(object, tempSca) {
  let treeTotal = Math.floor(Math.random() * 5.0 + 2.0);
  for (let index = 0; index < treeTotal; index++) {
    let tempTree = object.clone();
    tempTree.scale.copy(new THREE.Vector3(tempSca, tempSca, tempSca));
    let tempPos = new THREE.Vector3(
      30 + (Math.random() - 0.5) * 150.0,
      10, -100 + (Math.random() - 0.5) * 100.0
    );
    tempSca *= THREE.Math.mapLinear(Math.random(), 0, 1, 0.7, 1.3);
    let tempRotationy = Math.random() * 2 * Math.PI;
    tempTree.rotation.set(0, tempRotationy, 0);
    tempTree.position.copy(tempPos);

    for (let index = 0; index < tempTree.children.length; index++) {
      const element = tempTree.children[index];
      element.castShadow = true;
    }
    scene.add(tempTree);
  }
}