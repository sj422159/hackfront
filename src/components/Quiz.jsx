import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import "./Quiz.css";

const questions = [
  {
    question: "Who won the ICC World Cup 2011?",
    options: ["India", "Australia", "England", "Pakistan"],
    answer: "India",
  },
  {
    question: "Who is called the 'Master Blaster'?",
    options: ["Kohli", "Ponting", "Tendulkar", "Dhoni"],
    answer: "Tendulkar",
  },
];

const socket = io("http://localhost:4000");

const Quiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [waiting, setWaiting] = useState(true);

  const crowdRef = useRef();
  const correctRef = useRef();
  const outRef = useRef();

  useEffect(() => {
    socket.on("startGame", () => {
      setWaiting(false);
      crowdRef.current.play();
    });

    socket.on("syncAnswer", (opt) => {
      handleAnswer(opt, false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAnswer = (option, emit = true) => {
    if (waiting || gameOver) return;
    if (emit) socket.emit("answer", option);

    if (option === questions[currentQ].answer) {
      setRuns((r) => r + 4);
      correctRef.current.play();
    } else {
      setWickets((w) => w + 1);
      outRef.current.play();
      if (wickets + 1 >= 3) setGameOver(true);
    }

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setGameOver(true);
    }
  };

  return (
    <div className="quiz">
      <audio ref={crowdRef} src="/sounds/crowd.mp3" loop />
      <audio ref={correctRef} src="/sounds/correct.mp3" />
      <audio ref={outRef} src="/sounds/out.mp3" />

      {waiting ? (
        <h2>Waiting for Player 2 to Join...</h2>
      ) : !gameOver ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <h2>{questions[currentQ].question}</h2>
          <div className="options">
            {questions[currentQ].options.map((opt) => (
              <button key={opt} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="result">
          <h2>🏆 Match Over</h2>
          <p>Runs: {runs}</p>
          <p>Wickets: {wickets}</p>
        </div>
      )}
    </div>
  );
};

export default Quiz;
