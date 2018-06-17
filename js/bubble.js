let variousBubbles = [];
let bubbles = [];
let bubble, bubbleRadius = 1, bubbleOpacity = 1;
let time = 0;

function randomInSphere(radius) {
    const phi = Math.random() * Math.PI;
    const theta = Math.random() * Math.PI * 2.0;
    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

let Bubbles = function( scene ) {
    this.scene = scene;
    this.num = 30;
    this.start = 0;
    this.vanish  = false;
    this.geometry = null;
    this.material = null;
    this.system = null;
    this.launch();
};
// prototype
Bubbles.prototype = {
    constructor: Bubbles,

    reset: function() {
        this.scene.remove( this.system );
        this.scene.remove(this.target);
        this.geometry = null;
    },

    launch: function() {
        const delta = Math.min(clock.getDelta(), 0.1);
        time += delta;
        this.start = time;
        this.geometry = new THREE.Geometry();
        this.geometry.velocities = [];
        let color = new THREE.Color(0xffffff);
        let loader = new THREE.TextureLoader();
        let texture = loader.load("../asset/textures/bubbles/5865068.png");

        this.material = new THREE.PointsMaterial({
            size: 15,
            transparent: true,
            opacity: 1.0,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
            color: color
        });

        let particle;

        for (let i = 0; i < this.num; i++) {
            particle = new THREE.Vector3(0, -50, 0);
            let vel = new THREE.Vector3(
                (Math.random() - 0.5) / 3,
                 Math.random() / 5,
                (Math.random() - 0.5) / 3
            );
            let center = randomInSphere(10);
            center.y -= 500;
            this.geometry.vertices.push(center);
            this.geometry.velocities.push(randomInSphere(30));
        }

        this.system = new THREE.Points(this.geometry, this.material);
        this.system.sortParticles = true;
        this.scene.add( this.system );

        let texture1 = loader.load("../asset/textures/bubbles/1387077.png");
        this.target = new THREE.Mesh(
            new THREE.SphereGeometry(10, 20, 20),

            new THREE.MeshLambertMaterial({
                transparent: true,
                opacity: 1.0,
                map: texture1,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        this.scene.add(this.target);
    },

    update: function() {
        if (this.system && this.geometry) {
            const delta = Math.min(clock.getDelta(), 0.1);
            time += delta;

            for (let i = 0; i < this.num; i++) {
                this.material.opacity -= (time-this.start) * 0.00003 * Math.random();
                if (this.geometry.vertices[i].y >= -20) {
                    this.reset();
                    this.vanish = true;
                    return;
                }
            }
            this.material.size *= 1.001;
            this.target.position.x = 30 * Math.cos(time * 0.7);
            this.target.position.y = 50 * (time - this.start) - 200;
            this.target.position.z = 300 * Math.sin(time * 0.7);
            this.target.rotation.x += 0.2 * Math.PI * delta;
            this.target.rotation.y += 0.2 * Math.PI * delta;
            this.target.rotation.z += 0.2 * Math.PI * delta;

            const maxForce = 100.0;
            for (let  i = 0; i < this.num; i++) {
                const force = new THREE.Vector3().subVectors(this.target.position, this.geometry.vertices[i]);
                let d = force.length();
                if (d > maxForce) {
                    force.normalize().multiplyScalar(maxForce);
                }
                this.geometry.velocities[i].add(force.multiplyScalar(delta));
                this.geometry.vertices[i].add(this.geometry.velocities[i].clone().multiplyScalar(delta));

            }
            this.geometry.verticesNeedUpdate = true;
        }

    },
};
function bubblesInit() {
    createVariousBubbles();
}
function bubblesAnimation() {
    variousBubbles.forEach(function(child) {
        let vertices = child.geometry.vertices;
        vertices.forEach(function (v) {
            v.y = v.y + (v.velocityY);
            v.x = v.x - (v.velocityX);
            v.z = v.z - (v.velocityZ);

            if (v.y >= -20) v.y = -500;
            if (v.x <= -300 || v.x >= 300) v.velocityX = v.velocityX * -1;
            if (v.z <= -700 || v.z >= 400) v.velocityZ = v.velocityZ * -1;
        });
        child.geometry.verticesNeedUpdate = true;
    });

    if (bubbles.length === 0) {
        bubbles.push(new Bubbles(underScene));
    }
    for(let i = 0; i < bubbles.length; i++) {
        if (bubbles[i].vanish === true) {
            bubbles.splice(i, 1);
            continue;
        }
        bubbles[i].update();
    }
}

function createNormalBubbles(texture, size, opacity) {
    let geom = new THREE.Geometry();

    let color = new THREE.Color();
    let target = { h: 0, s: 0, l: 0 };
    color.setHSL(color.getHSL(target).h,
        color.getHSL(target).s,
        (Math.random()) * color.getHSL(target).l);

    let material = new THREE.PointsMaterial({
        size: size,
        transparent: true,
        opacity: opacity,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        color: color
    });


    for (let i = 0; i < 30; i++) {
        let particle = new THREE.Vector3(
            Math.random() * 600 - 300,
            THREE.Math.randInt(-500, 0) + 50,
            THREE.Math.randInt(0, 1000) - 700);
        particle.velocityY = 0.1 + Math.random() / 3;
        particle.velocityX = (Math.random() - 0.5) / 3;
        particle.velocityZ = (Math.random() - 0.5) / 3;
        geom.vertices.push(particle);
    }

    let system = new THREE.Points(geom, material);
    system.name = name;
    system.sortParticles = true;
    return system;
}

function createVariousBubbles() {
    let loader = new THREE.TextureLoader();
    let texture1 = loader.load("../asset/textures/bubbles/4.png");
    let texture2 = loader.load("../asset/textures/bubbles/bubble.png");
    let texture3 = loader.load("../asset/textures/bubbles/48450.png");
    let texture4 = loader.load("../asset/textures/bubbles/5865068.png");
    variousBubbles.push(createNormalBubbles(texture1, 8*bubbleRadius, bubbleOpacity, ));
    underScene.add(variousBubbles[0]);
    variousBubbles.push(createNormalBubbles(texture2, 20*bubbleRadius, bubbleOpacity));
    underScene.add(variousBubbles[1]);
    variousBubbles.push(createNormalBubbles(texture3, 20*bubbleRadius, bubbleOpacity));
    underScene.add(variousBubbles[2]);
    variousBubbles.push(createNormalBubbles(texture4, 25*bubbleRadius, bubbleOpacity));
    underScene.add(variousBubbles[3]);
}
let guiBubblesParam = new function () {
    this.size = 1;
    this.opacity = 0.6;
    this.color = 0xffffff;

    this.redraw = function () {
        variousBubbles[0].material.size = 8*guiBubblesParam.size;
        variousBubbles[1].material.size = 20*guiBubblesParam.size;
        variousBubbles[2].material.size = 20*guiBubblesParam.size;
        variousBubbles[3].material.size = 25*guiBubblesParam.size;
        variousBubbles.forEach(function (child) {
            child.material.opacity = guiBubblesParam.opacity;
        });
    };
};

function guiBubblesInit() {
    let guiBubbles = gui.addFolder("Bubbles Setting");
    guiBubbles.add(guiBubblesParam, 'size', 0, 1.5).onChange(function(value) { // 设置bubble的半径大小
        bubbleRadius = value;
        guiBubblesParam.redraw();
    });
    guiBubbles.add(guiBubblesParam, 'opacity', 0, 1).onChange(function(value) { // 设置bubble的半径大小
        bubbleOpacity = value;
        guiBubblesParam.redraw();
    });
    guiBubblesParam.redraw();
}
