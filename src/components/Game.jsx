import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Howl } from "howler";

const ballSound = new Howl({ src: ["/sounds/ball.mp3"] });
const sixSound = new Howl({ src: ["/sounds/six.mp3"] });
const wicketSound = new Howl({ src: ["/sounds/out.mp3"] });
const crowdSound = new Howl({ src: ["/sounds/crowd.mp3"] });

const questions = {
  easy: [
    { question: "2 + 2 = ?", answer: "4", options: ["3", "4", "5", "6"] },
    { question: "5 - 3 = ?", answer: "2", options: ["1", "2", "3", "4"] },
    { question: "10 - 7 = ?", answer: "3", options: ["2", "3", "4", "5"] },
    { question: "1 + 1 = ?", answer: "2", options: ["1", "2", "3", "4"] }
  ],
  medium: [
    { question: "Which sport is played with a bat?", answer: "Cricket", options: ["Hockey", "Cricket", "Football", "Tennis"] },
    { question: "How many players in a cricket team?", answer: "11", options: ["9", "10", "11", "12"] },
    { question: "What is the capital of France?", answer: "Paris", options: ["London", "Berlin", "Paris", "Madrid"] },
    { question: "What is 7 × 8?", answer: "56", options: ["48", "54", "56", "64"] }
  ],
  hard: [
    { question: "What is H2O?", answer: "Water", options: ["Oxygen", "Hydrogen", "Water", "Helium"] },
    { question: "What planet is closest to the sun?", answer: "Mercury", options: ["Venus", "Earth", "Mars", "Mercury"] },
    { question: "Who wrote 'Romeo and Juliet'?", answer: "Shakespeare", options: ["Dickens", "Shakespeare", "Hemingway", "Austen"] },
    { question: "What is the square root of 144?", answer: "12", options: ["10", "12", "14", "16"] }
  ]
};

function Bat() {
  return (
    <mesh position={[9, 1, -1]} rotation={[0, 0, -Math.PI / 4]}>
      <boxGeometry args={[0.3, 3, 0.2]} />
      <meshStandardMaterial color="brown" />
    </mesh>
  );
}

