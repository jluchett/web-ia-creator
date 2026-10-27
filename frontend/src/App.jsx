import React, { useState } from 'react';
import { ChatPanel } from './components/ChatPanel.jsx';
import { LiveCanvas } from './components/LiveCanvas.jsx';
import styles from './App.module.css';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [branding, setBranding] = useState({
    colors: {
      primary: '#4A2E1B',
      secondary: '#D4A373',
      accent: '#FAEDCD',
      background: '#FEFAE0',
      text: '#283618'
    },
    typography: {
      headings: 'Playfair Display',
      body: 'Inter'
    },
    logo_url: null
  });

  return (
    <div className={styles.appContainer}>
      <ChatPanel />
      <LiveCanvas currentPhase={currentPhase} branding={branding} />
    </div>
  );
}
