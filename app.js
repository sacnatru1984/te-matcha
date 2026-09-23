// Lógica de navegación y render — Matcha by NICE

// ── WhatsApp / Compartir ──
function pedirLink(texto) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`
}
function compartir(titulo, texto) {
  const textoCompleto = texto + '\n' + location.href
  if (navigator.share) {
    navigator.share({ title: titulo, text: texto, url: location.href }).catch(() => {})
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(textoCompleto)}`, '_blank')
  }
}

function irA(tab) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  document.getElementById('sec-' + tab).classList.add('active')
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab))
  window.scrollTo({ top: 0, behavior: 'instant' })
}

// ── Productos ──
function renderProductos() {
  const grid = document.getElementById('productos-grid')
  grid.innerHTML = PRODUCTOS.map(p => `
    <div class="producto-card ${p.te}" onclick="abrirProducto('${p.id}')">
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="body">
        <div class="tag">${p.te === 'matcha' ? 'Matcha' : 'Rooibos'}</div>
        <h3>${p.nombre}</h3>
        <p class="clamp">${p.descripcion}</p>
        <div class="meta">
          <span>${p.presentacion}</span>
          ${p.precio ? `<span class="precio">$${p.precio.toFixed(2)} MXN</span>` : ''}
        </div>
      </div>
    </div>
  `).join('')
}

function abrirProducto(id) {
  const p = PRODUCTOS.find(x => x.id === id)
  if (!p) return
  document.getElementById('pmodal-img').src = p.imagen
  document.getElementById('pmodal-img').alt = p.nombre
  document.getElementById('pmodal-tag').textContent = (p.te === 'matcha' ? 'Matcha' : 'Rooibos') + (p.sku ? ' · SKU ' + p.sku : '')
  document.getElementById('pmodal-nombre').textContent = p.nombre
  document.getElementById('pmodal-precio').textContent = p.precio ? '$' + p.precio.toFixed(2) + ' MXN' : ''
  document.getElementById('pmodal-precio').style.display = p.precio ? '' : 'none'
  document.getElementById('pmodal-presentacion').textContent = p.presentacion
  document.getElementById('pmodal-descripcion').textContent = p.descripcion
  const carEl = document.getElementById('pmodal-caracteristicas')
  if (p.caracteristicas && p.caracteristicas.length) {
    carEl.innerHTML = p.caracteristicas.map(c => `<li>${c}</li>`).join('')
    carEl.parentElement.style.display = ''
  } else {
    carEl.parentElement.style.display = 'none'
  }
  const precioTexto = p.precio ? ` ($${p.precio.toFixed(2)} MXN)` : ''
  document.getElementById('pmodal-pedir').href = pedirLink(`Hola, me interesa el ${p.nombre}${precioTexto} de NICE 🍵 ¿me das informes?`)
  document.getElementById('pmodal-compartir').onclick = () => compartir(p.nombre, `Mira ${p.nombre} en la guía Matcha by NICE 🍵`)
  document.getElementById('pmodal').classList.add('open')
}

function cerrarPModal() {
  document.getElementById('pmodal').classList.remove('open')
}
document.getElementById('pmodal').addEventListener('click', ev => {
  if (ev.target.id === 'pmodal') cerrarPModal()
})

// ── Recetas ──
let filtroActivo = 'todas'
let busquedaActiva = ''

function renderRecetas() {
  const grid = document.getElementById('recetas-grid')
  const q = busquedaActiva.trim().toLowerCase()
  const lista = RECETAS.filter(r => {
    if (filtroActivo !== 'todas' && r.te !== filtroActivo && r.tipo !== filtroActivo) return false
    if (q && !r.nombre.toLowerCase().includes(q) && !r.ingredientes.some(i => i.toLowerCase().includes(q))) return false
    return true
  })
  const vacio = document.getElementById('recetas-vacio')
  vacio.style.display = lista.length ? 'none' : ''
  grid.innerHTML = lista.map(r => `
    <div class="receta-card ${r.te}" onclick="abrirReceta('${r.id}')">
      <img src="${r.imagen}" alt="${r.nombre}">
      <div class="body">
        <div class="tag">${r.te === 'matcha' ? 'Matcha' : 'Rooibos'} · ${r.tipo === 'bebida' ? 'Bebida' : 'Platillo'}</div>
        <h3>${r.nombre}</h3>
        <div class="porciones">Porciones: ${r.porciones}</div>
      </div>
    </div>
  `).join('')
}

document.addEventListener('click', ev => {
  const pill = ev.target.closest('.pill')
  if (!pill) return
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active', 'rooibos-active'))
  filtroActivo = pill.dataset.filtro
  pill.classList.add('active')
  if (filtroActivo === 'rooibos') pill.classList.add('rooibos-active')
  renderRecetas()
})

