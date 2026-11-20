
import "../styles/panelHistorial.css";

/**
 * Función: convertirCoordenada
 *
 * Descripción:
 * Convierte una posición de matriz a una coordenada
 * de Batalla Naval, por ejemplo: fila 1, columna 3 = D2.
 *
 * Entradas:
 * @param {number} fila - Fila de la matriz.
 * @param {number} columna - Columna de la matriz.
 *
 * Retorno:
 * Coordenada en formato letra y número.
 */
function convertirCoordenada(fila, columna) {
  const letra = String.fromCharCode(65 + columna);

  return `${letra}${fila + 1}`;
}

/**
 * Función: obtenerResultado
 *
 * Descripción:
 * Convierte el resultado interno de un disparo
 * en un texto comprensible para el usuario.
 *
 * Entradas:
 * @param {string} resultado - Resultado del disparo.
 *
 * Retorno:
 * Descripción del resultado.
 */
function obtenerResultado(resultado) {
  if (resultado === "agua") {
    return "Agua";
  }

  if (resultado === "impacto") {
    return "Impacto";
  }

  if (resultado === "hundido") {
    return "Barco hundido";
  }

  return resultado ?? "Sin resultado";
}

/**
 * Función: PanelHistorial
 *
 * Descripción:
 * Muestra los disparos realizados por ambos participantes
 * y registra si el jugador siguió la recomendación
 * probabilística disponible antes de atacar.
 *
 * Entradas:
 * @param {Object} propiedades - Propiedades del componente.
 * @param {Array} propiedades.historial - Movimientos registrados.
 *
 * Retorno:
 * Panel con el historial y resumen de decisiones.
 */
function PanelHistorial({ historial = [] }) {

  // Obtiene únicamente los movimientos del jugador
  // que tenían una recomendación disponible.
  const decisionesEvaluadas = historial.filter(
    (movimiento) =>
      movimiento.participante === "Jugador" &&
      movimiento.siguioRecomendacion !== null
  );

  // Cuenta las ocasiones en que siguió la recomendación.
  const recomendacionesSeguidas = decisionesEvaluadas.filter(
    (movimiento) => movimiento.siguioRecomendacion === true
  ).length;

  // Cuenta las ocasiones en que eligió otra posición.
  const recomendacionesIgnoradas =
    decisionesEvaluadas.length - recomendacionesSeguidas;

  return (
    <section className="panel-historial">

      <h2>Historial de decisiones</h2>

      <p className="panel-historial__descripcion">
        Registro de los disparos realizados durante
        la partida y de las recomendaciones del algoritmo.
      </p>

      {/* Resumen de las decisiones del jugador. */}
      <div className="panel-historial__resumen">

        <p>
          Recomendaciones seguidas:{" "}
          <strong>{recomendacionesSeguidas}</strong>
        </p>

        <p>
          Recomendaciones ignoradas:{" "}
          <strong>{recomendacionesIgnoradas}</strong>
        </p>

      </div>

      {/* Mensaje mostrado antes de realizar disparos. */}
      {historial.length === 0 ? (

        <p className="panel-historial__vacio">
          Todavía no se han realizado disparos.
        </p>

      ) : (

        <div className="panel-historial__contenido">

          <table className="panel-historial__tabla">

            <thead>
              <tr>
                <th scope="col">N.º</th>
                <th scope="col">Participante</th>
                <th scope="col">Disparo</th>
                <th scope="col">Resultado</th>
                <th scope="col">Recomendación previa</th>
                <th scope="col">Decisión</th>
              </tr>
            </thead>

            <tbody>

              {historial.map((movimiento, indice) => (

                <tr key={indice}>

                  <td>{indice + 1}</td>

                  <td>{movimiento.participante}</td>

                  <td>
                    {convertirCoordenada(
                      movimiento.fila,
                      movimiento.columna
                    )}
                  </td>

                  <td>
                    {obtenerResultado(movimiento.resultado)}
                  </td>

                  <td>
                    {movimiento.recomendacion ?? "—"}
                  </td>

                  <td>
                    {movimiento.participante === "Máquina"
                      ? "Automático"
                      : movimiento.siguioRecomendacion === null
                        ? "Sin análisis previo"
                        : movimiento.siguioRecomendacion
                          ? "Sí"
                          : "No"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      <p className="panel-historial__nota">
        La recomendación registrada corresponde al análisis
        disponible antes de cada disparo del jugador.
      </p>

    </section>
  );
}

export default PanelHistorial;
