
import { useEffect, useRef, useState } from "react";

import Tablero from "./components/Tablero";
import PanelExperimentos from "./components/PanelExperimentos";
import PanelEstadisticas from "./components/PanelEstadisticas";
import PanelHistorial from "./components/PanelHistorial";

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
import { MotorProbabilistico } from "./algoritmo/MotorProbabilistico";
import { adaptarResultadoParaAgente } from "./services/adaptadorResultados";

// Cantidad de simulaciones utilizada al iniciar la aplicación.
const SIMULACIONES_INICIALES = 1000;

// Cantidades de simulaciones disponibles durante la partida.
const OPCIONES_SIMULACIONES = [
  100,
  1000,
  5000,
  10000
];

/**
 * Función: crearTableroAleatorio
 *
 * Descripción:
 * Genera una flota aleatoria y construye la matriz
 * correspondiente al tablero de Batalla Naval.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Matriz con los barcos colocados aleatoriamente.
 */
function crearTableroAleatorio() {

  const flota = generarFlotaAleatoria(
    TIPOS_BARCOS,
    TAMANO_TABLERO
  );

  return convertirFlotaAMatriz(
    flota,
    TAMANO_TABLERO
  );
}

/**
 * Función: crearTablerosIniciales
 *
 * Descripción:
 * Genera dos tableros independientes:
 * uno para el jugador y otro para la máquina.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Objeto con ambos tableros.
 */
function crearTablerosIniciales() {

  return {
    jugador: crearTableroAleatorio(),
    maquina: crearTableroAleatorio()
  };
}

/**
 * Función: crearConocimientoVacio
 *
 * Descripción:
 * Inicializa la información que puede utilizar
 * el motor probabilístico del jugador.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Objeto sin resultados conocidos.
 */
function crearConocimientoVacio() {

  return {
    agua: [],
    impactos: [],
    hundidos: []
  };
}

/**
 * Función: actualizarConocimientoJugador
 *
 * Descripción:
 * Incorpora un nuevo resultado al conocimiento
 * probabilístico del jugador.
 *
 * No utiliza la ubicación oculta de los barcos,
 * solamente los resultados de disparos realizados.
 *
 * Entradas:
 * @param {Object} conocimiento - Información anterior.
 * @param {Object} resultado - Resultado del disparo.
 * @param {number} fila - Fila atacada.
 * @param {number} columna - Columna atacada.
 *
 * Retorno:
 * Conocimiento actualizado.
 */
function actualizarConocimientoJugador(
  conocimiento,
  resultado,
  fila,
  columna
) {

  // Guarda la posición del disparo.
  const celda = { fila, columna };

  // Registra un disparo que cayó al agua.
  if (resultado.tipo === "agua") {

    return {
      ...conocimiento,
      agua: [...conocimiento.agua, celda]
    };
  }

  // Registra un impacto sobre un barco no hundido.
  if (resultado.tipo === "impacto") {

    return {
      ...conocimiento,
      impactos: [...conocimiento.impactos, celda]
    };
  }

  // Registra un barco completamente hundido.
  if (resultado.tipo === "hundido") {

    // Obtiene las posiciones del barco hundido.
    const celdasHundidas = resultado.celdas.map(
      (posicion) => ({
        fila: posicion.fila,
        columna: posicion.columna
      })
    );

    // Identifica las posiciones del barco hundido.
    const posicionesHundidas = new Set(
      celdasHundidas.map(
        (posicion) =>
          `${posicion.fila},${posicion.columna}`
      )
    );

    // Elimina los impactos que ya pertenecen
    // a un barco completamente hundido.
    const impactosPendientes = conocimiento.impactos.filter(
      (posicion) =>
        !posicionesHundidas.has(
          `${posicion.fila},${posicion.columna}`
        )
    );

    return {
      ...conocimiento,
      impactos: impactosPendientes,
      hundidos: [
        ...conocimiento.hundidos,
        {
          nombre: resultado.nombre,
          celdas: celdasHundidas
        }
      ]
    };
  }

  return conocimiento;
}

/**
 * Función: estanTodosLosBarcosHundidos
 *
 * Descripción:
 * Comprueba si todas las celdas que contienen
 * barcos fueron alcanzadas.
 *
 * Entradas:
 * @param {Array} matriz - Tablero que se comprobará.
 *
 * Retorno:
 * true si toda la flota fue alcanzada.
 */
