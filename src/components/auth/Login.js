import React from 'react';
import './login.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "Login page"
    };
  }

  render () {
    return <div> { this.state.data } </div>;
  };
}

export default Login;