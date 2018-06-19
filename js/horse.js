var guiHorse, mesh, mixer, action;
var horseClock = new THREE.Clock();

//初始化dat.GUI简化试验流程
function guiHorseInit() {
    let guiHorse = gui.addFolder("Horse Setting");
    //声明一个保存需求修改的相关数据的对象
    guiHorseParam = {
        animation: true
    };
    //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
    guiHorse.add(guiHorseParam, "animation").onChange(function (e) {
        if (e) {
            action.play();
        }
        else {
            action.stop();
        }
    });
}

function horseInit() {
    //加载模型
    var loader = new THREE.JSONLoader();
    loader.load("./asset/models/horse/horse.js", function (geometry) {
        console.log(geometry);

        mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
            vertexColors: THREE.FaceColors,
            morphTargets: true
        }));
        mesh.scale.set(0.11, 0.11, 0.11);
        mesh.position.set(40, 15, -50);
        scene.add(mesh);
        //AnimationMixer是场景中特定对象的动画播放器。当场景中的多个对象独立动画时，可以为每个对象使用一个AnimationMixer
        mixer = new THREE.AnimationMixer(mesh);

        //CreateFromMorphTargetSequence 通过geometry.morphTargets创建一个AnimationClip对象，其中包含每帧的内容和总帧数
        var clip = THREE.AnimationClip.CreateFromMorphTargetSequence('run', geometry.morphTargets, 30);

        //mixer.clipAction 返回一个可以控制动画的AnimationAction对象  参数需要一个AnimationClip 对象
        //AnimationAction.setDuration 设置一个循环所需要的时间，当前设置了一秒
        //告诉AnimationAction启动该动作
        action = mixer.clipAction(clip);
        action.setDuration(1).play();
    });
}

function horseAnimation() {
    if (mixer) {
        mixer.update(clock.getDelta());
    }
}
