import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import Game from "./components/Game";
import io from "socket.io-client";
import { Howl } from "howler";

const socket = io("https://pvp-quiz-backend.onrender.com");

const startSound = new Howl({ src: ["/sounds/start.mp3"] });

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("players", (playerList) => {
      setPlayers(playerList);
    });

    socket.on("startGame", () => {
      setGameStarted(true);
      startSound.play();
    });

    return () => {
      socket.off("players");
      socket.off("startGame");
    };
  }, []);

  const handleStart = () => {
    socket.emit("startGame");
  };

  return (
    <div style={{ textAlign: "center", backgroundColor: "#000", color: "#fff", height: "100vh" }}>
      {!gameStarted ? (
        <Home players={players} handleStart={handleStart} />
      ) : (
        <Game />
      )}
    </div>
  );
}
// import React, { useState, useEffect } from "react";