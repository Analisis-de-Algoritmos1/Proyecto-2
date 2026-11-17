
/**
 * Clase: CalculoProbabilidades
 *
 * Descripción:
 * Calcula la probabilidad estimada de encontrar
 * una parte de un barco en cada celda del tablero.
 *
 * Utiliza configuraciones completas de flotas
 * que ya fueron verificadas y filtradas.
 *
 * Entrada:
 * - Tamaño del tablero.
 * - Arreglo de configuraciones válidas.
 * - Resultados conocidos de disparos anteriores.
 *
 * Salida:
 * - Matriz de probabilidades.
 * - Matriz de frecuencias.
 * - Cantidad de configuraciones utilizadas.
 *
 * Importante:
 * No utiliza las posiciones reales de la flota.
 * Solo trabaja con las simulaciones y los
 * resultados conocidos de los disparos.
 */
export class CalculoProbabilidades {

  /**
   * Función: constructor
   *
   * Descripción:
   * Inicializa el tamaño del tablero.
   *
   * Entrada:
   * - tamanoTablero: número de filas y columnas.
   *
   * Salida:
   * - Instancia configurada de la clase.
   */
  constructor(tamanoTablero = 10) {
    this.tamanoTablero = tamanoTablero;
  }

  /**
   * Función: crearMatriz
   *
   * Descripción:
   * Crea una matriz cuadrada llena de ceros.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Matriz de tamaño 10x10 por defecto.
   */
  crearMatriz() {

    return Array.from(
      { length: this.tamanoTablero },
      () => Array(this.tamanoTablero).fill(0)
    );
  }

  /**
   * Función: obtenerCeldasAtacadas
   *
   * Descripción:
   * Reúne las celdas donde ya se realizó
   * un disparo para evitar recomendar
   * nuevamente esas posiciones.
   *
   * Entrada:
   * - resultados: objeto que contiene:
   *   agua, impactos y hundidos.
   *
   * Salida:
   * - Set de claves con formato "fila,columna".
   */
  obtenerCeldasAtacadas(resultados = {}) {

    const atacadas = new Set();

    // Registramos los disparos fallidos.
    for (const celda of resultados.agua ?? []) {
      atacadas.add(`${celda.fila},${celda.columna}`);
    }

    // Registramos los impactos conocidos.
    for (const celda of resultados.impactos ?? []) {
      atacadas.add(`${celda.fila},${celda.columna}`);
    }

    // Registramos las celdas de los barcos hundidos.
    for (const barco of resultados.hundidos ?? []) {
      for (const celda of barco.celdas) {
        atacadas.add(`${celda.fila},${celda.columna}`);
      }
    }

    return atacadas;
  }

  /**
   * Función: calcular
   *
   * Descripción:
   * Cuenta cuántas configuraciones válidas
   * contienen un barco en cada celda.
   *
   * Después divide cada frecuencia entre
   * el total de configuraciones válidas.
   *
   * Entrada:
   * - configuracionesValidas: arreglo de flotas.
   * - resultados: historial de disparos conocidos.
   *
   * Salida:
   * - Objeto con:
   *   probabilidades: matriz de valores entre 0 y 1.
   *   frecuencias: matriz de cantidades.
   *   totalValidas: total de configuraciones.
   *   hayEstimacion: indica si existen muestras.
   *
   * Nota:
   * Cuando no hay configuraciones válidas,
   * se devuelve una matriz de ceros, pero
   * hayEstimacion será false.
   */
  calcular(configuracionesValidas, resultados = {}) {

    if (!Array.isArray(configuracionesValidas)) {
      throw new Error(
        "Las configuraciones válidas deben ser un arreglo."
      );
    }

    // Creamos las matrices que utilizaremos.
    const frecuencias = this.crearMatriz();
    const probabilidades = this.crearMatriz();

    // Obtenemos la cantidad total de configuraciones.
    const totalValidas = configuracionesValidas.length;

    // Identificamos las celdas que ya fueron atacadas.
    const atacadas = this.obtenerCeldasAtacadas(resultados);

    // Si no hay configuraciones, no podemos estimar.
    if (totalValidas === 0) {
      return {
        probabilidades,
        frecuencias,
        totalValidas,
        hayEstimacion: false
      };
    }

    // Recorremos cada configuración válida.
    for (const configuracion of configuracionesValidas) {

      // Evita contar dos veces una misma celda
      // dentro de una configuración.
      const contadas = new Set();

      // Recorremos todos los barcos simulados.
      for (const barco of configuracion) {

        // Revisamos cada celda ocupada por el barco.
        for (const celda of barco.celdas) {

          const fila = celda.fila;
          const columna = celda.columna;
          const clave = `${fila},${columna}`;

          // Ignoramos posiciones fuera del tablero.
          if (
            !Number.isInteger(fila) ||
            !Number.isInteger(columna) ||
            fila < 0 ||
            columna < 0 ||
            fila >= this.tamanoTablero ||
            columna >= this.tamanoTablero
          ) {
            continue;
          }

          // No repetimos celdas en la misma flota.
          if (contadas.has(clave)) {
            continue;
          }

          contadas.add(clave);

          // Sumamos una configuración que contiene
          // un barco en esta posición.
          frecuencias[fila][columna]++;
        }
      }
    }

    // Calculamos la probabilidad de cada celda.
    for (let fila = 0; fila < this.tamanoTablero; fila++) {

      for (let columna = 0; columna < this.tamanoTablero; columna++) {

        const clave = `${fila},${columna}`;

        // Las celdas ya atacadas no son objetivos nuevos.
        // Se colocan en cero en el mapa de recomendación.
        if (atacadas.has(clave)) {
          probabilidades[fila][columna] = 0;
          continue;
        }

        // Aplicamos la fórmula del enunciado.
        probabilidades[fila][columna] =
          frecuencias[fila][columna] / totalValidas;
      }
    }

    return {
      probabilidades,
      frecuencias,
      totalValidas,
      hayEstimacion: true
    };
  }

  /**
   * Función: convertirPorcentajes
   *
   * Descripción:
   * Convierte una matriz de probabilidades
   * decimales en porcentajes.
   *
   * Entrada:
   * - probabilidades: matriz con valores de 0 a 1.
   *
   * Salida:
   * - Nueva matriz con porcentajes redondeados
   *   a dos decimales.
   */
  convertirPorcentajes(probabilidades) {

    return probabilidades.map(fila =>
      fila.map(valor =>
        Math.round(valor * 10000) / 100
      )
    );
  }
}
