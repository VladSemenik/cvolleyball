import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Game from './components/game';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date()
    };
  }

  render () {
    return <Router>
        <div>
          <Link to="/login">singIn</Link><br/>
          <Link to="/register">singUp</Link><br/>
          <Link to="/game">game</Link>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/game" component={Game} />
          </Switch>
        </div>
      </Router>
  };
}

export default App;
