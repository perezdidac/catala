/**
 * Catalan Vocabulary and Speech Database for "El Conductor de Paraules"
 * Specially designed for 5-year-old learners living abroad.
 * Covers 5 complete playable scenes across the Catalan railway journey.
 */

export interface VocabularyWord {
  id: string;
  catalan: string;
  syllables: string[];
  phoneticHint: string;
  meaningEn: string;
  icon: string;
  speechPhrase: string;
  acceptedRecognitionTokens: string[];
}

export const VOCABULARY_LIST: Record<string, VocabularyWord> = {
  tren: {
    id: 'tren',
    catalan: 'El Tren',
    syllables: ['tren'],
    phoneticHint: 'TREN',
    meaningEn: 'The Train',
    icon: '🚂',
    speechPhrase: 'Això és un tren de vapor molt bonic.',
    acceptedRecognitionTokens: ['tren', 'tre', 'el tren', 'trem']
  },
  locomotora: {
    id: 'locomotora',
    catalan: 'La Locomotora',
    syllables: ['lo', 'co', 'mo', 'to', 'ra'],
    phoneticHint: 'LO-CO-MO-TO-RA',
    meaningEn: 'The Locomotive',
    icon: '🚂',
    speechPhrase: 'La locomotora té un motor de vapor potent.',
    acceptedRecognitionTokens: ['locomotora', 'locomoto', 'motor']
  },
  via: {
    id: 'via',
    catalan: 'La Via',
    syllables: ['vi', 'a'],
    phoneticHint: 'VI-A',
    meaningEn: 'The Track',
    icon: '🛤️',
    speechPhrase: 'La via del tren està feta de ferro i fusta.',
    acceptedRecognitionTokens: ['via', 'la via', 'bies', 'vies']
  },
  obre_via: {
    id: 'obre_via',
    catalan: 'Obre la via',
    syllables: ['o', 'bre', 'la', 'vi', 'a'],
    phoneticHint: 'O-BRE LA VI-A',
    meaningEn: 'Open the track',
    icon: '🚦',
    speechPhrase: 'Obre la via, si us plau!',
    acceptedRecognitionTokens: [
      'obre la via',
      'obre via',
      'obre',
      'obri la via',
      'obri via',
      'obra la via',
      'obri',
      'via',
      'la via'
    ]
  },
  endavant: {
    id: 'endavant',
    catalan: 'Endavant',
    syllables: ['en', 'da', 'vant'],
    phoneticHint: 'EN-DA-VANT',
    meaningEn: 'Forward / Go ahead',
    icon: '⏩',
    speechPhrase: 'Endavant, tren! Tots al tren!',
    acceptedRecognitionTokens: ['endavant', 'davant', 'anem', 'adavant', 'en daban']
  },
  branques: {
    id: 'branques',
    catalan: 'Les Branques',
    syllables: ['bran', 'ques'],
    phoneticHint: 'BRAN-QUES',
    meaningEn: 'The Branches',
    icon: '🪵',
    speechPhrase: 'Unes branques de pi han caigut a la via.',
    acceptedRecognitionTokens: ['branques', 'branca', 'fusta', 'branquetes']
  },
  xiulet: {
    id: 'xiulet',
    catalan: 'El Xiulet',
    syllables: ['xiu', 'let'],
    phoneticHint: 'XIU-LET',
    meaningEn: 'The Whistle',
    icon: '📢',
    speechPhrase: 'El xiulet del tren fa: TUUU-TUUUT!',
    acceptedRecognitionTokens: ['xiulet', 'xiulet del tren', 'tuut', 'xiular', 'pitu']
  },
  foc: {
    id: 'foc',
    catalan: 'El Foc',
    syllables: ['foc'],
    phoneticHint: 'FOC',
    meaningEn: 'The Fire',
    icon: '🔥',
    speechPhrase: 'El foc crema a la caldera i fa vapor!',
    acceptedRecognitionTokens: ['foc', 'el foc', 'calor']
  },
  carbo: {
    id: 'carbo',
    catalan: 'El Carbó',
    syllables: ['car', 'bó'],
    phoneticHint: 'CAR-BÓ',
    meaningEn: 'The Coal',
    icon: '🪨',
    speechPhrase: 'Tirem carbó al foc per anar més ràpid.',
    acceptedRecognitionTokens: ['carbó', 'carbo', 'el carbó']
  },
  palanca: {
    id: 'palanca',
    catalan: 'La Palanca',
    syllables: ['pa', 'lan', 'ca'],
    phoneticHint: 'PA-LAN-CA',
    meaningEn: 'The Lever',
    icon: '🕹️',
    speechPhrase: 'Estirem la palanca per canviar de via.',
    acceptedRecognitionTokens: ['palanca', 'la palanca', 'canvi']
  },
  cap_estacio: {
    id: 'cap_estacio',
    catalan: "El Cap d'Estació",
    syllables: ['cap', "d'es", 'ta', 'ci', 'ó'],
    phoneticHint: "CAP D'ES-TA-CI-Ó",
    meaningEn: 'The Stationmaster',
    icon: '👨‍✈️',
    speechPhrase: "Hola! Sóc en Pep, el cap d'estació dels Pins.",
    acceptedRecognitionTokens: ['cap destacio', 'pep', 'senyor', 'cap', 'estacio']
  },
  maquinista: {
    id: 'maquinista',
    catalan: 'El Maquinista',
    syllables: ['ma', 'qui', 'nis', 'ta'],
    phoneticHint: 'MA-QUI-NIS-TA',
    meaningEn: 'The Train Driver',
    icon: '🧑‍🔧',
    speechPhrase: 'Hola, petit maquinista! Puja a la cabina!',
    acceptedRecognitionTokens: ['maquinista', 'conductor', 'joan']
  },
  ocell: {
    id: 'ocell',
    catalan: "L'Ocell",
    syllables: ['o', 'cell'],
    phoneticHint: 'O-CELL',
    meaningEn: 'The Bird',
    icon: '🐦',
    speechPhrase: "L'ocell canta dalt de l'arbre: Piu, piu, piu!",
    acceptedRecognitionTokens: ['ocell', 'ocellet', 'piu', 'piu piu']
  },

  // Scene 3: El Pont del Riu d'Or
  aigua_fresca: {
    id: 'aigua_fresca',
    catalan: 'Aigua fresca',
    syllables: ['ai', 'gua', 'fres', 'ca'],
    phoneticHint: 'AI-GUA FRES-CA',
    meaningEn: 'Fresh water',
    icon: '💧',
    speechPhrase: "Aigua fresca de muntanya per a la caldera del tren!",
    acceptedRecognitionTokens: ['aigua fresca', 'aigua', 'aigua de riu', 'fresca', 'aigua si us plau']
  },
  clau_anglesa: {
    id: 'clau_anglesa',
    catalan: 'La Clau Anglesa',
    syllables: ['clau', 'an', 'gle', 'sa'],
    phoneticHint: 'CLAU AN-GLE-SA',
    meaningEn: 'The Wrench',
    icon: '🔧',
    speechPhrase: 'Una clau anglesa per obrir la vàlvula daurada.',
    acceptedRecognitionTokens: ['clau anglesa', 'clau', 'anglesa', 'la clau']
  },
  lludriga: {
    id: 'lludriga',
    catalan: 'La Llúdriga Neus',
    syllables: ['llú', 'dri', 'ga'],
    phoneticHint: 'LLÚ-DRI-GA',
    meaningEn: 'The River Otter',
    icon: '🦦',
    speechPhrase: 'La llúdriga Neus neda contenta al riu!',
    acceptedRecognitionTokens: ['lludriga', 'llúdriga', 'neus', 'la llúdriga', 'animal']
  },
  pont: {
    id: 'pont',
    catalan: 'El Pont',
    syllables: ['pont'],
    phoneticHint: 'PONT',
    meaningEn: 'The Bridge',
    icon: '🌉',
    speechPhrase: 'El pont de pedra creua el riu d\'aigua clara.',
    acceptedRecognitionTokens: ['pont', 'el pont', 'viaducte']
  },

  // Scene 4: El Castell de la Roca
  tots_al_tren: {
    id: 'tots_al_tren',
    catalan: 'Tots al tren',
    syllables: ['tots', 'al', 'tren'],
    phoneticHint: 'TOTS AL TREN',
    meaningEn: 'All aboard',
    icon: '📢',
    speechPhrase: 'Tots al tren! El tren està a punt de sortir!',
    acceptedRecognitionTokens: ['tots al tren', 'tots al tre', 'tots', 'al tren', 'pujar']
  },
  bitllet: {
    id: 'bitllet',
    catalan: 'El Bitllet Daurat',
    syllables: ['bit', 'llet'],
    phoneticHint: 'BIT-LLET',
    meaningEn: 'The Golden Ticket',
    icon: '🎟️',
    speechPhrase: 'El bitllet de tren per viatjar fins al mar.',
    acceptedRecognitionTokens: ['bitllet', 'el bitllet', 'tiquet', 'passatge']
  },
  campana: {
    id: 'campana',
    catalan: 'La Campana',
    syllables: ['cam', 'pa', 'na'],
    phoneticHint: 'CAM-PA-NA',
    meaningEn: 'The Bell',
    icon: '🔔',
    speechPhrase: 'Ding-dong! La campana de bronze de l\'estació.',
    acceptedRecognitionTokens: ['campana', 'la campana', 'ding dong', 'tocar']
  },

  // Scene 5: La Vall Verda i el Mar
  visca_el_tren: {
    id: 'visca_el_tren',
    catalan: 'Visca el tren',
    syllables: ['vis', 'ca', 'el', 'tren'],
    phoneticHint: 'VIS-CA EL TREN',
    meaningEn: 'Long live the train / Hurray for the train',
    icon: '🎉',
    speechPhrase: 'Visca el tren i visca el petit maquinista!',
    acceptedRecognitionTokens: ['visca el tren', 'visca', 'el tren', 'visca tren', 'visca el maquinista']
  },
  mar: {
    id: 'mar',
    catalan: 'El Mar',
    syllables: ['mar'],
    phoneticHint: 'MAR',
    meaningEn: 'The Sea',
    icon: '🌊',
    speechPhrase: 'El mar blau amb les barquetes de pescadors.',
    acceptedRecognitionTokens: ['mar', 'el mar', 'aigua']
  },
  medalla: {
    id: 'medalla',
    catalan: 'La Medalla d\'Or',
    syllables: ['me', 'da', 'lla'],
    phoneticHint: 'ME-DA-LLA',
    meaningEn: 'The Gold Medal',
    icon: '🏅',
    speechPhrase: 'La medalla d\'or del millor maquinista de Catalunya!',
    acceptedRecognitionTokens: ['medalla', 'la medalla', 'or', 'premi']
  }
};

