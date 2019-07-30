import React from 'react';
import './register.css';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "Register page"
    };
  }

  render () {
    return <div> { this.state.data } </div>;
  };
}

export default Register;