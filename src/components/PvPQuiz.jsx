import React, { useState } from "react";
import { motion } from "framer-motion";
import "./PvPQuiz.css";

const questions = [
  {
    question: "Who won the ICC Cricket World Cup 2011?",
    options: ["Australia", "India", "Sri Lanka", "England"],
    answer: "India",
  },
  {
    question: "Who is known as the 'Master Blaster'?",
    options: ["Virat Kohli", "Ricky Ponting", "Sachin Tendulkar", "AB de Villiers"],
    answer: "Sachin Tendulkar",
  },
  {
    question: "How many players are there in a cricket team?",
    options: ["10", "11", "12", "9"],
    answer: "11",
  },
  {
    question: "What is the term for 3 wickets in 3 balls?",
    options: ["Hat-trick", "Century", "Maiden", "Six"],
    answer: "Hat-trick",
  },
];

const PvPQuiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleAnswer = (option) => {
    if (gameOver) return;
    if (option === questions[currentQ].answer) {
      setRuns(runs + 4);
    } else {
      setWickets(wickets + 1);
      if (wickets + 1 >= 3) {
        setGameOver(true);
      }
    }
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setGameOver(true);
    }
  };

  return (
    <div className="quiz-container">
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🏏 PvP Cricket Quiz
      </motion.h1>

      <div className="card">
        {!gameOver ? (
          <>
            <h2 className="question">{questions[currentQ].question}</h2>
            <div className="options">
              {questions[currentQ].options.map((opt) => (
                <button
                  key={opt}
                  className="option-btn"
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="result">
            <h2>🏆 Match Over</h2>
            <p>Runs: {runs}</p>
            <p>Wickets: {wickets}</p>
          </div>
        )}
      </div>

      <div className="score">
        <p>Runs: {runs}</p>
        <p>Wickets: {wickets} / 3</p>
      </div>
    </div>
  );
};

export default PvPQuiz;
