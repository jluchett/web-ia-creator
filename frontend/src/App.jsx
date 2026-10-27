import React, { useState } from 'react';
import { ChatPanel } from './components/ChatPanel.jsx';
import { LiveCanvas } from './components/LiveCanvas.jsx';
import { sendChatMessage, updateProjectMasterJson } from './services/api.js';
import styles from './App.module.css';

export default function App() {
  const [projectId] = useState('proj_123');
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogoId, setSelectedLogoId] = useState(null);
  const [logoOptions, setLogoOptions] = useState([]);

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

  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      role: 'assistant',
      author: 'Asistente de Marca',
      text: '¡Hola! Soy tu consultor de diseño web con IA. Cuéntame sobre tu negocio para comenzar la Misión 1 (definir nombre, sector y paleta de colores).'
    }
  ]);

  const handleSendMessage = async (text) => {
    const userMsgId = 'msg_user_' + Date.now();
    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      text
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(projectId, text);

      if (response && response.reply) {
        const assistantMsg = {
          id: 'msg_ai_' + Date.now(),
          role: 'assistant',
          author: 'Asistente de Marca',
          text: response.reply
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }

      if (response.project) {
        if (response.project.current_phase) {
          setCurrentPhase(response.project.current_phase);
        }
        if (response.project.master_json?.branding) {
          setBranding((prev) => ({
            ...prev,
            ...response.project.master_json.branding
          }));
        }
      }

      if (response.logo_options && Array.isArray(response.logo_options)) {
        setLogoOptions(response.logo_options);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          role: 'assistant',
          author: 'Sistema',
          text: `Hubo un inconveniente al procesar tu solicitud: ${err.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLogo = async (logoOpt) => {
    setSelectedLogoId(logoOpt.id);
    setBranding((prev) => ({
      ...prev,
      logo_url: logoOpt.preview_url
    }));

    try {
      await updateProjectMasterJson(projectId, {
        branding: {
          logo_url: logoOpt.preview_url
        }
      });
    } catch (err) {
      console.error('Error al sincronizar logo seleccionado:', err);
    }
  };

  return (
    <div className={styles.appContainer}>
      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
      <LiveCanvas
        currentPhase={currentPhase}
        branding={branding}
        logoOptions={logoOptions}
        selectedLogoId={selectedLogoId}
        onSelectLogo={handleSelectLogo}
      />
    </div>
  );
}
