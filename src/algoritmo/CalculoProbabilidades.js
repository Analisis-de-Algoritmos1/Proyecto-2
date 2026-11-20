
/**
 * Clase: CalculoProbabilidades
 * Función: calcular probabilidades por celda del tablero.
 * Entrada: configuraciones válidas y disparos conocidos.
 * Salida: matriz de probabilidades y frecuencias.
 */
export class CalculoProbabilidades {

  /**
   * Función: constructor
   * Entrada: tamaño del tablero.
   * Salida: calculadora inicializada.
   */
  constructor(tamanoTablero = 10) {
    this.tamanoTablero = tamanoTablero;
  }

  /**
   * Función: crearMatriz
   * Entrada: ninguna.
   * Salida: matriz cuadrada llena de ceros.
   */
  crearMatriz() {
    return Array.from(
      { length: this.tamanoTablero },
      () => Array(this.tamanoTablero).fill(0)
    );
  }

  /**
   * Función: obtenerCeldasAtacadas
   * Entrada: agua, impactos y barcos hundidos.
   * Salida: Set con las celdas atacadas.
   */
  obtenerCeldasAtacadas(resultados = {}) {
    const atacadas = new Set();

    for (const celda of resultados.agua ?? []) {
      atacadas.add(`${celda.fila},${celda.columna}`);
    }

    for (const celda of resultados.impactos ?? []) {
      atacadas.add(`${celda.fila},${celda.columna}`);
    }

    for (const barco of resultados.hundidos ?? []) {
      for (const celda of barco.celdas) {
        atacadas.add(`${celda.fila},${celda.columna}`);
      }
    }

    return atacadas;
  }

  /**
   * Función: calcular
   * Entrada: configuraciones válidas y resultados conocidos.
   * Salida: probabilidades, frecuencias y total de muestras.
   */
  calcular(configuracionesValidas, resultados = {}) {

    if (!Array.isArray(configuracionesValidas)) {
      throw new Error(
        "Las configuraciones válidas deben ser un arreglo."
      );
    }

    const frecuencias = this.crearMatriz();
    const probabilidades = this.crearMatriz();

    const totalValidas = configuracionesValidas.length;
    const atacadas = this.obtenerCeldasAtacadas(resultados);

    // Sin muestras válidas no se puede estimar.
    if (totalValidas === 0) {
      return {
        probabilidades,
        frecuencias,
        totalValidas,
        hayEstimacion: false
      };
    }

    // Contamos las celdas ocupadas en cada flota.
    for (const configuracion of configuracionesValidas) {
      const contadas = new Set();

      for (const barco of configuracion) {
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

          // Evitamos contar dos veces la misma celda.
          if (contadas.has(clave)) {
            continue;
          }

          contadas.add(clave);
          frecuencias[fila][columna]++;
        }
      }
    }

    // Calculamos las probabilidades de las celdas libres.
    for (let fila = 0; fila < this.tamanoTablero; fila++) {
      for (let columna = 0; columna < this.tamanoTablero; columna++) {

        const clave = `${fila},${columna}`;

        // No recomendamos celdas ya atacadas.
        if (atacadas.has(clave)) {
          probabilidades[fila][columna] = 0;
          continue;
        }

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
   * Entrada: matriz de probabilidades decimales.
   * Salida: matriz con porcentajes redondeados.
   */
  convertirPorcentajes(probabilidades) {
    return probabilidades.map(fila =>
      fila.map(valor =>
        Math.round(valor * 10000) / 100
      )
    );
  }
}
