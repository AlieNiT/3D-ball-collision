// import Ball from "./Ball";
// import Box from "./Box";
const boxSize = 200;
let theBox;
let time = 0;
let dt = 0.1;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  theBox = new Box(createVector(0,0,0), createVector(boxSize, boxSize, boxSize));
  // add some ball to box
  theBox.balls.push(new Ball(createVector(0, 0, 0), createVector(10,20,0),20,2));
  theBox.balls.push(new Ball(createVector(10, 60, 20), createVector(10,10,20),20,2));
  theBox.balls.push(new Ball(createVector(20, 50, -20), createVector(10,10,20),20,2));
  theBox.balls.push(new Ball(createVector(30, 40, 40), createVector(10,10,20),20,2));
  theBox.balls.push(new Ball(createVector(40, 30, -40), createVector(30,20,30),20,2));
  theBox.balls.push(new Ball(createVector(50, 20, 60), createVector(10,10,20),20,2));
  theBox.balls.push(new Ball(createVector(60, 10, -60), createVector(10,10,20),20,2));
}

function draw() {
  background(220);
  
  push();
  noFill();
  box(boxSize*2);
  pop();

  push();
  normalMaterial();
  theBox.showBalls();
  theBox.wallCollision();
  theBox.ballCollisionCheck();
  pop();

  update(0.1);
}

function update(dt) {
  theBox.update();
  //call other object update;
}

function resolveCollsion(b1, b2) {
  if (b1.m == 0 && b2.m == 0) return;

  let v_n = createVector(b2.position.x - b1.position.x, b2.position.y - b1.position.y); // v_n = normal vec. - a vector normal to the collision surface
  let v_un = unitVector(v_n);
  let v_ut = createVector(-v_un.y, v_un.x); // unit tangent vector

  // Compute scalar projections of velocities onto v_un and v_ut
  let v1n = dotProduct(v_un, b1.velocity); // Dot product
  let v1t = dotProduct(v_ut, b1.velocity);
  let v2n = dotProduct(v_un, b2.velocity);
  let v2t = dotProduct(v_ut, b2.velocity);

  // Compute new tangential velocities
  v1tPrime = v1t; // Note: in reality, the tangential velocities do not change after the collision
  v2tPrime = v2t;

  // Compute new normal velocities using one-dimensional elastic collision equations in the normal direction
  // Division by zero avoided. See early return above.
  v1nPrime = (v1n * (b1.m - b2.m) + 2. * b2.m * v2n) / (b1.m + b2.m);
  v2nPrime = (v2n * (b2.m - b1.m) + 2. * b1.m * v1n) / (b1.m + b2.m);

  // Compute new normal and tangential velocity vectors
  v_v1nPrime = scalarMult(v1nPrime, v_un); // Multiplication by a scalar
  v_v1tPrime = scalarMult(v1tPrime, v_ut);
  v_v2nPrime = scalarMult(v2nPrime, v_un);
  v_v2tPrime = scalarMult(v2tPrime, v_ut);

  b1.velocity.x = v_v1nPrime.x + v_v1tPrime.x;
  b1.velocity.y = v_v1nPrime.y + v_v1tPrime.y;
  b2.velocity.x = v_v2nPrime.x + v_v2tPrime.x;
  b2.velocity.y = v_v2nPrime.y + v_v2tPrime.y;
}

function distance(vect1, vect2) {
  return Math.sqrt((vect1.x - vect2.x) * (vect1.x - vect2.x) +
                   (vect1.y - vect2.y) * (vect1.y - vect2.y) +
                   (vect1.z - vect2.z) * (vect1.z - vect2.z));
}

function unitVector(vector) {
  let l = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return createVector(vector.x / l, vector.y / l);
}

function dotProduct(vect1, vect2) {
  return vect1.x * vect2.x + vect1.y * vect2.y;
}

function scalarMult(n, vect) {
  return createVector(vect.x * n, vect.y * n);
}

class Ball {
  constructor(position, velocity, r, m) {
      console.log('ball is made');
      this.m = m;
      this.r = r;
      this.position = position;
      this.velocity = velocity;
  }
}

class Box {
  balls = [];

  constructor(center, size) {
      console.log('box is made');
      this.center = center;
      this.size = size;
  }

  update() {
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].position.x += this.balls[i].velocity.x * dt;
      this.balls[i].position.y += this.balls[i].velocity.y * dt;
      this.balls[i].position.z += this.balls[i].velocity.z * dt;
    }
  }

  showBalls() {
    for (let i = 0; i < this.balls.length; i++){
      translate(this.balls[i].position);
      sphere(this.balls[i].r);
      translate(-this.balls[i].position.x, -this.balls[i].position.y, -this.balls[i].position.z);
    }
  }

  wallCollision() {
    for (let j = 0; j < this.balls.length; j++) {
      let b = this.balls[j];
      let center = this.center.array();
      let size = this.size.array();
      let position = b.position.array();
      let velocity = b.velocity.array();

      for (let i = 0; i < size.length; i++) {
          if (position[i] - b.r < center[i] - size[i] || position[i] + b.r > center[i] + size[i]) {
              velocity[i] *= -1;
              if (position[i] - b.r < center[i] - size[i])
                  position[i] += 2 * (b.r + center[i] - size[i] - position[i]);
              else
                  position[i] -= 2 * (b.r - center[i] - size[i] + position[i]);
          }
      }
      b.velocity = createVector(velocity[0], velocity[1], velocity[2]);
      b.position = createVector(position[0], position[1], position[2]);
    }
  }

  ballCollisionCheck() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        if (distance(this.balls[i].position, this.balls[j].position) < this.balls[i].r + this.balls[j].r)
          resolveCollsion(this.balls[i], this.balls[j]);
      }
    }
  }
      
}