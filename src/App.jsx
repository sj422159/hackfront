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
    socket.on("player-joined", (playerId) => {
      setPlayers((prev) => [...prev, playerId]);
    });

    socket.on("start-game", () => {
      setGameStarted(true);
      startSound.play();
    });

    return () => {
      socket.off("player-joined");
      socket.off("start-game");
    };
  }, []);

  const handleStart = () => {
    socket.emit("start-game");
  };

  return (
    <div style={{ textAlign: "center" }}>
      {!gameStarted ? (
        <Home players={players} handleStart={handleStart} />
      ) : (
        <Game />
      )}
    </div>
  );
}
