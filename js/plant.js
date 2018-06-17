//生成所有植物的源文件

//生成创建枝干的控制点
function createPoints(counts) {
   // points[0]为右边的枝干的点，points[1]为左边的枝干的点
   let points = [];
   let point = [];
  
  //底下第一段枝干尽量比较直
   point.push(new THREE.Vector3(Math.random(), -5, Math.random()));
   point.push(new THREE.Vector3(point[0].x+Math.random(), point[0].y+12, point[0].z+Math.random()));
   
   let step = 8;
   for (let i = 2; i < counts; i++) {

      let randomX = point[i-1].x;

      let randomY = point[i-1].y+Math.ceil(Math.random() * step);

      let randomZ = point[i-1].z+Math.ceil(Math.random() * 3);
        
      step -= 1;
 
      point.push(new THREE.Vector3(randomX, randomY, randomZ));

   }
   points[0] = point;
  
   point = [];
   //从右边枝干的第三段开始长出左枝
   point.push(points[0][Math.floor(counts/3)-1]);
   for (let i = 1; i < counts/2; i++) {

      let randomX = point[i-1].x;

      let randomY = point[i-1].y + Math.ceil(Math.random() * 5);

      let randomZ = point[i-1].z - Math.ceil(Math.random() * 3);
 
      point.push(new THREE.Vector3(randomX, randomY, randomZ));
     
   }
  points[1] = point;
  return points;
}

//生成叶子
function createLeaf() {
    //叶子由两个四棱锥构成
    let geometry = new THREE.ConeGeometry( 3, 11, 4);
    let material = new THREE.MeshPhongMaterial( {color: 0x008800, flatShading:true} );
    let up = new THREE.Mesh( geometry, material );
    let down = up.clone();
    up.position.set(0,11,0);
    
    down.rotation.z = Math.PI;
    down.position.set(0,0,0);
    let Leaf = new THREE.Group;
    Leaf.add(up);
    Leaf.add(down);
    let Scale = 0.3;
    Leaf.scale.set(Scale,Scale,Scale);

    //up.castShadow = true;
    up.receiveShadow = true;
    //down.castShadow = true;
    down.receiveShadow = true;

    return Leaf;
}


//生成有枝干的植物
function createPlant(counts) {
    //leafGroup用于保存左右枝干的所有叶子
    //leafGroup[0]保存右茎，leafGroup[1]保存左茎
    let leafGroup = [];
    leafGroup[0] = new THREE.Group();
      leafGroup[1] = new THREE.Group();

    //生成构成枝干的控制点
    let points = createPoints(counts);
   
    //左右枝干分别生成叶子
    for (let i = 0; i < 2; i++) {
      //右茎
        if (i == 0) {
            let wiseClock = true;
            for (let index = Math.ceil(counts/2); index < counts-1; index += 2) {
                let leafMesh = createLeaf();
                leafMesh.position.copy(points[i][index]);

                let direVec_y = points[i][index].y-points[i][index-1].y;
                let direVec_z = points[i][index].z-points[i][index-1].z;
                let ang_y = Math.atan(direVec_z/direVec_y);  

                if (wiseClock) {
                    leafMesh.position.z += Math.max(1.8,Math.random()*2.2);
                    leafMesh.position.y -= Math.random();
                    leafMesh.rotation.x = ang_y+0.5*Math.PI-Math.random()*0.1;
                    wiseClock = false;
                } else {
                    leafMesh.position.y += Math.max(1.8,Math.random()*2.2);
                    leafMesh.rotation.x = ang_y-0.5*Math.PI+Math.max(0.1,Math.random()*0.3);
                    wiseClock = true;
                }
      
                leafGroup[i].add(leafMesh);
            }
      //左茎
        } else {
            let wiseClock = true;
            for (let index = 2; index < counts/2-1; index++) {
                let leafMesh = createLeaf();
                leafMesh.position.copy(points[i][index]);

                let direVec_y = points[i][index].y-points[i][index-1].y;
                let direVec_z = points[i][index].z-points[i][index-1].z;
                let ang_y = Math.atan(direVec_z/direVec_y);

                if (wiseClock) {
                    leafMesh.position.z += Math.max(1.2,Math.random()*1.5);
                    leafMesh.position.y += Math.max(0.4,Math.random());
                    leafMesh.rotation.x = ang_y+0.5*Math.PI-Math.max(0.2,Math.random()*0.3);
                    wiseClock = false;
                } else {
                    leafMesh.position.y -= Math.max(2,Math.random()*2.8);
                    leafMesh.rotation.x = ang_y-0.5*Math.PI+Math.max(0.3,Math.random()*0.5);
                    wiseClock = true;
                }
      
                leafGroup[i].add(leafMesh);
            }
        }
    }

    //plant为生成的植物
    let plant = new THREE.Group();
    //添加叶子
    plant.add(leafGroup[0]);
    plant.add(leafGroup[1]);
 
    // THREE.CatmullRomCurve3方法可以将一组顶点生成一条平滑的曲线
    let branchGeometry = [];
    branchGeometry[0] = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points[0]), 6, 0.9, 5, false);
        branchGeometry[1] = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points[1]), 3, 0.8, 5, false);
        
    let meshMaterial = new THREE.MeshPhongMaterial({
            color: 0x008800,
            side:THREE.DoubleSide,
            flatShading:true
    });
  
    let branchMesh = [];
    branchMesh[0] = new THREE.Mesh(branchGeometry[0], meshMaterial);
    //branchMesh[0].castShadow = true;
    branchMesh[0].receiveShadow = true;

    branchMesh[1] = new THREE.Mesh(branchGeometry[1], meshMaterial);
    //branchMesh[1].castShadow = true;
    branchMesh[1].receiveShadow = true;
   
   //添加枝干
    plant.add(branchMesh[0]);
    plant.add(branchMesh[1]);
    plant.scale.set(2,2,2);
    return plant;
}

