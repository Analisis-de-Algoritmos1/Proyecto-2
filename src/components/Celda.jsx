
/**
 * Función: Celda
 *
 * Descripción:
 * Representa una celda individual del tablero.
 * Puede mostrar su estado normal o una probabilidad
 * estimada cuando todavía no ha sido atacada.
 *
 * Entradas:
 * @param {Object} propiedades - Información de la celda.
 *
 * Retorno:
 * Botón que representa una posición del tablero.
 */
function Celda({
  fila,
  columna,
  estado = "sin-disparo",
  tieneBarco = false,
  mostrarBarco = false,
  alSeleccionar,
  deshabilitada = false,
  probabilidad = null,
  colorProbabilidad = null,
  colorTexto = "#ffffff",
  esRecomendada = false
}) {

  // Comprueba si la celda recibió un disparo.
  const fueAtacada = estado !== "sin-disparo";

  // Evita disparos repetidos o fuera del turno.
  const estaDeshabilitada =
    deshabilitada ||
    fueAtacada ||
    typeof alSeleccionar !== "function";

  // Muestra los barcos únicamente cuando está permitido.
  const barcoVisible =
    mostrarBarco && tieneBarco && !fueAtacada;

  // Comprueba si debe mostrar un porcentaje.
  const mostrarProbabilidad =
    !fueAtacada &&
    !barcoVisible &&
    Number.isFinite(probabilidad);

  // Determina el símbolo visible de la celda.
  let simbolo = "";

  if (estado === "agua") {
    simbolo = "•";
  } else if (estado === "impacto") {
    simbolo = "✕";
  } else if (estado === "hundido") {
    simbolo = "✖";
  } else if (barcoVisible) {
    simbolo = "■";
  } else if (mostrarProbabilidad) {
    simbolo = `${probabilidad.toFixed(0)}%`;
  }

  // Convierte los índices en coordenadas.
  const coordenada =
    String.fromCharCode(65 + columna) + (fila + 1);

  // Construye la descripción accesible.
  let descripcion = estado;

  if (barcoVisible) {
    descripcion = "barco";
  } else if (estado === "sin-disparo") {
    descripcion = "sin atacar";
  }

  // Añade el porcentaje cuando está disponible.
  if (mostrarProbabilidad) {
    descripcion +=
      `, probabilidad estimada ${probabilidad.toFixed(2)}%`;
  }

  // Identifica la posición recomendada.
  if (esRecomendada) {
    descripcion += ", posición recomendada";
  }

  // Aplica el color calculado sin modificar otros estados.
  const estilo = mostrarProbabilidad
    ? {
        background: colorProbabilidad,
        color: colorTexto
      }
    : undefined;

  return (
    <button
      type="button"
      className={
        `celda celda--${estado}` +
        (barcoVisible ? " celda--barco" : "") +
        (mostrarProbabilidad ? " celda--probabilidad" : "") +
        (esRecomendada ? " celda--recomendada" : "")
      }
      style={estilo}
      onClick={() => alSeleccionar?.(fila, columna)}
      disabled={estaDeshabilitada}
      aria-label={`Celda ${coordenada}: ${descripcion}`}
      title={`${coordenada}: ${descripcion}`}
    >
      {simbolo}
    </button>
  );
}

export default Celda;