/**
 * Dialogue scripts for all 5 scenes
 */
export const DIALOGUES = {
  // Scene 1: L'Estació dels Pins
  welcome: {
    title: 'Benvingut a bord!',
    text: "Hola, petit maquinista! Benvingut a l'Estació dels Pins. Ajuda'ns a preparar el tren!",
    voiceText: "Hola, petit maquinista! Benvingut a l'Estació dels Pins. Ajuda'ns a preparar el tren!"
  },
  switchBlocked: {
    title: 'Via Bloquejada!',
    text: "La via està bloquejada per branques de pi! No podem passar.",
    voiceText: "La via està bloquejada per branques de pi! No podem passar."
  },
  tookBranches: {
    title: 'Molt bé!',
    text: "Has recollit les branques! Ara les podem fer servir com a llenya per al foc del tren.",
    voiceText: "Molt bé! Has recollit les branques! Ara les podem fer servir per fer foc al tren."
  },
  stationmasterAskVoice: {
    speaker: "Cap d'Estació Pep",
    title: 'La Paraula Màgica',
    text: "Per activar el canvi d'agulla i obrir el pas, em pots dir la paraula màgica? Digues: 'OBRE LA VIA'!",
    voiceText: "Hola petit maquinista! Em pots dir la paraula màgica per obrir el pas? Digues: Obre la via!",
    targetPhrase: 'Obre la via',
    syllables: ['O', 'bre', 'la', 'vi', 'a'],
    targetId: 'obre_via'
  },
  stationmasterSuccess: {
    speaker: "Cap d'Estació Pep",
    title: 'Molt ben dit!',
    text: "Genial! Has dit 'Obre la via'! Mira, la palanca s'ha desbloquejat. Estira la palanca!",
    voiceText: "Molt ben dit! Has dit: Obre la via! Ara estira la palanca per donar llum verda al tren!"
  },
  switchOpened: {
    title: 'Via Oberta!',
    text: "CLAC! El semàfor està verd! La via està lliure. Puja a la cabina amb el botó CONDUEIX!",
    voiceText: "Clac! El semàfor s'ha posat verd! La via està lliure. Puja a la cabina amb el botó CONDUEIX!"
  },

  // Scene 2: La Cabina del Maquinista
  cabinIntro: {
    speaker: 'Maquinista Joan',
    title: 'A la Cabina!',
    text: "Ja som a la cabina! Tira de la corda del xiulet, fica llenya a la caldera i empeny la palanca per arrencar!",
    voiceText: "Benvingut a la cabina! Tira de la corda del xiulet, fica llenya a la caldera i empeny la palanca per arrencar!"
  },
  whistleTuut: {
    title: 'TUUUUU-TUUUUT!',
    text: "Molt bé! El xiulet de vapor sona ben fort per tota la vall!",
    voiceText: "Tuuuut! El xiulet de vapor avisa a tothom que el tren està a punt de sortir!"
  },
  fireFed: {
    title: 'Foc viu!',
    text: "Has posat les branques a la caldera! El foc crema fort i la pressió del vapor puja!",
    voiceText: "Molt bé! La llenya crema a la caldera i fa un vapor molt potent!"
  },
  trainMoving: {
    title: 'Txu-txu-txu!',
    text: "El tren es mou! Mira com passen els camps i les muntanyes catalanes!",
    voiceText: "Txu, txu, txu! El tren es mou cap endavant! Que bonic que és el paisatge!"
  },
  destinationReached: {
    title: 'Felicitats, Maquinista!',
    text: "Visca! Hem arribat a la següent estació! Ets un maquinista fantàstic!",
    voiceText: "Visca el petit maquinista! Hem arribat sans i estalvis a la següent estació! Moltes felicitats!"
  },

  // Scene 3: El Pont del Riu d'Or
  bridgeIntro: {
    speaker: 'Maquinista Joan',
    title: 'El Pont del Riu d\'Or',
    text: "Mireu el viaducte de pedra! Però la caldera necessita aigua fresca del riu per continuar.",
    voiceText: "Mireu quin pont de pedra més bonic! Però la caldera necessita aigua fresca del riu per continuar."
  },
  otterAskVoice: {
    speaker: 'Llúdriga Neus',
    title: 'L\'Aigua del Riu',
    text: "Xip-xap! Sóc la Neus! Tinc la clau anglesa per obrir la grua d'aigua. Em pots demanar: 'AIGUA FRESCA'?",
    voiceText: "Hola petit amic! Tinc la clau anglesa per omplir el tren. Em pots dir ben clar: Aigua fresca?",
    targetPhrase: 'Aigua fresca',
    syllables: ['Ai', 'gua', 'fres', 'ca'],
    targetId: 'aigua_fresca'
  },
  otterSuccess: {
    speaker: 'Llúdriga Neus',
    title: 'Aigua pura!',
    text: "Molt bé! Aquí tens la clau anglesa. Obre la vàlvula de la grua per omplir el dipòsit d'aigua!",
    voiceText: "Molt ben dit! Aquí tens la clau anglesa. Obre la vàlvula per omplir d'aigua la locomotora!"
  },
  waterTankFull: {
    title: 'Dipòsit Ple!',
    text: "Gorg, gorg! La locomotora té aigua de sobres per generar vapor! Ja podem creuar el gran pont!",
    voiceText: "Gorg, gorg! El dipòsit d'aigua està ple de gom a gom! Ja podem creuar el gran pont cap al Castell!"
  },

  // Scene 4: El Castell de la Roca
  castleIntro: {
    speaker: 'Revisora Montserrat',
    title: 'El Castell de la Roca',
    text: "Benvinguts a l'estació del Castell! Abans d'entrar al túnel de la muntanya, cal fer sonar la campana.",
    voiceText: "Benvinguts a l'estació del Castell de la Roca! Abans de travessar el túnel, hem de cridar: Tots al tren!"
  },
  inspectorAskVoice: {
    speaker: 'Revisora Montserrat',
    title: 'El Gran Crida de Sortida',
    text: "Perquè tothom pugi als vagons i puguem tocar la campana, crida ben fort: 'TOTS AL TREN'!",
    voiceText: "Perquè tothom pugi als vagons, crida amb mi: Tots al tren!",
    targetPhrase: 'Tots al tren',
    syllables: ['Tots', 'al', 'tren'],
    targetId: 'tots_al_tren'
  },
  inspectorSuccess: {
    speaker: 'Revisora Montserrat',
    title: 'Tots a bord!',
    text: "Ding-dong! La campana de bronze ressona per tota la muntanya! Tothom és a bord. Endavant pel túnel!",
    voiceText: "Ding-dong! La campana ressona per la vall! Tothom és a bord. Endavant pel túnel!"
  },

  // Scene 5: La Vall Verda i el Mar
  seasideIntro: {
    speaker: 'Alcaldessa Eulàlia',
    title: 'L\'Arribada al Mar!',
    text: "Mireu el mar blau, les gavines i el far! Hem arribat al final de la línia ferroviària!",
    voiceText: "Visca! Mireu el mar blau, les gavines i el far! El tren ha arribat a la platja!"
  },
  mayorAskVoice: {
    speaker: 'Alcaldessa Eulàlia',
    title: 'La Gran Festa del Tren',
    text: "Per rebre la Medalla d'Or del Gran Maquinista, cridem tots plegats: 'VISCA EL TREN'!",
    voiceText: "Per celebrar aquesta gran aventura, crida amb nosaltres: Visca el tren!",
    targetPhrase: 'Visca el tren',
    syllables: ['Vis', 'ca', 'el', 'tren'],
    targetId: 'visca_el_tren'
  },
  mayorSuccess: {
    speaker: 'Alcaldessa Eulàlia',
    title: '🏅 El Gran Maquinista!',
    text: "Visca! Enhorabona! Has après moltes paraules en català i has portat el tren fins al mar. Ets un autèntic Maquinista d'Honor!",
    voiceText: "Visca el tren i visca el nostre petit maquinista! Enhorabona, has après un munt de català i has arribat al mar!"
  }
};

/**
 * Normalizes text for speech comparison (lowercased, trim accents, remove punctuation)
 */
export function normalizeCatalanText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"¡!¿]/g, '')
    .trim();
}

/**
 * Fuzzy matcher between spoken input and acceptable tokens
 */
export function matchesCatalanToken(spokenText: string, acceptedTokens: string[]): boolean {
  const normSpoken = normalizeCatalanText(spokenText);
  if (!normSpoken) return false;

  for (const token of acceptedTokens) {
    const normToken = normalizeCatalanText(token);
    // Direct inclusion
    if (normSpoken.includes(normToken) || normToken.includes(normSpoken)) {
      return true;
    }

    // Levenshtein distance check for child pronunciations
    if (levenshteinDistance(normSpoken, normToken) <= 2) {
      return true;
    }
  }
  return false;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
