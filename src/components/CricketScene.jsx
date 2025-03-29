// src/components/CricketScene.jsx
import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Howl } from "howler";

const ballSound = new Howl({ src: ["/sounds/six.mp3"] });
const wicketSound = new Howl({ src: ["/sounds/wicket.mp3"] });

function Ball({ isCorrect, trigger }) {
  const mesh = useRef();
  const [animation, setAnimation] = useState(false);
  let angle = 0;

  useFrame(() => {
    if (animation) {
      if (isCorrect) {
        mesh.current.position.x += 0.1;
        mesh.current.position.y = 5 * Math.sin(angle);
        angle += 0.05;
      } else {
        mesh.current.position.y -= 0.2;
      }
    }
  });

  React.useEffect(() => {
    if (trigger) {
      setAnimation(true);
      if (isCorrect) ballSound.play();
      else wicketSound.play();
    }
  }, [trigger, isCorrect]);

  return (
    <mesh ref={mesh} position={[0, 1, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={"red"} />
    </mesh>
  );
}

function Wicket({ fall }) {
  const group = useRef();

  useFrame(() => {
    if (fall && group.current.rotation.z > -Math.PI / 4) {
      group.current.rotation.z -= 0.02;
    }
  });

  return (
    <group ref={group} position={[5, 0, 0]}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshStandardMaterial color={"white"} />
      </mesh>
      <mesh position={[0.2, 1, 0]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshStandardMaterial color={"white"} />
      </mesh>
      <mesh position={[-0.2, 1, 0]}>
        <boxGeometry args={[0.1, 2, 0.1]} />
        <meshStandardMaterial color={"white"} />
      </mesh>
    </group>
  );
}

const CricketScene = ({ isCorrect, triggerAnimation }) => {
  return (
    <Canvas style={{ height: "100vh", background: "#0b0b0b" }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Stars />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <Ball isCorrect={isCorrect} trigger={triggerAnimation} />
      <Wicket fall={!isCorrect && triggerAnimation} />
      <OrbitControls />
    </Canvas>
  );
};

export default CricketScene;
