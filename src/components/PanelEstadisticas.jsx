
import { TIPOS_BARCOS } from "../config/flota";
import "../styles/panelEstadisticas.css";

/**
 * Función: calcularEstadisticas
 *
 * Descripción:
 * Recorre un tablero y calcula los disparos
 * realizados contra él, los impactos, los fallos
 * y la cantidad de barcos hundidos.
 *
 * Entradas:
 * @param {Array} tablero - Matriz que recibió los disparos.
 *
 * Retorno:
 * Objeto con las estadísticas del participante
 * que realizó los ataques.
 */
function calcularEstadisticas(tablero) {

  // Inicializa los contadores.
  let impactos = 0;
  let fallidos = 0;

  // Guarda los identificadores de los barcos hundidos.
  const barcosHundidos = new Set();

  // Recorre todas las filas del tablero.
  for (const fila of tablero) {

    // Recorre las celdas de cada fila.
    for (const celda of fila) {

      // Cuenta los disparos que cayeron en agua.
      if (celda.estado === "agua") {
        fallidos++;
      }

      // Cuenta las partes de barcos alcanzadas.
      if (
        celda.estado === "impacto" ||
        celda.estado === "hundido"
      ) {
        impactos++;
      }

      // Registra cada barco hundido una sola vez.
      if (
        celda.estado === "hundido" &&
        celda.barcoId !== null &&
        celda.barcoId !== undefined
      ) {
        barcosHundidos.add(celda.barcoId);
      }
    }
  }

  // Obtiene la cantidad de barcos de la flota.
  const totalBarcos = TIPOS_BARCOS.length;

  // Calcula las estadísticas finales.
  return {
    disparos: impactos + fallidos,
    impactos,
    fallidos,
    barcosHundidos: barcosHundidos.size,
    barcosRestantes: totalBarcos - barcosHundidos.size
  };
}

/**
 * Función: PanelEstadisticas
 *
 * Descripción:
 * Muestra las estadísticas del jugador y de la
 * máquina a partir de los tableros de la partida.
 *
 * Las estadísticas se actualizan automáticamente
 * cuando cambian los resultados de los disparos.
 *
 * Entradas:
 * @param {Object} propiedades - Propiedades del componente.
 * @param {Object} propiedades.tableros - Tableros de la partida.
 *
 * Retorno:
 * Componente visual con las estadísticas del juego.
 */
function PanelEstadisticas({ tableros }) {

  // Los disparos del jugador se registran en el tablero enemigo.
  const jugador = calcularEstadisticas(tableros.maquina);

  // Los disparos de la máquina se registran en el tablero propio.
  const maquina = calcularEstadisticas(tableros.jugador);

  return (
    <section className="panel-estadisticas">

      <h2>Estadísticas de la partida</h2>

      <p>
        Comparación de los resultados obtenidos
        por el jugador y la máquina.
      </p>

      <div className="panel-estadisticas__contenido">

        <table className="panel-estadisticas__tabla">

          <thead>
            <tr>
              <th scope="col">Estadística</th>
              <th scope="col">Jugador</th>
              <th scope="col">Máquina</th>
            </tr>
          </thead>

          <tbody>

            {/* Cantidad total de disparos realizados. */}
            <tr>
              <th scope="row">Disparos realizados</th>
              <td>{jugador.disparos}</td>
              <td>{maquina.disparos}</td>
            </tr>

            {/* Cantidad de partes de barcos alcanzadas. */}
            <tr>
              <th scope="row">Impactos</th>
              <td>{jugador.impactos}</td>
              <td>{maquina.impactos}</td>
            </tr>

            {/* Disparos que no alcanzaron ningún barco. */}
            <tr>
              <th scope="row">Disparos fallidos</th>
              <td>{jugador.fallidos}</td>
              <td>{maquina.fallidos}</td>
            </tr>

            {/* Barcos completamente hundidos. */}
            <tr>
              <th scope="row">Barcos hundidos</th>
              <td>{jugador.barcosHundidos}</td>
              <td>{maquina.barcosHundidos}</td>
            </tr>

            {/* Barcos que todavía no fueron hundidos. */}
            <tr>
              <th scope="row">Barcos restantes</th>
              <td>{jugador.barcosRestantes}</td>
              <td>{maquina.barcosRestantes}</td>
            </tr>

          </tbody>
        </table>

      </div>

      <p className="panel-estadisticas__nota">
        Los impactos incluyen las partes de barcos hundidos.
      </p>

    </section>
  );
}

export default PanelEstadisticas;
