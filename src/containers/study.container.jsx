import React, { Component } from 'react';
import $ from 'jquery';
import Firebase from '../firebase.js';
import { ref, set, get, update, remove, child, onValue } from "firebase/database";
import { Route, NavLink, HashRouter } from "react-router-dom";


class StudyContainer extends Component {

  constructor(props) {
    super(props);
    const me = this;
    this.state = {
      data: {}
    };
    this.db = Firebase();
    this.lastQuestion = 0;
    this.preQuestion = 0;
    this.source = "PMP/ExamTopic"; //PMP/StudyHall
    this.numberOfQuestion = 1389;
    this.currentMode = 0; // 0 = normal, 1 = dark, 2 = light
    this.textHeader = "PMP - Exam Topic";
    this.countdownInterval;
    this.timer = 60; // 1 minute in seconds
    this.information = {
      "questionNumber": 0,
      "questionQuestion": "",
      "questionAnswer": "",
      "questionCorrect": "",
      "questionNote": "",
      "sources": ['ExamTopic', 'StudyHall'],
      "subject": "",
    };
  }

  componentDidMount() {
    document.title = 'Study';
    this.main();
  }

  main() {
    console.log("main");
    this.retrieveQuestion(0);

  }

  retrieveQuestion = (questionNumberIn) => {
    this.startCountdown();

    document.getElementById('inputQuestionNumber').placeholder = '1 - ' + this.numberOfQuestion;

    let questionNumber = Math.floor(Math.random() * this.numberOfQuestion) + 1;
    if (questionNumberIn !== 0) {
      questionNumber = questionNumberIn;
    }
    // Save the current question number as the previous question
    this.preQuestion = this.lastQuestion;

    // Update the current question number
    this.lastQuestion = questionNumber;

    onValue(ref(this.db, '/subject/' + this.source + '/questions/' + questionNumber), (snapshot) => {
      const questionData = snapshot.val();
      if (questionData) {
        this.information["subject"] = this.textHeader;
        this.information["questionNumber"] = questionData.number;
        this.information["questionQuestion"] = questionData.question;
        document.getElementById('q-question-img').innerHTML = "<img src='" + questionData.questionImage + "'>";
        this.information["questionAnswer"] = questionData.answer.split('<br/>');
        this.information["questionCorrect"] = questionData.correct;
        document.getElementById('q-correct-img').innerHTML = "<img src='" + questionData.correctImage + "'>";
        this.information["questionNote"] = questionData.note;


        const solutionCard = document.getElementById('solution-card');
        solutionCard.style.display = 'none';

      } else {
        document.getElementById('questionDetails').innerHTML = '<p>No question found with the given number.</p>';
      }
      this.setState({ data: this.information });

      var inputAnswer = document.querySelectorAll("input[name=answer]");
      for (var i = 0; i < inputAnswer.length; i++) {
        inputAnswer[i].checked = false;
      }
    })
  }


  toggleSolution = () => {
    const solutionCard = document.getElementById('solution-card');
    if (solutionCard.style.display === 'none') {
      solutionCard.style.display = 'block';
    } else {
      solutionCard.style.display = 'none';
    }

    const correctChoiceElements = document.querySelectorAll(".correct-choice");
    const correctChoiceShowElements = document.querySelectorAll(".correct-choice-show");

    correctChoiceElements.forEach(element => {
      element.classList.replace("correct-choice", "correct-choice-show");
    });

    correctChoiceShowElements.forEach(element => {
      element.classList.replace("correct-choice-show", "correct-choice");
    });
  };



  startCountdown = () => {
    this.stopCountdown();
    const countdownElement = document.getElementById('countdown');

    this.countdownInterval = setInterval(() => {
      countdownElement.textContent = this.convertTimeToString(this.timer);
      this.timer--;
    }, 1000); // Update the countdown every 1 second
  }

  stopCountdown = () => {
    const countdownElement = document.getElementById('countdown');

    clearInterval(this.countdownInterval);
    this.timer = 60;
    countdownElement.textContent = this.convertTimeToString(this.timer);
  }

  convertTimeToString = (timer) => {
    const isNegative = timer < 0;
    const absoluteTimer = Math.abs(timer);
    const minutes = Math.floor(absoluteTimer / 60);
    const seconds = absoluteTimer % 60;
    let timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (isNegative) {
      timeString = `-${timeString}`;
    }

    return timeString;
  }

