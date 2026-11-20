
import { ValidacionFlotas } from "./ValidacionFlotas.js";

/**
 * Clase: GeneradorSimulaciones
 * Función: generar flotas compatibles mediante backtracking.
 * Entrada: tamaño del tablero y disparos conocidos.
 * Salida: una o varias configuraciones de barcos.
 */
export class GeneradorSimulaciones {

  /**
   * Función: constructor
   * Entrada: tamaño del tablero.
   * Salida: generador y validador inicializados.
   */
  constructor(tamanoTablero = 10) {
    this.tamanoTablero = tamanoTablero;
    this.validador = new ValidacionFlotas(tamanoTablero);

    this.barcos = [
      { nombre: "Portaaviones", longitud: 5 },
      { nombre: "Acorazado", longitud: 4 },
      { nombre: "Crucero", longitud: 3 },
      { nombre: "Submarino", longitud: 3 },
      { nombre: "Destructor", longitud: 2 }
    ];
  }

  /**
   * Función: crearClave
   * Entrada: celda con fila y columna.
   * Salida: texto "fila,columna".
   */
  crearClave(celda) {
    return `${celda.fila},${celda.columna}`;
  }

  /**
   * Función: mezclar
   * Entrada: arreglo de elementos.
   * Salida: copia del arreglo en orden aleatorio.
   */
  mezclar(elementos) {
    const copia = [...elementos];

    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
  }

  /**
   * Función: prepararResultados
   * Entrada: agua, impactos y barcos hundidos.
   * Salida: información organizada para validar flotas.
   */
  prepararResultados(resultados = {}) {
    const agua = new Set(
      (resultados.agua ?? []).map(c => this.crearClave(c))
    );

    const impactos = new Set(
      (resultados.impactos ?? []).map(c => this.crearClave(c))
    );

    const hundidos = resultados.hundidos ?? [];

    // Incluimos las posiciones de los barcos hundidos.
    for (const barco of hundidos) {
      for (const celda of barco.celdas) {
        impactos.add(this.crearClave(celda));
      }
    }

    return { agua, impactos, hundidos };
  }

  /**
   * Función: obtenerOpcionesBarco
   * Entrada: barco y resultados conocidos.
   * Salida: posiciones posibles del barco.
   */
  obtenerOpcionesBarco(barco, conocidos) {
    const opciones = [];

    const hundido = conocidos.hundidos.find(
      h => h.nombre === barco.nombre
    );

    for (const orientacion of ["H", "V"]) {
      for (let fila = 0; fila < this.tamanoTablero; fila++) {
        for (let columna = 0; columna < this.tamanoTablero; columna++) {

          if (!this.validador.validarPosicion(
            fila,
            columna,
            barco.longitud,
            orientacion,
            new Set()
          )) {
            continue;
          }

          const celdas = this.validador.obtenerCeldasBarco(
            fila,
            columna,
            barco.longitud,
            orientacion
          );

          const claves = celdas.map(c => this.crearClave(c));

          // Excluimos posiciones con agua conocida.
          if (claves.some(c => conocidos.agua.has(c))) {
            continue;
          }

          // Los barcos hundidos deben mantener sus celdas.
          if (hundido) {
            const clavesHundido = new Set(
              hundido.celdas.map(c => this.crearClave(c))
            );

            if (
              clavesHundido.size !== barco.longitud ||
              claves.some(c => !clavesHundido.has(c))
            ) {
              continue;
            }
          }

          opciones.push({
            nombre: barco.nombre,
            longitud: barco.longitud,
            orientacion,
            celdas,
            claves
          });
        }
      }
    }

    return this.mezclar(opciones);
  }

  /**
   * Función: generarFlota
   * Entrada: resultados de disparos anteriores.
   * Salida: flota compatible o null.
   */
  generarFlota(resultados = {}) {
    const conocidos = this.prepararResultados(resultados);

    // Rechazamos resultados contradictorios.
    for (const clave of conocidos.impactos) {
      if (conocidos.agua.has(clave)) {
        return null;
      }
    }

    // Colocamos primero los barcos hundidos.
    const barcosOrdenados = [
      ...this.barcos.filter(barco =>
        conocidos.hundidos.some(h => h.nombre === barco.nombre)
      ),
      ...this.barcos.filter(barco =>
        !conocidos.hundidos.some(h => h.nombre === barco.nombre)
      )
    ];

    const opcionesPorBarco = barcosOrdenados.map(
      barco => this.obtenerOpcionesBarco(barco, conocidos)
    );

    if (opcionesPorBarco.some(opciones => opciones.length === 0)) {
      return null;
    }

    const flota = [];
    const ocupadas = new Set();

    let nodosVisitados = 0;
    const maximoNodos = 100000;

    /**
     * Función: buscar
     * Entrada: índice del barco actual.
     * Salida: true si encuentra una flota válida.
     */
    const buscar = (indice) => {
      nodosVisitados++;

      if (nodosVisitados > maximoNodos) {
        return false;
      }

      // Verificamos los impactos al completar la flota.
      if (indice === barcosOrdenados.length) {
        for (const clave of conocidos.impactos) {
          if (!ocupadas.has(clave)) {
            return false;
          }
        }

        return true;
      }

      for (const opcion of opcionesPorBarco[indice]) {

        // No permitimos superposiciones.
        if (opcion.claves.some(clave => ocupadas.has(clave))) {
          continue;
        }

        // Marcamos las celdas ocupadas.
        for (const clave of opcion.claves) {
          ocupadas.add(clave);
        }

        flota.push({
          nombre: opcion.nombre,
          longitud: opcion.longitud,
          orientacion: opcion.orientacion,
          celdas: opcion.celdas
        });

        if (buscar(indice + 1)) {
          return true;
        }

        // Retrocedemos si la posición no funciona.
        flota.pop();

        for (const clave of opcion.claves) {
          ocupadas.delete(clave);
        }
      }

      return false;
    };

    return buscar(0) ? flota : null;
  }

  /**
   * Función: generarSimulaciones
   * Entrada: cantidad de simulaciones y disparos conocidos.
   * Salida: arreglo de flotas compatibles.
   */
  generarSimulaciones(cantidad = 100, resultados = {}) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error("La cantidad debe ser un entero positivo.");
    }

    const simulaciones = [];

    for (let i = 0; i < cantidad; i++) {
      const flota = this.generarFlota(resultados);

      if (flota !== null) {
        simulaciones.push(flota);
      }
    }

    return simulaciones;
  }
}
