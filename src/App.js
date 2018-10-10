import React, { Component } from 'react';
import './App.css';
import BreakOut from './game/break-out.js';


class App extends Component {
  render() {
    return (
      <div className="App">
          <BreakOut />
      </div>
    );
  }
}

export default App;
