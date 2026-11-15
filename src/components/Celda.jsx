
/**
 * Componente Celda
 *
 * Representa una celda individual de un tablero
 * de Batalla Naval.
 *
 * Este componente no administra el estado de la partida.
 * Recibe la información y comunica los clics al padre.
 */

function Celda({fila, columna, estado = "sin-disparo", tieneBarco = false, mostrarBarco = false,
  alSeleccionar, deshabilitada = false}) {
  // Determina si la celda ya fue atacada.
  const fueAtacada = estado !== "sin-disparo";

  // Evita disparos repetidos o interacciones no permitidas.
  const estaDeshabilitada =
    deshabilitada ||
    fueAtacada ||
    typeof alSeleccionar !== "function";

  // Los barcos solamente se muestran cuando está permitido.
  const barcoVisible =
    mostrarBarco && tieneBarco && !fueAtacada;

  // Símbolo que representa el contenido visible.
  let simbolo = "";

  if (estado === "agua") {
    simbolo = "•";
  } else if (estado === "impacto") {
    simbolo = "✕";
  } else if (estado === "hundido") {
    simbolo = "✖";
  } else if (barcoVisible) {
    simbolo = "■";
  }

  // Convierte los índices del tablero a coordenadas.
  // Por ejemplo: columna 3, fila 6 -> D7.
  const coordenada =
    String.fromCharCode(65 + columna) + (fila + 1);

  const descripcion = barcoVisible
    ? "barco"
    : estado === "sin-disparo"
      ? "sin atacar"
      : estado;

  return (
    <button
      type="button"
      className={`celda celda--${estado}${
        barcoVisible ? " celda--barco" : ""
      }`}
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
