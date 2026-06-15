window.RouletteProfile = {
    name: 'test',
    title: 'Ruleta Test',
    subtitle: 'Perfil mínimo para pruebas automatizadas',
    initialTime: 120,
    questions: [
        {
            letter: 'A',
            questions: [
                {type: 'empieza', question: 'Capital de España', answer: 'Madrid'}
            ]
        },
        {
            letter: 'B',
            questions: [
                {type: 'empieza', question: 'Animal que ladra', answer: 'Perro'},
                {type: 'contiene', question: 'Fruta amarilla', answer: 'Banana'}
            ]
        },
        {
            letter: 'C',
            questions: [
                {type: 'empieza', question: 'Planeta rojo', answer: 'Marte'}
            ]
        }
    ],
    audio: {
        intro:     {src: 'assets/audio/shared/intro/intro_50x15.mp4', volume: 0},
        correct:   {src: 'assets/audio/arribas/correct/correct_answer.m4a', volume: 0},
        incorrect: {src: 'assets/audio/arribas/incorrect/meeeeec.mp3', volume: 0},
        pass:      {src: 'assets/audio/arribas/pass/partido_a_partido.mpeg', volume: 0}
    }
};
