import React, { Component } from 'react';
import $ from 'jquery';
import Firebase from '../firebase.js';
import { Route, NavLink, HashRouter } from "react-router-dom";
import { ref, set, get, update, remove, child, onValue } from "firebase/database";


class TestContainer extends Component {

  constructor(props) {
    super(props);
    const me = this;
    this.state = {
      data: {}
    };
    this.db = Firebase();
    this.lastQuestion = 0;
    this.preQuestion = 0;
    this.counterQuestion = 1;
    this.totalQuestion = 10;
    this.curIdxOfArrQuestion = 0;
    this.trueCounter = 0;
    this.trueFalseFlag = true;
    this.source = "PMP/ExamTopic"; //PMP/StudyHall
    this.numberOfQuestion = 1389;
    this.currentMode = 0; // 0 = normal, 1 = dark, 2 = light
    this.textHeader = "PMP - Exam Topic";
    this.countdownInterval;
    this.arrayQuestions = [];
    this.timer = 60; // 1 minute in seconds
    this.examSaveInfo = {
      "timeSpend": 3600,
      "subject": "PMP/ExamTopic",
      "curIdxOfArrQuestion": 0,
      "option": [
        {
          "questionIndex": 1,
          "chooseAnswer": "B"
        },
        {
          "questionIndex": 2,
          "chooseAnswer": "AC"
        },
        {
          "questionIndex": 3,
          "chooseAnswer": ""
        }
      ]
    }
    this.information = {
      "questionNumber": 0,
      "questionQuestion": "",
      "questionAnswer": "",
      "questionCorrect": "",
      "questionNote": "",
      "sources": ['ExamTopic', 'StudyHall'],
      "subject": "",
      "totalQuestion": 10,
      "curIdxOfArrQuestion": 1,
      "chooseAnswer": ""
    };
  }

  componentDidMount() {
    document.title = 'Exam';
    this.main();
  }

  main() {
    this.loadExam();
  }

  restartExam() {
    this.arrayQuestions = this.generateRandomArray(this.numberOfQuestion, this.totalQuestion);
    this.examSaveInfo["option"] = [];
    for (let i = 0; i < this.arrayQuestions.length; i++) {
      this.examSaveInfo["option"].push({
        "questionIndex": this.arrayQuestions[i],
        "chooseAnswer": ""
      });
    }
    this.examSaveInfo["subject"] = this.source;
    this.curIdxOfArrQuestion = 0;
    this.examSaveInfo["curIdxOfArrQuestion"] = this.curIdxOfArrQuestion;
    this.timer = this.totalQuestion * 76; //1.26 min/question
    this.retrieveQuestion(this.examSaveInfo["option"][this.curIdxOfArrQuestion]["questionIndex"]);
    this.startCountdown();
  }

  loadExam() {
    let examSaveInfoTemp = JSON.parse(localStorage.getItem("exam_test"));
    if (examSaveInfoTemp) {
      this.examSaveInfo = examSaveInfoTemp;
      this.curIdxOfArrQuestion = this.examSaveInfo["curIdxOfArrQuestion"];
      this.totalQuestion = this.examSaveInfo["option"].length;
      this.retrieveQuestion(this.examSaveInfo["option"][this.curIdxOfArrQuestion]["questionIndex"]);
      this.timer = this.examSaveInfo["option"].length * 76 - this.examSaveInfo["timeSpend"];
      this.startCountdown();
      this.showModal();
    } else {
      this.showModal();
      this.restartExam();
    }
  }

  retrieveQuestion = (questionNumberIn) => {
    onValue(ref(this.db, '/subject/' + this.source + '/questions/' + questionNumberIn), (snapshot) => {
      const questionData = snapshot.val();
      if (questionData) {
        this.information["subject"] = this.textHeader;
        this.information["questionNumber"] = questionData.number;
        this.information["questionQuestion"] = questionData.question;
        document.getElementById('q-question-img').innerHTML = "<img src='" + questionData.questionImage + "'>";
        this.information["questionAnswer"] = questionData.answer.split('<br/>');
        this.information["questionCorrect"] = questionData.correct;
        this.information["chooseAnswer"] = this.examSaveInfo["option"][this.curIdxOfArrQuestion]["chooseAnswer"];
        this.information["totalQuestion"] = this.totalQuestion;
        this.information["curIdxOfArrQuestion"] = this.curIdxOfArrQuestion + 1;
      } else {
        document.getElementById('questionDetails').innerHTML = '<p>No question found with the given number.</p>';
      }
      this.setState({ data: this.information });
    })
  }


