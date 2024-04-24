import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-js";
import "./App.css";

const spotifyApi = new SpotifyWebApi();
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const RESPONSE = "token";
const SCOPE = "user-read-currently-playing";

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
            element={<LoggedIn loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

function LoggedIn({ loggedIn, setLoggedIn }) {
  const [currentSong, setCurrentSong] = useState({
    name: "",
    artist: "",
    albumImage: "",
  });

  const navigate = useNavigate();
  const nameRef = useRef(null);
  const artistRef = useRef(null);

  useEffect(() => {
    if (loggedIn) {
      getCurrentSong();
      const interval = setInterval(() => {
        getCurrentSong();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loggedIn]);

  useEffect(() => {
    const nameElement = nameRef.current;
    const artistElement = artistRef.current;
    if (nameElement && artistElement) {
      const nameOverflow = nameElement.scrollWidth > nameElement.clientWidth;
      const artistOverflow =
        artistElement.scrollWidth > artistElement.clientWidth;

      if (nameOverflow) {
        nameElement.classList.add("slide-in");
      } else {
        nameElement.classList.remove("slide-in");
      }

      if (artistOverflow) {
        artistElement.classList.add("slide-in");
      } else {
        artistElement.classList.remove("slide-in");
      }
    }
  }, [currentSong]);

  function getCurrentSong() {
    spotifyApi
      .getMyCurrentPlayingTrack()
      .then((response) => {
        console.log(response);
        if (response && response.item) {
          setCurrentSong({
            name: response.item.name,
            artist: response.item.artists[0].name,
            albumImage: response.item.album.images[0].url,
          });
        } else {
          setCurrentSong({
            name: "No song currently playing.",
            artist: "",
            albumImage: "src/assets/MangoMelodyLogo.jpeg",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleLoginWithSpotify() {
    window.location = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=${RESPONSE}`;
  }

  function handleLogout() {
    spotifyApi.setAccessToken(null);
    const width = 700;
    const height = 500;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const spotifyLogoutWindow = window.open(
      "https://www.spotify.com/logout/",
      "Spotify Logout",
      `width=${width},height=${height},top=${top},left=${left}`
    );
    setTimeout(() => {
      spotifyLogoutWindow.close();
      setLoggedIn(false);
      navigate("/");
    }, 2000);
  }

  return (
    <>
      {!loggedIn ? (
        <button onClick={handleLoginWithSpotify}>Login with Spotify</button>
      ) : (
        <div className="container-div">
          <div className="main-div">
            <div className="img-div">
              {currentSong.albumImage && (
                <img src={currentSong.albumImage} alt="Album Cover" />
              )}
            </div>
            <div
              className="info-background"
              style={{
                backgroundImage: `url(${currentSong.albumImage})`,
              }}
            />
            <div className="info-div">
              <p ref={nameRef} className="name-p">
                {currentSong.name}
              </p>
              <p ref={artistRef} className="artist-p">
                {currentSong.artist}
              </p>
            </div>
            <div className="arrow-div-container">
                <div className="arrow-div"></div>
              </div>
            <div className="loader"></div>
          </div>
          <div className="button-div">
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
