import dns from 'node:dns';
import mongoose from 'mongoose';
import app from './app.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fallback si la configuración de DNS no permite override
}

if (!process.env.PORT && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // Variables ya provistas por el entorno o flags CLI
  }
}

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webcreator';

async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Conectado a MongoDB Atlas');
    } else {
      console.log('⚠️ Corriendo en modo local sin conexión MONGODB_URI configurada');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
