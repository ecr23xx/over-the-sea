var mixers = [];
function deerInit() {
  // ground
  var mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);


  // model
  var loader = new THREE.FBXLoader();
  loader.load("asset/models/deer/stag.fbx", function(object) {
    object.mixer = new THREE.AnimationMixer(object);
    mixers.push(object.mixer);
    var action = object.mixer.clipAction(object.animations[0]);
    action.play();
    object.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(object);
    object.scale.x = guiDeerParam.scaleX
    object.scale.y = guiDeerParam.scaleY
    object.scale.z = guiDeerParam.scaleZ

  });
}

function deerAnimation() {
    if (mixers.length > 0) {
        for (var i = 0; i < mixers.length; i++) {
          mixers[i].update(clock.getDelta());
        }
      }
}

