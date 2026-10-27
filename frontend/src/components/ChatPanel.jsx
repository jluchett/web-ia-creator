import React, { useState } from 'react';
import styles from './ChatPanel.module.css';

export function ChatPanel({
  messages = [
    {
      id: 'msg_welcome',
      role: 'assistant',
      author: 'Asistente de Marca',
      text: '¡Hola! Soy tu consultor de diseño web con IA. Cuéntame sobre tu negocio para comenzar la Misión 1 (definir nombre, sector y paleta de colores).'
    }
  ],
  onSendMessage,
  isLoading = false
}) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
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
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.role === 'user' ? styles.messageUser : styles.messageAi}
          >
            <div className={msg.role === 'user' ? styles.userAuthor : styles.messageAuthor}>
              {msg.role === 'user' ? 'Tú' : msg.author || 'Asistente de Marca'}
            </div>
            <p>{msg.text}</p>
          </div>
        ))}

        {isLoading && (
          <div className={styles.typingIndicator}>
            El Asistente está analizando tu negocio...
          </div>
        )}
      </div>

      <form className={styles.inputContainer} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Escribe tu respuesta o idea de negocio..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading || !inputVal.trim()}
        >
          Enviar
        </button>
      </form>
    </aside>
  );
}
