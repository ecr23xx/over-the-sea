var cube, pointLight;
var pointLightAngle = 0, radian, pointLightR = 300;



function initPointLight() {
    //添加可以移动的点光源
    pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(0, 20, 0);
    underScene.add(pointLight);

    //给光源添加一个模型显示位置
    pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 20), new THREE.MeshBasicMaterial({color:0x00ffff})));
}

function initNormalMappingModel() {
    // // load model
    // var bump = new THREE.TextureLoader().load("./asset/textures/plaster.png");
    // var normal = new THREE.TextureLoader().load("./asset/textures/plaster.png");
    // var material = new THREE.MeshPhongMaterial({
    //     map:normal
    // });

    // // add normal mapping
    // material.normalMap = bump;
    // var geometry = new THREE.CubeGeometry(5, 5, 5);
    // cube = new THREE.Mesh(geometry, material);
    // cube.position.set(-22, -23.5, 77.5);
    // cube.rotation.y += Math.PI/6;
    // underScene.add(cube);
}

function normalMappingAnimation() {
    // 更新点光源的移动
    pointLightAngle += 2;
    radian = pointLightAngle / 180 * Math.PI;
    var x = Math.sin(radian);
    var y = Math.cos(radian);
    if(pointLightAngle % 720 > 360){
        y = -y+2;
    }
    pointLight.position.z = x * pointLightR;
    pointLight.position.x = y * pointLightR - pointLightR;
}
