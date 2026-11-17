
import { ValidacionFlotas } from "./ValidacionFlotas.js";

/**
 * Clase: GeneradorSimulaciones
 *
 * Descripción:
 * Genera configuraciones posibles de la flota
 * respetando las reglas de Batalla Naval.
 *
 * Utiliza búsqueda con retroceso (backtracking)
 * para colocar los cinco barcos sin superponerlos.
 *
 * Cuando existen disparos anteriores, intenta
 * generar únicamente configuraciones compatibles.
 *
 * Entrada:
 * - Tamaño del tablero.
 * - Resultados conocidos: agua, impactos y hundidos.
 * - Cantidad de simulaciones solicitadas.
 *
 * Salida:
 * - Una flota compatible.
 * - Un arreglo de configuraciones compatibles.
 * - null cuando no encuentra una flota.
 *
 * Importante:
 * Nunca recibe las posiciones reales de los barcos.
 */
export class GeneradorSimulaciones {

  /**
   * Función: constructor
   *
   * Entrada:
   * - tamanoTablero: tamaño del tablero.
   *
   * Salida:
   * - Inicializa barcos, tamaño y validador.
   */
  constructor(tamanoTablero = 10) {

    this.tamanoTablero = tamanoTablero;

    this.validador = new ValidacionFlotas(
      tamanoTablero
    );

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
   *
   * Entrada:
   * - celda: objeto con fila y columna.
   *
   * Salida:
   * - Texto con formato "fila,columna".
   */
  crearClave(celda) {
    return `${celda.fila},${celda.columna}`;
  }

  /**
   * Función: mezclar
   *
   * Descripción:
   * Cambia aleatoriamente el orden de un arreglo
   * utilizando el algoritmo Fisher-Yates.
   *
   * Entrada:
   * - elementos: arreglo que deseamos mezclar.
   *
   * Salida:
   * - Nuevo arreglo en orden aleatorio.
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
   *
   * Descripción:
   * Organiza las posiciones conocidas para
   * facilitar las validaciones posteriores.
   *
   * Entrada:
   * - resultados: agua, impactos y hundidos.
   *
   * Salida:
   * - Objeto con Sets de agua e impactos,
   *   y arreglo de barcos hundidos.
   */
  prepararResultados(resultados = {}) {

    const agua = new Set(
      (resultados.agua ?? []).map(c =>
        this.crearClave(c)
      )
    );

    const impactos = new Set(
      (resultados.impactos ?? []).map(c =>
        this.crearClave(c)
      )
    );

    const hundidos = resultados.hundidos ?? [];

    // Las posiciones hundidas también son impactos.
    for (const barco of hundidos) {

      for (const celda of barco.celdas) {
        impactos.add(this.crearClave(celda));
      }
    }

    return { agua, impactos, hundidos };
  }

  /**
   * Función: obtenerOpcionesBarco
   *
   * Descripción:
   * Obtiene todas las posiciones posibles de
   * un barco dentro del tablero.
   *
   * Excluye posiciones que contradigan el agua
   * conocida y respeta los barcos hundidos.
   *
   * Entrada:
   * - barco: nombre y longitud.
   * - conocidos: resultados preparados.
   *
   * Salida:
   * - Arreglo de posiciones posibles.
   */
  obtenerOpcionesBarco(barco, conocidos) {

    const opciones = [];

    const hundido = conocidos.hundidos.find(
      h => h.nombre === barco.nombre
    );

    for (const orientacion of ["H", "V"]) {

      for (let fila = 0; fila < this.tamanoTablero; fila++) {

        for (let columna = 0; columna < this.tamanoTablero; columna++) {

          // Validamos límites usando la primera clase.
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

          const claves = celdas.map(c =>
            this.crearClave(c)
          );

          // No puede haber barcos donde hubo agua.
          if (claves.some(c => conocidos.agua.has(c))) {
            continue;
          }

          // Si el barco está hundido, su ubicación
          // debe coincidir exactamente.
          if (hundido) {

            const clavesHundido = new Set(
              hundido.celdas.map(c =>
                this.crearClave(c)
              )
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
 *
 * Descripción:
 * Genera una flota compatible con los disparos
 * conocidos mediante búsqueda con retroceso.
 *
 * Coloca primero los barcos hundidos conocidos,
 * reservando sus posiciones para evitar conflictos.
 *
 * Entrada:
 * - resultados: objeto con agua, impactos y hundidos.
 *
 * Salida:
 * - Arreglo de cinco barcos compatibles.
 * - null si no encuentra una configuración válida.
 */
generarFlota(resultados = {}) {

  const conocidos = this.prepararResultados(resultados);

  // Verificamos que no existan contradicciones.
  for (const clave of conocidos.impactos) {
    if (conocidos.agua.has(clave)) {
      return null;
    }
  }

  // Organizamos los barcos colocando primero
  // aquellos cuya ubicación ya conocemos.
  const barcosOrdenados = [
    ...this.barcos.filter(barco =>
      conocidos.hundidos.some(h =>
        h.nombre === barco.nombre
      )
    ),
    ...this.barcos.filter(barco =>
      !conocidos.hundidos.some(h =>
        h.nombre === barco.nombre
      )
    )
  ];

  // Obtenemos posiciones posibles para cada barco.
  const opcionesPorBarco = barcosOrdenados.map(
    barco => this.obtenerOpcionesBarco(barco, conocidos)
  );

  if (opcionesPorBarco.some(opciones =>
    opciones.length === 0
  )) {
    return null;
  }

  const flota = [];
  const ocupadas = new Set();

  let nodosVisitados = 0;
  const maximoNodos = 100000;

  /**
   * Función interna: buscar
   *
   * Entrada:
   * - indice: posición del barco que se colocará.
   *
   * Salida:
   * - true si encuentra una configuración.
   * - false si no encuentra solución.
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

      // Evitamos colocar barcos superpuestos.
      if (opcion.claves.some(clave =>
        ocupadas.has(clave)
      )) {
        continue;
      }

      // Registramos las posiciones ocupadas.
      for (const clave of opcion.claves) {
        ocupadas.add(clave);
      }

      // Guardamos el barco.
      flota.push({
        nombre: opcion.nombre,
        longitud: opcion.longitud,
        orientacion: opcion.orientacion,
        celdas: opcion.celdas
      });

      // Intentamos colocar el siguiente barco.
      if (buscar(indice + 1)) {
        return true;
      }

      // Deshacemos la colocación si no funciona.
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
   *
   * Descripción:
   * Genera múltiples flotas compatibles con
   * la información disponible.
   *
   * Entrada:
   * - cantidad: número de simulaciones.
   * - resultados: disparos conocidos.
   *
   * Salida:
   * - Arreglo de configuraciones compatibles.
   *
   * Nota:
   * Puede generar menos configuraciones cuando
   * no consigue soluciones en todos los intentos.
   */
  generarSimulaciones(cantidad = 100, resultados = {}) {

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      throw new Error(
        "La cantidad debe ser un entero positivo."
      );
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
