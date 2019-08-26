const Player = function(name, color, radius, x, y, dx, dy, gravity, drag) {
    this.name = name;
    this.color = color;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.gravity = gravity;
    this.drag = drag;
    this.Right = false;
    this.Left = false;
    this.Up = false;
    this.Kick = false;
};

Player.prototype.playerMove = async function() {
  this.dy -= this.gravity;
  this.y += this.dy;

  if(this.x <= this.radius) {
    this.dx = 0;
    this.x = this.radius;
  }
  if(this.x >= 100-this.radius) {
    this.dx = 0;
    this.x = 100-this.radius;
  }
  if(this.y < this.radius*2) {
    this.y = this.radius*2;
    this.dy = 0;
  }

  if (this.y === this.radius*2) {
    if (this.Right) this.x += 0.5;
    if (this.Left) this.x -= 0.5;
  } else {
    if (this.Right) this.x += 0.2;
    if (this.Left) this.x -= 0.2;
  }

  if (this.Up && this.y === this.radius*2) {
    this.dy += 1;
    this.Up = false;
  }

  // wall
  if (this.x+this.radius >= 48 && this.x-this.radius <= 52 && this.y <= 75) {
    if (this.x < 48) {
      this.dx = 0;
      this.x = 48-this.radius;
    } else {
      this.dx = 0;
      this.x = 52+this.radius;
    }
  }
};

Player.prototype.drawPlayer = async function (canvas, img) {
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');
      const point = await Math.floor(Math.sqrt(Math.pow(this.x-(this.x - this.radius), 2) + Math.pow((this.y + this.radius)-this.y,2)));
      ctx.save();
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        (this.x - point) * window.innerWidth / 100,
        (100 - (this.y + point)) * window.innerHeight / 100,
        this.radius*2 * window.innerWidth / 100,
        this.radius*2 * window.innerWidth / 100
      );
      ctx.restore();
    }
};

Player.prototype.getConfigPlayer = async function () {
  return {
    "name": this.name,
    "color": this.color,
    "radius": this.radius,
    "x": this.x,
    "y": this.y,
    "dx": this.dx,
    "dy": this.dy,
    "gravity": this.gravity,
    "drag": this.drag,
    "Right": this.Right,
    "Left": this.Left,
    "Up": this.Up,
    "Kick": this.Kick,
  }
};

Player.prototype.setConfigPlayer = async function (params) {
  this.name = params.name;
  this.color = params.color;
  this.radius = params.radius;
  this.x = params.x;
  this.y = params.y;
  this.dx = params.dx;
  this.dy = params.dy;
  this.gravity = params.gravity;
  this.drag = params.drag;
  this.Right = params.Right;
  this.Left = params.Left;
  this.Up = params.Up;
  this.Kick = params.Kick;
};

Player.prototype.setKick = async function (value) {
  this.Kick = !!value;
};

Player.prototype.getKick = async function () {
  return this.Kick;
};

Player.prototype.setRight = async function (value) {
  this.Right = !!value;
};

Player.prototype.setLeft = async function (value) {
  this.Left = !!value;
};

Player.prototype.setUp = async function (value) {
  this.Up = !!value;
};

Player.prototype.getControls = async function () {
  return {
    "Right": this.Right,
    "Left": this.Left,
    "Up": this.Up,
  }
};

export default Player;