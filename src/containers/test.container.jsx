import React, { Component } from 'react';
import $ from 'jquery';
import Firebase from '../firebase.js';
import { ref, set, get, update, remove, child, onValue } from "firebase/database";
import toast, { Toaster } from 'react-hot-toast';
import { ConfirmToast } from 'react-confirm-toast'
import { characterObj } from '../assets/lib/character.js';

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
