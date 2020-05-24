import React, { Component } from 'react';
import './break-out.css';
const d3 = require("d3");

const Ball = ({ x, y, ballRadius }) => (
  <circle cx={x} cy={y} r={ballRadius} />
);

const Bar = ({ x, y, w, h }) => (
  <rect className="bar" x={x} y={y} width={w} height={h} rx="3" ry="3" />
);

const Node = ({ x, y, w, h, alive, index }) => (
  <g style={{ display: alive ? 'block' : 'none' }}>
    <rect className="node" x={x} y={y} width={w} height={h} rx="3" ry="3" />
  </g>
);

var createNodes = (screenWidth, screenHeight, line, nodeColCount = 10) => {
  var nodes = [];
  var minPadding = 2;
  var nodeHeight = 15;
  var x = parseInt((screenWidth - minPadding * 2) / nodeColCount)
  var rows = parseInt((screenHeight * line - minPadding * 2) / nodeHeight)
  var w = x * 0.9;
  var h = nodeHeight * 0.9;
  // var px = x * 0.1;
  // var py = nodeHeight * 0.1;

  var xPadding = (screenWidth - x * nodeColCount) / 2
  var yPadding = (screenHeight * line - rows * nodeHeight) / 2

  var dx = xPadding + (x * 0.1 / 2);
  var dy = yPadding;

  for (var i = 0; i < nodeColCount * rows; i++) {
    if (i % nodeColCount === 0 && i !== 0) {
      dx = xPadding + (x * 0.1 / 2)
      dy += nodeHeight
    }
    nodes.push({ x: dx, y: dy, w: w, h: h, alive: true });
    dx += x
  }
  //console.log(nodes);
  return nodes
}


class BreakOut extends Component {

  screenWidth = 800;
  screenHeight = 400;
  ballRadius = 10;
  barWidth = 150;
  barHeight = 10;
  line = 0.5;

  defaultState = {
    xBall: this.screenWidth / 2,
    yBall: this.screenHeight - this.ballRadius - this.barHeight,
    barWidth: this.barWidth,
    xBar: (this.screenWidth / 2) - (this.barWidth / 2),
    yBar: this.screenHeight - this.barHeight,
    nodes: createNodes(this.screenWidth, this.screenHeight, this.line),
    alphaBall: 0,
    vBall: 2,
    vBar: 15,
    nodeColCount: 10,
  };

  constructor() {
    super();
    this.state = {
      isRunning: false,
      isGameOver: false,
      ...this.defaultState
    }
    this.startGame = this.startGame.bind(this);
    this.stopGame = this.stopGame.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.moveBar = this.moveBar.bind(this);
  }

  resetGame() {
    this.stopGame();
    const { vBall, nodeColCount, barWidth, vBar } = this.state
    const xBar = (this.screenWidth / 2) - (this.state.barWidth / 2)
    this.defaultState.nodes = createNodes(this.screenWidth, this.screenHeight, this.line, nodeColCount)
    this.setState({ ...this.defaultState, xBar, vBar, vBall, nodeColCount, barWidth, isGameOver: false });
  }

  setNodes(nodeCount) {
    this.setState({ ...this.state, nodeColCount: nodeCount }, () => {
      this.resetGame()
    })
  }

  setBarWidth(width) {
    const oldWidth = this.state.barWidth
    const d = oldWidth - width
    this.setState({ ...this.state, barWidth: width, xBar: this.state.xBar + d / 2 })

  }

  startGame() {
    if (this.state.isRunning) return;
    this.timer = d3.timer(() => this.gameLoop());
    this.gameLoop();
    this.setState({ isRunning: true })
  }

  stopGame() {
    if (!this.timer) return;
    this.timer.stop();
    this.setState({ isRunning: false })
  }

  moveBar(e) {
    e.preventDefault();
    if (!this.state.isRunning) return;
    let { xBar, vBar, xBall } = this.state

    var key = e.keyCode;
    var dxBar = 0;
    //console.log(e.keyCode);
    if (key === 39) dxBar = vBar;
    if (key === 37) dxBar = -vBar;

    if ((xBar + dxBar) < 0 || (xBar + parseFloat(this.state.barWidth) + dxBar) > this.screenWidth) {
      console.log('nope')
      return
    };

    this.setState({
      xBar: xBar + dxBar,
      xBall: !this.state.isRunning ? xBall + dxBar : xBall
    })
  }

  componentDidMount() {
    document.addEventListener('keydown', this.moveBar);
  }

  componentWillUnmount() {
    this.stopGame();
    document.removeEventListener('keydown', this.moveBar);
  }

  bounceSucceed(xBall, xBar) {
    var a = (xBall >= xBar && xBall <= xBar + this.state.barWidth)
    return a
  }