document.getElementById('recetas-buscador').addEventListener('input', ev => {
  busquedaActiva = ev.target.value
  renderRecetas()
})

function abrirReceta(id) {
  const r = RECETAS.find(x => x.id === id)
  if (!r) return
  document.getElementById('modal-img').src = r.imagen
  document.getElementById('modal-img').alt = r.nombre
  document.getElementById('modal-tag').textContent = (r.te === 'matcha' ? 'Matcha' : 'Rooibos') + ' · ' + (r.tipo === 'bebida' ? 'Bebida' : 'Platillo')
  document.getElementById('modal-nombre').textContent = r.nombre
  document.getElementById('modal-porciones').textContent = 'Porciones: ' + r.porciones
  document.getElementById('modal-ingredientes').innerHTML = r.ingredientes.map(i => `<li>${i}</li>`).join('')
  document.getElementById('modal-instrucciones').innerHTML = r.instrucciones.map(i => `<li>${i}</li>`).join('')
  const teNombre = r.te === 'matcha' ? 'Matcha' : 'Rooibos'
  document.getElementById('modal-pedir').href = pedirLink(`Hola, vi la receta "${r.nombre}" en la app Matcha by NICE y quiero pedir mi ${teNombre} 🍵`)
  document.getElementById('modal-pedir').textContent = `📲 Pide tu ${teNombre} para esta receta`
  document.getElementById('modal-compartir').onclick = () => compartir(r.nombre, `Mira esta receta de ${r.nombre} en la guía Matcha by NICE 🍵`)
  document.getElementById('modal').classList.add('open')
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('open')
}
document.getElementById('modal').addEventListener('click', ev => {
  if (ev.target.id === 'modal') cerrarModal()
})

document.addEventListener('keydown', ev => {
  if (ev.key !== 'Escape') return
  cerrarModal()
  cerrarPModal()
})

// ── Quiz "¿Qué té es para ti?" (sin guardar nada, solo uso en el momento) ──
function renderQuizPreguntas() {
  document.getElementById('quiz-preguntas').innerHTML = QUIZ_PREGUNTAS.map((p, i) => `
    <div class="quiz-pregunta">
      <b>${i + 1}. ${p.pregunta}</b>
      ${p.opciones.map((o, j) => `
        <label class="quiz-opcion">
          <input type="radio" name="q${i}" value="${o.te}" ${j === 0 ? 'checked' : ''}>
          <span>${o.texto}</span>
        </label>
      `).join('')}
    </div>
  `).join('')
}

function abrirQuiz() {
  renderQuizPreguntas()
  document.getElementById('quiz-resultado').innerHTML = ''
  document.getElementById('quiz-preguntas').style.display = ''
  document.getElementById('quiz-btn').style.display = ''
  document.getElementById('qmodal').classList.add('open')
}

function cerrarQuiz() {
  document.getElementById('qmodal').classList.remove('open')
}
document.getElementById('qmodal').addEventListener('click', ev => {
  if (ev.target.id === 'qmodal') cerrarQuiz()
})

function verResultadoQuiz() {
  const puntos = { matcha: 0, rooibos: 0 }
  QUIZ_PREGUNTAS.forEach((_, i) => {
    const elegido = document.querySelector(`input[name="q${i}"]:checked`)
    if (elegido) puntos[elegido.value]++
  })
  const te = puntos.matcha >= puntos.rooibos ? 'matcha' : 'rooibos'
  const info = INFO_TES[te]
  const nombreTe = te === 'matcha' ? 'Matcha' : 'Rooibos'
  const producto = PRODUCTOS.find(p => p.te === te)
  const recetas = RECETAS.filter(r => r.te === te).slice(0, 2)

  document.getElementById('quiz-preguntas').style.display = 'none'
  document.getElementById('quiz-btn').style.display = 'none'
  document.getElementById('quiz-resultado').innerHTML = `
    <div class="quiz-resultado-card ${te}">
      <div class="tag">Tu recomendación</div>
      <h3>${nombreTe}</h3>
      <ul>
        ${info.beneficios.slice(0, 2).map(b => `<li><b>${b.t}</b> — ${b.d}</li>`).join('')}
      </ul>
    </div>
    ${producto ? `
      <h4>Producto recomendado</h4>
      <div class="producto-card ${te}" onclick="cerrarQuiz(); abrirProducto('${producto.id}')">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="body">
          <div class="tag">${nombreTe}</div>
          <h3>${producto.nombre}</h3>
          <div class="meta">
            <span>${producto.presentacion}</span>
            ${producto.precio ? `<span class="precio">$${producto.precio.toFixed(2)} MXN</span>` : ''}
          </div>
        </div>
      </div>
    ` : ''}
    ${recetas.length ? `
      <h4>Recetas para empezar</h4>
      ${recetas.map(r => `
        <div class="receta-card ${te}" onclick="cerrarQuiz(); abrirReceta('${r.id}')">
          <img src="${r.imagen}" alt="${r.nombre}">
          <div class="body">
            <div class="tag">${nombreTe} · ${r.tipo === 'bebida' ? 'Bebida' : 'Platillo'}</div>
            <h3>${r.nombre}</h3>
          </div>
        </div>
      `).join('')}
    ` : ''}
    <button class="btn-compartir quiz-repetir" onclick="abrirQuiz()">Volver a responder</button>
  `
}

