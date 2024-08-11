import React, { Component } from 'react';
import { Route, NavLink, HashRouter } from "react-router-dom";


class HomeContainer extends Component {
  constructor(props) {
    super(props);
    const me = this;
    this.state = {
      data: {}
    };
  }

  componentDidMount() {
    this.main();
  }

  main() {
    console.log("main");
  }

  render() {
    const { data } = this.state;
    return (
      <div>
        Home
        <NavLink to="/study"><button className="btn btn-secondary" type="button">Study</button></NavLink>
        <NavLink to="/exam"><button className="btn btn-primary" type="button">Exam</button></NavLink>
        <p className="pb-3 text-center text-muted-custom">©Tuân 2024</p>
      </div>
    );
  }
}

export default HomeContainer;