  generateRandomArray = (max, size) => {
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * max) + 1);
      // newArray.push(1225);
    }
    return newArray;
  }

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


  previousQuestion = () => {
    this.curIdxOfArrQuestion--;
    if (this.curIdxOfArrQuestion < 0) {
      this.curIdxOfArrQuestion = 0;
    }

    this.examSaveInfo["timeSpend"] = this.totalQuestion * 76 - this.timer;
    this.examSaveInfo["curIdxOfArrQuestion"] = this.curIdxOfArrQuestion;
    localStorage.setItem("exam_test", JSON.stringify(this.examSaveInfo));

    this.retrieveQuestion(this.examSaveInfo["option"][this.curIdxOfArrQuestion]["questionIndex"]);

    var inputAnswer = document.querySelectorAll("input[name=answer]");
    for (var i = 0; i < inputAnswer.length; i++) {
      inputAnswer[i].checked = false;
    }

    if (this.examSaveInfo["option"][this.curIdxOfArrQuestion]["chooseAnswer"]) {
      const choices = this.examSaveInfo["option"][this.curIdxOfArrQuestion]["chooseAnswer"].split('');
      choices.forEach(choice => {
        document.querySelector(`#answer-${choice}`).checked = true;
      });
    }
  }

  nextQuestion = () => {
    this.curIdxOfArrQuestion++;
    if (this.curIdxOfArrQuestion >= this.totalQuestion) {
      this.curIdxOfArrQuestion = this.totalQuestion - 1;
    }

    this.examSaveInfo["timeSpend"] = this.totalQuestion * 76 - this.timer;
    this.examSaveInfo["curIdxOfArrQuestion"] = this.curIdxOfArrQuestion;
    localStorage.setItem("exam_test", JSON.stringify(this.examSaveInfo));

    this.retrieveQuestion(this.examSaveInfo["option"][this.curIdxOfArrQuestion]["questionIndex"]);

    var inputAnswer = document.querySelectorAll("input[name=answer]");
    for (var i = 0; i < inputAnswer.length; i++) {
      inputAnswer[i].checked = false;
    }

    if (this.examSaveInfo["option"][this.curIdxOfArrQuestion]["chooseAnswer"]) {
      const choices = this.examSaveInfo["option"][this.curIdxOfArrQuestion]["chooseAnswer"].split('');
      choices.forEach(choice => {
        document.querySelector(`#answer-${choice}`).checked = true;
      });
    }
  }

  endExam = () => {
    this.examSaveInfo["timeSpend"] = this.totalQuestion * 76 - this.timer;
    this.examSaveInfo["curIdxOfArrQuestion"] = this.curIdxOfArrQuestion;
    localStorage.setItem("exam_test", JSON.stringify(this.examSaveInfo));
    window.location.href = '/#/review';
  }

  toggleDarkMode = () => {
    this.currentMode = (this.currentMode + 1) % 3;
    switch (this.currentMode) {
      case 0:
        //   document.body.classList.toggle("");
        document.body.className = "normal-mode";
        break;
      case 1:
        // document.body.classList.toggle("dark-mode");
        document.body.className = "dark-mode";
        break;
      case 2:
        //   document.body.classList.toggle("light-mode");
        document.body.className = "dark-mode light-mode";
        break;
    }
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

  startExam = () => {
    this.information["questionAnswer"] = "";
    this.setState({ data: this.information });

    var inputQuanlityQuestion = document.getElementById('inputQuanlityQuestion');
    if (inputQuanlityQuestion.value !== '') {
      this.totalQuestion = parseInt(inputQuanlityQuestion.value);
      this.hideModal();
      this.restartExam();
    }
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
  }

  handleCheckboxChange() {
    let checkboxes = document.querySelectorAll('input[type="checkbox"][name="answer"]');
    let selectedOptions = "";
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedOptions += checkbox.id.split('-')[1];
      }
    });
    this.examSaveInfo["option"][this.curIdxOfArrQuestion]["chooseAnswer"] = selectedOptions;
  }

  handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.startExam();
    }
  };

  handleRadioChange = (e, optionLetter) => {
    this.examSaveInfo["option"][this.curIdxOfArrQuestion]["chooseAnswer"] = optionLetter;
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
          <div className="container-fluid pb-5 px-0">
            <div className="card border-0">

              <div className="card-top card-background text-white">
                <div className="card-subject ps-3">
                  <NavLink to="/"><button className="btn btn-sm btn-outline-light me-2" type="button"><i className="fas fa-home"></i></button></NavLink>

                  <span className="question-title-topic" id="q-subject">
                    {data["subject"]}
                  </span>

                </div>
                <div className="card-info pe-3 text-end">
                  <div className="card-timer">
                    <span className="question-title-info"><i className="fa-solid fa-stopwatch"></i> Time Remaining <span id="countdown">60</span>
                    </span>
                  </div>
                  <div className="card-question">
                    <span className="me-3">#{data["questionNumber"]}</span>
                    <i className="fas fa-book"></i> <span alt="q-number">{data["curIdxOfArrQuestion"]}/{data["totalQuestion"]}</span>
                  </div>

                </div>
              </div>

              <div className="card-body question-body p-3">
                <span className="card-text">
                  <div id="q-question" dangerouslySetInnerHTML={{ __html: data["questionQuestion"] }}>
                  </div>
                  <span id="q-question-img">
                  </span>



                  <div className="my-3" alt="q-answer">
                    {data["questionAnswer"] && data["questionAnswer"].length > 0 ? data["questionAnswer"].map((answer, index) => {
                      if (answer.trim() !== '') {
                        const optionLetter = String.fromCharCode(65 + index);

                        return (
                          <div
                            key={`answer-${index}`}
                            className="choose-item ms-3 my-2"
                          >
                            {data["questionCorrect"].length > 1 ? (

                              // Use checkboxes for multiple correct answer
                              <div>
                                <input
                                  type="checkbox"
                                  name="answer"
                                  id={`answer-${optionLetter}`}
                                  defaultChecked={data["chooseAnswer"].includes(optionLetter)}
                                  onChange={(e) => this.handleCheckboxChange()}
                                />
                                <label htmlFor={`answer-${optionLetter}`}>
                                  {answer}
                                </label>
                              </div>
                            ) : (
                              // Use radio buttons for single correct answer
                              <div>
                                <input type="radio"
                                  name="answer"
                                  id={`answer-${optionLetter}`}
                                  defaultChecked={optionLetter === data["chooseAnswer"]}
                                  onChange={(e) => this.handleRadioChange(e, optionLetter)} />
                                <label htmlFor={`answer-${optionLetter}`}>
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

              </div>
            </div>
          </div>



          <footer className="fixed-bottom p-1 card-background">
            <div className="d-flex float-start">
              <button type="button" className="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#modal" onClick={this.showModal}>
                <i className="fas fa-cog"></i>
              </button>
              <button className="btn btn-outline-light mx-1" type="button" onClick={this.endExam}><i
                className="fa-solid fa-flag-checkered"></i> End exam</button>
            </div>

            <div className="d-flex float-end">
              <button className="btn btn-outline-light mx-1"
                type="button"
                onClick={this.previousQuestion}
                disabled={data["curIdxOfArrQuestion"] === 1}>
                <i className="fa-solid fa-backward-step"></i> Previous</button>
              <button className="btn btn-outline-light mx-1"
                type="button"
                onClick={this.nextQuestion}
                disabled={data["curIdxOfArrQuestion"] === data["totalQuestion"]}>
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

                <div className="input-group py-3">
                  <span className="input-group-text" id="basic-addon3">Total Question</span>
                  <input type="number" className="form-control text-end" defaultValue={data["totalQuestion"]} aria-label="" id="inputQuanlityQuestion" onKeyUp={this.handleKeyUp} />
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={this.startExam}>Start New Exam</button>
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal" onClick={this.hideModal}>Resum</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default TestContainer;
