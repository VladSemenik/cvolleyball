import React from 'react';
import styles from './index.css';
import io from 'socket.io-client';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "Game page",
      ball: {
        radius: 3,
        x: 100,
        y: 100,
      },
      player: {
        radius: 6,
        x: 40,
        y: 40,
        dx: 3,
        dy: -2,
        gravity: 3.85,
        drag: 0.8,
        Right: false,
        Left: false,
        Up: false,
      }
    };
  }

  async playerMove () {
    const player = await Object.assign({}, this.state.player);
    player.dy -= player.gravity;
    player.y += player.dy;

    if(player.x <= player.radius) {
      player.dx = 0;
      player.x = player.radius;
    }
    if(player.x >= 100 - player.radius) {
      player.dx = 0;
      player.x = 100 - player.radius;
    }
    if(player.y < player.radius) {
      player.y = player.radius;
      player.dy = 0;
    }

    if (player.Right) player.x += 5;
    if (player.Left) player.x -= 5;
    if (player.Up && player.y === player.radius) {
      player.dy += 20;
      player.Up = false;
    }

    await this.setState((state, props) => ({
      player: player
    }))
  }

  ballFigure(x, y, color, radius) {
    const canvas = document.getElementById('canvas');
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius * window.innerWidth / 100, 0, Math.PI * 2, true);
      ctx.fill();
    }
  }

  playerFigure(x, y, color, radius) {
    const canvas = document.getElementById('canvas');
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius * window.innerWidth / 100, 0, Math.PI * 2, true);
      ctx.fill();
    }
  }

  fieldClear() {
    const canvas = document.getElementById('canvas');
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  componentDidMount() {
    const socket = io.connect('http://172.20.1.39:3030');

    socket.on('ball point', (data) => {
      this.setState((state, props) => ({
        ball: Object.assign(state.ball, JSON.parse(data))
      }));
    });


    document.addEventListener('keydown', async (e) => {

      switch (e.code) {
        case "KeyW": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Up: true })
        })); break;
        case "KeyD": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Right: true })
        })); break;
        case "KeyA": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Left: true })
        })); break;
        default: break;
      }

    });

    document.addEventListener('keyup', async (e) => {

      switch (e.code.toString()) {
        case "KeyW": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Up: false })
        })); break;
        case "KeyD": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Right: false })
        })); break;
        case "KeyA": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Left: false })
        })); break;
        default: break;
      }

    });

    setInterval(async () => {
      await this.fieldClear();
      await this.playerFigure(this.state.player.x * window.innerWidth / 100, (100 - this.state.player.y) * window.innerHeight / 100, 'green', this.state.player.radius);
      await this.ballFigure(this.state.ball.x * window.innerWidth / 100, (100 - this.state.ball.y) * window.innerHeight / 100, 'gray', this.state.ball.radius);
    }, 0);

    setInterval(async () => {
      await this.playerMove();
      socket.emit('player point', JSON.stringify(this.state.player));
    }, 100);

  }

  render () {
    return <div>
      <canvas id="canvas" className={styles.canvas} width={window.innerWidth} height={window.innerHeight}>
      </canvas>
    </div>;
  };
}

export default Game;