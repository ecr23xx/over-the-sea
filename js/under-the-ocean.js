var renderer, scene, camera, cube, light, floor, object;
var stat = null;
var gui;
//绑定canvas和渲染器
function initRender() {
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    //清除画面颜色
    renderer.setClearColor(0x418a93);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
}

//初始化Stat
function initStat() {
    stat = new Stats();
    stat.domElement.style.position = 'absolute';
    stat.domElement.style.right = '0px';
    stat.domElement.style.top = '0px';
    document.body.appendChild(stat.domElement);
}

function initGui() {
    gui = new dat.GUI();

    let guiThree = gui.addFolder("Color Setting");
    let guiThreeParams = {
        fogColor: 0xcefaeb,
        sandColor: 0xe1c43f
    };
    gui.addColor(guiThreeParams, 'sandColor').onChange(function(value) {
        console.log(value);
        floor.material.color.set(value);
    });
    gui.addColor(guiThreeParams, 'fogColor').onChange(function(value) {
        console.log(value);
        scene.fog.color.set(value);
    });
}

//创建场景
function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xcefaeb, 0.0018);
}

//创建照相机
function initCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(50, 50, 50);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
}

//添加光源
function initLight() {
    light = new THREE.DirectionalLight(0xffffff, 0.2);

    light.castShadow = true;
    light.shadow.camera.left = -200;
    light.shadow.camera.right = 200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;

    light.position.set(0, 100, 50);

    var helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(helper);

    scene.add(light);

    var globalLight = new THREE.HemisphereLight(0xdddddd, 0xdddddd, .5);
    scene.add(globalLight);

    var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
    light2.position.set(0, 150, 50);
    scene.add(light2);

}

//创建物体
function initObject() {
    cube = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30),
        new THREE.MeshPhongMaterial({
            color: 0xffffff
        })
    );
    cube.position.y = 5;

    cube.castShadow = true;

    scene.add(cube);
}

function initFloor() {
    floor = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600, 24, 16),
        new THREE.MeshLambertMaterial({
            color: 0xe1c43f
        })
    );
    var vertices = floor.geometry.vertices;
    console.log(vertices.length);
    for (var i = 0; i < vertices.length; i++) {
        var v = vertices[i];
        var rand = Math.random() * 20;
        rand = (rand > 10) ? -rand : rand;
        v.z += rand;
    }
    floor.receiveShadow = true;
    floor.geometry.computeVertexNormals();
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10;
    scene.add(floor);

}

//渲染循环

function render() {
    stat.begin();
    requestAnimationFrame(render);
    stat.end();
    renderer.render(scene, camera);
}

//自适应窗口大小
function onResize() {
    // 设置透视摄像机的长宽比
    camera.aspect = window.innerWidth / window.innerHeight
        // 摄像机的 position 和 target 是自动更新的，而 fov、aspect、near、far 的修改则需要重新计算投影矩阵（projection matrix）
    camera.updateProjectionMatrix();
    // 设置渲染器输出的 canvas 的大小
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function init() {
    initRender();
    initStat();
    initScene();
    initCamera();
    initGui();
    initObject();
    initLight();
    initFloor();
    render();
    var controls = new THREE.OrbitControls(camera);
    window.addEventListener('resize', onResize, false);
}