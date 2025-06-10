"use client";

import React from "react";
import "../styles/loading-animation.css";

const LoadingAnimation = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* Central Core */}
        <div className="loading-core">
          <div className="core-dot"></div>
        </div>

        {/* Rotating Rings */}
        <div className="loading-ring ring-1">
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
        </div>

        <div className="loading-ring ring-2">
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
        </div>

        <div className="loading-ring ring-3">
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
        </div>

        {/* Floating Particles */}
        <div className="loading-particles">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="loading-particle"
              style={
                {
                  "--delay": `${i * 0.2}s`,
                  "--angle": `${i * 45}deg`,
                } as React.CSSProperties
              }
            ></div>
          ))}
        </div>

        {/* Text */}
        <div className="loading-text">
          <div className="loading-title">QUANTUM DICE</div>
          <div className="loading-subtitle">Initializing Web3 Protocol</div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Background Grid */}
      <div className="loading-grid"></div>
    </div>
  );
};

export default LoadingAnimation;
