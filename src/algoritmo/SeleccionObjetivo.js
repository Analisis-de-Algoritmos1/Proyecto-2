
/**
 * Clase: SeleccionObjetivo
 *
 * Descripción:
 * Selecciona la mejor celda disponible para
 * realizar el siguiente disparo en Batalla Naval.
 *
 * Utiliza el mapa de probabilidades calculado
 * a partir de configuraciones válidas.
 *
 * Entrada:
 * - Matriz de probabilidades del tablero.
 * - Resultados conocidos de disparos anteriores.
 *
 * Salida:
 * - Objeto con fila, columna, coordenada y
 *   probabilidad del objetivo recomendado.
 * - null si no quedan celdas disponibles
 *   o no existe una estimación válida.
 *
 * Importante:
 * No consulta la posición real de los barcos.
 * Solo utiliza las probabilidades estimadas
 * y la información de los disparos realizados.
 */
export class SeleccionObjetivo {

  /**
   * Función: constructor
   *
   * Descripción:
   * Inicializa el selector de objetivos.
   *
   * Entrada:
   * - tamanoTablero: tamaño del tablero (10 por defecto).
   *
   * Salida:
   * - Instancia de SeleccionObjetivo.
   */
  constructor(tamanoTablero = 10) {
    this.tamanoTablero = tamanoTablero;
  }

  /**
   * Función: obtenerCeldasAtacadas
   *
   * Descripción:
   * Identifica todas las posiciones que
   * ya recibieron un disparo.
   *
   * Entrada:
   * - resultados: objeto con:
   *   agua, impactos y hundidos.
   *
   * Salida:
   * - Set con posiciones en formato "fila,columna".
   */
  obtenerCeldasAtacadas(resultados = {}) {

    const atacadas = new Set();

    // Agregamos las celdas donde hubo agua.
    for (const celda of resultados.agua ?? []) {
      atacadas.add(`${celda.fila},${celda.columna}`);
    }

    // Agregamos las celdas donde hubo impacto.
    for (const celda of resultados.impactos ?? []) {
      atacadas.add(`${celda.fila},${celda.columna}`);
    }

    // Agregamos todas las celdas de barcos hundidos.
    for (const barco of resultados.hundidos ?? []) {
      for (const celda of barco.celdas) {
        atacadas.add(`${celda.fila},${celda.columna}`);
      }
    }

    return atacadas;
  }

  /**
   * Función: convertirCoordenada
   *
   * Descripción:
   * Convierte una posición numérica del tablero
   * a una coordenada fácil de mostrar al usuario.
   *
   * Entrada:
   * - fila: posición de fila desde cero.
   * - columna: posición de columna desde cero.
   *
   * Salida:
   * - Cadena como "A1", "C5" o "J10".
   *
   * Convención:
   * - Las filas se representan con letras.
   * - Las columnas se representan desde 1.
   */
  convertirCoordenada(fila, columna) {

    const letra = String.fromCharCode(65 + fila);

    return `${letra}${columna + 1}`;
  }

  /**
   * Función: seleccionar
   *
   * Descripción:
   * Busca la mayor probabilidad dentro del mapa
   * y recomienda una celda que no haya sido atacada.
   *
   * Si existen varias celdas con el mismo valor
   * máximo, elige una de ellas aleatoriamente.
   *
   * Entrada:
   * - mapaProbabilidades: matriz de valores entre 0 y 1.
   * - resultados: historial de disparos conocidos.
   * - hayEstimacion: indica si la matriz se calculó
   *   con al menos una configuración válida.
   *
   * Salida:
   * - Objeto con:
   *   fila: índice de fila.
   *   columna: índice de columna.
   *   coordenada: posición como "E5".
   *   probabilidad: valor decimal de 0 a 1.
   *   porcentaje: probabilidad expresada en %.
   * - null si no existe una recomendación válida.
   */
  seleccionar(
    mapaProbabilidades,
    resultados = {},
    hayEstimacion = true
  ) {

    // No podemos recomendar sin una estimación válida.
    if (!hayEstimacion) {
      return null;
    }

    // Verificamos que recibimos una matriz.
    if (
      !Array.isArray(mapaProbabilidades) ||
      mapaProbabilidades.length !== this.tamanoTablero
    ) {
      throw new Error("El mapa de probabilidades no es válido.");
    }

    // Verificamos sus columnas y probabilidades.
    for (const fila of mapaProbabilidades) {

      if (
        !Array.isArray(fila) ||
        fila.length !== this.tamanoTablero ||
        fila.some(
          valor =>
            typeof valor !== "number" ||
            !Number.isFinite(valor) ||
            valor < 0 ||
            valor > 1
        )
      ) {
        throw new Error(
          "El mapa contiene dimensiones o valores incorrectos."
        );
      }
    }

    // Identificamos las celdas ya utilizadas.
    const atacadas = this.obtenerCeldasAtacadas(resultados);

    let mayorProbabilidad = -1;
    let mejoresCeldas = [];

    // Recorremos todo el tablero.
    for (let fila = 0; fila < this.tamanoTablero; fila++) {

      for (let columna = 0; columna < this.tamanoTablero; columna++) {

        const clave = `${fila},${columna}`;

        // No recomendamos posiciones ya atacadas.
        if (atacadas.has(clave)) {
          continue;
        }

        const probabilidad = mapaProbabilidades[fila][columna];

        // Utilizamos una tolerancia para comparar
        // valores decimales prácticamente iguales.
        const tolerancia = 1e-12;

        // Encontramos una probabilidad mayor.
        if (probabilidad > mayorProbabilidad + tolerancia) {

          mayorProbabilidad = probabilidad;

          // Reiniciamos las mejores posiciones.
          mejoresCeldas = [{ fila, columna }];
        }

        // Encontramos otra celda con la misma probabilidad.
        else if (
          Math.abs(probabilidad - mayorProbabilidad) <= tolerancia
        ) {
          mejoresCeldas.push({ fila, columna });
        }
      }
    }

    // Todas las posiciones ya fueron atacadas.
    if (mejoresCeldas.length === 0) {
      return null;
    }

    // Desempate aleatorio entre las mejores celdas.
    const indiceAleatorio = Math.floor(
      Math.random() * mejoresCeldas.length
    );

    const mejorCelda = mejoresCeldas[indiceAleatorio];

    // Convertimos a una coordenada visual.
    const coordenada = this.convertirCoordenada(
      mejorCelda.fila,
      mejorCelda.columna
    );

    // Convertimos la probabilidad en porcentaje.
    const porcentaje =
      Math.round(mayorProbabilidad * 10000) / 100;

    // Devolvemos la recomendación.
    return {
      fila: mejorCelda.fila,
      columna: mejorCelda.columna,
      coordenada,
      probabilidad: mayorProbabilidad,
      porcentaje
    };
  }
}
