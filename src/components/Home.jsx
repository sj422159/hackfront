import React from "react";
import QRCode from "react-qr-code";

const Home = ({ players, handleStart }) => {
  const localIP = "192.168.1.34"; // Change this when deployed
  const vitePort = "5173";

  const qrLink = `http://${localIP}:${vitePort}`;

  return (
    <div style={styles.home}>
      <h1 style={styles.heading}>🏏 PvP Cricket Quiz</h1>
      <p style={styles.text}>Scan QR to Join & Play</p>
      <div style={styles.qrBox}>
        <QRCode value={qrLink} size={220} bgColor="#000000" fgColor="#FFD700" />
      </div>
      <p style={styles.text}>Players Joined: {players.length}</p>
      <button style={styles.button} onClick={handleStart}>
        Start Match
      </button>
    </div>
  );
};

const styles = {
  home: {
    marginTop: "50px",
    color: "#FFD700",
    textAlign: "center",
    backgroundColor: "#000000",
    minHeight: "100vh",
    paddingTop: "30px",
  },
  heading: {
    fontSize: "45px",
    textShadow: "0 0 10px #FFD700",
  },
  text: {
    marginTop: "20px",
    fontSize: "20px",
    color: "#FFD700",
  },
  qrBox: {
    marginTop: "20px",
    padding: "10px",
    background: "#000000",
    display: "inline-block",
    border: "2px solid #FFD700",
    borderRadius: "10px",
  },
  button: {
    marginTop: "30px",
    padding: "14px 30px",
    fontSize: "20px",
    backgroundColor: "#FFD700",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#000000",
    fontWeight: "bold",
    boxShadow: "0 0 15px #FFD700",
  },
};

export default Home;
