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
  }

  componentDidMount() {
    document.title = 'Review';
    this.main();
  }

  main() {
    console.log("main");
    this.examSaveInfo = JSON.parse(localStorage.getItem("exam_test"));
    if (this.examSaveInfo) {
      get(ref(this.db, '/subject/' + this.examSaveInfo["subject"] + '/questions/')).then((snapshot) => {
        const questionDatas = snapshot.val();

        this.information["questionResultArray"] = [];
        let numRightQuestion = 0;

        for (let i = 0; i < this.examSaveInfo["option"].length; i++) {
          // console.log(questionDatas[this.examSaveInfo["option"][i]["questionIndex"]]["number"]);
          let result = false;
          if (this.examSaveInfo["option"][i]["chooseAnswer"] == questionDatas[this.examSaveInfo["option"][i]["questionIndex"]]["correct"]) {
            numRightQuestion++;
            result = true;
          }
          let object = {
            "chooseAnswer": this.examSaveInfo["option"][i]["chooseAnswer"],
            "questionNumber": questionDatas[this.examSaveInfo["option"][i]["questionIndex"]]["number"],
            "questionQuestion": questionDatas[this.examSaveInfo["option"][i]["questionIndex"]]["question"],
            "questionCorrect": questionDatas[this.examSaveInfo["option"][i]["questionIndex"]]["correct"],
            "questionNote": questionDatas[this.examSaveInfo["option"][i]["questionIndex"]]["note"],
            "questionAnswer": questionDatas[this.examSaveInfo["option"][i]["questionIndex"]]["answer"].split("<br/>"),
            "result": result,
          }
          this.information["questionResultArray"].push(object);
        }

        this.information["subject"] = this.examSaveInfo["subject"];
        this.information["timeSpend"] = this.formatSeconds(this.examSaveInfo["timeSpend"]);
        this.information["totalQuestion"] = this.examSaveInfo["option"].length;
        this.information["numRightQuestion"] = numRightQuestion;
        this.information["rightRatio"] = (numRightQuestion / this.examSaveInfo["option"].length * 100).toFixed(0) + "%";
        // document.getElementById('q-question-img').innerHTML = "<img src='" + questionData.questionImage + "'>";
        // document.getElementById('q-correct-img').innerHTML = "<img src='" + questionData.correctImage + "'>";
        this.setState({ data: this.information });
      })
    } else {
      window.location.href = '/#/exam';
    }
  }

  formatSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                  <NavLink to="/study"><button className="btn btn-primary btn-lg px-4 me-3 sm-3" type="button"><i className="fab fa-leanpub"></i> Study</button></NavLink>
                  <NavLink to="/exam"><button className="btn btn-outline-secondary btn-lg px-4" type="button"><i className="fas fa-graduation-cap"></i> Exam</button></NavLink>
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
