import React, { Component } from 'react';
import $ from 'jquery';


class TestContainer extends Component {
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
      </div>
    );
  }
}

export default TestContainer;