//放置海底植物
function placePlant(plantsCount, width, height) {
    let pointsCount = [10, 12, 13];
    
    for (let i = 0; i < plantsCount; i++) {
      let points = pointsCount[Math.floor(Math.random()*3)];
      let plant = createPlant(points);
      
      let radius = (Math.min(1.0, Math.random()+0.4))*Math.min(width,height)/2;
      let angle = Math.random()*Math.PI*2;

      let x = radius*Math.cos(angle);
      let z = radius*Math.sin(angle);

      plant.position.set(x, 0-100, z);
      plant.rotation.y = Math.random()*Math.PI;
      underScene.add(plant);
    }
}

//海带的形状，三种
let seaGrassShapeOne = function (u, v, p0) {

        let r = 150;

        let z = -Math.sin(u) * r;

        let x = -Math.sin(v / 2) * r;

        let y = (Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI)) * 20;

        p0.set(x, y, z);

};

let seaGrassShapeTwo = function (u, v, p0) {

        let r = 150;

        let z = Math.sin(v) * r;

        let x = Math.sin(u/2) * r;

        let y = (Math.sin(v * 4 * Math.PI) + Math.cos(u * 2 * Math.PI)) * 20;

        p0.set(x, y, z);

};

let seaGrassShapeThree = function (u, v, p0) {

        let r = 100;

        let z = Math.sin(u) * r;

        let x = Math.sin(v / 2) * r;

        let y = (Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI)) * 20;

        p0.set(x, y, z);

};

//生成海带
function createSeaGrass(width, height) {
    let Colors = [0x25acbe, 0x25be52, 0xb2d15, 0xcac024, 0xe13f9e];
    let slices = Math.max(100, Math.floor(Math.random()*15));
    let stacks = Math.max(100, Math.floor(Math.random()*40));

    let geometry;
    let direction;
    let shape = Math.floor(Math.random()*3);
    if (shape == 0) {
        geometry = new THREE.ParametricGeometry(seaGrassShapeOne, slices, stacks);
        direction =-10;

    } else if (shape == 1) {

        geometry = new THREE.ParametricGeometry(seaGrassShapeTwo, slices, stacks);
        direction = 130;

    } else {

        geometry = new THREE.ParametricGeometry(seaGrassShapeThree, slices, stacks);
        direction = 90;
    }

    let material = new THREE.MeshPhongMaterial( {
                            color:Colors[Math.floor(Math.random()*5)],
                            flatShading:true,
                            side:THREE.DoubleSide
                        });
    let seaGrassMesh = new THREE.Mesh(geometry, material);

    //seaGrassMesh.castShadow = true;
    seaGrassMesh.receiveShadow = true;

    seaGrassMesh.scale.set(1.5*0.1,1.5*0.1,12*0.1);
    seaGrassMesh.rotation.x = Math.PI*0.5;
    seaGrassMesh.position.setY(direction-100);
    
    return seaGrassMesh;
}

