import React from 'react';
import { createRoot } from "react-dom/client";
import './index.css';
import '../src/assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Route, HashRouter } from 'react-router-dom'
import TestContainer from './containers/test.container';
import HomeContainer from './containers/home.container';
import StudyContainer from './containers/study.container';
import ExamContainer from './containers/exam.container';
import ReviewContainer from './containers/review.container';

const root = createRoot(document.getElementById("root"));
root.render(
  <HashRouter>
    <div>
    <Route path="/" exact component={HomeContainer} />
      <Route path="/test" exact component={TestContainer} />
      <Route path="/study" exact component={StudyContainer} />
      <Route path="/exam" exact component={ExamContainer} />
      <Route path="/review" exact component={ReviewContainer} />
    </div>
  </HashRouter>
);
