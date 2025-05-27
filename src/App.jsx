import { useState, useEffect, useRef } from 'react';
import Terminal from './components/Terminal';
import { ReactComponent as Logo } from './assets/Logo.svg';

const bootMessages = [
  "Initializing MLVS-OS v2.1...",
  "Checking system components...",
  "Loading terminal interface...",
  "Establishing secure connection...",
  "Verifying user credentials...",
  "System ready for access"
];

export default function App() {
  const [showBootScreen, setShowBootScreen] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(bootMessages[0]);
  const audioRef = useRef(null);

  // Boot sequence animation
  useEffect(() => {
    if (!showBootScreen) return;

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        const nextIndex = (bootMessages.indexOf(prev) + 1) % bootMessages.length;
        return bootMessages[nextIndex];
      });
    }, 1500);

    const progressInterval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [showBootScreen]);

  const handleBootComplete = () => {
    // Play terminal sound effect
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    setShowBootScreen(false);
  };

  return (
    <>
      {/* Hidden audio element for sound effects */}
      <audio ref={audioRef} src="/sounds/terminal-beep.mp3" preload="auto" />
      
      {showBootScreen ? (
        <div className="boot-screen">
          <Logo className="logo glow-text animate-pulse" />
          
          <div className="boot-content">
            <div className="boot-message">
              {currentMessage}
              <span className="blinking-cursor">_</span>
            </div>
            
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${bootProgress}%` }}
              ></div>
              <div className="progress-text">{bootProgress}%</div>
            </div>
            
            {bootProgress >= 100 && (
              <button 
                onClick={handleBootComplete}
                className="access-button glow-text"
              >
                [ ACCESS TERMINAL ]
              </button>
            )}
          </div>
          
          <div className="footer-note">
            RETROSH (C) 2025 | ALL RIGHTS RESERVED
          </div>
        </div>
      ) : (
        <div className="terminal-app">
          <Logo className="logo glow-text" />
          <Terminal />
          <div className="status-bar">
            SYSTEM READY | TYPE "HELP" FOR COMMANDS
          </div>
        </div>
      )}
    </>
  );
}