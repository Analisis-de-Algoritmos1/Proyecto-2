
import { ConfiguracionSimulaciones } from "./ConfiguracionSimulaciones.js";

/**
 * Archivo: pruebaConfiguracion.js
 *
 * Descripción:
 * Comprueba el funcionamiento de la clase
 * encargada de configurar simulaciones.
 *
 * Entrada:
 * - Cantidades válidas e inválidas.
 *
 * Salida:
 * - Resultados de las verificaciones en consola.
 */

const configuracion = new ConfiguracionSimulaciones();

console.log("=== PRUEBA DE CONFIGURACIÓN ===");

// Comprobamos el valor inicial.
console.log(
  "Cantidad inicial:",
  configuracion.obtenerCantidad()
);

// Consultamos las opciones disponibles.
console.log(
  "Opciones:",
  configuracion.obtenerOpciones()
);

// Cambiamos a 5000 simulaciones.
configuracion.establecerCantidad(5000);

console.log(
  "Cambio a 5000:",
  configuracion.obtenerCantidad() === 5000
);

// Cambiamos a 10000 simulaciones.
configuracion.establecerCantidad(10000);

console.log(
  "Cambio a 10000:",
  configuracion.obtenerCantidad() === 10000
);

// Comprobamos que rechace valores inválidos.
try {

  configuracion.establecerCantidad(250);

  console.log("Rechaza 250: false");

} catch (error) {

  console.log("Rechaza 250: true");
}

// Restablecemos la configuración.
configuracion.restablecer();

console.log(
  "Restablecer a 1000:",
  configuracion.obtenerCantidad() === 1000
);
