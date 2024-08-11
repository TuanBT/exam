import React, { Component } from 'react';
import $ from 'jquery';
import Firebase from '../firebase.js';
import { ref, set, get, update, remove, child, onValue } from "firebase/database";


class StudyContainer extends Component {

  constructor(props) {
    super(props);
    const me = this;
    this.state = {
      data: {}
    };
    this.db = Firebase();
    this.information = {
      "questionNumber": 0,
      "questionQuestion": "",
      "questionAnswer": "",
      "questionAnswer": "",
      "questionCorrect": "",
      "questionNote": "",
    };
    this.lastQuestion = 0;
    this.preQuestion = 0;
    this.counterQuestion = 1;
    this.trueCounter = 0;
    this.trueFalseFlag = true;
    this.source = "PMP/ExamTopic"; //PMP/StudyHall
    this.numberOfQuestion = 1389;
    this.currentMode = 0; // 0 = normal, 1 = dark, 2 = light
    this.textHeader = "PMP - Exam Topic";
  }

  componentDidMount() {
    document.title = 'Study';
    this.main();
  }

  main() {
    console.log("main");
    let questionNumber = Math.floor(Math.random() * this.numberOfQuestion) + 1;
    // if (questionNumberIn !== 0) {
    //     questionNumber = questionNumberIn;
    // }
    // // Save the current question number as the previous question
    // preQuestion = lastQuestion;

    // // Update the current question number
    // lastQuestion = questionNumber;

    get(ref(this.db, '/subject/' + this.source + '/questions/' + questionNumber)).then((snapshot) => {
      const questionData = snapshot.val();
      if (questionData) {
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


  render() {
    const { data } = this.state;
    return (
      <div>
        <div className="">

          <div className="input-group p-2">
            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal">
              <i className="fas fa-cog"></i>
            </button>
            <input type="number" className="htmlForm-control text-end" placeholder="" aria-label="" id="inputQuestionNumber" />
            <button className="btn btn-primary" type="button" onClick="gotoQuestion()"><i
              className="fa-solid fa-arrows-turn-to-dots"></i> Goto</button>
          </div>

          <div className="container-fluid pb-5 px-0">
            <div className="card">

              <div className="card-top text-white">
                <div className="card-subject px-3">
                  <span className="question-title-topic" id="q-subject">
                  </span>

                </div>
                <div className="card-info px-3 text-end">
                  <div className="card-timer">
                    <span className="question-title-info" onClick="resetCountdown()"><i className="fa-solid fa-stopwatch"></i>
                      Time Remaining
                      <span id="countdown">60</span>
                    </span>
                  </div>
                  <div className="card-question">
                    <span className=""></span><i className="far fa-question-circle"></i> <span id="q-number">{data["questionNumber"]}</span>
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

                <div className=" mb-3" role="group" aria-label="Basic radio toggle button group">
                  <button className="btn btn-secondary" type="button" onClick="clearCounter()"><i
                    className="fa-solid fa-calculator"></i>
                    <span id="trueCount">0</span>/<span id="counterQuestion"></span> (<span
                      id="truePercent">0</span>%)</button>
                  <button className="btn btn-success" type="button" onClick="countTrue()"><i className="fa-solid fa-check"></i>
                    True</button>
                </div>
              </div>
            </div>
          </div>



          <footer className="fixed-bottom p-1 bg-light">
            <div className="d-flex float-start">
              <button className="btn btn-warning mx-1" type="button" onClick="backQuestion()"><i
                className="fa-solid fa-arrow-rotate-left"></i>
                Back</button>
              <button className="btn btn-success mx-1" type="button" onClick="randomQuestion(0)">
                <i className="fa-solid fa-shuffle"></i> Random
              </button>
            </div>

            <div className="d-flex float-end">
              <button className="btn btn-primary mx-1" type="button" onClick="previousQuestion()"><i
                className="fa-solid fa-backward-step"></i> Previous</button>
              <button className="btn btn-primary mx-1" type="button" onClick="nextQuestion()">
                Next <i className="fa-solid fa-htmlForward-step"></i>
              </button>
            </div>
          </footer>




          <div className="modal fade" id="modal" tabIndex="-1" aria-labelledby="modalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="modalLabel"><i className="fas fa-cog"></i> Setting</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="input-group mb-2 px-1">
                    <div className="mt-2 me-2">
                      <button className="btn btn-lg btn-outline-secondary" type="button" onClick="toggleDarkMode()"><i
                        className="fa-solid fa-circle-half-stroke"></i></button>
                      <button className="btn btn-lg btn-outline-secondary" type="button" onClick="decreaseFontSize()"><i
                        className="fas fa-search-minus"></i></button>
                      <button className="btn btn-lg btn-outline-secondary" type="button" onClick="increaseFontSize()"><i
                        className="fas fa-search-plus"></i></button>
                    </div>
                  </div>
                  <div className="btn-group mt-2 me-2" role="group" aria-label="Basic radio toggle button group">
                    <input type="radio" className="btn-check" name="btnradio" id="btnPMPExamTopic" autoComplete="off"
                      onChange="handleRadioChange(event)" checked />
                    <label className="btn btn-outline-secondary" htmlFor="btnPMPExamTopic">PMP - Exam Topic</label>

                    <input type="radio" className="btn-check" name="btnradio" id="btnPMPStudyHall" autoComplete="off"
                      onChange="handleRadioChange(event)" />
                    <label className="btn btn-outline-secondary" htmlFor="btnPMPStudyHall">PMP - Study Hall</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default StudyContainer;
