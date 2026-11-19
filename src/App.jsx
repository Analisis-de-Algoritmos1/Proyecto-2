
import { useEffect, useRef, useState } from "react";

import Tablero from "./components/Tablero";
import "./styles/juego.css";

import { TAMANO_TABLERO, TIPOS_BARCOS } from "./config/flota";
import { generarFlotaAleatoria } from "./services/generadorFlota";
import { convertirFlotaAMatriz } from "./services/matrizFlota";
import { procesarDisparo } from "./services/logicaDisparos";

import {
  iniciarTurnos,
  puedeDisparar,
  cambiarTurno,
  finalizarPartida
} from "./services/controlTurnos";

import { AgenteAutomatico } from "./algoritmo/AgenteAutomatico";
import { adaptarResultadoParaAgente } from "./services/adaptadorResultados";

/**
 * Función: crearTableroAleatorio
 *
 * Descripción:
 * Genera una flota aleatoria y la convierte en
 * una matriz para representar el tablero.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Matriz con los barcos colocados aleatoriamente.
 */
function crearTableroAleatorio() {

  // Genera las posiciones de los barcos.
  const flota = generarFlotaAleatoria(
    TIPOS_BARCOS,
    TAMANO_TABLERO
  );

  // Convierte la flota en una matriz.
  return convertirFlotaAMatriz(flota, TAMANO_TABLERO);
}

/**
 * Función: crearTablerosIniciales
 *
 * Descripción:
 * Crea tableros independientes para el jugador
 * y para la máquina.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Objeto con las matrices de ambos tableros.
 */
function crearTablerosIniciales() {

  // Genera una flota para cada participante.
  return {
    jugador: crearTableroAleatorio(),
    maquina: crearTableroAleatorio()
  };
}

/**
 * Función: estanTodosLosBarcosHundidos
 *
 * Descripción:
 * Comprueba si todas las celdas que contienen
 * barcos ya fueron alcanzadas por disparos.
 *
 * Entradas:
 * @param {Array} matriz - Tablero que se comprobará.
 *
 * Retorno:
 * true si todos los barcos fueron alcanzados;
 * false si todavía quedan partes sin alcanzar.
 */
function estanTodosLosBarcosHundidos(matriz) {

  // Obtiene las celdas que contienen barcos.
  const celdasConBarco = matriz.flat().filter(
    (celda) => celda.tieneBarco
  );

  // Evita considerar ganadora una flota vacía.
  if (celdasConBarco.length === 0) {
    return false;
  }

  // Comprueba que todas las partes fueron alcanzadas.
  return celdasConBarco.every(
    (celda) =>
      celda.estado === "impacto" ||
      celda.estado === "hundido"
  );
}

/**
 * Función: App
 *
 * Descripción:
 * Administra los tableros, los disparos,
 * los turnos y la finalización de la partida.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Interfaz principal del juego.
 */
