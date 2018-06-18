/*

  织物模拟，一面小旗子, GUI可以改变旗的颜色、位置和大小，不能倾斜放置，只能直立着 :(
 */

// 重力
const G = 9.81;
const Gravity = new THREE.Vector3(0, -G, 0);
const Dampen = 0.99;

// 旗的大小
let SIZEX = 60;
let SIZEY = 40;



let guiClothParam = new function (){
    this.flagColor = 0xeeee00;
    this.scaleX = 1;
    this.scaleY = 1;
    this.stickColor = 0x522525;
    this.scaleStick = 1;
    this.positionX = -76;
    this.positionY = -66;
    this.positionZ = 162;
    this.redraw = function () {
        underScene.remove(clothes[0].mesh);
        clothes.splice(0, 1);
        underScene.remove(cylinder);
        clothInit();
    };
};

let clothPos = new THREE.Vector3(guiClothParam.positionX, guiClothParam.positionY, guiClothParam.positionZ);

// 两点之间的作用力
class Constraint {
    constructor(p1, p2, length) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = length
    }

    doConstraint() {
        var dir = this.p2.vertice.clone().sub(this.p1.vertice);
        var clength = dir.length();
        dir = dir.multiplyScalar(1 - this.length/clength).multiplyScalar(0.5);
        if (this.p1.movable) this.p1.vertice.add(dir);
        if (this.p2.movable) this.p2.vertice.sub(dir);
    }
}

// 旗上的所有点
class PointMass {
    constructor(vertice, movable=true) {
        this.movable = movable;
        this.vertice = vertice;
        this.last = this.vertice.clone();
        this.acc = new THREE.Vector3(0, 0, 0);
    }
    // 在点上施加力，假设一点有初速度和加速度分别产生的位移，初速度产生的位移假设和上一次的位移相同，再加上重力导致的位移（都是向量加法)，得到新的位置
    applyForce() {
        if (this.movable) {
            var vel = this.vertice.clone().sub(this.last).multiplyScalar(Dampen);
            this.setVertice(this.vertice.clone().add(vel).add(this.acc));
        }
        this.acc.set(0, 0, 0);
    }
    // acc为位移
    addForce(f) {
        this.acc.add(f);
    }
    // 受重力的因素
    doPhysics(t) {
        if (this.movable) {
            this.addForce(Gravity.clone().multiplyScalar(0.5 * t * t));
        }
    }

    setVertice(next) {
        this.last = this.vertice.clone();
        this.vertice.copy(next);
    }
}

// 旗是由很多三角形拼成的
class Triangle {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.triangle = new THREE.Triangle(a.vertice, b.vertice, c.vertice);
    }
    // 将风作用在每个三角形上，计算风和三角形法向量的夹角，将得到的力作用在三个顶点
    // 模拟旗子时，一个三角形永远在一个平面上
    doWind(direction) {
        let normal = this.triangle.getNormal();
        normal.multiplyScalar(normal.dot(direction));
        this.a.addForce(normal);
        this.b.addForce(normal);
        this.c.addForce(normal);
    }
}

