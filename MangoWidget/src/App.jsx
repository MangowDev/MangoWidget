import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-js";
import "./App.css";
import LoggedIn from "./LoggedIn";

const spotifyApi = new SpotifyWebApi();

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const getHashParams = () => {
    const hashParams = {};
    let e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  };

  useEffect(() => {
    const params = getHashParams();
    const accessToken = params.access_token;

    if (accessToken) {
      spotifyApi.setAccessToken(accessToken);
      const timer = setTimeout(() => {
        spotifyApi.setAccessToken(null);
        setLoggedIn(false);
      }, 3600 * 1000);
      setLoggedIn(true);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={<LoggedIn spotifyApi={spotifyApi} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />
        </Routes>
      </Router>
    </div>
  );
}



export default App;