  randomQuestion = () => {
    this.retrieveQuestion(0);
  }

  backQuestion = () => {
    this.retrieveQuestion(this.preQuestion);
  }

  previousQuestion = () => {
    this.retrieveQuestion(this.lastQuestion - 1);
  }

  nextQuestion = () => {
    this.retrieveQuestion(this.lastQuestion + 1);
  }

  gotoQuestion = () => {
    var inputQuestionNumber = document.getElementById('inputQuestionNumber');
    if (inputQuestionNumber.value !== '') {
      this.retrieveQuestion(parseInt(inputQuestionNumber.value));
      inputQuestionNumber.value = '';
    }
  }

  toggleDarkMode = () => {
    this.currentMode = (this.currentMode + 1) % 3;
    switch (this.currentMode) {
      case 0:
        document.body.className = "normal-mode";
        break;
      case 1:
        document.body.className = "dark-mode";
        break;
      case 2:
        document.body.className = "dark-mode light-mode";
        break;
    }
  }

  resetCountdown = () => {
    this.timer = 60;
  }

  increaseFontSize = () => {
    var cardTextElements = document.querySelectorAll(".card-text");
    cardTextElements.forEach(function (element) {
      var currentSize = parseFloat(window.getComputedStyle(element).getPropertyValue('font-size'));
      element.style.fontSize = (currentSize + 2) + "px";
    });
  }

  decreaseFontSize = () => {
    var cardTextElements = document.querySelectorAll(".card-text");
    cardTextElements.forEach(function (element) {
      var currentSize = parseFloat(window.getComputedStyle(element).getPropertyValue('font-size'));
      element.style.fontSize = (currentSize - 2) + "px";
    });
  }

  chooseSource = (source) => {
    if (source === 'ExamTopic') {
      this.source = "PMP/ExamTopic";
      this.textHeader = "PMP - Exam Topic";
      this.numberOfQuestion = 1389;
    } else if (source === 'StudyHall') {
      this.source = "PMP/StudyHall";
      this.textHeader = "PMP - Study Hall";
      this.numberOfQuestion = 875;
    }
    this.retrieveQuestion(0);
  }

  handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.gotoQuestion();
    }
  };

  showModal = () => {
    $('#modal').removeClass('modal display-none').addClass('modal display-block');
  };
  hideModal = () => {
    $('#modal').removeClass('modal display-block').addClass('modal display-none');
  };


  render() {
    const { data } = this.state;
    return (
      <div>
        <div className="">

          <div className="d-grid gap-0 d-sm-flex justify-content-sm-center">
            <div className="input-group p-2">
            <NavLink to="/"><button className="btn btn-success me-2" type="button"><i className="fas fa-home"></i></button></NavLink>
              <button type="button" className="btn btn-primary rounded-start" data-bs-toggle="modal" data-bs-target="#modal" onClick={this.showModal}>
                <i className="fas fa-cog"></i>
              </button>
              <input type="number" className="form-control text-end" placeholder="" aria-label="" id="inputQuestionNumber" onKeyUp={this.handleKeyUp} />
              <button className="btn btn-primary" type="button" onClick={this.gotoQuestion}><i
                className="fa-solid fa-arrows-turn-to-dots"></i> Go</button>
            </div>
          </div>



          <div className="container-fluid pb-5 px-0">
            <div className="card">

              <div className="card-top card-background rounded-top text-white">
                <div className="card-subject ps-3">
                  <span className="question-title-topic" id="q-subject">
                    {data["subject"]}
                  </span>

                </div>
                <div className="card-info pe-3 text-end">
                  <div className="card-timer">
                    <span className="question-title-info" onClick={this.resetCountdown}><i className="fa-solid fa-stopwatch"></i> Time Remaining <span id="countdown">60</span>
                    </span>
                  </div>
                  <div className="card-question">
                    <span className=""></span><i className="fas fa-book"></i> <span id="q-number">{data["questionNumber"]}</span>
                  </div>

                </div>
              </div>

              <div className="card-body question-body p-3">
                <span className="card-text">
                  <div id="q-question" dangerouslySetInnerHTML={{ __html: data["questionQuestion"] }}>
                  </div>
                  <span id="q-question-img">
                  </span>

                  <div className="my-3" id="q-answer">
                    {data["questionAnswer"] && data["questionAnswer"].length > 0 ? data["questionAnswer"].map((answer, index) => {
                      if (answer.trim() !== '') {
                        const optionLetter = String.fromCharCode(65 + index);
                        const isCorrect = data["questionCorrect"].includes(optionLetter);

                        return (
                          <div
                            key={`answer-${index}`}
                            className={`choose-item ms-3 my-2 ${isCorrect ? 'correct-choice' : ''}`}
                          >
                            {data["questionCorrect"].length > 1 ? (
                              // Use checkboxes for multiple correct answer
                              <div>
                                <input
                                  type="checkbox"
                                  name="answer"
                                  id={`answer-${optionLetter}`}
                                  className={isCorrect ? 'correct-choice' : ''}
                                />
                                <label className="" htmlFor={`answer-${optionLetter}`}>
                                  {answer}
                                </label>
                              </div>
                            ) : (
                              // Use radio buttons for single correct answer
                              <div>
                                <input type="radio" name="answer" id={`answer-${optionLetter}`} />
                                <label className="" htmlFor={`answer-${optionLetter}`}>
                                  {answer}
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }) : (
                      <></>
                    )}
                  </div>


                </span>

                <button className="btn btn-primary reveal-solution d-print-none my-3" type="button" onClick={this.toggleSolution}><i
                  className="fa-regular fa-message"></i> Solution</button>

                <span className="card-text question-answer bg-light white-text p-2 mb-3" id="solution-card"
                  style={{ display: 'none' }}>
                  <strong>
                    <div className="correct-answer-box d-flex">Correct Answer:&nbsp;
                      <div className="correct-answer d-flex" id="q-correct">
                        {data["questionCorrect"]}
                      </div>
                    </div>
                  </strong>
                  <span id="q-correct-img">
                  </span>
                  <br />
                  <div className="answer-note fst-italic" id="q-note"
                    dangerouslySetInnerHTML={{ __html: data["questionNote"] }}>
                  </div>
                </span>
              </div>
            </div>
          </div>



          <footer className="fixed-bottom p-1 bg-light">
            <div className="d-flex float-start">
              <button className="btn btn-warning mx-1" type="button" onClick={this.backQuestion}><i
                className="fa-solid fa-arrow-rotate-left"></i> Back</button>
              <button className="btn btn-success mx-1" type="button" onClick={() => this.randomQuestion(0)}>
                <i className="fa-solid fa-shuffle"></i> Random
              </button>
            </div>

            <div className="d-flex float-end">
              <button className="btn btn-primary mx-1" type="button" onClick={this.previousQuestion}><i
                className="fa-solid fa-backward-step"></i> Previous</button>
              <button className="btn btn-primary mx-1" type="button" onClick={this.nextQuestion}>
                Next <i className="fa-solid fa-forward-step"></i>
              </button>
            </div>
          </footer>

        </div>

        <div className="modal" id="modal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="modalLabel"><i className="fas fa-cog"></i> Setting</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.hideModal}></button>
              </div>
              <div className="modal-body">
                <div className="input-group mb-2 px-1">
                  <div className="mt-2 me-2">
                    <button className="btn btn-lg btn-outline-secondary me-2" type="button" onClick={this.toggleDarkMode}><i
                      className="fa-solid fa-circle-half-stroke"></i></button>
                    <button className="btn btn-lg btn-outline-secondary me-2" type="button" onClick={this.decreaseFontSize}><i
                      className="fas fa-search-minus"></i></button>
                    <button className="btn btn-lg btn-outline-secondary me-2" type="button" onClick={this.increaseFontSize}><i
                      className="fas fa-search-plus"></i></button>
                  </div>
                </div>

                <div className="btn-group mt-2 me-2" role="group">
                  {data["sources"] && data["sources"].length > 0 ? data["sources"].map((source, i) => (
                    <React.Fragment key={i} >
                      <input type="radio" className="btn-check" name="btnradio" onClick={() => this.chooseSource(source)} id={`tournamentRadio-${source}`} value={source} defaultChecked={i === 0} />
                      <label className="btn btn-outline-secondary" htmlFor={`tournamentRadio-${source}`}>{source}</label>
                    </React.Fragment>
                  )) : (
                    <div></div>
                  )}
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={this.hideModal}>Close</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default StudyContainer;