// ── Historia / beneficios: toda la sección es un acordeón ──
function accSection(id, titulo, contenidoHtml, accent) {
  return `
    <div class="acc-section ${accent || ''}">
      <button class="acc-header" onclick="toggleAcc('${id}')">
        <span>${titulo}</span>
        <span class="acc-chev" id="acc-chev-${id}">›</span>
      </button>
      <div class="acc-wrap" id="acc-wrap-${id}">
        <div class="acc-inner">${contenidoHtml}</div>
      </div>
    </div>
  `
}

function toggleAcc(id) {
  const wrap = document.getElementById('acc-wrap-' + id)
  const chev = document.getElementById('acc-chev-' + id)
  const abierta = wrap.classList.toggle('open')
  chev.classList.toggle('open', abierta)
}

function renderHistoria() {
  const block = document.getElementById('beneficios-block')

  const origenMatchaHtml = `
    <div class="beneficio-item origen">
      ${ORIGEN_MATCHA.texto.map(p => `<p>${p}</p>`).join('')}
    </div>
  `
  const beneficiosMatchaHtml = INFO_TES.matcha.beneficios.map(b => `
    <div class="beneficio-item">
      <b>${b.t}</b>
      <span>${b.d}</span>
    </div>
  `).join('')

  const origenRooibosHtml = `
    <div class="beneficio-item origen rooibos">
      ${ORIGEN_ROOIBOS.texto.map(p => `<p>${p}</p>`).join('')}
    </div>
    <div class="fuente-nota">Fuente: información general de dominio público — NICE aún no publica su propia reseña de origen para el rooibos.</div>
  `
  const beneficiosRooibosHtml = INFO_TES.rooibos.beneficios.map(b => `
    <div class="beneficio-item rooibos">
      <b>${b.t}</b>
      <span>${b.d}</span>
    </div>
  `).join('')

  const preparacionHtml = PREPARACION_MATCHA.items.map(it => `
    <div class="beneficio-item prep">
      <b>${it.t}</b>
      <span>${it.d}</span>
    </div>
  `).join('')

  const mitosHtml = MITOS.map(m => `
    <div class="mito-item">
      <div class="mito">✗ ${m.mito}</div>
      <div class="verdad">✓ ${m.verdad}</div>
    </div>
  `).join('')

  const faqsHtml = `
    <div class="faq-list">
      ${FAQS.map((f, i) => `
        <div class="faq-item">
          <button class="faq-pregunta" onclick="toggleFaq(${i})">
            <span>${f.pregunta}</span>
            <span class="faq-chev" id="faq-chev-${i}">›</span>
          </button>
          <div class="faq-respuesta" id="faq-respuesta-${i}">${f.respuesta}</div>
        </div>
      `).join('')}
    </div>
  `

  block.innerHTML = [
    accSection('origen-matcha', 'Origen del Matcha', origenMatchaHtml),
    accSection('beneficios-matcha', INFO_TES.matcha.titulo + ' — Beneficios', beneficiosMatchaHtml),
    accSection('origen-rooibos', 'Origen del Rooibos', origenRooibosHtml, 'rooibos'),
    accSection('beneficios-rooibos', INFO_TES.rooibos.titulo + ' — Beneficios', beneficiosRooibosHtml, 'rooibos'),
    accSection('preparacion', PREPARACION_MATCHA.titulo, preparacionHtml, 'gold'),
    accSection('mitos', 'Mitos y verdades', mitosHtml),
    accSection('faqs', 'Preguntas frecuentes', faqsHtml),
  ].join('')
}

function toggleFaq(i) {
  const respuesta = document.getElementById('faq-respuesta-' + i)
  const chev = document.getElementById('faq-chev-' + i)
  const abierta = respuesta.classList.toggle('open')
  chev.classList.toggle('open', abierta)
}

// ── Testimonios ──
function renderTestimonios() {
  const grid = document.getElementById('testimonios-grid')
  grid.innerHTML = TESTIMONIOS.map(t => `
    <div class="testimonio-card">
      <img src="${t.imagen}" alt="${t.alt}">
    </div>
  `).join('')
}

// ── CTA: quiero ser distribuidor ──
document.getElementById('socio-cta').href = pedirLink('Hola, vi tu página de té y me interesa saber cómo unirme como distribuidor(a) de NICE 🌿')

// ── Init ──
renderProductos()
renderRecetas()
renderHistoria()
renderTestimonios()