function App() {

  // Guarda los tableros de los dos participantes.
  const [tableros, setTableros] = useState(crearTablerosIniciales);

  // Guarda el turno, el ganador y el estado de la partida.
  const [turnos, setTurnos] = useState(iniciarTurnos);

  // Conserva el agente durante toda la partida.
  const agenteRef = useRef(null);

  // Crea el agente si todavía no existe.
  if (agenteRef.current === null) {
    agenteRef.current = new AgenteAutomatico(
      TAMANO_TABLERO,
      1000
    );
  }

  /**
   * Función: reiniciarTableros
   *
   * Descripción:
   * Inicia una nueva partida, genera nuevas flotas
   * y reinicia el conocimiento del agente.
   *
   * Entradas:
   * No recibe parámetros.
   *
   * Retorno:
   * No retorna valores.
   */
  function reiniciarTableros() {

    // Genera nuevas flotas.
    setTableros(crearTablerosIniciales());

    // Reinicia los turnos y elimina el ganador anterior.
    setTurnos(iniciarTurnos());

    // Borra los disparos conocidos por el agente.
    agenteRef.current.reiniciar();
  }

  /**
   * Función: manejarDisparoJugador
   *
   * Descripción:
   * Procesa el disparo del jugador, actualiza
   * el tablero enemigo y comprueba si ganó.
   *
   * Entradas:
   * @param {number} fila - Fila seleccionada.
   * @param {number} columna - Columna seleccionada.
   *
   * Retorno:
   * No retorna valores.
   */
  function manejarDisparoJugador(fila, columna) {

    // Comprueba que la partida continúe y sea su turno.
    if (
      turnos.finalizada ||
      !puedeDisparar(turnos, "jugador")
    ) {
      return;
    }

    // Procesa el disparo contra la máquina.
    const disparo = procesarDisparo(
      tableros.maquina,
      fila,
      columna
    );

    // Rechaza disparos inválidos o repetidos.
    if (!disparo.valido) {
      return;
    }

    // Actualiza el tablero de la máquina.
    setTableros((anteriores) => ({
      ...anteriores,
      maquina: disparo.matriz
    }));

    // Comprueba si todos los barcos enemigos fueron alcanzados.
    if (estanTodosLosBarcosHundidos(disparo.matriz)) {

      // Finaliza la partida con victoria del jugador.
      setTurnos((anterior) =>
        finalizarPartida(anterior, "jugador")
      );

      return;
    }

    // Cambia el turno si falla o lo conserva si acierta.
    setTurnos((anterior) =>
      cambiarTurno(anterior, disparo.resultado)
    );
  }

  /**
   * Efecto: ejecutarDisparoMaquina
   *
   * Descripción:
   * Ejecuta los disparos automáticos del agente
   * y comprueba si la máquina gana la partida.
   *
   * Entradas:
   * Utiliza los tableros y el control de turnos.
   *
   * Retorno:
   * Cancela el temporizador cuando corresponde.
   */
  useEffect(() => {

    // Evita disparos si terminó la partida.
    if (
      turnos.finalizada ||
      !puedeDisparar(turnos, "maquina")
    ) {
      return;
    }

    // Programa un disparo con una pausa visual.
    const temporizador = setTimeout(() => {

      // Conserva el tablero resultante del disparo.
      let matrizActualizada = null;

      // El agente selecciona una celda probabilísticamente.
      const registro = agenteRef.current.ejecutarTurno(
        (fila, columna) => {

          // Procesa el disparo sobre el tablero del jugador.
          const disparo = procesarDisparo(
            tableros.jugador,
            fila,
            columna
          );

          // Comprueba si el disparo fue válido.
          if (!disparo.valido) {
            throw new Error(
              "La máquina realizó un disparo inválido."
            );
          }

          // Guarda la matriz actualizada.
          matrizActualizada = disparo.matriz;

          // Comunica el resultado al agente.
          return adaptarResultadoParaAgente(
            disparo,
            fila,
            columna
          );
        }
      );

      // Comprueba que se haya realizado un disparo.
      if (registro === null || matrizActualizada === null) {
        return;
      }

      // Actualiza el tablero del jugador.
      setTableros((anteriores) => ({
        ...anteriores,
        jugador: matrizActualizada
      }));

      // Comprueba si todos los barcos del jugador fueron alcanzados.
      if (estanTodosLosBarcosHundidos(matrizActualizada)) {

        // Finaliza la partida con victoria de la máquina.
        setTurnos((anterior) =>
          finalizarPartida(anterior, "maquina")
        );

        return;
      }

      // Conserva el turno si acierta y lo cambia si falla.
      setTurnos((anterior) =>
        cambiarTurno(anterior, registro.tipo)
      );

    }, 400);

    // Cancela el disparo pendiente si cambia el estado.
    return () => clearTimeout(temporizador);

  }, [turnos, tableros]);

  return (
    <main className="pantalla-juego">

      <header className="encabezado-juego">

        <h1>Batalla Naval</h1>

        <p>Jugador contra máquina</p>

        {/* Muestra el resultado o el turno actual. */}
        {turnos.finalizada ? (

          <p role="status">
            {turnos.ganador === "jugador"
              ? "¡Ganaste! Hundiste todos los barcos enemigos."
              : "¡La máquina ganó! Hundió todos tus barcos."}
          </p>

        ) : (

          <p>
            Turno actual: {
              turnos.turnoActual === "jugador"
                ? "Jugador"
                : "Máquina"
            }
          </p>

        )}

        <button
          type="button"
          onClick={reiniciarTableros}
        >
          Generar nueva partida
        </button>

      </header>

      <section className="tableros-juego">

        {/* Tablero del jugador. */}
        <Tablero
          titulo="Mis barcos"
          celdas={tableros.jugador}
          mostrarBarcos={true}
          deshabilitado={true}
        />

        {/* Tablero enemigo. */}
        <Tablero
          titulo="Barcos enemigos"
          celdas={tableros.maquina}
          mostrarBarcos={false}
          alSeleccionar={manejarDisparoJugador}
          deshabilitado={
            turnos.finalizada ||
            !puedeDisparar(turnos, "jugador")
          }
        />

      </section>

    </main>
  );
}

export default App;
