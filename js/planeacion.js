
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

    // Validación simple: no permitir avanzar si campos obligatorios vacíos
    if (next > currentTab && !validateForm(currentTab)) {
        return false;
    }

    if (next >= 0 && next < tabs.length) {
        showTab(next);
    }
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
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
}

document.getElementById('wizardForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;

    const asignatura = form.asignatura.value.trim();
    const tema = form.tema.value.trim();
    const nivel = form.nivel.value;
    const duracion = form.duracion.value.trim();
    const num_clases = form.num_clases.value.trim();
    const objetivos = form.objetivos.value.trim();
    const consideraciones = form.consideraciones.value.trim();
    const estructura = form.estructura.value.trim();

    const modalidad = getRadioValue('modalidad'); // ✅ esto debe estar aquí antes del payload
    const evaluacion = getRadioValue('evaluacion');

    const metodologias = getCheckboxValues('metodologias');
    const habilidades = getCheckboxValues('habilidades');
    const estilo = getCheckboxValues('estilo');
    const tipo_actividad = getCheckboxValues('tipo_actividad');
    const recursos = getCheckboxValues('recursos');

    const generarProblemas = form.generar_problemas.checked ? 'Sí' : 'No';

    // ⬇️ El resumen está bien
    let resumenTexto = 'Tus clases se generarán a partir de los siguientes datos:\n\n';
    resumenTexto += `Asignatura: ${asignatura}\n`;
    resumenTexto += `Tema: ${tema}\n`;
    resumenTexto += `Nivel: ${nivel}\n`;
    resumenTexto += `Duración: ${duracion} minutos\n`;
    resumenTexto += `Número de Clases: ${num_clases}\n`;
    resumenTexto += `Objetivos de Aprendizaje: ${objetivos}\n`;
    resumenTexto += `Consideraciones: ${consideraciones}\n`;
    resumenTexto += `Modalidad: ${modalidad}\n\n`;

    resumenTexto += `Metodologías: ${metodologias.join(', ')}\n`;
    resumenTexto += `Habilidades: ${habilidades.join(', ')}\n`;
    resumenTexto += `Estilo de Aprendizaje: ${estilo.join(', ')}\n\n`;

    resumenTexto += `Evaluación: ${evaluacion}\n`;
    resumenTexto += `Tipo de Actividad: ${tipo_actividad.join(', ')}\n`;
    resumenTexto += `Recursos: ${recursos.join(', ')}\n\n`;

    resumenTexto += `Generar problemas con soluciones: ${generarProblemas}\n\n`;
    resumenTexto += `Estructura de la Clase: ${estructura}\n`;

    const resumen = document.getElementById('resumen');
    resumen.textContent = resumenTexto;
    resumen.style.display = 'block';

    resumen.scrollIntoView({ behavior: 'smooth' });

    // ✅ Aquí va el payload y el fetch
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

    console.log("📤 Enviando datos:", payload);

    fetch('http://localhost:3000/api/planeaciones', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            console.log('✅ Planeación guardada:', data);
            alert("🎉 Planeación guardada exitosamente en Supabase.");
        })
        .catch(err => {
            console.error('❌ Error al guardar:', err);
            alert("Hubo un error al guardar la planeación.");
        });
});
