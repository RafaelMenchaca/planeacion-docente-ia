(() => {
const config = window.EDUCATIVO_CONFIG;
if (!config) {
  window.supabase = undefined;
  throw new Error('Configuración de entorno: cliente deshabilitado por configuración ausente o inválida.');
}
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbmthcW1oY3N5eGR4b3FuYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDI4MTcsImV4cCI6MjA2Mzg3ODgxN30.ADYrubfJuP9Oo60713UldzO0owCIgYfUKJ8WFnuBCpM'; // tu clave anon publica

// Cliente global
const publicKey = config.environment === 'production' ? SUPABASE_KEY : config.supabasePublicKey;
if (typeof publicKey !== 'string' || !publicKey.trim()) {
  window.supabase = undefined;
  throw new Error('Configuración de entorno: falta la clave pública.');
}
window.supabase = window.supabase.createClient(config.supabaseUrl, publicKey);
})();

