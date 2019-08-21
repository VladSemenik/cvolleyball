class Ball {
  constructor(radius, x, y, dx, dy, gravity, drag) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.gravity = gravity;
    this.drag = drag;
  }

  ballMove () {
    this.dy -= this.gravity;
    this.x += this.dx/2;
    this.y += this.dy;

    if(this.x < this.radius*2) {
      this.dx *= -1;
    }
    if(this.x > 100-this.radius*2) {
      this.dx *= -1;
    }
    if(this.y > 100 - this.radius*2) {
      this.y = 100 - this.radius*2;
      this.dy = -this.dy * this.drag;
      this.dx = this.dx * this.drag;
    }
    if(this.y < this.radius*2) {
      this.y = this.radius*2;
      this.dy = -this.dy * this.drag;
      this.dx = this.dx * this.drag;
    }
    // wall
    if (this.x+this.radius >= 48 && this.x-this.radius <= 52 && this.y <= 75) {
      if (this.x < 48) {
        this.dx *= -1;
        this.x = 48-this.radius;
      }else {
        this.dx *= -1;
        this.x = 52+this.radius;
      }
    }
  }

  ballDraw (canvas, color) {
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x * window.innerWidth / 100, (100 - this.y) * window.innerHeight / 100, this.radius * window.innerWidth / 100, 0, Math.PI * 2, true);
      ctx.fill();
    }
  }

  set configBall (params) {
    this.radius = params.radius;
    this.x = params.x;
    this.y = params.y;
    this.dx = params.dx;
    this.dy = params.dy;
    this.gravity = params.gravity;
    this.drag = params.drag;
  }

  get configBall () {
    return {
      "radius": this.radius,
      "x": this.x,
      "y": this.y,
      "dx": this.dx,
      "dy": this.dy,
      "gravity": this.gravity,
      "drag": this.drag,
    }
  }
}

export default Ball;