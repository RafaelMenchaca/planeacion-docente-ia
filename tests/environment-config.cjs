// node --test tests/environment-config.cjs; no SDK/network or real credentials.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/core/config.js'), 'utf8');
// Replace the historical public literal BEFORE evaluation; never print/use it.
const clientSource = fs.readFileSync(path.join(root, 'js/core/supabase.client.js'), 'utf8')
    .replace(/const SUPABASE_KEY = [^\r\n]+/, "const SUPABASE_KEY = 'synthetic-production-public';");
const valid = () => ({ environment: 'test', supabaseUrl: 'https://gwdtlbisykzzplgzczzq.supabase.co', apiBaseUrl: 'http://127.0.0.1:3000', supabasePublicKey: 'synthetic-test-public' });
function run(url, config) {
    const callbacks = [];
    const calls = [];
    const notices = [];
    const document = { readyState: 'loading', createElement: () => ({ setAttribute() {} }), body: { prepend: node => notices.push(node), replaceChildren: node => notices.push(node) } };
    const window = { location: new URL(url), EDUCATIVO_LOCAL_CONFIG: config, addEventListener: (_type, fn) => callbacks.push(fn) };
    const ctx = vm.createContext({ window, document, URL });
    let error;
    try { vm.runInContext(source, ctx); } catch (e) { error = e; }
    window.supabase = { createClient: (url, key) => { calls.push({ url, key }); return { auth: {}, storage: {} }; } };
    try { vm.runInContext(clientSource, ctx); } catch (e) { error ||= e; }
    callbacks.forEach(fn => fn({ stopImmediatePropagation() {} }));
    return { window, calls, notices, error };
}
for (const host of ['educativoia.com', 'www.educativoia.com', 'planeacion-docente-ia.vercel.app']) {
    test(`production exact host ${host}`, () => {
        const result = run(`https://${host}`);
        assert.equal(result.error, undefined);
        assert.equal(result.window.EDUCATIVO_CONFIG.environment, 'production');
        assert.equal(result.notices.length, 0, `${host}: no debe renderizar avisos de test`);
        const visibleContent = result.notices.map(node => node.textContent || '').join('\n');
        assert.doesNotMatch(visibleContent, /test/i, `${host}: contenido visible sin test`);
        assert.doesNotMatch(visibleContent, /gwdtlbisykzzplgzczzq/, `${host}: contenido visible sin proyecto test`);
        assert.doesNotMatch(visibleContent, /localhost:3000|127\.0\.0\.1:3000/, `${host}: contenido visible sin API local`);
        assert.equal(result.window.API_BASE_URL, 'https://api.educativoia.com');
        assert.equal(result.calls[0].url, 'https://bfnkaqmhcsyxdxoqnahk.supabase.co');
        assert.equal(result.calls[0].key, 'synthetic-production-public');
    });
    test(`production rejects local override ${host}`, () => {
        const result = run(`https://${host}`, valid());
        assert.match(result.error.message, /No se permite configuración local en producción/);
        assert.equal(result.window.EDUCATIVO_CONFIG, undefined);
        assert.equal(result.window.API_BASE_URL, undefined);
        assert.equal(result.calls.length, 0, 'No debe crearse un cliente con el override');
        const visibleContent = result.notices.map(node => node.textContent || '').join('\n');
        assert.doesNotMatch(visibleContent, /test|gwdtlbisykzzplgzczzq|localhost:3000|127\.0\.0\.1:3000/i);
    });
}
for (const host of ['localhost', '127.0.0.1']) {
    test(`test config on ${host}`, () => {
        const result = run(`http://${host}:5500`, valid());
        assert.equal(result.error, undefined);
        assert.equal(result.calls.length, 1);
        assert.equal(result.calls[0].key, 'synthetic-test-public');
        assert.equal(result.window.EDUCATIVO_ENVIRONMENT.projectId, 'gwdtlbisykzzplgzczzq');
        assert.match(result.notices[0].textContent, /test/);
        assert.equal(result.notices.length, 1, 'El indicador se conserva exclusivamente en local/test');
        assert.equal(JSON.stringify(result.window.EDUCATIVO_ENVIRONMENT).includes('synthetic'), false);
    });
}
const invalid = [
    ['missing local config', 'http://localhost:5500', undefined],
    ['preview', 'https://branch-example.vercel.app', valid()],
    ['unknown', 'https://unknown.example', valid()],
    ['spoof localhost', 'https://localhost.example', valid()],
    ['LAN', 'http://192.168.1.20:5500', valid()],
    ['IPv6', 'http://[::1]:5500', valid()],
    ['file', 'file:///pages/login.html', valid()],
    ['wrong port', 'http://localhost:3000', valid()],
    ['production HTTP', 'http://educativoia.com', undefined],
    ['test with production project', 'http://localhost:5500', { ...valid(), supabaseUrl: 'https://bfnkaqmhcsyxdxoqnahk.supabase.co' }],
    ['production with test project', 'http://localhost:5500', { ...valid(), environment: 'production' }],
    ['production override rejected', 'https://educativoia.com', valid()],
    ['unknown environment', 'http://localhost:5500', { ...valid(), environment: 'staging' }],
    ['missing key', 'http://localhost:5500', { ...valid(), supabasePublicKey: '' }],
    ['example placeholder', 'http://localhost:5500', { ...valid(), supabasePublicKey: 'REPLACE_WITH_TEST_PUBLIC_ANON_KEY' }],
    ['Supabase HTTP', 'http://localhost:5500', { ...valid(), supabaseUrl: 'http://gwdtlbisykzzplgzczzq.supabase.co' }],
    ['URL credentials', 'http://localhost:5500', { ...valid(), supabaseUrl: 'https://synthetic-user:synthetic-secret@gwdtlbisykzzplgzczzq.supabase.co' }],
    ['API production', 'http://localhost:5500', { ...valid(), apiBaseUrl: 'https://api.educativoia.com' }],
    ['API malformed', 'http://localhost:5500', { ...valid(), apiBaseUrl: 'synthetic-secret' }]
];
for (const [name, url, config] of invalid) test(`closed: ${name}`, () => {
    const result = run(url, config);
    assert.ok(result.error);
    assert.equal(result.calls.length, 0);
    assert.equal(result.window.API_BASE_URL, undefined);
    assert.match(result.notices[0].textContent, /Configuración de entorno/);
    assert.doesNotMatch(result.error.message, /synthetic|REPLACE_/);
});
test('all client pages share classic providers; inactive pages remain disconnected', () => {
    const pages = fs.readdirSync(path.join(root, 'pages')).filter(name => name.endsWith('.html'));
    const consumers = [];
    for (const page of pages) {
        const html = fs.readFileSync(path.join(root, 'pages', page), 'utf8');
        if (!html.includes('core/supabase.client.js')) continue;
        consumers.push(page);
        const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(match => match[1]);
        const providers = ['../js/core/config.local.js', '../js/core/config.js', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js', '../js/core/supabase.client.js', '../js/services/auth.service.js'];
        const indexes = providers.map(provider => scripts.indexOf(provider));
        assert.ok(indexes.every((index, i) => index >= 0 && (!i || index > indexes[i - 1])), page);
    }
    assert.deepEqual(consumers.sort(), ['archivados.html', 'dashboard.html', 'dashboard_tailwind.html', 'detalle.html', 'login.html']);
    for (const page of ['index.html', 'pages/registro.html', 'pages/recuperar.html', 'pages/contacto.html']) {
        assert.doesNotMatch(fs.readFileSync(path.join(root, page), 'utf8'), /core\/supabase.client.js/);
    }
});
