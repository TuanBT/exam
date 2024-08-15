import React, { Component } from 'react';
import $ from 'jquery';
import Firebase from '../firebase.js';
import { ref, set, get, update, remove, child, onValue } from "firebase/database";
import { Route, NavLink, HashRouter } from "react-router-dom";


class EditContainer extends Component {

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
    this.questionNumber = 1;
    this.obj = {};
    this.information = {
      "questionNumber": 0,
      "questionQuestion": "",
      "questionAnswer": "",
      "questionImage": "",
      "questionAnswerOrg": "",
      "questionCorrect": "",
      "questionCorrectImage": "",
      "questionNote": "",
      "sources": ['ExamTopic', 'StudyHall'],
      "subject": "",
    };
  }

  componentDidMount() {
    document.title = 'Edit';
    this.main();
  }

  main() {
    console.log("main");
    this.retrieveQuestion(0);

  }

  retrieveQuestion = (questionNumberIn) => {

    document.getElementById('inputQuestionNumber').placeholder = '1 - ' + this.numberOfQuestion;
    this.questionNumber = questionNumberIn;

    if (questionNumberIn === 0) {
      this.questionNumber = Math.floor(Math.random() * this.numberOfQuestion) + 1;
    }

    onValue(ref(this.db, '/subject/' + this.source + '/questions/' + this.questionNumber), (snapshot) => {
      const questionData = snapshot.val();
      if (questionData) {
        this.information["subject"] = this.textHeader;
        this.information["questionNumber"] = questionData.number;
        this.information["questionQuestion"] = questionData.question;
        document.getElementById('q-question-img').innerHTML = "<img src='" + questionData.questionImage + "'>";
        this.information["questionImage"] = questionData.questionImage;
        this.information["questionAnswer"] = questionData.answer.split('<br/>');
        this.information["questionAnswerOrg"] = questionData.answer;
        this.information["questionCorrect"] = questionData.correct;
        document.getElementById('q-correct-img').innerHTML = "<img src='" + questionData.correctImage + "'>";
        this.information["questionCorrectImage"] = questionData.correctImage;
        this.information["questionNote"] = questionData.note;

      } else {
        document.getElementById('questionDetails').innerHTML = '<p>No question found with the given number.</p>';
      }
      this.setState({ data: this.information });
    })
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

  save = (type) => {
    switch (type) {
      case "question":
        this.obj = {
          "question": document.getElementById("txtQuestion").value
        }
        break;
      case "questionImage":
        this.obj = {
          "questionImage": document.getElementById("txtQuestionImage").value
        }
        break;
      case "answer":
        this.obj = {
          "answer": document.getElementById("txtAnswer").value
        }
        break;
      case "correct":
        this.obj = {
          "correct": document.getElementById("txtCorrect").value
        }
        break;
      case "correctImage":
        this.obj = {
          "correctImage": document.getElementById("txtCorrectImage").value
        }
        break;
      case "note":
        this.obj = {
          "note": document.getElementById("txtNote").value
        }
        break;
    }
    update(ref(this.db, '/subject/' + this.source + '/questions/' + this.questionNumber), this.obj);
  }

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
        <div className="bg-secondary pt-3">

        <div className="fixed-top p-0 bg-primary">
            <div className="input-group p-2">
              <NavLink to="/"><button className="btn btn-outline-light me-2" type="button"><i className="fas fa-home"></i></button></NavLink>
              <button type="button" className="btn btn-outline-light rounded-start" data-bs-toggle="modal" data-bs-target="#modal" onClick={this.showModal}>
                <i className="fas fa-cog"></i>
              </button>
              <input type="number" className="form-control text-end" placeholder="" aria-label="" id="inputQuestionNumber" onKeyUp={this.handleKeyUp} />
              <button className="btn btn-outline-light rounded-end" type="button" onClick={this.gotoQuestion}><i
                className="fa-solid fa-arrows-turn-to-dots"></i> Go</button>
            </div>
          </div>


          <div className="container-fluid pb-3 pt-5">
            <div className="card bg-light">

              <div className="card-top bg-danger rounded text-white">
                <div className="card-subject ps-3">
                  <span className="question-title-topic" id="q-subject">
                    {data["subject"]}
                  </span>

                </div>
                <div className="card-info pe-3 text-end">
                  <div className="card-question">
                    <span><i className="fa-solid fa-pen-to-square"></i> Eidt Mode</span>
                  </div>
                  <div className="card-question">
                    #<span id="q-number">{data["questionNumber"]}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="container-fluid pb-3 px-2">
            <div className="card bg-light">

              <div className="card-top bg-warning rounded-top text-white">
                <div className="card-subject ps-3">
                  <span className="question-title-topic" id="q-subject">
                    Question
                  </span>
                </div>
              </div>

              <div className="card-body question-body p-3">
                <span className="card-text">
                  <div id="q-question" dangerouslySetInnerHTML={{ __html: data["questionQuestion"] }}>
                  </div>
                  <div className="input-group">
                    <div className="form-floating">
                      <textarea className="form-control" placeholder="Question Answer" defaultValue={data["questionQuestion"]} id="txtQuestion"></textarea>
                      <label htmlFor="txtQuestion">Question</label>
                    </div>
                    <button className="btn btn-outline-success" type="button" onClick={() => this.save("question")}><i
                      className="fa-solid fa-cloud-arrow-up"></i> Save</button>
                  </div>
                </span>
              </div>
            </div>
          </div>

          <div className="container-fluid pb-3 px-2">
            <div className="card bg-light">
              <div className="card-top bg-warning rounded-top text-white">
                <div className="card-subject ps-3">
                  <span className="question-title-topic" id="q-subject">
                    Question Image
                  </span>
                </div>
              </div>
              <div className="card-body question-body p-3">
                <span className="card-text">

                  <span id="q-question-img">
                  </span>
                  <div className="input-group">
                    <div className="form-floating">
                      <input type="text" className="form-control" id="txtQuestionImage" placeholder="Change Correct Answer" defaultValue={data["questionImage"]} />
                      <label htmlFor="txtQuestionImage">Image Base64</label>
                    </div>
                    <button className="btn btn-outline-success" type="button" onClick={() => this.save("questionImage")}><i
                      className="fa-solid fa-cloud-arrow-up"></i> Save</button>
                  </div>
                </span>

              </div>
            </div>
          </div>

          <div className="container-fluid pb-3 px-2">
            <div className="card bg-light">
              <div className="card-top bg-warning rounded-top text-white">
                <div className="card-subject ps-3">
                  <span className="question-title-topic" id="q-subject">
                    Answer
                  </span>
                </div>
              </div>
              <div className="card-body question-body p-3">
                <span className="card-text">

                  <div className="my-3" id="q-answer">
                    {data["questionAnswer"] && data["questionAnswer"].length > 0 ? data["questionAnswer"].map((answer, index) => {
                      if (answer.trim() !== '') {
                        const optionLetter = String.fromCharCode(65 + index);
                        const isCorrect = data["questionCorrect"].includes(optionLetter);

                        return (
                          <div
                            key={`answer-${index}`}
                            className={`choose-item ms-3 my-2 ${isCorrect ? 'correct-choice-show' : ''}`}
                          >
                            {data["questionCorrect"].length > 1 ? (
                              // Use checkboxes for multiple correct answer
                              <div>
                                <input
                                  type="checkbox"
                                  name="answer"
                                  id={`answer-${optionLetter}`}
                                  disabled={true}
                                  className={isCorrect ? 'correct-choice-show' : ''}
                                />
                                <label className="" htmlFor={`answer-${optionLetter}`}>
                                  {answer}
                                </label>
                              </div>
                            ) : (
                              // Use radio buttons for single correct answer
                              <div>
                                <input type="radio" 
                                name="answer" 
                                id={`answer-${optionLetter}`} 
                                disabled={true}
                                />
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
                    <div className="input-group">
                      <div className="form-floating">
                        <textarea className="form-control" placeholder="Answer" defaultValue={data["questionAnswerOrg"]} id="txtAnswer"></textarea>
                        <label htmlFor="txtAnswer">Answer</label>
                      </div>
                      <button className="btn btn-outline-success" type="button" onClick={() => this.save("answer")}><i
                        className="fa-solid fa-cloud-arrow-up"></i> Save</button>
                    </div>
                  </div>

                </span>
              </div>
            </div>
          </div>

          <div className="container-fluid pb-3 px-2">
            <div className="card bg-light">
              <div className="card-top bg-warning rounded-top text-white">
                <div className="card-subject ps-3">
                  <span className="question-title-topic" id="q-subject">
                    Correct Answer
                  </span>
                </div>
              </div>
              <div className="card-body question-body p-3">
                <span className="card-text">

                  <strong>
                    <div className="correct-answer-box d-flex">Correct Answer:&nbsp;
                      <div className="correct-answer d-flex" id="q-correct">
                        {data["questionCorrect"]}
                      </div>
                    </div>
                  </strong>
                  <div className="input-group">
                    <div className="form-floating">
                      <input type="text" className="form-control" id="txtCorrect" placeholder="Change Correct Answer" defaultValue={data["questionCorrect"]} />
                      <label htmlFor="txtCorrect">Correct Answer</label>
                    </div>
                    <button className="btn btn-outline-success" type="button" onClick={() => this.save("correct")}><i
                      className="fa-solid fa-cloud-arrow-up"></i> Save</button>
                  </div>

                </span>
              </div>
            </div>
          </div>

          <div className="container-fluid pb-3 px-2">
            <div className="card bg-light">
              <div className="card-top bg-warning rounded-top text-white">
                <div className="card-subject ps-3">
                  <span className="question-title-topic" id="q-subject">
                    Correct Image
                  </span>
                </div>
              </div>
              <div className="card-body question-body p-3">
                <span className="card-text">

                  <span id="q-correct-img">
                  </span>
                  <div className="input-group">
                    <div className="form-floating">
                      <input type="text" className="form-control" id="txtCorrectImage" placeholder="Change Correct Answer" defaultValue={data["questionCorrectImage"]} />
                      <label htmlFor="txtCorrectImage">Image Base64</label>
                    </div>
                    <button className="btn btn-outline-success" type="button" onClick={() => this.save("correctImage")}><i
                      className="fa-solid fa-cloud-arrow-up"></i> Save</button>
                  </div>

                </span>
              </div>
            </div>
          </div>

          <div className="container-fluid pb-3 px-2">
            <div className="card bg-light">
              <div className="card-top bg-warning rounded-top text-white">
                <div className="card-subject ps-3">
                  <span className="question-title-topic" id="q-subject">
                    Note
                  </span>
                </div>
              </div>
              <div className="card-body question-body p-3">
                <span className="card-text">

                  <div className="answer-note fst-italic" id="q-note"
                    dangerouslySetInnerHTML={{ __html: data["questionNote"] }}>
                  </div>
                  <div className="input-group">
                    <div className="form-floating">
                      <textarea className="form-control" placeholder="Question Note" defaultValue={data["questionNote"]} id="txtNote"></textarea>
                      <label htmlFor="txtNote">Question Note</label>
                    </div>
                    <button className="btn btn-outline-success" type="button" onClick={() => this.save("note")}><i
                      className="fa-solid fa-cloud-arrow-up"></i> Save</button>
                  </div>

                </span>
              </div>
            </div>
          </div>

          
        </div>

        <div className="modal" id="modal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="modalLabel"><i className="fas fa-cog"></i> Setting</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.hideModal}></button>
              </div>
              <div className="modal-body">

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

export default EditContainer;
