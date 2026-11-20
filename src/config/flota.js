
/**
 * Configuración de la flota de Batalla Naval.
 *
 * Descripción:
 * Define las dimensiones del tablero y los barcos
 * que participan en cada partida, incluyendo sus
 * identificadores, nombres y tamaños.
 */

// Dimensión del tablero: 10 filas y 10 columnas.
export const TAMANO_TABLERO = 10;

// Embarcaciones que conforman cada flota.
export const TIPOS_BARCOS = [
  { id: "portaaviones", nombre: "Portaaviones", tamano: 5 },

  { id: "acorazado", nombre: "Acorazado", tamano: 4 },

  { id: "crucero", nombre: "Crucero", tamano: 3 },

  { id: "submarino", nombre: "Submarino", tamano: 3 },

  { id: "destructor", nombre: "Destructor", tamano: 2},
];
