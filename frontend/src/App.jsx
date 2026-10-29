import React, { useState } from 'react';
import { ChatPanel } from './components/ChatPanel.jsx';
import { LiveCanvas } from './components/LiveCanvas.jsx';
import {
  sendChatMessage,
  updateProjectMasterJson,
  unlockProjectLead
} from './services/api.js';
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

  const [capabilities, setCapabilities] = useState({
    has_cart: false,
    has_whatsapp_checkout: false,
    has_booking: false,
    has_custom_form: false,
    has_faq_accordion: false
  });

  const [dynamicContent, setDynamicContent] = useState(null);

  const [leadInfo, setLeadInfo] = useState({
    is_unlocked: false,
    full_name: null,
    whatsapp: null,
    email: null,
    captured_at: null
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
        if (response.project.master_json?.capabilities) {
          setCapabilities((prev) => ({
            ...prev,
            ...response.project.master_json.capabilities
          }));
        }
        if (response.project.master_json?.dynamic_content) {
          setDynamicContent(response.project.master_json.dynamic_content);
        }
        if (response.project.lead_info) {
          setLeadInfo((prev) => ({
            ...prev,
            ...response.project.lead_info
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

  const handleToggleCapability = async (capabilityKey, nextValue) => {
    setCapabilities((prev) => ({
      ...prev,
      [capabilityKey]: nextValue
    }));

    try {
      await updateProjectMasterJson(projectId, {
        capabilities: {
          [capabilityKey]: nextValue
        }
      });
    } catch (err) {
      console.error('Error al sincronizar capacidad:', err);
    }
  };

  const handleUnlockLead = async (leadData) => {
    try {
      const result = await unlockProjectLead(projectId, leadData);
      if (result && result.project?.lead_info) {
        setLeadInfo(result.project.lead_info);
      } else {
        setLeadInfo((prev) => ({
          ...prev,
          ...leadData,
          is_unlocked: true,
          captured_at: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error('Error al desbloquear lead:', err);
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
        capabilities={capabilities}
        onToggleCapability={handleToggleCapability}
        dynamicContent={dynamicContent}
        leadInfo={leadInfo}
        onUnlockLead={handleUnlockLead}
      />
    </div>
  );
}
