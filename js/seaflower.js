let seaflowerGui, skeletonHelper, bones, seaflowerGuiParam, seaflowerMesh;

//初始化dat.GUI简化试验流程
function guiSeaflowerInit() {

    let guiSeaflower = gui.addFolder("Seaflower Setting");
    //声明一个保存需求修改的相关数据的对象
    seaflowerGuiParam = {
        skeleton : false
    };
    //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
    guiSeaflower.add(seaflowerGuiParam, "skeleton").onChange(function (e) {
        skeletonHelper.visible = e;
    });

}

function initSeaflower() {

    //制作模型
    var segmentHeight = 6; //每一节骨骼的的高度
    var segmentCount = 4; //总节数
    var height = segmentHeight * segmentCount; //总高度
    var halfHeight = height * 0.5; //总高度一半的高度

    var sizing = {
        segmentHeight : segmentHeight,
        segmentCount : segmentCount,
        height : height,
        halfHeight : halfHeight
    };

    var geometry = createGeometry( sizing );  //创建几何体
    var bones = createBones( sizing );  //创建骨骼
    seaflowerMesh = createMesh( geometry, bones );  //创建网格模型

    // mesh.scale.multiplyScalar( 1 );
    underScene.add( seaflowerMesh );

}

//创建集合体
function createGeometry ( sizing ) {

    var geometry = new THREE.CylinderGeometry(
        5,                       // 顶部圆柱体的半径
        5,                       // 底部圆柱体的半径
        sizing.height,           // 圆柱体的高度
        8,                       // 圆柱周围的分段面数
        sizing.segmentCount * 3, // 沿圆柱体高度的面的行数
        true                     // 圆柱体的末端是打开
    );

    //添加绘制第二个纹理的面
    var len = geometry.faces.length;

    for(var i=0; i < len; i++){
        var face = geometry.faces[i].clone();
        face.materialIndex = 1;
        geometry.faces.push(face);
    }

    //将vertexUv报错解决掉
    var len = geometry.faceVertexUvs[0].length;

    for(var i=0; i < len; i++){
        geometry.faceVertexUvs[0].push(geometry.faceVertexUvs[0][i]);
    }

    //遍历几何体所有的顶点
    for ( var i = 0; i < geometry.vertices.length; i ++ ) {

        //根据顶点的位置计算出骨骼影响下标和权重

        var vertex = geometry.vertices[ i ];
        var y = ( vertex.y + sizing.halfHeight );

        var skinIndex = Math.floor( y / sizing.segmentHeight );
        var skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;

        geometry.skinIndices.push( new THREE.Vector4( skinIndex, skinIndex + 1, 0, 0 ) );
        geometry.skinWeights.push( new THREE.Vector4( 1 - skinWeight, skinWeight, 0, 0 ) );

    }

    return geometry;

}

//创建骨骼
function createBones ( sizing ) {

    bones = [];

    var prevBone = new THREE.Bone();
    bones.push( prevBone );
    prevBone.position.y = - sizing.halfHeight;

    for ( var i = 0; i < sizing.segmentCount; i++ ) {

        var bone = new THREE.Bone();
        bone.position.y = sizing.segmentHeight;
        bones.push( bone ); //添加到骨骼数组
        prevBone.add( bone ); //上一个骨骼定义为父级
        prevBone = bone;

    }

    return bones;

}

function createMesh ( geometry, bones ) {

    var material = new THREE.MeshPhongMaterial( {
        skinning : true,
        color: 0x8B3A62,
        emissive: 0x8B3A62,
        side: THREE.DoubleSide,
        flatShading: true
    } );

    var lineMaterial = new THREE.MeshBasicMaterial({
        skinning : true,
        wireframe: true,
        color: 0xCD5C5C
    });

    seaflowerMesh = new THREE.SkinnedMesh( geometry, [material, lineMaterial] );
    var skeleton = new THREE.Skeleton( bones ); //创建骨架

    seaflowerMesh.add( bones[ 0 ] ); //将骨骼添加到模型里面
        
    seaflowerMesh.bind( skeleton ); //模型绑定骨架

    for ( var i = 1; i < 5; i++ ) {
        bones[i].scale.set(Math.log(1-0.25*i)-1, 1, Math.log(1-0.25*i)-1);
        // bones[i].position.set(35, 0, -170)
    }

    seaflowerMesh.scale.set(3, 3, 3);
    seaflowerMesh.position.set(-250, -57, 100);

    // 添加骨骼辅助标记
    skeletonHelper = new THREE.SkeletonHelper( seaflowerMesh );
    skeletonHelper.material.linewidth = 10;
    underScene.add( skeletonHelper );
    skeletonHelper.visible = false;
    return seaflowerMesh;

}

function seaflowerAnimation() {
    // Wiggle the bones
    for ( var i = 0; i < seaflowerMesh.skeleton.bones.length; i ++ ) {
        seaflowerMesh.skeleton.bones[ i ].position.z = Math.sin( Date.now() * 0.001 ) * 8 / seaflowerMesh.skeleton.bones.length;
        seaflowerMesh.skeleton.bones[ i ].rotation.x = Math.sin( Date.now() * 0.001 ) * 0.10 / seaflowerMesh.skeleton.bones.length;
        seaflowerMesh.skeleton.bones[ i ].rotation.y = Math.sin( Date.now() * 0.001 ) * 0.05 / seaflowerMesh.skeleton.bones.length;
    }
}