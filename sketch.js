// import Ball from "./Ball";
// import Box from "./Box";
const boxSize = 200;
const FONT_SIZE = 18;
let theBox;
let pageData;
let restTime = 0;
let GRAVITY = -0.1;

function preload() {
	pageFont = loadFont("./assets/Castoro-Regular.ttf");
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	pageData = createGraphics(200, 100);

	theBox = new Box(createVector(0, 0, 0), createVector(boxSize, boxSize, boxSize));
	// add some ball to box
	theBox.balls.push(new Ball(createVector(0, 0, 0),     createVector(1, 2, 0), 20, 2));
	theBox.balls.push(new Ball(createVector(10, 60, 20),  createVector(1, 1, 2), 20, 2));
	theBox.balls.push(new Ball(createVector(20, 50, -20), createVector(1, 1, 2), 20, 2));
	theBox.balls.push(new Ball(createVector(30, 40, 40),  createVector(1, 1, 2), 20, 2));
	theBox.balls.push(new Ball(createVector(40, 30, -40), createVector(3, 2, 3), 20, 2));
	theBox.balls.push(new Ball(createVector(50, 20, 60),  createVector(1, 1, 2), 20, 2));
	theBox.balls.push(new Ball(createVector(60, 10, -60), createVector(1, 1, 2), 20, 2));
}

function draw() {
	background(220);
	createStatusBar();
	lights();

	push();
	noFill();
	theBox.showBox();
	pop();

	push();
	noStroke();
	ambientMaterial(255, 100, 0);
	theBox.showBalls();
	pop();

	update();
}

function update() {
	restTime += deltaTime;
	for (let i = 0; i < restTime / 10; restTime -= 10) {
		// try to calculate 100 times per sec
		theBox.wallCollision();
		theBox.ballCollisionCheck();
		theBox.update();
	}
}

function createStatusBar() {
	pageData.background(100);
	pageData.textSize(FONT_SIZE);
	pageData.textFont(pageFont);
	pageData.text("FPS: " + floor(frameRate()), FONT_SIZE, 2 * FONT_SIZE);
	pageData.text("SEC: " + floor(millis() / 1000), FONT_SIZE, 4 * FONT_SIZE);
	image(pageData, windowWidth / 2 - 200, -windowHeight / 2);
}

function resolveCollsion(b1, b2) {
	if (b1.m == 0 && b2.m == 0) return;

	let v_n = subtract(b2.position, b1.position); // v_n = normal vec. - a vector normal to the collision surface
	let v_un = unitVector(v_n);
	// let v_ut = createVector(-v_un.y, v_un.x); // unit tangent vector

	// Compute scalar projections of velocities onto v_un and v_ut
	let v1n = dotProduct(v_un, b1.velocity); // Dot product
	let v2n = dotProduct(v_un, b2.velocity);
	let v1t = subtract(b1.velocity, scalarMult(v1n, v_un)); // vector
	let v2t = subtract(b2.velocity, scalarMult(v2n, v_un)); // vector

	if (v1n - v2n < 0)
	{
		return;
	}


	// Compute new tangential velocities
	v_v1tPrime = v1t; // Note: in reality, the tangential velocities do not change after the collision
	v_v2tPrime = v2t;

	// Compute new normal velocities using one-dimensional elastic collision equations in the normal direction
	// Division by zero avoided. See early return above.
	v1nPrime = (v1n * (b1.m - b2.m) + 2. * b2.m * v2n) / (b1.m + b2.m);
	v2nPrime = (v2n * (b2.m - b1.m) + 2. * b1.m * v1n) / (b1.m + b2.m);

	// Compute new normal and tangential velocity vectors
	v_v1nPrime = scalarMult(v1nPrime, v_un); // Multiplication by a scalar
	v_v2nPrime = scalarMult(v2nPrime, v_un);

	b1.velocity = add(v_v1nPrime, v_v1tPrime);
	b2.velocity = add(v_v2nPrime, v_v2tPrime);

}

function distance(vect1, vect2) {
	return Math.sqrt(
		(vect1.x - vect2.x) * (vect1.x - vect2.x) +
		(vect1.y - vect2.y) * (vect1.y - vect2.y) +
		(vect1.z - vect2.z) * (vect1.z - vect2.z));
}

function subtract(v1, v2) {//v1-v2
	return createVector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}

function add(v1, v2) {
	return createVector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
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
		for (let i = 0; i < this.balls.length; i++)
		{
			this.balls[i].velocity.y -= GRAVITY;

			this.balls[i].position.x += this.balls[i].velocity.x;
			this.balls[i].position.y += this.balls[i].velocity.y;
			this.balls[i].position.z += this.balls[i].velocity.z;
		}
	}

	showBox() {
		translate(this.center);
		box(this.size.x * 2, this.size.y * 2, this.size.z * 2);
		translate(-this.center.x, -this.center.y, -this.center.z);
	}

	showBalls() {
		for (let i = 0; i < this.balls.length; i++)
		{
			translate(this.balls[i].position);
			sphere(this.balls[i].r);
			translate(-this.balls[i].position.x, -this.balls[i].position.y, -this.balls[i].position.z);
		}
	}

	wallCollision() {
		for (let j = 0; j < this.balls.length; j++)
		{
			let b = this.balls[j];
			let center = this.center.array();
			let size = this.size.array();
			let position = b.position.array();
			let velocity = b.velocity.array();

			for (let i = 0; i < size.length; i++)
			{
				if (position[i] - b.r < center[i] - size[i] || position[i] + b.r > center[i] + size[i])
				{
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
		for (let i = 0; i < this.balls.length; i++)
		{
			for (let j = i + 1; j < this.balls.length; j++)
			{
				if (distance(this.balls[i].position, this.balls[j].position) <= this.balls[i].r + this.balls[j].r)
					resolveCollsion(this.balls[i], this.balls[j]);
			}
		}
	}

}