class Clothe {
    constructor(SIZEX, SIZEY, pos, color) {
        this.pointsmass = [];    // 三角形顶点
        this.constraints = [];   // 点之间的作用力
        this.triangles = [];     // 拼成旗的三角形
        this.accuracy = 2;        // 准确度
        this.geom = new THREE.Geometry();
        this.position = pos;     // 旗放在的位置
        this.color = color;
        for (let y = 0; y < SIZEY; y++) {
            for (let x = 0; x < SIZEX; x++) {
                let v;
                if ((y*SIZEY+x) === SIZEX*(SIZEY-1))     // 旗子左下角的点
                    v = new THREE.Vector3(this.position.x, this.position.y+1, this.position.z);
                  else
                    v = new THREE.Vector3(this.position.x+x, this.position.y+SIZEY-y, this.position.z);
                this.pointsmass.push(new PointMass(v));
                this.geom.vertices.push(v);
            }
        }
        // 左上角和左下角的点固定在旗杆上
        this.pointsmass[0].movable = false;
        this.pointsmass[SIZEX*(SIZEY-1)].movable = false;

        for (let y = 0; y < SIZEY - 1; y++) {
            for (let x = 0; x < SIZEX - 1; x++) {
                /*
                 * * * * * * * *
                 * * a b * * * *
                 * * c * * * * *
                 * * * * * * * *
                 */
                let p = y * SIZEX + x;
                let a = p, b = p + 1, c = p + SIZEX;

                this.geom.faces.push(new THREE.Face3(a, b, c));
                this.triangles.push(new Triangle(
                    this.pointsmass[a],
                    this.pointsmass[b],
                    this.pointsmass[c]
                ));
                /*
                 * * * * * * * *
                 * * * a * * * *
                 * * b c * * * *
                 * * * * * * * *
                 */
                a = p + 1;
                b = p + SIZEX;
                c = p + SIZEX + 1;
                this.geom.faces.push(new THREE.Face3(a, b, c));
                this.triangles.push(new Triangle(
                    this.pointsmass[a],
                    this.pointsmass[b],
                    this.pointsmass[c]
                ))
            }
        }
        // 计算结构力、剪切力和弯曲力
        const shear = Math.sqrt(2);
        for (let y = 0; y < SIZEY; y++) {
            for (let x = 0; x < SIZEX; x++) {
                let p = y * SIZEX + x;
                if (x < SIZEX - 1) this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + 1], 1));
                if (y < SIZEY - 1) this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + SIZEX], 1));
                // Shear Constraints
                if (y < SIZEY - 1 && x < SIZEX - 1) {
                    this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + 1 + SIZEX], shear));
                    this.constraints.push(new Constraint(this.pointsmass[p + SIZEX], this.pointsmass[p + 1], shear));
                }
                // Bending Constraints
                if (x < SIZEX - 2) this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + 2], 2));
                if (y < SIZEY - 2) this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + SIZEX + SIZEX], 2));
                if (y < SIZEY - 2 && x < SIZEX - 2) {
                    this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + 2 + SIZEX + SIZEX], shear * 2));
                    this.constraints.push(new Constraint(this.pointsmass[p + SIZEX + SIZEX], this.pointsmass[p + 2], shear * 2));
                }
            }
        }

        this.material = new THREE.MeshPhongMaterial({
            color: this.color,
            wireframe: false,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(this.geom, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false;
    }

    doPhysics(t) {
        _.forEach(this.pointsmass, (p) => {
            p.doPhysics(t)
        })
    }
    // 风作用于每个三角形
    doWind(d) {
        _.forEach(this.triangles, (t) => {
            t.doWind(d)
        })
    }
    // this.constraints中每两点之间，计算两次力，为了更准确
    doConstraints() {
        _.times(this.accuracy, () => {
            _.forEach(this.constraints, (c) => {
                c.doConstraint()
            })
        })
    }

    applyForces() {
        _.forEach(this.pointsmass, (p) => {
            p.applyForce()
        })
    }
    // 循环计算两点之间的力，加上重力的影响，加上风，计算新的位置后更新
    doLoop(t, wind) {
        this.doConstraints();
        this.doPhysics(t);
        this.doWind(wind);
        this.applyForces();
        this.geom.verticesNeedUpdate = true;
        this.geom.computeFaceNormals();
        this.geom.normalsNeedUpdate = true;
    }
}

class Wind {
    constructor() {
        this.accuracy = 16;
        this.last = null;
        this.blow = new THREE.Vector3(1, 0, -1);
        this.windForce = 0;
        this.leftOverTime = 0;
    }
}

let wind = new Wind();
let clothes = [];
let cylinder;

function clothInit() {
    let cloth = new Clothe(SIZEX, SIZEY, clothPos, guiClothParam.flagColor);
    clothes.push(cloth);
    underScene.add(cloth.mesh);

    let geometry = new THREE.CylinderGeometry( 1, 1, 80, 32 );
    let material = new THREE.MeshPhongMaterial( {color: guiClothParam.stickColor} );
    cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(clothPos.x, clothPos.y, clothPos.z);
    cylinder.scale.set(1, guiClothParam.scaleStick, 1);
    underScene.add( cylinder );
}


function clothAnimation(current) {
    if (wind.last !== null) {
        let elapesd = current - wind.last + wind.leftOverTime;
        let timeSteps = Math.floor(elapesd / wind.accuracy);
        let currentWind = wind.blow.clone().multiplyScalar((wind.windForce));
        wind.leftOverTime = elapesd - timeSteps * wind.accuracy;
        _.times(timeSteps, () => {
            loop(
                wind.accuracy / 1000,
                currentWind
            )
        })
    }
    // 随机风力和风向
    let up = (Math.random() > 0.5) ? 1 : -1;
    wind.windForce = Math.min(Math.abs(wind.windForce +(Math.random() / 10000) * up), 0.001);
    wind.last = current;
}

function loop(t, wind) {
    _.forEach(clothes, (i) => {
        i.doLoop(t, wind)
    })
}

function guiClothInit() {
    let guiCloth = gui.addFolder("Flag Setting");
    guiCloth.addColor(guiClothParam, 'flagColor').onChange(function(value) {
        clothes[0].material.color.set(value);
    });
    guiCloth.addColor(guiClothParam, 'stickColor').onChange(function(value) {
        cylinder.material.color.set(value);
    });
    guiCloth.add(guiClothParam, 'scaleX', 0.1, 1).onChange(function(value) {
        SIZEX = Math.round(15*value);
        guiClothParam.redraw();
    });
    guiCloth.add(guiClothParam, 'scaleY', 0.1, 1).onChange(function(value) {
        SIZEY = Math.round(10*value);
        guiClothParam.redraw();
    });
    guiCloth.add(guiClothParam, 'scaleStick', 0.1, 1).onChange(function(value) {
        cylinder.scale.set(1, value, 1);
    });

    guiCloth.add(guiClothParam, 'positionX', -500, 500).onChange(function(value) {
        clothPos.x = value;
        guiClothParam.redraw();
    });
    guiCloth.add(guiClothParam, 'positionY', -100, 0).onChange(function(value) {
        clothPos.y = value;
        guiClothParam.redraw();
    });
    guiCloth.add(guiClothParam, 'positionZ', -500, 500).onChange(function(value) {
        clothPos.z = value;
        guiClothParam.redraw();
    });

}

