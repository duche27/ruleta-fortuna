// El nombre se deriva del propio archivo (profiles/<name>.js).
const name = document.currentScript.src.split('/').pop().replace(/\?.*$/, '').replace(/\.js$/, '');
const imgIn = (folder) => (file) => `assets/images/${name}/${folder}/${file}`;
const bg    = imgIn('background');
const wrongAnswer = imgIn('wrong_answer');
const snd   = (file) => `assets/audio/${name}/${file}`;
const sharedAudio = (file) => `assets/audio/shared/${file}`;
// Las fotos del carrusel se cargan automáticamente desde assets/images/<name>/random/
// Las preguntas se cargan automáticamente desde questions_and_answers/<name>.json

window.RouletteProfile = {
    name,
    title: 'Ruleta de la Fortuna Albina',
    subtitle: 'El juego perfecto por si te has olvidado de beber los últimos 5 minutos',
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
