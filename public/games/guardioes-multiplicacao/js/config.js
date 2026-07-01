(function(global){
  'use strict';
  const G = global.Guardioes = global.Guardioes || {};

  G.Config = Object.freeze({
    canvasWidth: 960,
    canvasHeight: 576,
    tile: 64,
    cols: 15,
    rows: 9,
    maxLives: 5,
    startLives: 5,
    startBombs: 10,
    targetCrystals: 9,
    playerSpeed: 190,
    ghostRespawnMs: 6500,
    bombFuseMs: 900,
    blastMs: 420,
    blastRange: 2,
    invulnerabilityMs: 1400,
    interactionDistance: 36,
    interactionResetDistance: 78,
    saveKey: 'guardioes-multiplicacao-etapa-8'
  });

  const commonChallengeSpawns = [
    {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
    {x:7,y:3},{x:13,y:3},{x:3,y:7},{x:11,y:7}
  ];

  G.Worlds = [
    {
      id: 1,
      tabuada: 1,
      name: 'Escola da Comunidade',
      subtitle: 'Os Livros Selados',
      missionKicker: 'MUNDO 1 · TABUADA DO 1',
      mission: 'Os Fantasmas da Desaprendizagem esconderam nove livros que guardam o primeiro Cristal da Multiplicação. Explore o pátio, resolva cada desafio e devolva o conhecimento à escola.',
      missionTip: 'Aproxime-se dos Livros Selados e resolva os nove desafios.',
      challengeName: 'Livro Selado',
      challengeGlyph: '📘',
      completeKicker: 'PRIMEIRO CRISTAL RECUPERADO',
      completeTitle: 'Escola da Comunidade restaurada!',
      transitionText: 'A escola voltou a brilhar. Um novo caminho se abre em direção à Feira de Oeiras.',
      worldIcon: '🏫',
      palette: {
        grassA: '#8dcb7e', grassB: '#82c175', pathA: '#e8d39e', pathB: '#dfc78d',
        wall: '#d8e5ec', wallEdge: '#8ea2af', crate: '#c9823c', crateDark: '#8f5429',
        accent: '#2d8d55', sky: '#174f73', vignette: 'rgba(0,18,34,.22)'
      },
      decorations: [
        {x:2,y:0,type:'tree'}, {x:12,y:0,type:'tree'}, {x:0,y:7,type:'cactus'},
        {x:14,y:6,type:'cactus'}, {x:7,y:0,type:'school'}, {x:7,y:8,type:'flower'}
      ],
      challengeSpawns: commonChallengeSpawns,
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 2,
      tabuada: 2,
      name: 'Feira de Oeiras',
      subtitle: 'As Bancas Embaralhadas',
      missionKicker: 'MUNDO 2 · TABUADA DO 2',
      mission: 'A feira amanheceu em confusão: frutas, sementes e peças de artesanato foram espalhadas pelos corredores. Ajude os feirantes a reorganizar as bancas e recupere o segundo Cristal da Multiplicação.',
      missionTip: 'Explore as bancas da feira e resolva os nove desafios da tabuada do 2.',
      challengeName: 'Banca Encantada',
      challengeGlyph: '🧺',
      completeKicker: 'SEGUNDO CRISTAL RECUPERADO',
      completeTitle: 'A Feira de Oeiras voltou a funcionar!',
      transitionText: 'Os comerciantes celebram. Ao longe, as portas do Mercado Municipal se abrem para a próxima missão.',
      worldIcon: '🧺',
      palette: {
        grassA: '#dba96c', grassB: '#cf9657', pathA: '#f4d9a5', pathB: '#e9c98e',
        wall: '#f0dfc9', wallEdge: '#b98d63', crate: '#df7d3b', crateDark: '#9e4f22',
        accent: '#e07a2f', sky: '#7b3f1f', vignette: 'rgba(53,18,3,.24)'
      },
      decorations: [
        {x:2,y:0,type:'stall'}, {x:12,y:0,type:'stall'}, {x:0,y:7,type:'fruit'},
        {x:14,y:6,type:'fruit'}, {x:7,y:0,type:'market'}, {x:7,y:8,type:'basket'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:5,y:7},{x:11,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'},
        {x:7,y:7,kind:'square',color:'#72d985'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 3,
      tabuada: 3,
      name: 'Mercado Municipal',
      subtitle: 'O Estoque Perdido',
      missionKicker: 'MUNDO 3 · TABUADA DO 3',
      mission: 'As prateleiras do Mercado Municipal ficaram vazias e os produtos foram escondidos em depósitos encantados. Organize o estoque, enfrente fantasmas mais atentos e recupere o terceiro Cristal da Multiplicação.',
      missionTip: 'Encontre os nove depósitos encantados e resolva os desafios da tabuada do 3.',
      challengeName: 'Depósito Encantado',
      challengeGlyph: '📦',
      completeKicker: 'TERCEIRO CRISTAL RECUPERADO',
      completeTitle: 'O Mercado Municipal foi reorganizado!',
      transitionText: 'O Mercado Municipal foi reorganizado. Pelas estradas do sertão, uma nova missão espera na Fazenda Boa Esperança.',
      worldIcon: '🏬',
      palette: {
        grassA: '#8fa9b8', grassB: '#829caa', pathA: '#d4e1e7', pathB: '#c5d5dc',
        wall: '#465b69', wallEdge: '#243846', crate: '#b76b39', crateDark: '#733d22',
        accent: '#3d7fa1', sky: '#203f52', vignette: 'rgba(4,16,24,.30)'
      },
      decorations: [
        {x:2,y:0,type:'shelf'}, {x:12,y:0,type:'shelf'}, {x:0,y:7,type:'cart'},
        {x:14,y:6,type:'cart'}, {x:7,y:0,type:'warehouse'}, {x:7,y:8,type:'boxes'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:3,y:7},{x:9,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'},
        {x:7,y:7,kind:'square',color:'#72d985'},
        {x:9,y:5,kind:'guard',color:'#f3f4f6'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 4,
      tabuada: 4,
      name: 'Fazenda do Sertão',
      subtitle: 'A Colheita Encantada',
      missionKicker: 'MUNDO 4 · TABUADA DO 4',
      mission: 'Os Fantasmas da Confusão espalharam sementes, ferramentas e alimentos pela Fazenda Boa Esperança. Ajude a comunidade a reorganizar a produção e recupere o quarto Cristal da Multiplicação.',
      missionTip: 'Procure os nove cestos encantados e resolva os desafios da tabuada do 4.',
      challengeName: 'Cesto da Colheita',
      challengeGlyph: '🌽',
      completeKicker: 'QUARTO CRISTAL RECUPERADO',
      completeTitle: 'A Fazenda Boa Esperança voltou a produzir!',
      transitionText: 'A colheita foi salva. Seguindo o curso das águas, o Guardião parte para ajudar as comunidades do Rio Canindé.',
      worldIcon: '🌾',
      palette: {
        grassA: '#b6a45b', grassB: '#a8934e', pathA: '#e7c785', pathB: '#d9b872',
        wall: '#a95f35', wallEdge: '#6b3921', crate: '#b87537', crateDark: '#6d3b20',
        accent: '#d58b27', sky: '#6f381a', vignette: 'rgba(53,25,4,.30)'
      },
      decorations: [
        {x:2,y:0,type:'barn'}, {x:12,y:0,type:'tractor'}, {x:0,y:7,type:'corn'},
        {x:14,y:6,type:'chicken'}, {x:7,y:0,type:'farm'}, {x:7,y:8,type:'fence'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:3,y:7},{x:11,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'},
        {x:7,y:7,kind:'square',color:'#72d985'},
        {x:9,y:5,kind:'guard',color:'#f3f4f6'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 5,
      tabuada: 5,
      name: 'Rio Canindé',
      subtitle: 'As Águas do Conhecimento',
      missionKicker: 'MUNDO 5 · TABUADA DO 5',
      mission: 'Uma névoa encantada cobriu o Rio Canindé e desorganizou barcos, redes e materiais das comunidades ribeirinhas. Navegue pelas margens, resolva os desafios e devolva segurança às águas.',
      missionTip: 'Encontre os nove pontos de apoio do rio e resolva os desafios da tabuada do 5.',
      challengeName: 'Ponto de Apoio',
      challengeGlyph: '🐟',
      completeKicker: 'QUINTO CRISTAL RECUPERADO',
      completeTitle: 'As águas do Rio Canindé voltaram a brilhar!',
      transitionText: 'O rio está protegido novamente. Uma trilha antiga conduz o Guardião ao Parque Nacional Serra da Capivara.',
      worldIcon: '🛶',
      palette: {
        grassA: '#4ea6a2', grassB: '#44958f', pathA: '#90d7cc', pathB: '#7bc6bb',
        wall: '#78654b', wallEdge: '#493d2f', crate: '#8b6337', crateDark: '#52391f',
        accent: '#1f9ca3', sky: '#0b5364', vignette: 'rgba(0,33,45,.32)'
      },
      decorations: [
        {x:2,y:0,type:'boat'}, {x:12,y:0,type:'reeds'}, {x:0,y:7,type:'fish'},
        {x:14,y:6,type:'net'}, {x:7,y:0,type:'river'}, {x:7,y:8,type:'water'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:5,y:7},{x:11,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'},
        {x:7,y:7,kind:'square',color:'#72d985'},
        {x:9,y:5,kind:'guard',color:'#f3f4f6'},
        {x:5,y:5,kind:'chaser',color:'#ff9d57'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 6,
      tabuada: 6,
      name: 'Serra da Capivara',
      subtitle: 'Os Registros do Tempo',
      missionKicker: 'MUNDO 6 · TABUADA DO 6',
      mission: 'As trilhas educativas e os painéis de visitação da Serra da Capivara perderam sua luz. Ajude as equipes de preservação a reorganizar materiais, proteger os registros culturais e recuperar o sexto Cristal.',
      missionTip: 'Explore as trilhas e resolva os nove marcos de pesquisa da tabuada do 6.',
      challengeName: 'Marco de Pesquisa',
      challengeGlyph: '🏺',
      completeKicker: 'SEXTO CRISTAL RECUPERADO',
      completeTitle: 'A Serra da Capivara recuperou sua memória!',
      transitionText: 'Você concluiu seis mundos e dominou as tabuadas de 1 a 6. O progresso está salvo para a próxima etapa.',
      worldIcon: '🏞️',
      palette: {
        grassA: '#b96845', grassB: '#a95b3d', pathA: '#dba277', pathB: '#cc8f66',
        wall: '#74422f', wallEdge: '#40251c', crate: '#985634', crateDark: '#592f20',
        accent: '#c45d39', sky: '#532c2a', vignette: 'rgba(45,13,9,.35)'
      },
      decorations: [
        {x:2,y:0,type:'rock'}, {x:12,y:0,type:'painting'}, {x:0,y:7,type:'lizard'},
        {x:14,y:6,type:'cave'}, {x:7,y:0,type:'capivara'}, {x:7,y:8,type:'trail'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:3,y:7},{x:9,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'},
        {x:7,y:7,kind:'square',color:'#72d985'},
        {x:9,y:5,kind:'guard',color:'#f3f4f6'},
        {x:5,y:5,kind:'chaser',color:'#ff9d57'},
        {x:11,y:5,kind:'wander',color:'#d06cff'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 7,
      tabuada: 7,
      name: 'Serra das Confusões',
      subtitle: 'A Trilha da Neblina',
      missionKicker: 'MUNDO 7 · TABUADA DO 7',
      mission: 'Uma neblina encantada cobriu as trilhas da Serra das Confusões e apagou as marcações usadas por pesquisadores e visitantes. Encontre os nove marcos escondidos, organize os materiais de orientação e recupere o sétimo Cristal da Multiplicação.',
      missionTip: 'Atravesse a mata, encontre os nove marcos da trilha e resolva os desafios da tabuada do 7.',
      challengeName: 'Marco da Trilha',
      challengeGlyph: '🧭',
      completeKicker: 'SÉTIMO CRISTAL RECUPERADO',
      completeTitle: 'As trilhas da Serra das Confusões foram reencontradas!',
      transitionText: 'A neblina se dissipa e revela um caminho entre paredões de pedra. O próximo Cristal está no Cânion do Rio Poti.',
      worldIcon: '🌳',
      palette: {
        grassA: '#486f50', grassB: '#3e6247', pathA: '#9f9369', pathB: '#8e825c',
        wall: '#4e493e', wallEdge: '#28251f', crate: '#7e5b35', crateDark: '#49331f',
        accent: '#6ca77b', sky: '#263f38', vignette: 'rgba(7,20,16,.48)'
      },
      decorations: [
        {x:2,y:0,type:'twistedTree'}, {x:12,y:0,type:'fog'}, {x:0,y:7,type:'macaw'},
        {x:14,y:6,type:'boulder'}, {x:7,y:0,type:'confusoes'}, {x:7,y:8,type:'trailMarker'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:3,y:7},{x:11,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'},
        {x:7,y:7,kind:'square',color:'#72d985'},
        {x:9,y:5,kind:'guard',color:'#f3f4f6'},
        {x:5,y:5,kind:'chaser',color:'#ff9d57'},
        {x:11,y:5,kind:'wander',color:'#d06cff'},
        {x:3,y:5,kind:'guard',color:'#e9f0ff'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 8,
      tabuada: 8,
      name: 'Cânion do Rio Poti',
      subtitle: 'As Pontes de Pedra',
      missionKicker: 'MUNDO 8 · TABUADA DO 8',
      mission: 'Os Fantasmas da Pressa espalharam equipamentos pelas margens do Cânion do Rio Poti e enfraqueceram as pontes de passagem. Ajude as equipes locais a reorganizar os materiais, ilumine os paredões e recupere o oitavo Cristal.',
      missionTip: 'Explore as margens e resolva os nove desafios da tabuada do 8.',
      challengeName: 'Ponto do Cânion',
      challengeGlyph: '🌉',
      completeKicker: 'OITAVO CRISTAL RECUPERADO',
      completeTitle: 'As pontes do Cânion do Rio Poti estão seguras!',
      transitionText: 'As águas refletem a luz do oitavo Cristal. Uma estrada antiga leva o Guardião ao Centro Histórico de Oeiras.',
      worldIcon: '🏜️',
      palette: {
        grassA: '#9a6645', grassB: '#87583c', pathA: '#d3a46e', pathB: '#bf8f5e',
        wall: '#6d4937', wallEdge: '#38271f', crate: '#a66b38', crateDark: '#623a21',
        accent: '#d0834e', sky: '#334e61', vignette: 'rgba(28,13,8,.42)'
      },
      decorations: [
        {x:2,y:0,type:'cliff'}, {x:12,y:0,type:'bridge'}, {x:0,y:7,type:'canoePoti'},
        {x:14,y:6,type:'waterfall'}, {x:7,y:0,type:'canyon'}, {x:7,y:8,type:'viewpoint'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:5,y:7},{x:11,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'},
        {x:7,y:7,kind:'square',color:'#72d985'},
        {x:9,y:5,kind:'guard',color:'#f3f4f6'},
        {x:5,y:5,kind:'chaser',color:'#ff9d57'},
        {x:11,y:5,kind:'wander',color:'#d06cff'},
        {x:3,y:5,kind:'chaser',color:'#ff4f82'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 9,
      tabuada: 9,
      name: 'Centro Histórico de Oeiras',
      subtitle: 'As Luzes da Primeira Capital',
      missionKicker: 'MUNDO 9 · TABUADA DO 9',
      mission: 'As luzes dos casarões, praças e igrejas de Oeiras foram aprisionadas pelo Fantasma do Esquecimento. Percorra as ruas históricas, ajude a comunidade a preparar uma grande celebração e recupere o nono Cristal da Multiplicação.',
      missionTip: 'Visite os nove pontos históricos e resolva os desafios da tabuada do 9.',
      challengeName: 'Relíquia Iluminada',
      challengeGlyph: '🏛️',
      completeKicker: 'NONO CRISTAL RECUPERADO',
      completeTitle: 'O Centro Histórico de Oeiras voltou a brilhar!',
      transitionText: 'Os nove Cristais da Multiplicação foram recuperados. No horizonte surge a sombra do Castelo da Desaprendizagem, onde o Senhor da Confusão aguarda a batalha final.',
      worldIcon: '⛪',
      palette: {
        grassA: '#a48e72', grassB: '#967f65', pathA: '#dcc6a5', pathB: '#cdb38f',
        wall: '#e5d8c7', wallEdge: '#8c745d', crate: '#9c633d', crateDark: '#5f3824',
        accent: '#d4a34c', sky: '#342c4c', vignette: 'rgba(22,13,37,.43)'
      },
      decorations: [
        {x:2,y:0,type:'church'}, {x:12,y:0,type:'mansion'}, {x:0,y:7,type:'streetLamp'},
        {x:14,y:6,type:'clock'}, {x:7,y:0,type:'oeiras'}, {x:7,y:8,type:'bunting'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:3,y:7},{x:9,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff6666'},
        {x:1,y:7,kind:'wander',color:'#b58cff'},
        {x:7,y:7,kind:'square',color:'#72d985'},
        {x:9,y:5,kind:'guard',color:'#f3f4f6'},
        {x:5,y:5,kind:'chaser',color:'#ff9d57'},
        {x:11,y:5,kind:'wander',color:'#d06cff'},
        {x:3,y:5,kind:'guard',color:'#ffffff'},
        {x:11,y:1,kind:'chaser',color:'#ff4f82'}
      ],
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    },
    {
      id: 10,
      tabuada: 'MISTAS',
      targetChallenges: 10,
      bossWorld: true,
      name: 'Castelo da Desaprendizagem',
      subtitle: 'A Batalha pelo Cristal Mestre',
      missionKicker: 'MUNDO EXTRA · TABUADAS MISTURADAS',
      mission: 'Os nove Cristais abriram o caminho para o castelo. O Senhor da Confusão reuniu os Fantasmas da Desaprendizagem e protege o Cristal Mestre com dez selos matemáticos. Resolva desafios de diferentes tabuadas, use a Luz para controlar os fantasmas e quebre a armadura do chefão.',
      missionTip: 'Encontre os dez Selos do Conhecimento. Cada resposta correta enfraquece o Senhor da Confusão.',
      challengeName: 'Selo do Conhecimento',
      challengeGlyph: '🔮',
      completeKicker: 'CRISTAL MESTRE RESTAURADO',
      completeTitle: 'O Senhor da Confusão foi derrotado!',
      transitionText: 'A luz dos dez cristais atravessa o Piauí fantástico. As comunidades recuperam suas cores e o Guardião recebe a maior honra da jornada.',
      worldIcon: '🏰',
      palette: {
        grassA: '#26213d', grassB: '#201b34', pathA: '#56436f', pathB: '#49375f',
        wall: '#433851', wallEdge: '#171320', crate: '#6d4056', crateDark: '#321d2a',
        accent: '#b85cff', sky: '#120d20', vignette: 'rgba(5,1,12,.64)'
      },
      decorations: [
        {x:2,y:0,type:'tower'}, {x:12,y:0,type:'tower'}, {x:0,y:7,type:'shadowFlame'},
        {x:14,y:6,type:'shadowFlame'}, {x:7,y:0,type:'castle'}, {x:7,y:8,type:'masterCrystal'}
      ],
      challengeSpawns: [
        {x:3,y:1},{x:5,y:1},{x:9,y:1},{x:11,y:1},{x:1,y:3},
        {x:7,y:3},{x:13,y:3},{x:3,y:7},{x:7,y:7},{x:11,y:7}
      ],
      ghostSpawns: [
        {x:13,y:1,kind:'patrol',color:'#61c9ff'},
        {x:13,y:5,kind:'chaser',color:'#ff5f6d'},
        {x:1,y:7,kind:'wander',color:'#b85cff'},
        {x:5,y:5,kind:'square',color:'#6ee7a5'},
        {x:9,y:5,kind:'guard',color:'#f4f1ff'},
        {x:11,y:5,kind:'chaser',color:'#ff9d57'},
        {x:3,y:5,kind:'wander',color:'#d06cff'},
        {x:5,y:3,kind:'chaser',color:'#ff4f82'},
        {x:1,y:5,kind:'guard',color:'#d9e7ff'},
        {x:9,y:3,kind:'patrol',color:'#7dcfff'}
      ],
      boss: {x:7,y:5,maxHp:10},
      playerSpawn: {x:1,y:1},
      portal: {x:13,y:7}
    }  ];

  G.getWorld = function(worldId){
    return G.Worlds.find(world=>world.id===Number(worldId)) || G.Worlds[0];
  };
})(window);
