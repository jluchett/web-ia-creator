import React, { useState, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel.jsx';
import { LiveCanvas } from './components/LiveCanvas.jsx';
import {
  createProject,
  sendChatMessage,
  updateProjectMasterJson,
  unlockProjectLead,
  generatePrototype
} from './services/api.js';
import styles from './App.module.css';

export default function App() {
  const [projectId, setProjectId] = useState('proj_123');
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

  const [generatedPrototype, setGeneratedPrototype] = useState(null);
  const [isGeneratingPrototype, setIsGeneratingPrototype] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      role: 'assistant',
      author: 'Asistente de Marca',
      text: '¡Hola! Soy tu consultor de diseño web con IA. Cuéntame sobre tu negocio para comenzar la Misión 1 (definir nombre, sector y paleta de colores).'
    }
  ]);

  useEffect(() => {
    let isMounted = true;
    async function initRealProject() {
      if (projectId && /^[0-9a-fA-F]{24}$/.test(projectId)) return;
      if (typeof createProject !== 'function') return;

      try {
        let storedSession = null;
        try {
          storedSession = localStorage.getItem('webcreator_session_id');
          if (!storedSession) {
            storedSession = `sess_${Math.random().toString(36).substring(2, 10)}`;
            localStorage.setItem('webcreator_session_id', storedSession);
          }
        } catch {
          storedSession = 'sess_default';
        }

        const res = await createProject(storedSession);
        if (isMounted && res?.data?._id) {
          setProjectId(res.data._id);
        }
      } catch (err) {
        // Modo offline / fallback
        console.warn('Inicialización offline/fallback de proyecto:', err.message);
      }
    }

    initRealProject();
    return () => {
      isMounted = false;
    };
  }, []);

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
      let currentId = projectId;
      if ((!currentId || !/^[0-9a-fA-F]{24}$/.test(currentId)) && typeof createProject === 'function') {
        try {
          const storedSession =
            (typeof localStorage !== 'undefined' && localStorage.getItem('webcreator_session_id')) ||
            `sess_${Math.random().toString(36).substring(2, 10)}`;
          const created = await createProject(storedSession);
          if (created?.data?._id) {
            currentId = created.data._id;
            setProjectId(currentId);
          }
        } catch {
          // Fallback a ID actual
        }
      }

      const targetId = currentId || 'proj_123';
      const response = await sendChatMessage(targetId, text);

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
        if (response.project._id) {
          setProjectId(response.project._id);
        }
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
        if (response.project.generated_prototype?.html_body) {
          setGeneratedPrototype(response.project.generated_prototype);
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

  const handleGeneratePrototype = async () => {
    setIsGeneratingPrototype(true);
    try {
      const result = await generatePrototype(projectId);
      if (result && result.project?.generated_prototype) {
        setGeneratedPrototype(result.project.generated_prototype);
        setCurrentPhase(4);
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg_proto_' + Date.now(),
            role: 'assistant',
            author: 'Ingeniero Frontend',
            text: '🎉 ¡Tu prototipo web interactivo ha sido compilado exitosamente! Ahora puedes explorarlo y probar la interactividad en el visor sandbox a la derecha.'
          }
        ]);
      }
    } catch (err) {
      console.error('Error al compilar prototipo:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_proto_err_' + Date.now(),
          role: 'assistant',
          author: 'Sistema',
          text: `No fue posible generar el prototipo: ${err.message}`
        }
      ]);
    } finally {
      setIsGeneratingPrototype(false);
    }
  };

  const handlePublishClick = () => {
    const businessName = dynamicContent?.hero?.headline || 'mi negocio';
    const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(
      `¡Hola! He generado mi prototipo interactivo para ${businessName} en WebCreator AI y deseo contratar el paquete de desarrollo profesional para publicarlo en producción.`
    )}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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
        generatedPrototype={generatedPrototype}
        onGeneratePrototype={handleGeneratePrototype}
        isGeneratingPrototype={isGeneratingPrototype}
        onPublishClick={handlePublishClick}
      />
    </div>
  );
}
