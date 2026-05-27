// El nombre se deriva del propio archivo (profiles/<name>.js).
const name = document.currentScript.src.split('/').pop().replace(/\?.*$/, '').replace(/\.js$/, '');
// Imágenes: assets/images/<name>/{background,wrong_answer,random}/
// Audios:    assets/audio/<name>/{correct,incorrect,pass}/ (+ shared/intro obligatorio, shared/incorrect opcional)
// Preguntas: questions_and_answers/<name>.json

window.RouletteProfile = {
    name,
    title: 'Ruleta de la Fortuna Arribística',
    subtitle: 'El juego del Rosco de Champions Leagues que lleva el Atleti',
    initialTime: 250,

    audio: {
        intro:     { volume: 0.6, cutoffAt: 17 },
        correct:   { volume: 0.7 },
        incorrect: { volume: 0.7 },
        pass:      { volume: 0.7 }
    }
};