function Ball({ answerCorrect, onAnimationEnd }) {
  const ballRef = useRef();
  const [flying, setFlying] = useState(true);
  const t = useRef(0);
  const initialPosition = [0, 5, 0];

  useEffect(() => {
    // Play ball sound at the start
    ballSound.play();
    
    // Reset animation state when component mounts
    t.current = 0;
    setFlying(true);
    
    return () => {
      // Clean up any ongoing animations or sounds
      ballSound.stop();
    };
  }, []);

  useFrame(() => {
    if (flying && ballRef.current) {
      t.current += 0.015; // Slightly faster animation
      
      // Calculate trajectory
      const x = initialPosition[0] + t.current * 10;
      const y = initialPosition[1] + Math.sin(t.current * Math.PI) * 10;
      ballRef.current.position.set(x, y, 0);

      // Ball spin animation
      ballRef.current.rotation.x += 0.2;
      ballRef.current.rotation.y += 0.1;

      // Check if ball has reached the bat/wicket
      if (x >= 9) {
        setFlying(false);
        answerCorrect ? animateSix() : animateWicket();
      }
    }
  });

  const animateSix = () => {
    sixSound.play();
    crowdSound.play();
    setTimeout(() => onAnimationEnd(true), 1500);
  };

  const animateWicket = () => {
    wicketSound.play();
    setTimeout(() => onAnimationEnd(false), 1500);
  };

  return (
    <mesh ref={ballRef} position={initialPosition}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

function Wicket({ fallen }) {
  return (
    <group>
      {[-0.5, 0, 0.5].map((pos, i) => (
        <mesh key={i} position={[10, 1, pos]} rotation={[0, 0, fallen ? -Math.PI / 4 : 0]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
    </group>
  );
}

// Static confetti - this avoids the buffer resizing issue
function Confetti({ visible }) {
  const particlesCount = 50; // Fixed number of particles
  const positions = useRef(new Float32Array(particlesCount * 3));
  const colors = useRef(new Float32Array(particlesCount * 3));
  const speeds = useRef(new Float32Array(particlesCount));
  const confettiRef = useRef();
  
  // Initialize particles once
  useEffect(() => {
    if (visible) {
      // Generate initial positions and colors
      for (let i = 0; i < particlesCount; i++) {
        positions.current[i * 3] = Math.random() * 20 - 10;     // x
        positions.current[i * 3 + 1] = Math.random() * 10 + 10; // y
        positions.current[i * 3 + 2] = Math.random() * 20 - 10; // z
        
        // Random colors
        const colorIndex = Math.floor(Math.random() * 5);
        const colorMap = [
          [1, 0.85, 0],    // Gold
          [1, 0.39, 0.28], // Tomato
          [0.25, 0.41, 0.88], // Royal Blue
          [0.2, 0.8, 0.2],  // Lime Green
          [0.58, 0.44, 0.86] // Medium Purple
        ];
        
        colors.current[i * 3] = colorMap[colorIndex][0];     // r
        colors.current[i * 3 + 1] = colorMap[colorIndex][1]; // g
        colors.current[i * 3 + 2] = colorMap[colorIndex][2]; // b
        
        speeds.current[i] = Math.random() * 0.3 + 0.1;
      }
    }
  }, [visible]);
  
  useFrame(() => {
    if (!confettiRef.current || !visible) return;
    
    const positionAttr = confettiRef.current.geometry.attributes.position;
    
    // Update each particle position
    for (let i = 0; i < particlesCount; i++) {
      // Move particle down
      positions.current[i * 3 + 1] -= speeds.current[i];
      
      // Reset if below ground
      if (positions.current[i * 3 + 1] < 0) {
        positions.current[i * 3 + 1] = Math.random() * 10 + 10;
      }
      
      // Update position in buffer
      positionAttr.setXYZ(
        i, 
        positions.current[i * 3],
        positions.current[i * 3 + 1],
        positions.current[i * 3 + 2]
      );
    }
    
    positionAttr.needsUpdate = true;
  });
  
  if (!visible) return null;
  
  return (
    <points ref={confettiRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions.current}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} vertexColors />
    </points>
  );
}

function Ground() {
  const texture = useTexture("/textures/grass.jpg");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[50, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function Leaderboard({ players, currentPlayer, gameOver, restartGame }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  return (
    <div style={{
      position: "absolute",
      top: gameOver ? "50%" : "15px",
      right: gameOver ? "50%" : "15px",
      transform: gameOver ? "translate(50%, -50%)" : "none",
      background: "rgba(0,0,0,0.8)",
      borderRadius: "12px",
      padding: "15px",
      minWidth: gameOver ? "400px" : "250px",
      zIndex: 1000
    }}>
      <h2 style={{ 
        color: "#FFD700", 
        textAlign: "center", 
        margin: "0 0 15px 0",
        fontSize: gameOver ? "32px" : "20px"
      }}>
        {gameOver ? "Final Scores" : "Leaderboard"}
      </h2>
      
      <div style={{
        maxHeight: gameOver ? "400px" : "300px",
        overflowY: "auto",
        padding: "5px"
      }}>
        {sortedPlayers.map((player, index) => (
          <div key={player.id} style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: player.id === currentPlayer ? "rgba(255, 215, 0, 0.2)" : "transparent",
            padding: "8px 12px",
            margin: "5px 0",
            borderRadius: "8px",
            borderLeft: index === 0 ? "4px solid gold" : index === 1 ? "4px solid silver" : index === 2 ? "4px solid #cd7f32" : "none"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              flex: 1
            }}>
              <span style={{ 
                width: "24px", 
                height: "24px", 
                backgroundColor: player.color, 
                borderRadius: "50%",
                display: "inline-block"
              }} />
              <span style={{ 
                color: "white", 
                fontWeight: player.id === currentPlayer ? "bold" : "normal",
                fontSize: gameOver ? "18px" : "16px" 
              }}>
                {player.name} {player.id === currentPlayer && !gameOver ? "(Current)" : ""}
              </span>
            </div>
            <span style={{ 
              color: "white", 
              fontWeight: "bold",
              fontSize: gameOver ? "18px" : "16px"
            }}>
              {player.score}
            </span>
          </div>
        ))}
      </div>
      
      {gameOver && (
        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <div style={{ 
            color: "#FFD700", 
            fontSize: "24px", 
            marginBottom: "15px" 
          }}>
            Winner: {sortedPlayers[0]?.name || "No winner"}!
          </div>
          <button 
            onClick={restartGame}
            style={{
              padding: "12px 24px",
              fontSize: "18px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              margin: "10px"
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

function PlayerSetup({ onStartGame }) {
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", color: "#FF6347", score: 0 },
    { id: 2, name: "Player 2", color: "#4169E1", score: 0 }
  ]);
  const [turnTime, setTurnTime] = useState(45);
  
  const handleNameChange = (id, name) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name } : player
    ));
  };
  
  const handleColorChange = (id, color) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, color } : player
    ));
  };
  
  const addPlayer = () => {
    if (players.length < 4) {
      const colors = ["#FF6347", "#4169E1", "#32CD32", "#9370DB"];
      const usedColors = players.map(p => p.color);
      const availableColors = colors.filter(c => !usedColors.includes(c));
      
      setPlayers([
        ...players, 
        { 
          id: players.length + 1, 
          name: `Player ${players.length + 1}`, 
          color: availableColors[0] || "#FFD700",
          score: 0 
        }
      ]);
    }
  };
  
  const removePlayer = (id) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== id));
    }
  };
  
  const startGame = () => {
    onStartGame(players, turnTime);
  };
  
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(0,0,0,0.85)",
      padding: "30px",
      borderRadius: "15px",
      width: "90%",
      maxWidth: "500px",
      color: "white"
    }}>
      <h1 style={{ color: "#FFD700", textAlign: "center", marginBottom: "20px" }}>
        Cricket Quiz Game
      </h1>
      
      <h2 style={{ color: "white", marginBottom: "15px" }}>Player Setup</h2>
      
      {players.map(player => (
        <div key={player.id} style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "15px",
          gap: "10px" 
        }}>
          <input
            type="color"
            value={player.color}
            onChange={(e) => handleColorChange(player.id, e.target.value)}
            style={{ width: "40px", height: "40px", border: "none", cursor: "pointer" }}
          />
          <input
            type="text"
            value={player.name}
            onChange={(e) => handleNameChange(player.id, e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "16px",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "5px",
              color: "white"
            }}
          />
          {players.length > 2 && (
            <button 
              onClick={() => removePlayer(player.id)}
              style={{
                backgroundColor: "rgba(255,0,0,0.7)",
                border: "none",
                borderRadius: "5px",
                width: "40px",
                height: "40px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      
      {players.length < 4 && (
        <button 
          onClick={addPlayer}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            margin: "10px 0 20px",
            backgroundColor: "rgba(100,100,255,0.7)",
            border: "none",
            borderRadius: "5px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Add Player
        </button>
      )}
      
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Turn Time (seconds):
        </label>
        <input
          type="range"
          min="10"
          max="90"
          step="5"
          value={turnTime}
          onChange={(e) => setTurnTime(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>10s</span>
          <span>{turnTime}s</span>
          <span>90s</span>
        </div>
      </div>
      
      <button 
        onClick={startGame}
        style={{
          display: "block",
          width: "100%",
          padding: "15px",
          backgroundColor: "#4CAF50",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold"
        }}
      >
        Start Game!
      </button>
    </div>
  );
}

function PlayerTurnIndicator({ currentPlayer }) {
  return (
    <div style={{
      position: "absolute",
      top: "15px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: currentPlayer.color,
      color: getBrightness(currentPlayer.color) > 128 ? "black" : "white",
      padding: "8px 15px",
      borderRadius: "20px",
      fontWeight: "bold",
      fontSize: "18px",
      textAlign: "center",
      zIndex: 1000,
      minWidth: "200px"
    }}>
      {currentPlayer.name}'s Turn
    </div>
  );
}

// Helper function to determine text color based on background brightness
function getBrightness(hex) {
  // Convert hex to RGB
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  
  // Calculate perceived brightness
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export default function Game() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [level, setLevel] = useState("medium");
  const [index, setIndex] = useState(0);
  const [timer, setTimer] = useState(45);
  const [turnTime, setTurnTime] = useState(45);
  const [showBall, setShowBall] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [wicketFallen, setWicketFallen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  // Add a new state to track the current question
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // Initialize and update current question when needed
  useEffect(() => {
    if (gameStarted && level && questions[level] && questions[level].length > 0) {
      const questionIndex = index % questions[level].length;
      setCurrentQuestion(questions[level][questionIndex]);
    }
  }, [gameStarted, level, index]);
  
  useEffect(() => {
    if (!gameStarted || !gameActive) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Move to next player when time runs out
          nextPlayer();
          return turnTime;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameActive, turnTime]);
  
  const startGame = (setupPlayers, setupTurnTime) => {
    // Shuffle questions for each difficulty
    shuffleQuestions();
    
    setPlayers(setupPlayers);
    setTurnTime(setupTurnTime);
    setTimer(setupTurnTime);
    setCurrentPlayerIndex(0);
    setLevel("medium");
    setIndex(0);
    setGameStarted(true);
    setGameActive(true);
    setGameOver(false);
    setShowBall(false); // Ensure ball is not shown at game start
  };
  
  const shuffleQuestions = () => {
    // Fisher-Yates shuffle for each difficulty level
    Object.keys(questions).forEach(difficulty => {
      for (let i = questions[difficulty].length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[difficulty][i], questions[difficulty][j]] = 
        [questions[difficulty][j], questions[difficulty][i]];
      }
    });
  };
  
  const nextPlayer = () => {
    if (currentPlayerIndex >= players.length - 1) {
      // Check if all players have had enough turns
      const maxScore = Math.max(...players.map(p => p.score));
      const minScore = Math.min(...players.map(p => p.score));
      
      // If score difference is significant or we've played enough turns
      if (maxScore >= 20 || maxScore - minScore >= 10 || getCompletedTurns() >= 12) {
        endGame();
        return;
      }
    }
    
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setTimer(turnTime);
    // Ensure ball is not shown when switching to next player
    setShowBall(false);
  };
  
  const getCompletedTurns = () => {
    return Math.floor(index / players.length) + 1;
  };
  
  const handleAnswer = (option) => {
    if (!gameActive || showBall) return;
    
    const isCorrect = option === currentQuestion?.answer;
    setAnswerCorrect(isCorrect);
    setShowBall(true);
  };
  
  const handleAnimationEnd = (success) => {
    // Hide the ball animation
    setShowBall(false);
    setWicketFallen(!success);
    
    if (success) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Update player score
      const points = level === "easy" ? 2 : level === "medium" ? 4 : 6;
      updatePlayerScore(players[currentPlayerIndex].id, points);
      
      // Increase difficulty
      setLevel(level === "easy" ? "medium" : "hard");
    } else {
      setWicketFallen(true);
      setTimeout(() => {
        setWicketFallen(false);
        // Move to next player on wrong answer
        nextPlayer();
      }, 1500);
      
      // Decrease difficulty
      setLevel(level === "hard" ? "medium" : "easy");
    }
    
    // Move to next question
    setIndex((prev) => prev + 1);
  };
  
  const updatePlayerScore = (playerId, points) => {
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, score: player.score + points } : player
    ));
  };
  
  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
  };
  
  const restartGame = () => {
    setGameStarted(false);
    setPlayers(players.map(player => ({ ...player, score: 0 })));
    setShowBall(false);
    setAnswerCorrect(false);
    setWicketFallen(false);
    setShowConfetti(false);
  };
  
  if (!gameStarted) {
    return <PlayerSetup onStartGame={startGame} />;
  }
  
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#0A1929" }}>
      <Canvas camera={{ position: [0, 15, 25], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[15, 40, 35]} angle={0.3} intensity={1.5} castShadow />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2.5} />
        
        <Ground />
        <Stars />
        <Wicket fallen={wicketFallen} />
        <Bat />
        {showBall && <Ball answerCorrect={answerCorrect} onAnimationEnd={handleAnimationEnd} />}
        <Confetti visible={showConfetti} />
      </Canvas>

      {!gameOver && <PlayerTurnIndicator currentPlayer={currentPlayer} />}
      
      <Leaderboard 
        players={players} 
        currentPlayer={currentPlayer.id} 
        gameOver={gameOver} 
        restartGame={restartGame} 
      />

      {gameActive && !gameOver && currentQuestion && (
        <>
          <div style={{ 
            position: "absolute", 
            top: "10px", 
            left: "15px", 
            color: "yellow", 
            fontSize: "20px",
            fontFamily: "Arial",
            background: "rgba(0,0,0,0.5)",
            padding: "8px 12px",
            borderRadius: "10px"
          }}>
            Time: {timer}s | Level: {level.charAt(0).toUpperCase() + level.slice(1)}
          </div>

          <div style={{ 
            position: "absolute", 
            top: "80px", 
            left: "50%", 
            transform: "translateX(-50%)", 
            color: "white", 
            fontSize: "28px",
            fontFamily: "Arial",
            background: "rgba(0,0,0,0.7)",
            padding: "15px",
            borderRadius: "10px",
            width: "80%",
            maxWidth: "800px",
            textAlign: "center"
          }}>
            {currentQuestion.question}
          </div>

          <div style={{ 
            position: "absolute", 
            bottom: "70px", 
            width: "100%", 
            textAlign: "center" 
          }}>
            {currentQuestion.options.map((option, idx) => (
              <button 
                key={idx} 
                onClick={() => handleAnswer(option)} 
                style={{
                  margin: "10px", 
                  padding: "12px 20px", 
                  fontSize: "18px", 
                  backgroundColor: showBall ? "#999" : currentPlayer.color,
                  color: getBrightness(currentPlayer.color) > 128 ? "black" : "white",
                  border: "none", 
                  borderRadius: "10px", 
                  cursor: showBall ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                  transition: "all 0.2s ease",
                  opacity: showBall ? 0.6 : 1
                }}
                disabled={showBall}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}