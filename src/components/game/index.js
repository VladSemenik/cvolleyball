import React from 'react';
import axios from 'axios';
import styles from './index.css';
import io from 'socket.io-client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "Game page",
      game: false,
      gameName: '',
      gameConnection: {},
      ball: {
        radius: 4,
        x: 30,
        y: 100,
        dx: 0,
        dy: 0,
        gravity: 0.00085,
        drag: 0.8,
      },
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
      // enemy: {
      //   name: '',
      //   radius: 6,
      //   x: 40,
      //   y: 40,
      //   dx: 0,
      //   dy: 0,
      //   gravity: 0.0085,
      //   drag: 0.8,
      //   Right: false,
      //   Left: false,
      //   Up: false,
      // },
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

  async ballMove () {
    const ball = await Object.assign({}, this.state.ball);
    ball.dy -= ball.gravity;
    ball.x += ball.dx/2;
    ball.y += ball.dy;

    if(ball.x < ball.radius*2) {
      ball.dx *= -1;
    }
    if(ball.x > 100-ball.radius*2) {
      ball.dx *= -1;
    }
    if(ball.y < ball.radius*2) {
      ball.y = ball.radius*2;
      ball.dy = -ball.dy * ball.drag;
      ball.dx = ball.dx * ball.drag;
    }
    // wall
    if (ball.x+ball.radius >= 48 && ball.x-ball.radius <= 52 && ball.y <= 75) {
      if (ball.x < 48) {
        ball.dx *= -1;
        ball.x = 48-ball.radius;
      }else {
        ball.dx *= -1;
        ball.x = 52+ball.radius;
      }
    }

    await this.setState((state, props) => ({
      ball: ball
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

  createGame() {
    axios.get(`http://localhost:3030/api/game/create/${this.state.gameName}`)
      .then(async (res) => {

        const socket = await io(`http://localhost:3031/${this.state.gameName}`, {transports: ['websocket', 'polling', 'flashsocket']});

        this.setState( (state, props) => ({
          gameConnection: socket
        }));

        console.log(socket);

        await socket.on('ball point', (data) => {
          this.setState((state, props) => ({
            ball: Object.assign(state.ball, JSON.parse(data))
          }));
          console.log("ball point", data);
        });

        await socket.on('enemy point', (data) => {
          this.setState((state, props) => ({
            enemy: Object.assign(state.enemy, JSON.parse(data))
          }));
        });
        if (res.data.createdStatus === 'connected') {

          const player = {
            x: 60,
            y: 40,
            color: 'green',
          };

          await this.setState((state, props) => ({
            player: Object.assign(state.player, player)
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

    document.querySelector('canvas').addEventListener('mousemove', async (e) => {
      await this.setState((state, props) => ({
        aim: { x: Math.floor(e.layerX/window.innerWidth*100), y: 100-Math.floor(e.layerY/window.innerHeight*100) }
      }));
    });

    setInterval(async () => {
      await this.fieldClear();
      await this.playerFigure(this.state.player.x * window.innerWidth / 100, (100 - this.state.player.y) * window.innerHeight / 100, this.state.player.color, this.state.player.radius);
      // await this.playerFigure(this.state.enemy.x * window.innerWidth / 100, (100 - this.state.enemy.y) * window.innerHeight / 100, 'blue', this.state.enemy.radius);

      await this.ballFigure(this.state.ball.x * window.innerWidth / 100, (100 - this.state.ball.y) * window.innerHeight / 100, 'gray', this.state.ball.radius);
    }, 0);

    setInterval(async () => {
      const ball = await Object.assign({}, this.state.ball);
      const player = await Object.assign({}, this.state.player);
      const aim = await Object.assign({}, this.state.aim);

      let Dx = ball.x - player.x;
      let Dy = ball.y - player.y;
      let d = Math.sqrt(Dx*Dx+Dy*Dy);

      let rb = ball.radius;
      let rp = player.radius;

      if (d < rb + rp && player.Kick) {
        const hx = aim.x - player.x;
        const hy = aim.y - player.y;
        const r = Math.sqrt(hx*hx+hy*hy);

        const ax = hx/r;
        const ay = hy/r;



        if(aim.x > player.x)
          ball.dx = ax;
        else
          ball.dx = -ax;

        if(aim.y > player.y)
          ball.dy = ay;
        else
          ball.dy = -ay;

        await this.setState((state, props) => ({
          ball: ball
        }));

        const socket = await this.state.gameConnection;
        await socket.emit('ball point', JSON.stringify(this.state.ball));
      }


      await this.playerMove();
      await this.ballMove();
    }, 1);

    // setInterval(async () => {
    //   await socket.emit('enemy point', JSON.stringify(this.state.player));
    // }, 100);

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