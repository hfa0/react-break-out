import React, { Component } from 'react';
import './App.css';
import BreakOut from './game/break-out.js';


class App extends Component {
  render() {
    return (
      <div className="App">
          <BreakOut />
          <div className="instruction">start the game and use left and right arrow buttons to move the bar</div>
      </div>
    );
  }
}

export default App;
