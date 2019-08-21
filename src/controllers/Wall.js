const Wall = function (x, y, width, height, color, img)
{
  this.v_x = x;
  this.v_y = y;
  this.v_width = width;
  this.v_height = height;
  this.v_color = color;
  this.v_img = img;
};

Wall.prototype.drawWall = function (canvas) {
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = this.v_color;
    ctx.beginPath();
    ctx.fillRect(this.v_x * window.innerWidth / 100, (100 - this.v_y) * window.innerHeight / 100, this.v_width * window.innerWidth / 100, this.v_height * window.innerWidth / 100);
  }
};

export default Wall;