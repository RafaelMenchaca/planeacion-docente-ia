let currentTab = 0;
const tabs = document.querySelectorAll('.tab');
const steps = document.querySelectorAll('.step');

function showTab(n) {
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === n);
    });
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === n);
    });
    currentTab = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextTab(n) {
    let next = currentTab + n;
    if (next > currentTab && !validateForm(currentTab)) return false;
    if (next >= 0 && next < tabs.length) showTab(next);
}

function validateForm(tabIndex) {
    const tab = tabs[tabIndex];
    let valid = true;
    const inputs = tab.querySelectorAll('input[type=text], select, textarea, input[type=radio]');
    for (const input of inputs) {
        if ((input.hasAttribute('required') || input.name) && input.value.trim() === '') {
            valid = false;
            alert('Por favor, completa todos los campos obligatorios.');
            break;
        }
    }
    return valid;
}

function getCheckboxValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
}

function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("wizardForm");
    const btn = document.getElementById("btn-finalizar");
    const resumen = document.getElementById("resumen");
    const acciones = document.getElementById("acciones-finales");
    const btnVerDetalle = document.getElementById("btn-ver-detalle");
    let enviado = false;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (enviado) return;
        enviado = true;

        btn.disabled = true;
        btn.textContent = "Guardando...";

        const asignatura = form.asignatura.value.trim();
        const tema = form.tema.value.trim();
        const nivel = form.nivel.value;
        const duracion = form.duracion.value.trim();
        const num_clases = form.num_clases.value.trim();
        const objetivos = form.objetivos.value.trim();
        const consideraciones = form.consideraciones.value.trim();
        const estructura = form.estructura.value.trim();
        const modalidad = getRadioValue('modalidad');
        const evaluacion = getRadioValue('evaluacion');
        const metodologias = getCheckboxValues('metodologias');
        const habilidades = getCheckboxValues('habilidades');
        const estilo = getCheckboxValues('estilo');
        const tipo_actividad = getCheckboxValues('tipo_actividad');
        const recursos = getCheckboxValues('recursos');
        const generarProblemas = form.generar_problemas.checked ? 'Sí' : 'No';

        const payload = {
            materia: asignatura,
            grado: nivel,
            tema,
            duracion,
            detalles_completos: {
                objetivos,
                modalidad,
                metodologias,
                habilidades,
                estilo,
                tipo_actividad,
                recursos,
                consideraciones,
                evaluacion,
                generarProblemas,
                estructura,
                num_clases
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/planeaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            // Mostrar resumen
            let resumenTexto = '🎓 Planeación Generada:\n\n';
            resumenTexto += `Asignatura: ${asignatura}\nTema: ${tema}\nNivel: ${nivel}\nDuración: ${duracion} minutos\n`;
            resumenTexto += `Número de Clases: ${num_clases}\nObjetivos: ${objetivos}\nModalidad: ${modalidad}\n\n`;
            resumenTexto += `Metodologías: ${metodologias.join(', ')}\nHabilidades: ${habilidades.join(', ')}\n`;
            resumenTexto += `Estilo: ${estilo.join(', ')}\nEvaluación: ${evaluacion}\nActividades: ${tipo_actividad.join(', ')}\n`;
            resumenTexto += `Recursos: ${recursos.join(', ')}\nGenerar problemas: ${generarProblemas}\n`;
            resumenTexto += `Consideraciones: ${consideraciones}\nEstructura: ${estructura}`;

            resumen.textContent = resumenTexto;
            resumen.style.display = 'block';
            resumen.scrollIntoView({ behavior: 'smooth' });

            acciones.style.display = "block";

            // Espera un pequeño momento para asegurarse de que los botones se rendericen
            setTimeout(() => {
                acciones.scrollIntoView({ behavior: 'smooth' });
            }, 200);

            btnVerDetalle.onclick = () => {
                window.location.href = `detalle.html?id=${data.id}`;
            };

            alert("🎉 Planeación guardada exitosamente en Supabase.");
        } catch (err) {
            console.error("❌ Error al guardar:", err);
            alert("❌ Error al guardar la planeación.");
            btn.disabled = false;
            btn.textContent = "Finalizar";
            enviado = false;
        }
    });
});
