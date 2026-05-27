// Plantilla para crear un nuevo perfil.
//
// Cómo añadir un nuevo amigo:
//   1) Copia este archivo a profiles/<nombre>.js (ej. profiles/marina.js).
//      El nombre del archivo se usa como base para las carpetas de assets.
//   2) Crea las carpetas (los nombres de archivo no importan):
//        assets/images/<nombre>/background/      -> fondo de la página
//        assets/images/<nombre>/wrong_answer/    -> foto del "¡INCORRECTO!"
//        assets/images/<nombre>/random/          -> fotos del carrusel
//        assets/audio/<nombre>/correct/          -> audio respuesta correcta
//        assets/audio/<nombre>/incorrect/        -> audio respuesta incorrecta
//        assets/audio/<nombre>/pass/             -> audio de pasapalabra
//        assets/audio/shared/intro/              -> intro compartida (obligatoria)
//   3) Copia questions_and_answers/example.json a questions_and_answers/<nombre>.json
//      y rellena las preguntas y respuestas.
//   4) En index.html, cambia <script src="profiles/arribas.js"> por
//      <script src="profiles/<nombre>.js">.
//   5) Abre con `node server.js` (local) o publica en GitHub Pages.

// El nombre se deriva del propio archivo (profiles/<name>.js).
const name = document.currentScript.src.split('/').pop().replace(/\?.*$/, '').replace(/\.js$/, '');

window.RouletteProfile = {
    name,
    title: 'Ruleta de la Fortuna',
    subtitle: 'El juego del Rosco para tu despedida',
    initialTime: 250,

    audio: {
        intro:     { volume: 0.6, cutoffAt: 17 },
        correct:   { volume: 0.7 },
        incorrect: { volume: 0.7 },
        pass:      { volume: 0.7 }
    }
};
