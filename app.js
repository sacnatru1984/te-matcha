// Lógica de navegación y render — Matcha by NICE

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
    <div class="producto-card ${p.te}">
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="body">
        <div class="tag">${p.te === 'matcha' ? 'Matcha' : 'Rooibos'}</div>
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <div class="meta">
          <span>${p.presentacion}</span>
          <span class="precio ${p.precio ? '' : 'placeholder'}">${p.precio ? '$' + p.precio + ' MXN' : '[precio por confirmar]'}</span>
        </div>
      </div>
    </div>
  `).join('')
}

// ── Recetas ──
let filtroActivo = 'todas'

function renderRecetas() {
  const grid = document.getElementById('recetas-grid')
  const lista = RECETAS.filter(r => {
    if (filtroActivo === 'todas') return true
    return r.te === filtroActivo || r.tipo === filtroActivo
  })
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
  document.getElementById('modal').classList.add('open')
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('open')
}
document.getElementById('modal').addEventListener('click', ev => {
  if (ev.target.id === 'modal') cerrarModal()
})

// ── Historia / beneficios ──
function renderHistoria() {
  const block = document.getElementById('beneficios-block')
  const origen = `
    <h3>${ORIGEN_MATCHA.titulo}</h3>
    <div class="beneficio-item origen">
      ${ORIGEN_MATCHA.texto.map(p => `<p>${p}</p>`).join('')}
    </div>
  `
  const beneficios = Object.values(INFO_TES).map(grupo => `
    <h3>${grupo.titulo}</h3>
    ${grupo.beneficios.map((b, i) => `
      <div class="beneficio-item ${grupo.titulo === 'Rooibos' ? 'rooibos' : ''}">
        <b>${b.t}</b>
        <span>${b.d}</span>
      </div>
    `).join('')}
  `).join('')
  const preparacion = `
    <h3>${PREPARACION_MATCHA.titulo}</h3>
    ${PREPARACION_MATCHA.items.map(it => `
      <div class="beneficio-item prep">
        <b>${it.t}</b>
        <span>${it.d}</span>
      </div>
    `).join('')}
  `
  block.innerHTML = origen + beneficios + preparacion
}

// ── Init ──
renderProductos()
renderRecetas()
renderHistoria()
