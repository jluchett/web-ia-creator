import React, { useState, useRef, useEffect } from 'react';
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
  const textareaRef = useRef(null);

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e) => {
    setInputVal(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    if (onSendMessage) {
      onSendMessage(inputVal.trim());
    }
    setInputVal('');
    resetTextareaHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (!inputVal) {
      resetTextareaHeight();
    }
  }, [inputVal]);

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
        <textarea
          ref={textareaRef}
          rows={1}
          className={styles.textarea}
          placeholder="Escribe tu respuesta o idea de negocio..."
          value={inputVal}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
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
