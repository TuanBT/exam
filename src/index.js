import React from 'react';
import { createRoot } from "react-dom/client";
import './index.css';
import '../src/assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Route, HashRouter } from 'react-router-dom'
import HomeContainer from './containers/home.container';
import TestContainer from './containers/test.container';
import PlayerJoinContainer from './containers/playerJoin.container';
import PlayerPlayContainer from './containers/playerPlay.container';
import HostJoinContainer from './containers/hostJoin.container';
import HostCreateContainer from './containers/hostCreate.container';
import HostPlayContainer from './containers/hostPlay.container';
import RoleContainer from './containers/role.container';

const root = createRoot(document.getElementById("root"));
root.render(
  <HashRouter>
    <div>
      <Route path="/" exact component={HomeContainer} />
      <Route path="/test" component={TestContainer} />
      <Route path="/player-join" component={PlayerJoinContainer} />
      <Route path="/player-play" component={PlayerPlayContainer} />
      <Route path="/host-join" component={HostJoinContainer} />
      <Route path="/host-create" component={HostCreateContainer} />
      <Route path="/host-play" component={HostPlayContainer} />
      <Route path="/role" component={RoleContainer} />
    </div>
  </HashRouter>
);
