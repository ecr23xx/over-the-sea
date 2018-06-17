var fishSwim = {
  fish: [],
  target: null,
  total: 5
};

function fishAnimation() {
  // fishSwim.fish[0].position.copy(fishSwim.target);
  for (let index = 0; index < fishSwim.fish.length; index++) {
    const element = fishSwim.fish[index];
    let nowAcceleration = new THREE.Vector3()
      .copy(fishSwim.target)
      .sub(element.position);
    nowAcceleration.clampLength(0.0, 0.05);
    element.speed.add(nowAcceleration);
    element.speed.clampLength(1.0, 3.0);
    element.speed.multiplyScalar(0.99);
    if (element.collision == 1) {
      console.log(element.collision)
      element.speed.multiplyScalar(5.99);
      element.position.sub(element.speed);
      element.collision = 0
    } else {
      element.position.add(element.speed);
    }
    element.lookAt(fishSwim.target);
    element.rotation.y -= Math.PI * 0.5;
  }
}

function fishInit() {
  for (let index = 0; index < fishSwim.total; index++) {
    fishSwim.fish.push(createFish());
    let tempScaler = Math.random() * 0.04 + 0.01;
    fishSwim.fish[index].scale.copy(sameV3(tempScaler));
    fishSwim.fish[index].position.copy(randomV3(100));
    fishSwim.fish[index].speed = new THREE.Vector3();
  }
}

function randomV3(range)  {
  let t1 = (Math.random() - 0.5) * range;
  let t2 = (Math.random() - 0.5) * range;
  let t3 = (Math.random() - 0.5) * range;
  return new THREE.Vector3(t1, t2, t3);
}

function sameV3(input) {
  return new THREE.Vector3(input, input, input);
}

function createFish() {
  // A group that will contain each part of the fish
  let fish = new THREE.Group();
  fish.name = 'fish'
  // each part needs a geometry, a material, and a mesh
  let halfPI = Math.PI * 0.5;
  // Body
  let bodyGeom = new THREE.BoxGeometry(120, 120, 120);
  let bodyMat = new THREE.MeshLambertMaterial({
    color: 0x80f5fe,
    flatShading: true
  });
  bodyMat = getMaterialbyColor(getRandomColor());
  // let bodyFish = new THREE.Mesh(bodyGeom, bodyMat);
  let bodyFish = new THREE.Mesh(bodyGeom, bodyMat);
  bodyFish.name = 'body'

  // Tail
  let tailGeom = new THREE.CylinderGeometry(0, 60, 60, 4, false);
  let tailMat = new THREE.MeshLambertMaterial({
    color: 0xff00dc,
    flatShading: true
  });

  let tailFish = new THREE.Mesh(tailGeom, tailMat);
  tailFish.scale.set(0.8, 1, 0.1);
  tailFish.position.x = -60;
  tailFish.rotation.z = -halfPI;

  // Lips
  let lipsGeom = new THREE.BoxGeometry(25, 10, 120);
  let lipsFish = new THREE.Mesh(lipsGeom, bodyMat);
  lipsFish.position.set(65, -47, 0);
  lipsFish.rotation.z = halfPI;

  // Fins
  let topFish = new THREE.Mesh(tailGeom, tailMat);
  topFish.scale.set(0.8, 1, 0.1);
  topFish.position.set(-20, 60, 0);
  topFish.rotation.z = -halfPI;

  let sideRightFish = new THREE.Mesh(tailGeom, tailMat);
  sideRightFish.scale.set(0.8, 1, 0.1);
  sideRightFish.rotation.set(halfPI, 0, -halfPI);
  sideRightFish.position.set(0, -50, -60);

  let sideLeftFish = new THREE.Mesh(tailGeom, tailMat);
  sideLeftFish.scale.set(0.8, 1, 0.1);
  sideLeftFish.rotation.set(halfPI, 0, -halfPI);
  sideLeftFish.position.set(0, -50, 60);

  // Eyes
  let eyeGeom = new THREE.BoxGeometry(40, 40, 5);
  let eyeMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    flatShading: true
  });

  let rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(25, -10, -60);

  let irisGeom = new THREE.BoxGeometry(10, 10, 3);
  let irisMat = new THREE.MeshLambertMaterial({
    color: 0x330000,
    flatShading: true
  });

  let rightIris = new THREE.Mesh(irisGeom, irisMat);
  rightIris.position.set(35, -10, -65);

  let leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(25, -10, 60);

  let leftIris = new THREE.Mesh(irisGeom, irisMat);
  leftIris.position.set(35, -10, 65);

  let toothGeom = new THREE.BoxGeometry(20, 4, 20);
  let toothMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    flatShading: true
  });

  // Teeth
  let tooth1 = new THREE.Mesh(toothGeom, toothMat);
  tooth1.position.set(65, -35, -50);
  tooth1.rotation.set(-halfPI, 0, halfPI);

  let tooth2 = new THREE.Mesh(toothGeom, toothMat);
  tooth2.position.set(65, -30, -25);
  tooth2.rotation.set(-Math.PI / 12, 0, halfPI);

  let tooth3 = new THREE.Mesh(toothGeom, toothMat);
  tooth3.position.set(65, -25, 0);
  tooth3.rotation.z = halfPI;

  let tooth4 = new THREE.Mesh(toothGeom, toothMat);
  tooth4.position.set(65, -30, 25);
  tooth4.rotation.set(Math.PI / 12, 0, halfPI);

  let tooth5 = new THREE.Mesh(toothGeom, toothMat);
  tooth5.position.set(65, -35, 50);
  tooth5.rotation.set(Math.PI / 8, 0, halfPI);

  fish.add(bodyFish);
  bodyFish.castShadow = true;
  fish.add(tailFish);
  tailFish.castShadow = true;
  fish.add(topFish);
  topFish.castShadow = true;
  fish.add(sideRightFish);
  sideRightFish.castShadow = true;
  fish.add(sideLeftFish);
  sideLeftFish.castShadow = true;
  fish.add(rightEye);
  fish.add(rightIris);
  fish.add(leftEye);
  fish.add(leftIris);
  fish.add(tooth1);
  fish.add(tooth2);
  fish.add(tooth3);
  fish.add(tooth4);
  fish.add(tooth5);
  fish.add(lipsFish);

  scene.add(fish);
  return fish;
}