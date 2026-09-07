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

// ── Historia / beneficios ──
function renderOrigen(origen, claseExtra) {
  return `
    <h3>${origen.titulo}</h3>
    <div class="beneficio-item origen ${claseExtra || ''}">
      ${origen.texto.map(p => `<p>${p}</p>`).join('')}
    </div>
  `
}

function renderHistoria() {
  const block = document.getElementById('beneficios-block')

  const matchaBlock = renderOrigen(ORIGEN_MATCHA) + `
    <h3>${INFO_TES.matcha.titulo} — Beneficios</h3>
    ${INFO_TES.matcha.beneficios.map(b => `
      <div class="beneficio-item">
        <b>${b.t}</b>
        <span>${b.d}</span>
      </div>
    `).join('')}
  `

  const rooibosBlock = renderOrigen(ORIGEN_ROOIBOS, 'rooibos') + `
    <div class="fuente-nota">Fuente: información general de dominio público — NICE aún no publica su propia reseña de origen para el rooibos.</div>
    <h3>${INFO_TES.rooibos.titulo} — Beneficios</h3>
    ${INFO_TES.rooibos.beneficios.map(b => `
      <div class="beneficio-item rooibos">
        <b>${b.t}</b>
        <span>${b.d}</span>
      </div>
    `).join('')}
  `

  const preparacion = `
    <h3>${PREPARACION_MATCHA.titulo}</h3>
    ${PREPARACION_MATCHA.items.map(it => `
      <div class="beneficio-item prep">
        <b>${it.t}</b>
        <span>${it.d}</span>
      </div>
    `).join('')}
  `
  block.innerHTML = matchaBlock + rooibosBlock + preparacion
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

// ── Init ──
renderProductos()
renderRecetas()
renderHistoria()
renderTestimonios()
