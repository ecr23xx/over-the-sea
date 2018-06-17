var mixers = [];
function deerInit() {
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
    object.scale.x = 0.08;
    object.scale.y = 0.08;
    object.scale.z = 0.08;
    object.position.set(-10, 12, -50);

  });
}

function deerAnimation() {
    if (mixers.length > 0) {
        for (var i = 0; i < mixers.length; i++) {
          mixers[i].update(clock.getDelta());
        }
      }
}

