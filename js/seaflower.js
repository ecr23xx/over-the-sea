var seaflowerGui, skeletonHelper, bones, seaflowerGuiParam;

    //初始化dat.GUI简化试验流程
    function guiSeaflowerInit() {
        seaflowerGuiParam = {
            skeleton : false
        };
        seaflowerGui = new dat.GUI();
        var folder = seaflowerGui.addFolder( "Seaflower Setting" );

        folder.add(seaflowerGuiParam, "skeleton").onChange(function (e) {
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
        mesh = createMesh( geometry, bones );  //创建网格模型

        // mesh.scale.multiplyScalar( 1 );
        scene.add( mesh );

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
            color: 0x551A8B,
            emissive: 0x4B0082,
            side: THREE.DoubleSide,
            flatShading: true
        } );

        var lineMaterial = new THREE.MeshBasicMaterial({
            skinning : true,
            wireframe: true
        });

        mesh = new THREE.SkinnedMesh( geometry, [material, lineMaterial] );
        var skeleton = new THREE.Skeleton( bones ); //创建骨架

        mesh.add( bones[ 0 ] ); //将骨骼添加到模型里面
        
        mesh.bind( skeleton ); //模型绑定骨架

        for ( var i = 1; i < 5; i++ ) {
            bones[i].scale.set(Math.log(1-0.25*i)-1, 1, Math.log(1-0.25*i)-1);
        }

        // 添加骨骼辅助标记
        skeletonHelper = new THREE.SkeletonHelper( mesh );
        skeletonHelper.material.linewidth = 2;
        scene.add( skeletonHelper );
        skeletonHelper.visible = false;
        return mesh;

    }

    function seaflowerRender() {
        var time = Date.now() * 0.001;

        // Wiggle the bones
        for ( var i = 0; i < mesh.skeleton.bones.length; i ++ ) {
            mesh.skeleton.bones[ i ].position.z = Math.sin( time ) * 8 / mesh.skeleton.bones.length;
            mesh.skeleton.bones[ i ].rotation.x = Math.sin( time ) * 0.10 / mesh.skeleton.bones.length;
            mesh.skeleton.bones[ i ].rotation.y = Math.sin( time ) * 0.05 / mesh.skeleton.bones.length;
        }

        controls.update();
    }

    function seaflowerAnimation() {
        //更新控制器
        seaflowerRender();

        // //更新性能插件
        // stats.update();

        // renderer.render(scene, camera);

        // requestAnimationFrame(seaflowerAnimation);
    }