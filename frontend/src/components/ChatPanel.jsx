import React, { useState } from 'react';
import styles from './ChatPanel.module.css';

export function ChatPanel({ onSendMessage }) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    if (onSendMessage) {
      onSendMessage(inputVal);
    }
    setInputVal('');
  };

  return (
    <aside className={styles.chatPanel} data-testid="chat-panel">
      <header className={styles.header}>
        <div className={styles.title}>
          <span>WebCreator AI</span>
          <span className={styles.badge}>gemini-3.8-flash</span>
        </div>
      </header>

      <div className={styles.messagesContainer}>
        <div className={styles.messageAi}>
          <div className={styles.messageAuthor}>Asistente de Marca</div>
          <p>
            ¡Hola! Soy tu consultor de diseño web con IA. Cuéntame sobre tu negocio para comenzar la Misión 1 (definir nombre, sector y paleta de colores).
          </p>
        </div>
      </div>

      <form className={styles.inputContainer} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Escribe tu respuesta o idea de negocio..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button type="submit" className={styles.sendButton}>
          Enviar
        </button>
      </form>
    </aside>
  );
}
