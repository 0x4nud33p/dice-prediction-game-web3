"use client";

import React, { useState, useEffect } from 'react';
import '../styles/dice-animation.css';

const DiceAnimation = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(6);

  useEffect(() => {
    const rollInterval = setInterval(() => {
      setIsRolling(true);
      
      setTimeout(() => {
        setCurrentNumber(Math.floor(Math.random() * 6) + 1);
        setShowPulse(true);
        
        setTimeout(() => {
          setShowPulse(false);
          setIsRolling(false);
        }, 500);
      }, 2800);
    }, 4000);

    return () => clearInterval(rollInterval);
  }, []);

  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push(
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        />
      );
    }
    return particles;
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Grid Background */}
      <div className="grid-background" />
      
      {/* Floating Particles */}
      {generateParticles()}
      
      {/* Main Dice Container */}
      <div className="dice-container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Glass Floor */}
        <div className="glass-floor" />
        
        {/* Main Dice */}
        <div className={`dice ${isRolling ? 'animate-pulse' : ''}`}>
          <div className="dice-face face-1">1</div>
          <div className="dice-face face-2">2</div>
          <div className="dice-face face-3">3</div>
          <div className="dice-face face-4">4</div>
          <div className="dice-face face-5">5</div>
          <div className="dice-face face-6">{currentNumber}</div>
        </div>
        
        {/* Dice Reflection */}
        <div className="dice-reflection">
          <div className="dice">
            <div className="dice-face face-1">1</div>
            <div className="dice-face face-2">2</div>
            <div className="dice-face face-3">3</div>
            <div className="dice-face face-4">4</div>
            <div className="dice-face face-5">5</div>
            <div className="dice-face face-6">{currentNumber}</div>
          </div>
        </div>
        
        {/* Energy Pulse Effect */}
        {showPulse && <div className="energy-pulse" />}
      </div>
      
      
      {/* Status Indicator */}
      {/* <div className="absolute top-8 right-8">
        <div className={`w-3 h-3 rounded-full ${isRolling ? 'bg-yellow-400' : 'bg-green-400'} shadow-lg`}>
          <div className={`w-full h-full rounded-full animate-ping ${isRolling ? 'bg-yellow-400' : 'bg-green-400'}`} />
        </div>
        <span className="hologram-text text-xs ml-2">
          {isRolling ? 'Rolling...' : 'Ready'}
        </span>
      </div> */}
    </div>
  );
};

export default DiceAnimation;
