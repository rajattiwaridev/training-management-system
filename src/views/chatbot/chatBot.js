import React, { useState, useRef } from 'react';
import CanvasDraw from "react-canvas-draw";
import './chatBot.css'; // Assuming you have a CSS file for styling
function ChatBot() {
   const [options, setOptions] = useState({
    button: false,
    list: false,
    test: false
  });
  const canvasRef = useRef(null);

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="system-cobold-container">
      {/* Header Section */}
      <header className="system-header">
        <h1>Bolt / SYSTEM_Cobold</h1>
      </header>

      {/* Main Content */}
      <div className="content-section">
        <section className="system-section">
          <h2>1. SYSSTEM_Cobold</h2>
          <div className="manager-message">
            <strong>Manager</strong>
            <p>Welcome! To help you better, please visit us here we can help. You can choose the options that support this from this quick way person.</p>
          </div>
        </section>

        <div className="divider"></div>

        {/* Connect with Team Section */}
        <section className="connect-section">
          <h3>Connect with team</h3>
          
          {/* Options Area */}
          <div className="options-area">
            <h4>Options</h4>
            <div className="options-grid">
              {['button', 'list', 'test'].map((option) => (
                <div key={option} className="option-item">
                  <div 
                    className={`option-box ${options[option] ? 'checked' : ''}`}
                    onClick={() => handleOptionChange(option)}
                  >
                    {options[option] && <span>✓</span>}
                  </div>
                  <label>{option.charAt(0).toUpperCase() + option.slice(1)}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Drawing Area */}
          <div className="canvas-container">
            <h4>Connect with team</h4>
            <div className="button-status">
              <strong>Add Button Item (1/2)</strong>
            </div>
            <CanvasDraw 
              ref={canvasRef}
              brushColor="#000"
              brushRadius={2}
              canvasWidth={500}
              canvasHeight={200}
              className="drawing-canvas"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatBot;