//放置海带
function placeSeaGrass(counts, width, height, group) {
    let i;
    for (i = 0; i < counts; i += group) {
        
        let radius = (Math.random()/2+0.45)*Math.min(width,height)/2;
        let angle = Math.random()*Math.PI*2;

        let x = radius*Math.cos(angle);
        let z = radius*Math.sin(angle);
        for (let j = 0; j < group; j++) {
            x += Math.max(8, Math.random()*10);
            z += Math.max(6, Math.random()*10)
            let seaGrass = createSeaGrass(width, height);
            seaGrass.position.setX(x);
            seaGrass.position.setZ(z);
            seaGrass.rotation.z = 0.5*Math.PI;
            underScene.add(seaGrass);
        }
        placeStone(Math.floor(3*Math.random()+2), x, z, 'position');
    }
}

//导入并放置珊瑚
function loadCoral(pos) {
        let loader = new THREE.MTLLoader();
        let paths = ['coral 1', 'coral 2', 'Coral'];
        let scale = [{x:150,y:150,z:150},  {x:15,y:15,z:15}, {x:9,y:9,z:9}];
        let position = [{x:-50, y:-50, z:50}, {x:9,y:-475,z:-100}, {x:650, y:-10, z:0}];
        paths.forEach(function(path, index) {
            loader.setPath("../asset/models/"+path+'/')
            .load(path + '.mtl', function(material) {
              material.preload();
              new THREE.OBJLoader()
                .setMaterials(material)
                .setPath("../asset/models/"+path+'/')
                .load(path+'.obj', function(object) {
                        object.scale.set(scale[index].x,scale[index].y,scale[index].z);
                        object.position.set(position[index].x+pos[index].x,position[index].y+pos[index].y,position[index].z+pos[index].z);
                        object.children.forEach(function (child) {

                            child.material.flatShading = true;

                        });
                        //object.castShadow = true;
                        object.receiveShadow = true;
                        underScene.add(object);
                    },
                    function(xhr) {
                        console.log(path + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            },
            function(xhr) {
                console.log(path + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
            },
            function(err) {
                console.log(err);
            }
            )
        });
}

//导入并放置海草
function loadKelp(pos) {
    let loader = new THREE.OBJLoader();
    let paths = ['kelp 4', 'kelp 1','kelp 3'];
    let scale = [{x:20,y:30,z:20}, {x:6,y:6,z:6}, {x:35,y:15,z:35}];
    let position = [{x:900, y:160, z:0}, {x:-50, y:-75, z:-450}, {x:-1500,y:-150,z:0}];
    let Colors = [0xff7223, 0xd81155, 0x145428, 0x292664];
    paths.forEach(function(path,index) {
        loader.load("../asset/models/"+path+'/'+ path + '.obj', function(obj) {
        let material = new THREE.MeshPhongMaterial({
            color:Colors[index], 
            side:THREE.DoubleSide, 
            flatShading:true
        });
        obj.children.forEach(function (child) {

                child.material = material;

                child.geometry.computeFaceNormals();

                child.geometry.computeVertexNormals();

            });
        obj.scale.set(scale[index].x,scale[index].y,scale[index].z);
        obj.position.set(position[index].x+pos[index].x,position[index].y+pos[index].y,position[index].z+pos[index].z);
        
        //obj.castShadow = true;
        obj.receiveShadow = true;

        underScene.add(obj);
    },
    function(xhr) {
            console.log("mtl " + (xhr.loaded / xhr.total * 100) + '% loaded' );
        }
    );
    });
    
}

