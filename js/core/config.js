// Classic provider: optional config.local.js -> config.js -> SDK -> client -> Auth.
const API_BASE_URL = (() => {
    const productionHosts = ['educativoia.com', 'www.educativoia.com', 'planeacion-docente-ia.vercel.app'];
    const localHosts = ['localhost', '127.0.0.1'];
    const projects = { test: 'gwdtlbisykzzplgzczzq', production: 'bfnkaqmhcsyxdxoqnahk' };
    const fail = (message) => { throw new Error(`Configuración de entorno: ${message}`); };
    const originUrl = (value, name) => {
        let url;
        try { url = new URL(value); } catch { fail(`${name} inválida.`); }
        if (url.username || url.password || url.search || url.hash || url.pathname !== '/') fail(`${name} debe ser un origen sin credenciales, ruta ni parámetros.`);
        return url;
    };
    try {
        const location = window.location;
        const production = productionHosts.includes(location.hostname);
        const local = localHosts.includes(location.hostname);
        if (!production && !local) fail('Host no autorizado; previews, LAN, IPv6 y file: no están habilitados.');
        if (production && (location.protocol !== 'https:' || location.port)) fail('Producción requiere HTTPS en el puerto estándar.');
        if (local && (location.protocol !== 'http:' || location.port !== '5500')) fail('Local requiere HTTP en el puerto 5500.');
        const override = window.EDUCATIVO_LOCAL_CONFIG;
        if (production && override !== undefined) fail('No se permite configuración local en producción.');
        if (local && (!override || typeof override !== 'object')) fail('Falta js/core/config.local.js para pruebas.');
        const input = production ? {
            environment: 'production',
            supabaseUrl: `https://${projects.production}.supabase.co`,
            apiBaseUrl: 'https://api.educativoia.com'
        } : override;
        if (!['test', 'production'].includes(input.environment)) fail('Ambiente desconocido.');
        if (local && input.environment !== 'test') fail('Local solo admite el ambiente test.');
        const sb = originUrl(input.supabaseUrl, 'SUPABASE_URL');
        if (sb.protocol !== 'https:' || sb.port || sb.hostname !== `${projects[input.environment]}.supabase.co`) fail('SUPABASE_URL no coincide con el proyecto HTTPS autorizado para el ambiente.');
        const api = originUrl(input.apiBaseUrl, 'API_BASE_URL');
        if (local && (api.protocol !== 'http:' || !localHosts.includes(api.hostname) || api.port !== '3000')) fail('La API de pruebas debe ser local HTTP en el puerto 3000.');
        if (production && api.origin !== 'https://api.educativoia.com') fail('API de producción no autorizada.');
        if (local && (typeof input.supabasePublicKey !== 'string' || !input.supabasePublicKey.trim() || input.supabasePublicKey.startsWith('REPLACE_'))) fail('Falta la clave pública de pruebas; completar el archivo local.');
        window.EDUCATIVO_CONFIG = Object.freeze({
            environment: input.environment,
            projectId: projects[input.environment],
            supabaseUrl: sb.origin,
            apiBaseUrl: api.origin,
            // Production retains the existing public literal in supabase.client.js.
            supabasePublicKey: local ? input.supabasePublicKey : undefined
        });
        window.EDUCATIVO_ENVIRONMENT = Object.freeze({ environment: input.environment, projectId: projects[input.environment], apiBaseUrl: api.origin });
        window.API_BASE_URL = api.origin;
        if (local) window.addEventListener('DOMContentLoaded', () => {
            const notice = document.createElement('p');
            notice.setAttribute('role', 'status');
            notice.textContent = `Educativo IA: test · ${projects.test} · API ${api.origin}`;
            document.body.prepend(notice);
        }, { once: true });
        return api.origin;
    } catch (error) {
        const showError = (event) => {
            if (event) event.stopImmediatePropagation();
            const notice = document.createElement('p');
            notice.setAttribute('role', 'alert');
            notice.textContent = error.message;
            document.body.replaceChildren(notice);
        };
        if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', showError, { capture: true, once: true });
        else showError();
        throw error;
    }
})();
