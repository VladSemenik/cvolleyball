import React from 'react';
import axios from 'axios';
import styles from './index.css';
import io from 'socket.io-client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Wall from '../../controllers/Wall';
import Ball from '../../controllers/Ball';
const ball = new Ball(4, 30, 100, 0, 0, 0.00085, 0.8);

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "Game page",
      game: false,
      gameName: '',
      gameConnection: {},
      player: {
        name: '',
        color: 'red',
        radius: 6,
        x: 40,
        y: 40,
        dx: 0,
        dy: 0,
        gravity: 0.0085,
        drag: 0.8,
        Right: false,
        Left: false,
        Up: false,
        Kick: false,
      },
      enemy: {
        name: '',
        color: 'green',
        radius: 6,
        x: 60,
        y: 40,
        dx: 0,
        dy: 0,
        gravity: 0.0085,
        drag: 0.8,
        Right: false,
        Left: false,
        Up: false,
        Kick: false,
      },
      aim: {
        x: 0,
        y: 0,
      }
    };
    this.changeGameName = this.changeGameName.bind(this);
    this.createGame = this.createGame.bind(this);
  }

  async playerMove (playerSide = "player") {
    const player = await Object.assign({}, this.state[playerSide]);
    player.dy -= player.gravity;
    player.y += player.dy;

    if(player.x <= player.radius) {
      player.dx = 0;
      player.x = player.radius;
    }
    if(player.x >= 100-player.radius) {
      player.dx = 0;
      player.x = 100-player.radius;
    }
    if(player.y < player.radius*2) {
      player.y = player.radius*2;
      player.dy = 0;
    }

    if (player.y === player.radius*2) {
      if (player.Right) player.x += 0.5;
      if (player.Left) player.x -= 0.5;
    } else {
      if (player.Right) player.x += 0.2;
      if (player.Left) player.x -= 0.2;
    }

    if (player.Up && player.y === player.radius*2) {
      player.dy += 1;
      player.Up = false;
    }

    // wall
    if (player.x+player.radius >= 48 && player.x-player.radius <= 52 && player.y <= 75) {
      if (player.x < 48) {
        player.dx = 0;
        player.x = 48-player.radius;
      }else {
        player.dx = 0;
        player.x = 52+player.radius;
      }
    }

    await this.setState((state, props) => ({
      [playerSide]: player
    }))
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

  createGame() {
    axios.get(`http://172.20.1.30:3030/api/game/create/${this.state.gameName}`)
      .then(async (res) => {

        const socket = await io(`http://172.20.1.30:3031/${this.state.gameName}`, {transports: ['websocket', 'polling', 'flashsocket']});

        this.setState( (state, props) => ({
          gameConnection: socket
        }));

        console.log(socket);

        await socket.on('ball point', (data) => {
          ball.configBall = JSON.parse(data);
          console.log("ball point", data);
        });

        await socket.on('enemy point', (data) => {
          if (data.id !== socket.id) {
            this.setState((state, props) => ({
              enemy: Object.assign(state.enemy, JSON.parse(data.enemy))
            }));
          }
        });

        if (res.data.createdStatus === 'connected') {

          const player = {
            x: 60,
            y: 40,
            color: 'green',
          };

          const enemy = {
            x: 40,
            y: 40,
            color: 'red',
          };

          await this.setState((state, props) => ({
            player: Object.assign(state.player, player),
            enemy: Object.assign(state.enemy, enemy)
          }));
        }
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      })
  }

  changeGameName(obj) {
    const value = obj.target.value;
    this.setState((state, props) => ({
      gameName: value
    }));
  }

  componentDidMount() {

    const wall = new Wall(48, 75, 4, 75, "#42252b");

    document.querySelector('canvas').addEventListener('mousedown', async (e) => {
      if (e.button === 0) {
        await this.setState((state, props) => ({
          player: Object.assign(state.player, { Kick: true })
        }));
      }
    });

    document.querySelector('canvas').addEventListener('mouseup', async (e) => {
      if (e.button === 0) {
        await this.setState((state, props) => ({
          player: Object.assign(state.player, { Kick: false })
        }));
      }
    });

    document.addEventListener('keydown', async (e) => {
      const socket = await this.state.gameConnection;
      switch (e.code) {
        case "KeyW": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Up: true })
        }));
          await socket.emit('enemy point', { enemy: JSON.stringify(this.state.player), id: socket.id });
          break;
        case "KeyD": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Right: true })
        }));
          await socket.emit('enemy point', { enemy: JSON.stringify(this.state.player), id: socket.id });
        break;
        case "KeyA": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Left: true })
        }));
          await socket.emit('enemy point', { enemy: JSON.stringify(this.state.player), id: socket.id });
        break;
        default: break;
      }
    });

    document.addEventListener('keyup', async (e) => {
      const socket = await this.state.gameConnection;
      switch (e.code.toString()) {
        case "KeyW": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Up: false })
        }));
          await socket.emit('enemy point', { enemy: JSON.stringify(this.state.player), id: socket.id });
        break;
        case "KeyD": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Right: false })
        }));
          await socket.emit('enemy point', { enemy: JSON.stringify(this.state.player), id: socket.id });
        break;
        case "KeyA": await this.setState((state, props) => ({
          player: Object.assign(state.player, { Left: false })
        }));
          await socket.emit('enemy point', { enemy: JSON.stringify(this.state.player), id: socket.id });
        break;
        default: break;
      }
    });

    document.querySelector('canvas').addEventListener('mousemove', async (e) => {
      await this.setState((state, props) => ({
        aim: { x: Math.floor(e.layerX/window.innerWidth*100), y: 100-Math.floor(e.layerY/window.innerHeight*100) }
      }));
    });

    setInterval(async () => {
      await this.fieldClear();
      await this.playerFigure(this.state.player.x * window.innerWidth / 100, (100 - this.state.player.y) * window.innerHeight / 100, this.state.player.color, this.state.player.radius);
      await this.playerFigure(this.state.enemy.x * window.innerWidth / 100, (100 - this.state.enemy.y) * window.innerHeight / 100, this.state.enemy.color, this.state.enemy.radius);

      await ball.ballDraw(document.getElementById('canvas'), 'gray');

      await wall.drawWall(document.getElementById('canvas'));
    }, 0);

    setInterval(async () => {
      const socket = await this.state.gameConnection;
      const copyBall = await Object.assign({}, ball.configBall);
      const player = await Object.assign({}, this.state.player);
      const aim = await Object.assign({}, this.state.aim);

      let Dx = copyBall.x - player.x;
      let Dy = copyBall.y - player.y;
      let d = Math.sqrt(Dx*Dx+Dy*Dy);

      let rb = copyBall.radius;
      let rp = player.radius;

      if (d < rb + rp && player.Kick) {
        const hx = aim.x - player.x;
        const hy = aim.y - player.y;
        const r = Math.sqrt(hx*hx+hy*hy);

        const ax = hx/r;
        const ay = hy/r;



        if(aim.x > player.x)
          copyBall.dx = ax;
        else
          copyBall.dx = -ax;

        if(aim.y > player.y)
          copyBall.dy = ay;
        else
          copyBall.dy = -ay;

        ball.configBall = copyBall;

        await socket.emit('ball point', JSON.stringify(ball.configBall));
      }

      await this.playerMove();
      await this.playerMove('enemy');

      await ball.ballMove();
    }, 1);

  }

  render () {
    return <div>
        <form className={"game__form-create"} noValidate autoComplete="off">
          <TextField
            onChange={this.changeGameName}
            className={"game_name-field"}
            label="name"
            margin="normal"
          />
          <Button
            onClick={this.createGame}
            className={"game_button-create"}
            variant="contained"
          >
            Create
          </Button>
        </form>
        <canvas id="canvas" className={"game_canvas"} width={window.innerWidth} height={window.innerHeight}>
        </canvas>
      </div>;
  };
}

export default Game;