  gameOver() {
    this.stopGame();
    this.setState({
      isGameOver: true
    })
  }

  findCollidingNodes() {
    var isColliding = false
    let { nodes, xBall, yBall } = this.state
    var i = 0;
    for (let node of nodes) {
      if (node.alive) {
        var a = (xBall >= node.x && xBall <= node.x + node.w)
        var b = (yBall + this.ballRadius >= node.y && yBall - this.ballRadius <= node.y + node.h)
        isColliding = a && b
        if (isColliding) {
          //console.log({i:i, xBall:xBall, yBall:yBall, xn:node.x, yn:node.y, a:a, b:b});
          node.alive = false
          //this.stopGame()
          break
        }
      }
      i++
    }
    this.setState({
      nodes: nodes,
    })

    return isColliding
  }


  gameLoop() {

    let { xBall, vBall, yBall, alphaBall, xBar } = this.state;

    var flip = (alpha) => (alpha - Math.PI / 2);

    if (alphaBall === 0) {
      //initial random angle
      var r = Math.random() * ((5 * Math.PI / 16) - (1 * Math.PI / 4)) + (1 * Math.PI / 4);
      alphaBall = Math.round(Math.random()) === 1 ? r : Math.PI - r;
    } else if ((xBall + this.ballRadius) > this.screenWidth) {
      //ball bounces on right side
      alphaBall = flip(alphaBall)
    } else if (xBall < this.ballRadius) {
      //ball bounces on left side
      alphaBall = flip(alphaBall)
    }

    if (yBall < this.ballRadius) {
      //ball bounces on top
      alphaBall = flip(alphaBall)
    }

    if ((yBall > this.screenHeight - this.ballRadius - this.barHeight)) {
      //ball arrives at the minimum height
      if (this.bounceSucceed(xBall, xBar)) {
        //ball bounes on bar
        alphaBall = flip(alphaBall)
        console.log("bounced");
      } else {
        console.log("game over");
        return this.gameOver()
      }
    }

    if (yBall - this.ballRadius <= this.screenHeight * this.line) {
      var a = this.findCollidingNodes()
      //console.log(a);
      if (a) {
        alphaBall = flip(alphaBall)
        var nodesAlive = this.state.nodes.filter((n) => n.alive).length;
        if (nodesAlive === 0) return this.gameOver();
      }
    }


    var dyBall = Math.round(Math.sin(alphaBall), 2) * vBall
    var dxBall = Math.round(Math.cos(alphaBall), 2) * vBall

    this.setState({
      yBall: yBall - dyBall,
      xBall: xBall - dxBall,
      alphaBall: alphaBall,
    })
  }

  render() {

    return (

      <div className="game">
        <div>
          {this.state.isGameOver ? (
            <svg className="gameover" width={this.screenWidth} height={this.screenHeight}><text className="text-center" x={this.screenWidth / 2} y={this.screenHeight / 2}>Game Over</text></svg>
          ) : (
              <svg className="screen" width={this.screenWidth} height={this.screenHeight}>
                {this.state.nodes.map(function (node, index) {

                  return <Node key={index}
                    index={index}
                    alive={node.alive}
                    x={node.x}
                    y={node.y}
                    w={node.w}
                    h={node.h} />;
                })}
                <Ball x={this.state.xBall}
                  y={this.state.yBall}
                  ballRadius={this.ballRadius} />
                <Bar x={this.state.xBar}
                  y={this.state.yBar}
                  w={this.state.barWidth}
                  h={this.barHeight} />
              </svg>
            )}
        </div>
        <div className="control">
          <button onClick={this.startGame}>start Game</button>
          <button onClick={this.stopGame}>stop Game</button>
          <button onClick={this.resetGame}>reset Game</button>
        </div >
        {!this.state.isRunning && <div className="control-input">
          <div className="control-input-entry"> <div>node columns</div>  <input type="number" value={this.state.nodeColCount} onChange={(evt) => this.setNodes(evt.target.value)} /></div>
          <div className="control-input-entry"> <div>ball velocity</div>  <input type="number" value={this.state.vBall} onChange={(evt) => this.setState({ ...this.state, vBall: evt.target.value })} /></div>
          <div className="control-input-entry"> <div>bar width</div>  <input type="number" value={this.state.barWidth} onChange={(evt) => this.setBarWidth(evt.target.value)} /></div>
          <div className="control-input-entry"> <div>bar velocity</div>  <input type="number" value={this.state.vBar} onChange={(evt) => this.setState({ ...this.state, vBar: Number(evt.target.value) })} /></div>
        </div>}
      </div>

    );
  }
}

export default BreakOut;
