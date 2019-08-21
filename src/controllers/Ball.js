class Ball {
  constructor() {
    this.radius = 4;
    this.x = 30;
    this.y = 100;
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.00085;
    this.drag = 0.8;
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

}