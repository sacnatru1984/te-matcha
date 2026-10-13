// Lector en voz alta — usa la voz del propio teléfono/navegador (Web Speech API).
// No envía nada a ningún servidor ni guarda datos. La lógica vive aquí, separada de
// la pantalla, para poder probarla sin navegador.

// Corta un texto en trozos cortos sin partir frases. Los navegadores cortan las
// lecturas largas (Chrome se detiene tras ~15 s), por eso se lee trozo por trozo.
function trocear(texto, max = 190) {
  const limpio = (texto || '').replace(/\s+/g, ' ').trim()
  if (!limpio) return []
  const frases = limpio.match(/[^.!?;:]+[.!?;:]*\s*/g) || [limpio]
  const trozos = []
  let actual = ''
  for (const f of frases) {
    if ((actual + f).length <= max) { actual += f; continue }
    if (actual.trim()) { trozos.push(actual.trim()); actual = '' }
    if (f.length <= max) { actual = f; continue }
    let resto = f
    while (resto.length > max) {
      let corte = resto.lastIndexOf(', ', max)
      if (corte < max * 0.4) corte = resto.lastIndexOf(' ', max)
      if (corte <= 0) corte = max
      trozos.push(resto.slice(0, corte + 1).trim())
      resto = resto.slice(corte + 1)
    }
    actual = resto
  }
  if (actual.trim()) trozos.push(actual.trim())
  return trozos
}

// Ajustes para que la voz lea bien abreviaturas y símbolos.
function paraVoz(texto) {
  return String(texto)
    .replace(/\bmg\b/gi, 'miligramos')
    .replace(/\bml\b/gi, 'mililitros')
    .replace(/(\d)\s?g\b/g, '$1 gramos')
    .replace(/%/g, ' por ciento')
    .replace(/EGCG/g, 'E G C G')
    .replace(/\bLDL\b/g, 'L D L')
    .replace(/[✓✗✔✘]/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// secciones: [{ id, titulo, textos: ['párrafo', ...] }]
function crearLector({ synth, Utterance, alCambiar }) {
  const VELOCIDADES = [0.85, 1, 1.25]
  let secciones = []
  let iSec = 0
  let iTrozo = 0
  let estado = 'detenido' // 'leyendo' | 'pausado' | 'detenido'
  let token = 0
  let velocidad = 1
  let temporizador = null
  let vigilante = null

  const soportado = !!(synth && Utterance)

  function trozosDe(sec) {
    if (!sec._trozos) sec._trozos = sec.textos.flatMap(t => trocear(paraVoz(t)))
    return sec._trozos
  }

  function elegirVoz() {
    const voces = synth.getVoices ? synth.getVoices() : []
    const es = voces.filter(v => /^es([-_]|$)/i.test(v.lang))
    for (const pref of ['es-MX', 'es-US', 'es-419', 'es-ES']) {
      const v = es.find(x => x.lang.replace('_', '-').toLowerCase() === pref.toLowerCase())
      if (v) return v
    }
    return es[0] || null
  }

  function avisar(extra) {
    const sec = secciones[iSec]
    alCambiar && alCambiar({
      estado,
      seccionId: sec ? sec.id : null,
      titulo: sec ? sec.titulo : '',
      posicion: sec ? iSec + 1 : 0,
      total: secciones.length,
      velocidad,
      ...extra,
    })
  }

  function limpiarTiempos() {
    clearTimeout(temporizador); temporizador = null
    clearTimeout(vigilante); vigilante = null
  }

  function terminar(extra) {
    token++
    limpiarTiempos()
    try { synth.cancel() } catch {}
    estado = 'detenido'
    avisar(extra)
    iSec = 0; iTrozo = 0
  }

  function avanzar(miToken) {
    if (miToken !== token) return
    iTrozo++
    hablar()
  }

  function hablar() {
    const sec = secciones[iSec]
    if (!sec) return terminar({ fin: true })
    const trozos = trozosDe(sec)
    if (iTrozo >= trozos.length) {
      iSec++; iTrozo = 0
      if (iSec >= secciones.length) return terminar({ fin: true })
      avisar({ nuevaSeccion: true })
      return hablar()
    }
    const miToken = ++token
    limpiarTiempos()
    const habiaLectura = !!(synth.speaking || synth.pending)
    try { synth.cancel() } catch {}
    const decir = () => {
      if (miToken !== token) return
      const u = new Utterance(trozos[iTrozo])
      u.lang = 'es-MX'
      u.rate = velocidad
      const voz = elegirVoz()
      if (voz) { u.voice = voz; u.lang = voz.lang }
      let arranco = false
      u.onstart = () => { arranco = true; clearTimeout(vigilante) }
      u.onend = () => avanzar(miToken)
      u.onerror = e => {
        if (miToken !== token) return
        const err = e && e.error
        if (err === 'interrupted' || err === 'canceled') return
        if (err === 'not-allowed') return terminar({ error: 'no-permitido' })
        avanzar(miToken)
      }
      // Si el navegador nunca empieza a hablar (sin voz, volumen apagado o bloqueo), se avisa.
      vigilante = setTimeout(() => {
        if (miToken === token && !arranco) terminar({ error: 'no-arranco' })
      }, 5000)
      synth.speak(u)
    }
    // Si no había nada hablando se arranca de inmediato: iPhone/Safari solo deja empezar a
    // hablar directamente desde el toque del usuario. Solo si hubo que cortar una lectura en
    // curso se espera un instante, porque Chrome a veces ignora un speak() pegado a un cancel().
    if (habiaLectura) temporizador = setTimeout(decir, 40)
    else decir()
    if (estado !== 'leyendo') { estado = 'leyendo'; avisar() }
  }

  return {
    soportado,
    get estado() { return estado },
    get velocidad() { return velocidad },
    VELOCIDADES,
    leer(lista, desde = 0) {
      if (!soportado || !lista || !lista.length) return
      secciones = lista.map(s => ({ ...s, _trozos: null }))
      iSec = Math.min(Math.max(desde, 0), secciones.length - 1)
      iTrozo = 0
      estado = 'leyendo'
      avisar({ nuevaSeccion: true })
      hablar()
    },
    pausar() {
      if (estado !== 'leyendo') return
      // Se cancela y se recuerda el trozo: es lo único que funciona igual en todos los navegadores.
      token++
      limpiarTiempos()
      try { synth.cancel() } catch {}
      estado = 'pausado'
      avisar()
    },
    reanudar() {
      if (estado !== 'pausado') return
      estado = 'leyendo'
      avisar()
      hablar()
    },
    alternar() {
      if (estado === 'leyendo') this.pausar()
      else if (estado === 'pausado') this.reanudar()
    },
    detener() {
      if (estado === 'detenido') return
      terminar()
    },
    fijarVelocidad(v) {
      velocidad = VELOCIDADES.includes(v) ? v : 1
      avisar()
      if (estado === 'leyendo') hablar()
    },
    siguienteVelocidad() {
      const i = VELOCIDADES.indexOf(velocidad)
      this.fijarVelocidad(VELOCIDADES[(i + 1) % VELOCIDADES.length])
    },
  }
}