function estanTodosLosBarcosHundidos(matriz) {

  // Obtiene las celdas ocupadas por barcos.
  const celdasConBarco = matriz.flat().filter(
    (celda) => celda.tieneBarco
  );

  // Impide declarar victoria si no existe una flota.
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
 * Función: convertirCoordenada
 *
 * Descripción:
 * Convierte una posición de matriz a una coordenada
 * de Batalla Naval, por ejemplo H2.
 *
 * Entradas:
 * @param {number} fila - Fila.
 * @param {number} columna - Columna.
 *
 * Retorno:
 * Coordenada de Batalla Naval.
 */
function convertirCoordenada(fila, columna) {

  const letra = String.fromCharCode(65 + columna);

  return `${letra}${fila + 1}`;
}

/**
 * Función: App
 *
 * Descripción:
 * Administra los tableros, turnos, disparos,
 * análisis probabilísticos, estadísticas,
 * historial de decisiones y experimentos.
 *
 * Permite configurar la cantidad de simulaciones
 * utilizada por ambos motores probabilísticos.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Interfaz principal del juego.
 */
function App() {

  // Guarda los tableros de ambos participantes.
  const [tableros, setTableros] = useState(
    crearTablerosIniciales
  );

  // Guarda el estado de la partida.
  const [turnos, setTurnos] = useState(iniciarTurnos);

  // NUEVO: cantidad de simulaciones seleccionada.
  const [cantidadSimulaciones, setCantidadSimulaciones] =
    useState(SIMULACIONES_INICIALES);

  // Guarda el último análisis probabilístico del jugador.
  const [analisisJugador, setAnalisisJugador] = useState(null);

  // Guarda el historial de decisiones de ambos participantes.
  const [historial, setHistorial] = useState([]);

  // Conserva el agente automático de la máquina.
  const agenteRef = useRef(null);

  // Conserva el motor probabilístico del jugador.
  const motorJugadorRef = useRef(null);

  // Conserva los resultados conocidos por el jugador.
  const conocimientoJugadorRef = useRef(
    crearConocimientoVacio()
  );

  // Inicializa el agente automático.
  if (agenteRef.current === null) {

    agenteRef.current = new AgenteAutomatico(
      TAMANO_TABLERO,
      SIMULACIONES_INICIALES
    );
  }

  // Inicializa el motor probabilístico del jugador.
  if (motorJugadorRef.current === null) {

    motorJugadorRef.current = new MotorProbabilistico(
      TAMANO_TABLERO
    );
  }

  /**
   * Función: reiniciarTableros
   *
   * Descripción:
   * Inicia una nueva partida y reinicia:
   * - Las flotas.
   * - Los turnos.
   * - El agente automático.
   * - El conocimiento del jugador.
   * - El mapa probabilístico.
   * - El historial de decisiones.
   *
   * También permite configurar la cantidad
   * de simulaciones de la nueva partida.
   *
   * Entradas:
   * @param {number} nuevaCantidad - Simulaciones deseadas.
   *
   * Retorno:
   * No retorna valores.
   */
  function reiniciarTableros(
    nuevaCantidad = cantidadSimulaciones
  ) {

    // Verifica que la cantidad esté permitida.
    if (!OPCIONES_SIMULACIONES.includes(nuevaCantidad)) {
      return;
    }

    // Guarda la cantidad de simulaciones seleccionada.
    setCantidadSimulaciones(nuevaCantidad);

    // Genera nuevas flotas independientes.
    setTableros(crearTablerosIniciales());

    // Reinicia el control de turnos.
    setTurnos(iniciarTurnos());

    // NUEVO: crea un agente con la cantidad seleccionada.
    // Esto también elimina su conocimiento anterior.
    agenteRef.current = new AgenteAutomatico(
      TAMANO_TABLERO,
      nuevaCantidad
    );

    // Reinicia el motor independiente del jugador.
    motorJugadorRef.current = new MotorProbabilistico(
      TAMANO_TABLERO
    );

    // Elimina los resultados conocidos anteriormente.
    conocimientoJugadorRef.current =
      crearConocimientoVacio();

    // Oculta las probabilidades hasta el primer disparo.
    setAnalisisJugador(null);

    // Elimina el historial de la partida anterior.
    setHistorial([]);
  }

  /**
   * Función: cambiarCantidadSimulaciones
   *
   * Descripción:
   * Recibe la nueva cantidad seleccionada
   * e inicia una partida con esa configuración.
   *
   * Entradas:
   * @param {Object} evento - Cambio del selector.
   *
   * Retorno:
   * No retorna valores.
   */
  function cambiarCantidadSimulaciones(evento) {

    // Convierte el valor seleccionado a número.
    const nuevaCantidad = Number(evento.target.value);

    // Evita reiniciar cuando se selecciona
    // la misma cantidad de simulaciones.
    if (nuevaCantidad === cantidadSimulaciones) {
      return;
    }

    // Reinicia la partida con la nueva cantidad.
    reiniciarTableros(nuevaCantidad);
  }

  /**
   * Función: manejarDisparoJugador
   *
   * Descripción:
   * Procesa el disparo del jugador, registra su decisión,
   * actualiza el tablero enemigo y calcula las
   * probabilidades utilizando la cantidad configurada.
   *
   * Entradas:
   * @param {number} fila - Fila seleccionada.
   * @param {number} columna - Columna seleccionada.
   *
   * Retorno:
   * No retorna valores.
   */
  function manejarDisparoJugador(fila, columna) {

    // Comprueba que sea el turno del jugador.
    if (
      turnos.finalizada ||
      !puedeDisparar(turnos, "jugador")
    ) {
      return;
    }

    // Ejecuta el disparo contra la flota enemiga.
    const disparo = procesarDisparo(
      tableros.maquina,
      fila,
      columna
    );

    // Ignora disparos inválidos o repetidos.
    if (!disparo.valido) {
      return;
    }

    // Conserva la recomendación disponible
    // antes de ejecutar el disparo.
    const recomendacionPrevia =
      analisisJugador?.recomendacion ?? null;

    // Identifica si el jugador siguió la recomendación.
    const siguioRecomendacion = recomendacionPrevia
      ? (
          recomendacionPrevia.fila === fila &&
          recomendacionPrevia.columna === columna
        )
      : null;

    // Actualiza el tablero enemigo.
    setTableros((anteriores) => ({
      ...anteriores,
      maquina: disparo.matriz
    }));

    // Obtiene el resultado conocido por el jugador.
    const resultado = adaptarResultadoParaAgente(
      disparo,
      fila,
      columna
    );

    // Registra el movimiento en el historial.
    setHistorial((anteriores) => [
      ...anteriores,
      {
        participante: "Jugador",
        fila,
        columna,
        resultado: resultado.tipo,
        recomendacion: recomendacionPrevia
          ? convertirCoordenada(
              recomendacionPrevia.fila,
              recomendacionPrevia.columna
            )
          : null,
        siguioRecomendacion
      }
    ]);

    // Actualiza el conocimiento del jugador.
    const nuevoConocimiento = actualizarConocimientoJugador(
      conocimientoJugadorRef.current,
      resultado,
      fila,
      columna
    );

    // Conserva los resultados para futuros análisis.
    conocimientoJugadorRef.current = nuevoConocimiento;

    // Comprueba si el jugador ganó.
    if (estanTodosLosBarcosHundidos(disparo.matriz)) {

      // Oculta el análisis al finalizar la partida.
      setAnalisisJugador(null);

      // Declara ganador al jugador.
      setTurnos((anterior) =>
        finalizarPartida(anterior, "jugador")
      );

      return;
    }

    // NUEVO: utiliza la cantidad seleccionada
    // para calcular las probabilidades del jugador.
    const nuevoAnalisis = motorJugadorRef.current.analizar(
      nuevoConocimiento,
      cantidadSimulaciones
    );

    // Actualiza el mapa y las métricas.
    setAnalisisJugador(nuevoAnalisis);

    // Conserva el turno si acierta y lo cambia si falla.
    setTurnos((anterior) =>
      cambiarTurno(anterior, disparo.resultado)
    );
  }

  /**
   * Efecto: ejecutarDisparoMaquina
   *
   * Descripción:
   * Ejecuta automáticamente el turno de la máquina,
   * actualiza el tablero del jugador y registra
   * las decisiones realizadas por el agente.
   *
   * El agente ya fue creado utilizando la cantidad
   * de simulaciones seleccionada para la partida.
   *
   * Retorno:
   * Cancela el temporizador cuando corresponde.
   */
  useEffect(() => {

    // Comprueba si corresponde disparar a la máquina.
    if (
      turnos.finalizada ||
      !puedeDisparar(turnos, "maquina")
    ) {
      return;
    }

    // Programa el disparo con una pausa visual.
    const temporizador = setTimeout(() => {

      // Guarda el tablero después del disparo.
      let matrizActualizada = null;

      // Guarda el movimiento seleccionado por la máquina.
      let movimientoMaquina = null;

      // Ejecuta el turno del agente probabilístico.
      const registro = agenteRef.current.ejecutarTurno(
        (fila, columna) => {

          // Procesa el disparo contra el jugador.
          const disparo = procesarDisparo(
            tableros.jugador,
            fila,
            columna
          );

          // Comprueba que el disparo sea válido.
          if (!disparo.valido) {

            throw new Error(
              "La máquina realizó un disparo inválido."
            );
          }

          // Conserva la matriz actualizada.
          matrizActualizada = disparo.matriz;

          // Obtiene el resultado conocido por el agente.
          const resultado = adaptarResultadoParaAgente(
            disparo,
            fila,
            columna
          );

          // Registra la decisión automática.
          movimientoMaquina = {
            participante: "Máquina",
            fila,
            columna,
            resultado: resultado.tipo,
            recomendacion: null,
            siguioRecomendacion: null
          };

          // Comunica el resultado al agente.
          return resultado;
        }
      );

      // Comprueba que el agente haya realizado un disparo.
      if (
        registro === null ||
        matrizActualizada === null
      ) {
        return;
      }

      // Actualiza el tablero propio del jugador.
      setTableros((anteriores) => ({
        ...anteriores,
        jugador: matrizActualizada
      }));

      // Agrega la decisión de la máquina al historial.
      if (movimientoMaquina !== null) {

        setHistorial((anteriores) => [
          ...anteriores,
          movimientoMaquina
        ]);
      }

      // Comprueba si la máquina ganó.
      if (estanTodosLosBarcosHundidos(matrizActualizada)) {

        setAnalisisJugador(null);

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

    // Cancela el disparo programado si cambia la partida.
    return () => clearTimeout(temporizador);

  }, [turnos, tableros]);

  return (
    <main className="pantalla-juego">

      <header className="encabezado-juego">

        <h1>Batalla Naval</h1>

        <p>Jugador contra máquina</p>

        {/* Muestra el ganador o el turno actual. */}
        {turnos.finalizada ? (

          <p role="status">
            {turnos.ganador === "jugador"
              ? "¡Ganaste! Hundiste todos los barcos enemigos."
              : "¡La máquina ganó! Hundió todos tus barcos."}
          </p>

        ) : (

          <p>
            Turno actual:{" "}
            {turnos.turnoActual === "jugador"
              ? "Jugador"
              : "Máquina"}
          </p>

        )}

        {/* NUEVO: configuración de simulaciones. */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            margin: "18px 0"
          }}
        >

          <label htmlFor="cantidad-simulaciones">
            Simulaciones por análisis:
          </label>

          <select
            id="cantidad-simulaciones"
            value={cantidadSimulaciones}
            onChange={cambiarCantidadSimulaciones}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #22a7e0",
              backgroundColor: "#102b41",
              color: "#ffffff",
              fontSize: "1rem",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >

            {OPCIONES_SIMULACIONES.map((cantidad) => (

              <option
                key={cantidad}
                value={cantidad}
              >
                {cantidad.toLocaleString("es-CR")}
              </option>

            ))}

          </select>

        </div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "#a9d6ec"
          }}
        >
          Cambiar las simulaciones inicia una nueva partida.
        </p>

        {/* Permite generar una nueva partida
            conservando la cantidad seleccionada. */}
        <button
          type="button"
          onClick={() => reiniciarTableros()}
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

        {/* Tablero enemigo con mapa probabilístico. */}
        <Tablero
          titulo="Barcos enemigos"
          celdas={tableros.maquina}
          mostrarBarcos={false}
          alSeleccionar={manejarDisparoJugador}
          deshabilitado={
            turnos.finalizada ||
            !puedeDisparar(turnos, "jugador")
          }
          probabilidades={analisisJugador?.porcentajes}
          recomendacion={analisisJugador?.recomendacion}
          analisis={analisisJugador}
        />

      </section>

      {/* Estadísticas de la partida. */}
      <PanelEstadisticas tableros={tableros} />

      {/* Historial de decisiones. */}
      <PanelHistorial historial={historial} />

      {/* Experimentos independientes de la partida. */}
      <PanelExperimentos />

    </main>
  );
}

export default App;
