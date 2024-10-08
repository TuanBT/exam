import React, { Component } from 'react';
import { Route, NavLink, HashRouter } from "react-router-dom";
import Firebase from '../firebase.js';
import { ref, set, get, update, remove, child, onValue } from "firebase/database";


class ReviewContainer extends Component {
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
      "questionCorrect": "",
      "questionNote": "",
      "sources": ['ExamTopic', 'StudyHall'],
      "subject": "",
      "questionResultArray": []
    };
    this.examSaveInfo = {};
    this.currentMode = 0; // 0 = normal, 1 = dark, 2 = light
  }

  componentDidMount() {
    document.title = 'Exam Results Review';
    this.main();
  }

  main() {
    console.log("main");
    this.examSaveInfo = JSON.parse(localStorage.getItem("exam_test"));
    if (this.examSaveInfo) {
      this.information["questionResultArray"] = [];
      let numRightQuestion = 0;

      this.information["subject"] = this.examSaveInfo["subject"];
      this.information["timeSpend"] = this.formatSeconds(this.examSaveInfo["timeSpend"]);
      // this.information["totalQuestion"] = this.examSaveInfo["option"].length;

      for (let i = 0; i < this.examSaveInfo["option"].length; i++) {

        get(ref(this.db, '/subject/' + this.examSaveInfo["subject"] + '/questions/' + this.examSaveInfo["option"][i]["questionIndex"])).then((snapshot) => {
          const questionData = snapshot.val();
          let result = false;
          if (this.examSaveInfo["option"][i]["chooseAnswer"] == questionData["correct"]) {
            numRightQuestion++;
            result = true;
          }

          let object = {
            "chooseAnswer": this.examSaveInfo["option"][i]["chooseAnswer"],
            "questionNumber": questionData["number"],
            "questionQuestion": questionData["question"],
            "questionImage": questionData["questionImage"],
            "questionAnswer": questionData["answer"].split("<br/>"),
            "questionCorrect": questionData["correct"],
            "correctImage": questionData["correctImage"],
            "questionNote": questionData["note"],
            "result": result,
          }
          this.information["questionResultArray"].push(object);
          this.information["numRightQuestion"] = numRightQuestion;
          this.information["rightRatio"] = (numRightQuestion / this.examSaveInfo["option"].length * 100).toFixed(0) + "%";
          this.information["totalQuestion"] = i + 1;

          this.setState({ data: this.information });
        })

      }

    } else {
      window.location.href = '/#/exam';
    }
  }

  formatSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  render() {
    const { data } = this.state;
    return (
      <div style={{ background: '#bdc3c7' }}>
        <header className="site-header sticky-top py-1 bg-primary text-white">
          <nav className="container d-flex justify-content-between">
            <div>
              <i className="fas fa-book-open"></i> {data["subject"]}
            </div>
            <div>
              <i className="fas fa-check-square"></i> {data["numRightQuestion"]}/{data["totalQuestion"]} ({data["rightRatio"]})
            </div>
            <div>
              <i className="fas fa-history"></i> Time Spend: {data["timeSpend"]}
            </div>
          </nav>
        </header>

        {data["questionResultArray"] && data["questionResultArray"].length > 0 ? data["questionResultArray"].map((questionResult, i) => (
          <React.Fragment key={i} >
            <div className="container-fluid py-2 px-1">
              <div className="card">
                <div className={`card-header text-white rounded-top ${questionResult.result ? "bg-success" : "bg-danger"}`}>
                  <div className="container d-flex justify-content-between">
                    <div>
                      <i className="fas fa-question-circle"></i> {i + 1}
                    </div>
                    <div>
                      {questionResult["result"] ? "True" : "False"}
                    </div>
                    <div>
                      #{questionResult["questionNumber"]}
                    </div>
                  </div>
                </div>

                <div className="card-body question-body p-3">
                  <span className="card-text">
                    <div alt="q-question" dangerouslySetInnerHTML={{ __html: questionResult["questionQuestion"] }}>
                    </div>
                    <span alt="q-question-img">
                      <img src={questionResult["questionImage"]} />
                    </span>

                    <div className="my-3" id={`q-answer-${questionResult["questionNumber"]}`}>
                      {questionResult["questionAnswer"] && questionResult["questionAnswer"].length > 0 ? questionResult["questionAnswer"].map((answer, index) => {
                        if (answer.trim() !== '') {
                          const optionLetter = String.fromCharCode(65 + index);
                          const isCorrect = questionResult["questionCorrect"].includes(optionLetter);

                          return (
                            <div
                              key={`answer-${index}-${questionResult["questionNumber"]}`}
                              className={`choose-item ms-3 my-2 ${isCorrect ? 'correct-choice-show' : ''}`}
                            >
                              {questionResult["questionCorrect"].length > 1 ? (
                                // Use checkboxes for multiple correct answer
                                <div>
                                  <input
                                    type="checkbox"
                                    name={`answer-${questionResult["questionNumber"]}`}
                                    id={`answer-${optionLetter}-${questionResult["questionNumber"]}`}
                                    disabled={true}
                                    className={isCorrect ? 'correct-choice-show' : ''}
                                    defaultChecked={questionResult["chooseAnswer"].includes(optionLetter)} />
                                  <label className="" htmlFor={`answer-${optionLetter}-${questionResult["questionNumber"]}`}>
                                    {answer}
                                  </label>
                                </div>
                              ) : (
                                // Use radio buttons for single correct answer
                                <div>
                                  <input type="radio"
                                    name={`answer-${questionResult["questionNumber"]}`}
                                    id={`answer-${optionLetter}-${questionResult["questionNumber"]}`}
                                    disabled={true}
                                    defaultChecked={optionLetter === questionResult["chooseAnswer"]} />
                                  <label className="" htmlFor={`answer-${optionLetter}-${questionResult["questionNumber"]}`}>
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


                  <span className="card-text question-answer bg-light white-text p-2 mb-3" alt="solution-card" style={{ display: 'block' }}>
                    <strong>
                      <div className="correct-answer-box d-flex mb-1">Your Answer:&nbsp;
                        <div className="correct-answer d-flex" alt="q-correct">
                          {questionResult["chooseAnswer"]}
                        </div>
                      </div>
                    </strong>
                    <div className="correct-answer-box d-flex fst-italic">Correct Answer:&nbsp;
                      <div className="correct-answer d-flex" alt="q-correct">
                        {questionResult["questionCorrect"]}
                      </div>
                    </div>

                    <span alt="q-correct-img">
                      <img src={questionResult["correctImage"]} />
                    </span>
                    <br />
                    <div className="answer-note fst-italic" alt="q-note"
                      dangerouslySetInnerHTML={{ __html: questionResult["questionNote"] }}>
                    </div>
                  </span>

                </div>
              </div>
            </div>
          </React.Fragment>
        )) : (
          <div><section className="pt-5 text-center container">
            <div className="row py-lg-5">
              <div className="col-lg-6 col-md-8 mx-auto">
                <p className="fs-1">
                  <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                </p>
              </div>
            </div>
          </section></div>
        )}

        <div>
          <section className="py-0 text-center container">
            <div className="row py-lg-5">
              <div className="col-lg-6 col-md-8 mx-auto">
                <p>
                  <NavLink to="/"><button className="btn btn-success btn-lg px-4 me-3 sm-3" type="button"><i className="fas fa-home"></i></button></NavLink>
                  <NavLink to="/study"><button className="btn btn-primary btn-lg px-4 me-3 sm-3" type="button"><i className="fab fa-leanpub"></i> Study</button></NavLink>
                  <NavLink to="/exam"><button className="btn btn-outline-danger btn-lg px-4" type="button"><i className="fas fa-graduation-cap"></i> Exam</button></NavLink>
                </p>
                <p className="mt-3">
                  <button className="btn btn-sm btn-outline-secondary me-2" type="button" onClick={this.toggleDarkMode}><i
                    className="fa-solid fa-circle-half-stroke"></i></button>
                  <button className="btn btn-sm btn-outline-secondary me-2" type="button" onClick={this.decreaseFontSize}><i
                    className="fas fa-search-minus"></i></button>
                  <button className="btn btn-sm btn-outline-secondary me-2" type="button" onClick={this.increaseFontSize}><i
                    className="fas fa-search-plus"></i></button>
                </p>
              </div>


            </div>
          </section>
          <p className="pb-3 text-center text-muted-custom">©Tuân 2024</p>
        </div>

      </div>
    );
  }
}

export default ReviewContainer;
