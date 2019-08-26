import React from 'react';
import axios from 'axios';
import styles from './index.css';
import io from 'socket.io-client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Wall from '../../controllers/Wall';
import Ball from '../../controllers/Ball';
import Player from '../../controllers/Player';
const ball = new Ball(4, 30, 100, 0, 0, 0.00085, 0.8);
const player = new Player('', 'red', 9, 40, 40, 0, 0, 0.0085, 0.8);
const enemy = new Player('', 'green', 9, 60, 40, 0, 0, 0.0085, 0.8);

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "Game page",
      game: false,
      gameName: '',
      gameConnection: {},
      score: {
        left: 0,
        right: 0
      },
      aim: {
        x: 0,
        y: 0,
      }
    };
    this.changeGameName = this.changeGameName.bind(this);
    this.createGame = this.createGame.bind(this);
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

        await socket.on('enemy point', async (data) => {
          if (data.id !== socket.id) {
            await enemy.setConfigPlayer(JSON.parse(data.enemy));
          }
        });

        await socket.on('score game', async (data) => {
          if (data.id !== socket.id) {
            await this.setState((state) =>
              Object.assign({}, {
                score: JSON.parse(data.score)
              }))
          }
        });

        if (res.data.createdStatus === 'connected') {
          const copyPlayer = Object.assign({}, await player.getConfigPlayer());
          const copyEnemy = Object.assign({}, await enemy.getConfigPlayer());

          copyPlayer.x = 60;

          copyEnemy.x = 40;

          await player.setConfigPlayer(Object.assign({}, copyPlayer));
          await enemy.setConfigPlayer(Object.assign({}, copyEnemy));
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
      const socket = await this.state.gameConnection;
      if (e.button === 0) {
        await player.setKick(true);
        if (Object.keys(socket).length)
        await socket.emit('enemy point', { enemy: JSON.stringify(await player.getConfigPlayer()), id: socket.id });
      }
    });

    document.querySelector('canvas').addEventListener('mouseup', async (e) => {
      const socket = await this.state.gameConnection;
      if (e.button === 0) {
        await player.setKick(false);
        if (Object.keys(socket).length)
        await socket.emit('enemy point', { enemy: JSON.stringify(await player.getConfigPlayer()), id: socket.id });
      }
    });

    document.addEventListener('keydown', async (e) => {
      const socket = await this.state.gameConnection;
      switch (e.code) {
        case "KeyW": await player.setUp(true);
          if (Object.keys(socket).length)
          await socket.emit('enemy point', { enemy: JSON.stringify(await player.getConfigPlayer()), id: socket.id });
          break;
        case "KeyD": await player.setRight(true);
          if (Object.keys(socket).length)
          await socket.emit('enemy point', { enemy: JSON.stringify(await player.getConfigPlayer()), id: socket.id });
        break;
        case "KeyA": await player.setLeft(true);
          if (Object.keys(socket).length)
          await socket.emit('enemy point', { enemy: JSON.stringify(await player.getConfigPlayer()), id: socket.id });
        break;
        default: break;
      }
    });

    document.addEventListener('keyup', async (e) => {
      const socket = await this.state.gameConnection;
      switch (e.code.toString()) {
        case "KeyW": await player.setUp(false);
          if (Object.keys(socket).length)
          await socket.emit('enemy point', { enemy: JSON.stringify(await player.getConfigPlayer()), id: socket.id });
        break;
        case "KeyD": await player.setRight(false);
          if (Object.keys(socket).length)
          await socket.emit('enemy point', { enemy: JSON.stringify(await player.getConfigPlayer()), id: socket.id });
        break;
        case "KeyA": await player.setLeft(false);
          if (Object.keys(socket).length)
          await socket.emit('enemy point', { enemy: JSON.stringify(await player.getConfigPlayer()), id: socket.id });
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

      await player.drawPlayer(document.getElementById('canvas'), document.getElementById('player'));
      await enemy.drawPlayer(document.getElementById('canvas'), document.getElementById('enemy'));


      await ball.ballDraw(document.getElementById('canvas'), document.getElementById('ball'));

      await wall.drawWall(document.getElementById('canvas'));
    }, 0);

    setInterval(async () => {
      const socket = await this.state.gameConnection;
      const copyBall = await Object.assign({}, ball.configBall);
      const copyPlayer = await Object.assign({}, await player.getConfigPlayer());
      const aim = await Object.assign({}, this.state.aim);

      let Dx = copyBall.x - copyPlayer.x;
      let Dy = copyBall.y - copyPlayer.y;
      let d = Math.sqrt(Dx*Dx+Dy*Dy);

      let rb = copyBall.radius;
      let rp = copyPlayer.radius;

      if (d < rb + rp && await player.getKick()) {
        const hx = aim.x - copyPlayer.x;
        const hy = aim.y - copyPlayer.y;
        const r = Math.sqrt(hx*hx+hy*hy);

        const ax = hx/r;
        const ay = hy/r;



        if(aim.x > copyPlayer.x)
          copyBall.dx = ax;
        else
          copyBall.dx = -ax;

        if(aim.y > copyPlayer.y)
          copyBall.dy = ay;
        else
          copyBall.dy = -ay;

        ball.configBall = copyBall;
        if (Object.keys(socket).length)
        await socket.emit('ball point', JSON.stringify(ball.configBall));
      }

      if (copyBall.y <= 10){
        const score = await Object.assign({}, this.state.score);

        if (copyBall.x < 50)
          score.left++;
        else
          score.right++;

        this.setState((state, props) => ({
          score: score
        }));

        copyBall.y = 100;
        copyBall.dx = 0;
        copyBall.dy = 0;
        ball.configBall = copyBall;

        if (Object.keys(socket).length) {
          await socket.emit('score game', JSON.stringify(this.state.score));
          await socket.emit('ball point', JSON.stringify(ball.configBall));
        }
      }

      await player.playerMove();
      await enemy.playerMove();

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
          <span>{this.state.score.left}</span>
          :
          <span>{this.state.score.right}</span>
        <canvas id="canvas" className={"game_canvas"} width={window.innerWidth} height={window.innerHeight}>
          <img id="ball" src={require("./../../assets/ball.png")} alt="ball"/>
          <img id="player" src={require("./../../assets/player.png")} alt="player"/>
          <img id="enemy" src={require("./../../assets/enemy.png")} alt="enemy"/>
        </canvas>
      </div>;
  };
}

export default Game;