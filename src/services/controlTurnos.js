
/*
 * Archivo: controlTurnos.js
 *
 * Descripción:
 * Controla los turnos del jugador y de la máquina
 * durante una partida de Batalla Naval.
 *
 * Permite iniciar los turnos, comprobar quién puede
 * disparar, cambiar el turno y finalizar la partida.
 */

/**
 * Función: iniciarTurnos
 *
 * Descripción:
 * Crea el estado inicial de los turnos.
 * El jugador comienza la partida.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * @returns {Object} Estado inicial de la partida.
 */
export function iniciarTurnos() {

  // Establece las condiciones iniciales.
  return {
    turnoActual: "jugador",
    finalizada: false,
    ganador: null,
    turnosCompletados: 0
  };
}

/**
 * Función: puedeDisparar
 *
 * Descripción:
 * Comprueba si el participante indicado puede
 * realizar un disparo durante el turno actual.
 *
 * Entradas:
 * @param {Object} control - Estado de los turnos.
 * @param {string} participante - Jugador o máquina.
 *
 * Retorno:
 * @returns {boolean} Indica si puede disparar.
 */
export function puedeDisparar(control, participante) {

  // Comprueba si el participante es válido.
  if (participante !== "jugador" && participante !== "maquina") {
    return false;
  }

  // Compara el participante con el turno actual.
  return (
    !control.finalizada &&
    control.turnoActual === participante
  );
}


/**
 * Función: cambiarTurno
 *
 * Descripción:
 * Controla el cambio de turno según el resultado
 * del disparo. Si el participante acierta, puede
 * continuar disparando. Si falla, pierde el turno.
 *
 * Entradas:
 * @param {Object} control - Estado actual de los turnos.
 * @param {string} resultadoDisparo - Resultado del disparo.
 *
 * Retorno:
 * @returns {Object} Estado actualizado de los turnos.
 */
export function cambiarTurno(control, resultadoDisparo) {

  // Comprueba si la partida ya terminó.
  if (control.finalizada) {
    return control;
  }

  // Comprueba si el resultado corresponde a un disparo válido.
  if (
    resultadoDisparo !== "agua" &&
    resultadoDisparo !== "impacto" &&
    resultadoDisparo !== "hundido"
  ) {
    return control;
  }

  // Conserva el turno si el disparo acertó.
  if (
    resultadoDisparo === "impacto" ||
    resultadoDisparo === "hundido"
  ) {
    return control;
  }

  // Cambia el turno cuando el disparo cae en agua.
  const siguienteTurno =
    control.turnoActual === "jugador" ? "maquina" : "jugador";

  // Actualiza el turno y su contador.
  return {
    ...control,
    turnoActual: siguienteTurno,
    turnosCompletados: control.turnosCompletados + 1
  };
}


/**
 * Función: finalizarPartida
 *
 * Descripción:
 * Finaliza la partida y registra al ganador
 * cuando todos los barcos del rival fueron hundidos.
 *
 * Entradas:
 * @param {Object} control - Estado actual de los turnos.
 * @param {string} ganador - Jugador o máquina.
 *
 * Retorno:
 * @returns {Object} Estado final de la partida.
 */
export function finalizarPartida(control, ganador) {

  // Comprueba si la partida terminó o el ganador es inválido.
  if (
    control.finalizada ||
    (ganador !== "jugador" && ganador !== "maquina")
  ) {
    return control;
  }

  // Registra al ganador y finaliza la partida.
  return {
    ...control,
    finalizada: true,
    ganador
  };
}
