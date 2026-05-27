// Plantilla para crear un nuevo perfil.
//
// Cómo añadir un nuevo amigo:
//   1) Copia este archivo a profiles/<nombre>.js (ej. profiles/marina.js).
//      El nombre del archivo se usa como base para las carpetas de assets.
//   2) Crea las carpetas:
//        assets/images/<nombre>/background/      -> fondo (background.png)
//        assets/images/<nombre>/wrong_answer/    -> foto del "¡INCORRECTO!"
//        assets/images/<nombre>/random/          -> fotos del carrusel (cualquier nombre)
//        assets/audio/<nombre>/                  -> correct_answer.<ext>, pass.<ext>
//   3) Copia questions_and_answers/example.json a questions_and_answers/<nombre>.json
//      y rellena las preguntas y respuestas.
//   4) Edita background y wrongAnswer en el perfil; las fotos de random/ se cargan solas.
//   5) En index.html, cambia <script src="profiles/arribas.js"> por
//      <script src="profiles/<nombre>.js">.

// El nombre se deriva del propio archivo (profiles/<name>.js).
const name = document.currentScript.src.split('/').pop().replace(/\?.*$/, '').replace(/\.js$/, '');
const imgIn = (folder) => (file) => `assets/images/${name}/${folder}/${file}`;
const bg    = imgIn('background');
const wrongAnswer = imgIn('wrong_answer');
const snd   = (file) => `assets/audio/${name}/${file}`;
const sharedAudio = (file) => `assets/audio/shared/${file}`;

window.RouletteProfile = {
    name,
    title: 'Ruleta de la Fortuna',
    subtitle: 'El juego del Rosco para tu despedida',
    initialTime: 250,

    images: {
        background:  bg('background.png'),
        wrongAnswer: wrongAnswer('jumpscare.jpg')
    },

    audio: {
        intro:     { src: sharedAudio('intro_50x15.mp4'),      volume: 0.6, cutoffAt: 17 },
        correct:   { src: snd('correct_answer.mp3'),           volume: 0.7 },
        incorrect: { src: sharedAudio('incorrect_answer.mp3'), volume: 0.7 },
        pass:      { src: snd('pass.mp3'),                     volume: 0.7 }
    }
};
