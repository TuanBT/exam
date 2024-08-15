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
  }

  render() {
    const { data } = this.state;
    return (
      <div>
        <section className="py-5 text-center container">
          <div className="row py-lg-5">
            <div className="col-lg-6 col-md-8 mx-auto">
              <h1 className="fw-bold">Exam Training</h1>
              <p className="lead text-muted">The application allows self-learning and testing to help increase confidence when taking multiple-choice exams.<br />The app currently only supports PMP exam preparation and the questions are sourced from two sources: Exam Topic and Study Hall.</p>
              <p>
                <NavLink to="/study"><button className="btn btn-primary btn-lg px-4 me-3 sm-3" type="button"><i className="fab fa-leanpub"></i> Study</button></NavLink>
                <NavLink to="/exam"><button className="btn btn-outline-danger btn-lg px-4" type="button"><i className="fas fa-graduation-cap"></i> Exam</button></NavLink>
              </p>
            </div>
          </div>
        </section>
        <p className="pb-3 text-center text-muted-custom">©Tuân 2024</p>
      </div>
    );
  }
}

export default HomeContainer;
