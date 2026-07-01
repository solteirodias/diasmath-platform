(function(global){
  'use strict';
  const G=global.Guardioes=global.Guardioes||{};

  const worldOne=[
    {
      id:'w1-1',fact:[1,1],title:'O livro da acolhida',
      text:'Na abertura do ano letivo, a professora Helena preparou uma mesa para a leitura de acolhida. Sobre a mesa, ela colocou 1 livro de histórias. Quantos livros ficaram disponíveis para a leitura?',
      alternatives:[1,2,3,4],
      practice:{groups:1,perGroup:1,groupLabel:'Mesa de leitura',groupIcon:'🪑',itemEmoji:'📚',itemName:'livro de histórias'}
    },
    {
      id:'w1-2',fact:[1,2],title:'O kit de gibis',
      text:'A biblioteca montou 1 kit de leitura para o recreio. Dentro dele foram colocados 2 gibis. Quantos gibis os estudantes encontraram no kit?',
      alternatives:[2,3,4,1],
      practice:{groups:1,perGroup:2,groupLabel:'Kit de leitura',groupIcon:'🧰',itemEmoji:'📖',itemName:'gibis'}
    },
    {
      id:'w1-3',fact:[1,3],title:'Investigadores da natureza',
      text:'Para observar folhas e pequenos insetos no jardim, a turma recebeu 1 bandeja com 3 lupas. Quantas lupas estavam disponíveis para a investigação?',
      alternatives:[3,2,5,4],
      practice:{groups:1,perGroup:3,groupLabel:'Bandeja de ciências',groupIcon:'🧺',itemEmoji:'🔍',itemName:'lupas'}
    },
    {
      id:'w1-4',fact:[1,4],title:'Oficina de desenho',
      text:'Durante a oficina de arte, a professora colocou sobre uma mesa 1 caixa com 4 lápis de cor. Quantos lápis de cor foram separados para a atividade?',
      alternatives:[4,6,3,5],
      practice:{groups:1,perGroup:4,groupLabel:'Caixa de arte',groupIcon:'📦',itemEmoji:'✏️',itemName:'lápis de cor'}
    },
    {
      id:'w1-5',fact:[1,5],title:'Roda de poesia',
      text:'Para a roda de leitura, a coordenadora levou 1 cesto com 5 folhetos de poesia. Quantos folhetos puderam ser compartilhados com a turma?',
      alternatives:[5,4,7,6],
      practice:{groups:1,perGroup:5,groupLabel:'Cesto de leitura',groupIcon:'🧺',itemEmoji:'📜',itemName:'folhetos de poesia'}
    },
    {
      id:'w1-6',fact:[1,6],title:'Jogo dos números',
      text:'Em uma atividade de Matemática, o professor guardou 6 cartas numeradas dentro de 1 envelope. Quantas cartas faziam parte do jogo?',
      alternatives:[6,8,5,7],
      practice:{groups:1,perGroup:6,groupLabel:'Envelope do jogo',groupIcon:'✉️',itemEmoji:'🃏',itemName:'cartas numeradas'}
    },
    {
      id:'w1-7',fact:[1,7],title:'Horta da escola',
      text:'No projeto da horta, os estudantes organizaram 1 caixote com 7 mudas de alface para o plantio. Quantas mudas seriam levadas até o canteiro?',
      alternatives:[7,6,9,8],
      practice:{groups:1,perGroup:7,groupLabel:'Caixote de mudas',groupIcon:'📦',itemEmoji:'🌱',itemName:'mudas de alface'}
    },
    {
      id:'w1-8',fact:[1,8],title:'Circuito de movimento',
      text:'Para uma brincadeira no pátio, a professora de Educação Física preparou 1 bolsa com 8 bolas de iniciação esportiva. Quantas bolas seriam usadas no circuito?',
      alternatives:[8,10,7,9],
      practice:{groups:1,perGroup:8,groupLabel:'Bolsa de materiais',groupIcon:'🎒',itemEmoji:'🥎',itemName:'bolas de iniciação'}
    },
    {
      id:'w1-9',fact:[1,9],title:'Exposição de talentos',
      text:'Na mostra cultural da escola, uma turma montou 1 painel com 9 desenhos produzidos pelos estudantes. Quantos desenhos ficaram expostos no painel?',
      alternatives:[9,8,10,7],
      practice:{groups:1,perGroup:9,groupLabel:'Painel da turma',groupIcon:'📌',itemEmoji:'🖼️',itemName:'desenhos'}
    }
  ];

  const worldTwo=[
    {
      id:'w2-1',fact:[2,1],title:'As mudas de cheiro-verde',
      text:'Dona Francisca separou 2 pequenos caixotes para vender mudas de cheiro-verde. Em cada caixote colocou 1 muda já pronta para o plantio. Quantas mudas ela separou?',
      alternatives:[2,3,1,4],
      practice:{groups:2,perGroup:1,groupLabel:'Caixote',groupIcon:'📦',itemEmoji:'🌱',itemName:'muda de cheiro-verde'}
    },
    {
      id:'w2-2',fact:[2,2],title:'Os pares de cocos',
      text:'Seu Antônio preparou 2 cestos para a banca de frutas. Em cada cesto colocou 2 cocos verdes. Quantos cocos foram organizados para a venda?',
      alternatives:[4,2,6,5],
      practice:{groups:2,perGroup:2,groupLabel:'Cesto',groupIcon:'🧺',itemEmoji:'🥥',itemName:'cocos verdes'}
    },
    {
      id:'w2-3',fact:[2,3],title:'Milho para o café da manhã',
      text:'Uma feirante montou 2 bandejas de milho cozido. Em cada bandeja colocou 3 espigas. Quantas espigas ficaram prontas para os clientes?',
      alternatives:[6,5,8,4],
      practice:{groups:2,perGroup:3,groupLabel:'Bandeja',groupIcon:'🍽️',itemEmoji:'🌽',itemName:'espigas de milho'}
    },
    {
      id:'w2-4',fact:[2,4],title:'Mangas maduras',
      text:'Na Feira de Oeiras, Dona Rosa organizou 2 caixas de mangas maduras. Em cada caixa colocou 4 mangas. Quantas mangas foram preparadas para a venda?',
      alternatives:[8,6,10,7],
      practice:{groups:2,perGroup:4,groupLabel:'Caixa de mangas',groupIcon:'📦',itemEmoji:'🥭',itemName:'mangas maduras'}
    },
    {
      id:'w2-5',fact:[2,5],title:'Peças de artesanato',
      text:'Mestre Joaquim levou 2 expositores de artesanato para a feira. Em cada expositor colocou 5 pequenas peças de barro. Quantas peças ficaram em exposição?',
      alternatives:[10,12,8,9],
      practice:{groups:2,perGroup:5,groupLabel:'Expositor',groupIcon:'🪵',itemEmoji:'🏺',itemName:'peças de barro'}
    },
    {
      id:'w2-6',fact:[2,6],title:'Cachos de banana',
      text:'Para facilitar a escolha dos clientes, um vendedor arrumou 2 bancas iguais. Em cada banca colocou 6 cachos de banana. Quantos cachos ficaram disponíveis?',
      alternatives:[12,10,14,11],
      practice:{groups:2,perGroup:6,groupLabel:'Banca',groupIcon:'🛒',itemEmoji:'🍌',itemName:'cachos de banana'}
    },
    {
      id:'w2-7',fact:[2,7],title:'Pacotes de castanha',
      text:'Uma produtora organizou 2 cestas de produtos regionais. Em cada cesta colocou 7 pacotes de castanha. Quantos pacotes foram separados?',
      alternatives:[14,12,16,15],
      practice:{groups:2,perGroup:7,groupLabel:'Cesta regional',groupIcon:'🧺',itemEmoji:'🥜',itemName:'pacotes de castanha'}
    },
    {
      id:'w2-8',fact:[2,8],title:'Garrafas de mel',
      text:'Uma família de apicultores trouxe 2 caixas para a feira. Cada caixa continha 8 garrafas de mel. Quantas garrafas de mel foram trazidas ao todo?',
      alternatives:[16,18,14,15],
      practice:{groups:2,perGroup:8,groupLabel:'Caixa de mel',groupIcon:'📦',itemEmoji:'🍯',itemName:'garrafas de mel'}
    },
    {
      id:'w2-9',fact:[2,9],title:'Cordéis na banca',
      text:'Na banca de literatura popular, foram montados 2 varais. Em cada varal ficaram pendurados 9 folhetos de cordel. Quantos folhetos foram expostos?',
      alternatives:[18,16,20,17],
      practice:{groups:2,perGroup:9,groupLabel:'Varal de cordel',groupIcon:'🧵',itemEmoji:'📜',itemName:'folhetos de cordel'}
    }
  ];

  const worldThree=[
    {
      id:'w3-1',fact:[3,1],title:'Caixas de café',
      text:'Antes da abertura do mercado, o gerente colocou 3 caixas sobre o balcão. Em cada caixa havia 1 pacote de café regional. Quantos pacotes foram colocados no balcão?',
      alternatives:[3,2,4,6],
      practice:{groups:3,perGroup:1,groupLabel:'Caixa',groupIcon:'📦',itemEmoji:'☕',itemName:'pacote de café'}
    },
    {
      id:'w3-2',fact:[3,2],title:'Garrafas de leite',
      text:'Na seção de laticínios, 3 engradados foram preparados para reposição. Cada engradado recebeu 2 garrafas de leite. Quantas garrafas foram separadas?',
      alternatives:[6,5,8,4],
      practice:{groups:3,perGroup:2,groupLabel:'Engradado',groupIcon:'🧺',itemEmoji:'🥛',itemName:'garrafas de leite'}
    },
    {
      id:'w3-3',fact:[3,3],title:'Pacotes de arroz',
      text:'O estoquista organizou 3 prateleiras para uma promoção. Em cada prateleira colocou 3 pacotes de arroz. Quantos pacotes ficaram expostos?',
      alternatives:[9,6,12,8],
      practice:{groups:3,perGroup:3,groupLabel:'Prateleira',groupIcon:'🗄️',itemEmoji:'🍚',itemName:'pacotes de arroz'}
    },
    {
      id:'w3-4',fact:[3,4],title:'Cestas de feijão',
      text:'Para abastecer três corredores do mercado, foram montadas 3 cestas iguais. Em cada cesta havia 4 pacotes de feijão. Quantos pacotes foram distribuídos?',
      alternatives:[12,10,14,9],
      practice:{groups:3,perGroup:4,groupLabel:'Cesta',groupIcon:'🧺',itemEmoji:'🫘',itemName:'pacotes de feijão'}
    },
    {
      id:'w3-5',fact:[3,5],title:'Frutas para a cantina',
      text:'Uma escola fez uma encomenda no mercado. O atendente separou 3 caixas com 5 maçãs em cada uma. Quantas maçãs foram preparadas para a entrega?',
      alternatives:[15,12,18,14],
      practice:{groups:3,perGroup:5,groupLabel:'Caixa de frutas',groupIcon:'📦',itemEmoji:'🍎',itemName:'maçãs'}
    },
    {
      id:'w3-6',fact:[3,6],title:'Sabonetes nas gôndolas',
      text:'Na seção de higiene, 3 gôndolas receberam 6 sabonetes cada uma. Quantos sabonetes ficaram disponíveis para os clientes?',
      alternatives:[18,16,21,15],
      practice:{groups:3,perGroup:6,groupLabel:'Gôndola',groupIcon:'🗄️',itemEmoji:'🧼',itemName:'sabonetes'}
    },
    {
      id:'w3-7',fact:[3,7],title:'Garrafas de suco',
      text:'Para uma ação de degustação, o mercado preparou 3 mesas. Em cada mesa colocou 7 garrafas de suco de caju. Quantas garrafas foram utilizadas?',
      alternatives:[21,18,24,20],
      practice:{groups:3,perGroup:7,groupLabel:'Mesa de degustação',groupIcon:'🪑',itemEmoji:'🧃',itemName:'garrafas de suco de caju'}
    },
    {
      id:'w3-8',fact:[3,8],title:'Cadernos da papelaria',
      text:'A papelaria do mercado recebeu 3 caixas de material escolar. Cada caixa trouxe 8 cadernos. Quantos cadernos chegaram para a loja?',
      alternatives:[24,21,27,22],
      practice:{groups:3,perGroup:8,groupLabel:'Caixa de papelaria',groupIcon:'📦',itemEmoji:'📒',itemName:'cadernos'}
    },
    {
      id:'w3-9',fact:[3,9],title:'Lâmpadas do corredor',
      text:'Para melhorar a iluminação, foram organizados 3 conjuntos com 9 lâmpadas de LED em cada conjunto. Quantas lâmpadas seriam instaladas no mercado?',
      alternatives:[27,24,30,26],
      practice:{groups:3,perGroup:9,groupLabel:'Conjunto de iluminação',groupIcon:'📦',itemEmoji:'💡',itemName:'lâmpadas de LED'}
    }
  ];


  const worldFour=[
    {
      id:'w4-1',fact:[4,1],title:'Regadores nos canteiros',
      text:'Na Fazenda Boa Esperança, foram preparados 4 canteiros para o plantio. Ao lado de cada canteiro ficou 1 regador. Quantos regadores foram distribuídos?',
      alternatives:[4,5,3,8],
      practice:{groups:4,perGroup:1,groupLabel:'Canteiro',groupIcon:'🌱',itemEmoji:'🪣',itemName:'regador'}
    },
    {
      id:'w4-2',fact:[4,2],title:'Galinhas nos cercados',
      text:'Seu Raimundo organizou 4 pequenos cercados. Em cada cercado colocou 2 galinhas para protegê-las durante a limpeza do galinheiro. Quantas galinhas foram acomodadas?',
      alternatives:[8,6,10,4],
      practice:{groups:4,perGroup:2,groupLabel:'Cercado',groupIcon:'🪵',itemEmoji:'🐔',itemName:'galinhas'}
    },
    {
      id:'w4-3',fact:[4,3],title:'Espigas para a feira',
      text:'Depois da colheita, Dona Lúcia separou 4 cestos. Em cada cesto colocou 3 espigas de milho. Quantas espigas foram preparadas para a feira?',
      alternatives:[12,10,14,16],
      practice:{groups:4,perGroup:3,groupLabel:'Cesto',groupIcon:'🧺',itemEmoji:'🌽',itemName:'espigas de milho'}
    },
    {
      id:'w4-4',fact:[4,4],title:'Ovos para a merenda',
      text:'A comunidade organizou 4 bandejas para entregar à escola. Cada bandeja recebeu 4 ovos. Quantos ovos foram separados para a merenda?',
      alternatives:[16,12,20,14],
      practice:{groups:4,perGroup:4,groupLabel:'Bandeja',groupIcon:'🍽️',itemEmoji:'🥚',itemName:'ovos'}
    },
    {
      id:'w4-5',fact:[4,5],title:'Mudas de tomate',
      text:'Na horta da fazenda, os estudantes montaram 4 fileiras. Em cada fileira plantaram 5 mudas de tomate. Quantas mudas foram plantadas?',
      alternatives:[20,18,24,16],
      practice:{groups:4,perGroup:5,groupLabel:'Fileira',groupIcon:'🪴',itemEmoji:'🌱',itemName:'mudas de tomate'}
    },
    {
      id:'w4-6',fact:[4,6],title:'Sementes selecionadas',
      text:'Para preservar sementes crioulas, a família guardou 4 envelopes. Em cada envelope colocou 6 sementes de abóbora. Quantas sementes foram armazenadas?',
      alternatives:[24,20,28,22],
      practice:{groups:4,perGroup:6,groupLabel:'Envelope',groupIcon:'✉️',itemEmoji:'🌰',itemName:'sementes de abóbora'}
    },
    {
      id:'w4-7',fact:[4,7],title:'Porções de ração',
      text:'Antes do amanhecer, foram preparados 4 cochos. Cada cocho recebeu 7 porções de ração. Quantas porções foram distribuídas aos animais?',
      alternatives:[28,24,32,30],
      practice:{groups:4,perGroup:7,groupLabel:'Cocho',groupIcon:'🪵',itemEmoji:'🥣',itemName:'porções de ração'}
    },
    {
      id:'w4-8',fact:[4,8],title:'Caixas de caju',
      text:'Durante a colheita do caju, os trabalhadores encheram 4 caixas. Em cada caixa colocaram 8 cajus maduros. Quantos cajus foram colhidos?',
      alternatives:[32,28,36,30],
      practice:{groups:4,perGroup:8,groupLabel:'Caixa',groupIcon:'📦',itemEmoji:'🍎',itemName:'cajus maduros'}
    },
    {
      id:'w4-9',fact:[4,9],title:'Feixes de capim',
      text:'Para alimentar o rebanho, 4 carroças foram carregadas. Cada carroça levou 9 feixes de capim. Quantos feixes foram transportados?',
      alternatives:[36,32,40,34],
      practice:{groups:4,perGroup:9,groupLabel:'Carroça',groupIcon:'🛒',itemEmoji:'🌾',itemName:'feixes de capim'}
    }
  ];

  const worldFive=[
    {
      id:'w5-1',fact:[5,1],title:'Lanternas nas canoas',
      text:'Antes de uma travessia ao entardecer, 5 canoas receberam 1 lanterna de segurança cada uma. Quantas lanternas foram distribuídas?',
      alternatives:[5,4,6,10],
      practice:{groups:5,perGroup:1,groupLabel:'Canoa',groupIcon:'🛶',itemEmoji:'🏮',itemName:'lanterna de segurança'}
    },
    {
      id:'w5-2',fact:[5,2],title:'Remos preparados',
      text:'A comunidade revisou 5 canoas para uma atividade no rio. Em cada canoa foram colocados 2 remos. Quantos remos ficaram prontos?',
      alternatives:[10,8,12,15],
      practice:{groups:5,perGroup:2,groupLabel:'Canoa',groupIcon:'🛶',itemEmoji:'🪵',itemName:'remos'}
    },
    {
      id:'w5-3',fact:[5,3],title:'Coletes de segurança',
      text:'Para receber visitantes, os guias organizaram 5 caixas. Em cada caixa guardaram 3 coletes salva-vidas. Quantos coletes foram preparados?',
      alternatives:[15,12,18,10],
      practice:{groups:5,perGroup:3,groupLabel:'Caixa',groupIcon:'📦',itemEmoji:'🦺',itemName:'coletes salva-vidas'}
    },
    {
      id:'w5-4',fact:[5,4],title:'Boias nas redes',
      text:'Os pescadores verificaram 5 redes de pesca artesanal. Cada rede precisava de 4 boias de sinalização. Quantas boias foram utilizadas?',
      alternatives:[20,16,24,18],
      practice:{groups:5,perGroup:4,groupLabel:'Rede',groupIcon:'🕸️',itemEmoji:'🛟',itemName:'boias de sinalização'}
    },
    {
      id:'w5-5',fact:[5,5],title:'Peixes registrados',
      text:'Em uma atividade de observação ambiental, os estudantes analisaram 5 trechos do rio. Em cada trecho registraram 5 peixes. Quantos peixes foram registrados?',
      alternatives:[25,20,30,15],
      practice:{groups:5,perGroup:5,groupLabel:'Trecho do rio',groupIcon:'🌊',itemEmoji:'🐟',itemName:'peixes observados'}
    },
    {
      id:'w5-6',fact:[5,6],title:'Kits de pesca',
      text:'Para uma oficina sobre pesca responsável, foram montados 5 kits. Cada kit recebeu 6 anzóis educativos sem ponta. Quantos anzóis foram separados?',
      alternatives:[30,25,35,28],
      practice:{groups:5,perGroup:6,groupLabel:'Kit',groupIcon:'🎒',itemEmoji:'🪝',itemName:'anzóis educativos'}
    },
    {
      id:'w5-7',fact:[5,7],title:'Mutirão das margens',
      text:'Durante um mutirão de cuidado com o rio, 5 equipes receberam 7 sacos para recolher resíduos. Quantos sacos foram distribuídos?',
      alternatives:[35,30,40,32],
      practice:{groups:5,perGroup:7,groupLabel:'Equipe',groupIcon:'👥',itemEmoji:'🗑️',itemName:'sacos de coleta'}
    },
    {
      id:'w5-8',fact:[5,8],title:'Garrafas para os voluntários',
      text:'Os organizadores prepararam 5 caixas de apoio. Em cada caixa colocaram 8 garrafas de água para os voluntários. Quantas garrafas foram separadas?',
      alternatives:[40,35,45,38],
      practice:{groups:5,perGroup:8,groupLabel:'Caixa de apoio',groupIcon:'📦',itemEmoji:'💧',itemName:'garrafas de água'}
    },
    {
      id:'w5-9',fact:[5,9],title:'Peixes para secagem',
      text:'Uma família ribeirinha montou 5 varais para secar o pescado. Em cada varal colocou 9 peixes. Quantos peixes foram organizados?',
      alternatives:[45,40,50,42],
      practice:{groups:5,perGroup:9,groupLabel:'Varal',groupIcon:'🧵',itemEmoji:'🐟',itemName:'peixes'}
    }
  ];

  const worldSix=[
    {
      id:'w6-1',fact:[6,1],title:'Mapas das equipes',
      text:'Seis equipes de educação ambiental iniciaram uma visita guiada. Cada equipe recebeu 1 mapa das trilhas. Quantos mapas foram entregues?',
      alternatives:[6,5,7,12],
      practice:{groups:6,perGroup:1,groupLabel:'Equipe',groupIcon:'👥',itemEmoji:'🗺️',itemName:'mapa das trilhas'}
    },
    {
      id:'w6-2',fact:[6,2],title:'Placas de orientação',
      text:'Os monitores revisaram 6 pequenos trechos de trilha. Em cada trecho instalaram 2 placas de orientação. Quantas placas foram instaladas?',
      alternatives:[12,10,14,8],
      practice:{groups:6,perGroup:2,groupLabel:'Trecho',groupIcon:'🥾',itemEmoji:'🪧',itemName:'placas de orientação'}
    },
    {
      id:'w6-3',fact:[6,3],title:'Réplicas educativas',
      text:'Em uma oficina sobre patrimônio cultural, foram organizadas 6 mesas. Cada mesa recebeu 3 réplicas educativas de artefatos. Quantas réplicas foram utilizadas?',
      alternatives:[18,15,21,16],
      practice:{groups:6,perGroup:3,groupLabel:'Mesa',groupIcon:'🪑',itemEmoji:'🏺',itemName:'réplicas educativas'}
    },
    {
      id:'w6-4',fact:[6,4],title:'Imagens nos painéis',
      text:'O centro de visitantes preparou 6 painéis informativos. Em cada painel colocou 4 imagens de registros rupestres. Quantas imagens foram expostas?',
      alternatives:[24,20,28,22],
      practice:{groups:6,perGroup:4,groupLabel:'Painel',groupIcon:'🖼️',itemEmoji:'🎨',itemName:'imagens de registros rupestres'}
    },
    {
      id:'w6-5',fact:[6,5],title:'Garrafas nas mochilas',
      text:'Para uma caminhada educativa, 6 mochilas de apoio foram preparadas. Cada mochila recebeu 5 garrafas de água. Quantas garrafas foram organizadas?',
      alternatives:[30,25,36,28],
      practice:{groups:6,perGroup:5,groupLabel:'Mochila',groupIcon:'🎒',itemEmoji:'💧',itemName:'garrafas de água'}
    },
    {
      id:'w6-6',fact:[6,6],title:'Kits de observação',
      text:'Os pesquisadores organizaram 6 caixas de campo. Em cada caixa colocaram 6 lupas para atividades de observação. Quantas lupas foram separadas?',
      alternatives:[36,30,42,32],
      practice:{groups:6,perGroup:6,groupLabel:'Caixa de campo',groupIcon:'📦',itemEmoji:'🔍',itemName:'lupas'}
    },
    {
      id:'w6-7',fact:[6,7],title:'Estudantes nas trilhas',
      text:'Durante uma visita escolar, foram formados 6 grupos. Cada grupo ficou com 7 estudantes e um monitor. Quantos estudantes participaram dos grupos?',
      alternatives:[42,36,48,40],
      practice:{groups:6,perGroup:7,groupLabel:'Grupo',groupIcon:'👥',itemEmoji:'🧑‍🎓',itemName:'estudantes'}
    },
    {
      id:'w6-8',fact:[6,8],title:'Luzes de orientação',
      text:'Para uma atividade no fim da tarde, 6 pontos de apoio receberam 8 lanternas recarregáveis cada um. Quantas lanternas foram distribuídas?',
      alternatives:[48,42,54,46],
      practice:{groups:6,perGroup:8,groupLabel:'Ponto de apoio',groupIcon:'⛺',itemEmoji:'🔦',itemName:'lanternas recarregáveis'}
    },
    {
      id:'w6-9',fact:[6,9],title:'Desenhos nos cadernos',
      text:'Após a visita, 6 turmas produziram cadernos coletivos. Cada caderno reuniu 9 desenhos sobre a Serra da Capivara. Quantos desenhos foram reunidos?',
      alternatives:[54,48,60,52],
      practice:{groups:6,perGroup:9,groupLabel:'Caderno coletivo',groupIcon:'📒',itemEmoji:'🖼️',itemName:'desenhos'}
    }
  ];


  const worldSeven=[
    {
      id:'w7-1',fact:[7,1],title:'Mapas para os guias',
      text:'Sete guias se prepararam para conduzir pequenos grupos pela Serra das Confusões. Cada guia recebeu 1 mapa resistente à umidade. Quantos mapas foram entregues?',
      alternatives:[7,6,8,14],
      practice:{groups:7,perGroup:1,groupLabel:'Guia',groupIcon:'🧭',itemEmoji:'🗺️',itemName:'mapa de trilha'}
    },
    {
      id:'w7-2',fact:[7,2],title:'Cantís nas mochilas',
      text:'Para uma caminhada segura, foram organizadas 7 mochilas de apoio. Em cada mochila ficaram 2 cantis de água. Quantos cantis foram preparados?',
      alternatives:[14,12,16,9],
      practice:{groups:7,perGroup:2,groupLabel:'Mochila',groupIcon:'🎒',itemEmoji:'🧴',itemName:'cantis de água'}
    },
    {
      id:'w7-3',fact:[7,3],title:'Placas nas trilhas',
      text:'A equipe de conservação revisou 7 trechos da serra. Em cada trecho instalou 3 placas de orientação. Quantas placas passaram a indicar os caminhos?',
      alternatives:[21,18,24,20],
      practice:{groups:7,perGroup:3,groupLabel:'Trecho da trilha',groupIcon:'🥾',itemEmoji:'🪧',itemName:'placas de orientação'}
    },
    {
      id:'w7-4',fact:[7,4],title:'Mudas da caatinga',
      text:'Em uma ação de recuperação ambiental, 7 canteiros receberam 4 mudas de espécies da caatinga cada um. Quantas mudas foram plantadas?',
      alternatives:[28,24,32,27],
      practice:{groups:7,perGroup:4,groupLabel:'Canteiro',groupIcon:'🪴',itemEmoji:'🌱',itemName:'mudas da caatinga'}
    },
    {
      id:'w7-5',fact:[7,5],title:'Cadernos de observação',
      text:'Sete equipes de estudantes registraram a fauna e a vegetação da serra. Cada equipe utilizou 5 cadernos de campo. Quantos cadernos foram usados?',
      alternatives:[35,30,42,32],
      practice:{groups:7,perGroup:5,groupLabel:'Equipe',groupIcon:'👥',itemEmoji:'📒',itemName:'cadernos de campo'}
    },
    {
      id:'w7-6',fact:[7,6],title:'Sementes preservadas',
      text:'Os pesquisadores organizaram 7 envelopes para guardar sementes coletadas de forma responsável. Cada envelope recebeu 6 sementes. Quantas sementes foram catalogadas?',
      alternatives:[42,36,49,40],
      practice:{groups:7,perGroup:6,groupLabel:'Envelope',groupIcon:'✉️',itemEmoji:'🌰',itemName:'sementes catalogadas'}
    },
    {
      id:'w7-7',fact:[7,7],title:'Lanternas do acampamento',
      text:'Para iluminar os pontos de apoio, foram montados 7 acampamentos. Cada acampamento recebeu 7 lanternas recarregáveis. Quantas lanternas ficaram disponíveis?',
      alternatives:[49,42,56,48],
      practice:{groups:7,perGroup:7,groupLabel:'Acampamento',groupIcon:'⛺',itemEmoji:'🔦',itemName:'lanternas recarregáveis'}
    },
    {
      id:'w7-8',fact:[7,8],title:'Registros de aves',
      text:'Durante uma pesquisa, 7 pontos de observação registraram 8 aves cada um. Quantos registros de aves foram anotados pelas equipes?',
      alternatives:[56,48,63,54],
      practice:{groups:7,perGroup:8,groupLabel:'Ponto de observação',groupIcon:'🔭',itemEmoji:'🦜',itemName:'registros de aves'}
    },
    {
      id:'w7-9',fact:[7,9],title:'Kits para os visitantes',
      text:'O centro de apoio preparou 7 caixas para receber grupos de visitantes. Em cada caixa colocou 9 kits de orientação. Quantos kits foram organizados?',
      alternatives:[63,56,72,61],
      practice:{groups:7,perGroup:9,groupLabel:'Caixa de apoio',groupIcon:'📦',itemEmoji:'🎒',itemName:'kits de orientação'}
    }
  ];

  const worldEight=[
    {
      id:'w8-1',fact:[8,1],title:'Cordas para a travessia',
      text:'Oito pontos de apoio do Cânion do Rio Poti receberam 1 corda de segurança cada um. Quantas cordas foram distribuídas?',
      alternatives:[8,7,9,16],
      practice:{groups:8,perGroup:1,groupLabel:'Ponto de apoio',groupIcon:'⛺',itemEmoji:'🪢',itemName:'corda de segurança'}
    },
    {
      id:'w8-2',fact:[8,2],title:'Remos nas canoas',
      text:'Para uma atividade de educação ambiental, 8 canoas foram preparadas. Cada canoa recebeu 2 remos. Quantos remos ficaram prontos para o percurso?',
      alternatives:[16,14,18,10],
      practice:{groups:8,perGroup:2,groupLabel:'Canoa',groupIcon:'🛶',itemEmoji:'🪵',itemName:'remos'}
    },
    {
      id:'w8-3',fact:[8,3],title:'Capacetes dos visitantes',
      text:'Oito equipes iniciaram uma trilha entre os paredões. Cada equipe recebeu 3 capacetes de proteção. Quantos capacetes foram entregues?',
      alternatives:[24,21,27,22],
      practice:{groups:8,perGroup:3,groupLabel:'Equipe',groupIcon:'👥',itemEmoji:'⛑️',itemName:'capacetes de proteção'}
    },
    {
      id:'w8-4',fact:[8,4],title:'Lanternas das passagens',
      text:'Para sinalizar trechos mais escuros, 8 passagens receberam 4 lanternas cada uma. Quantas lanternas iluminaram os caminhos?',
      alternatives:[32,28,36,30],
      practice:{groups:8,perGroup:4,groupLabel:'Passagem',groupIcon:'🪨',itemEmoji:'🏮',itemName:'lanternas'}
    },
    {
      id:'w8-5',fact:[8,5],title:'Garrafas para a caminhada',
      text:'Os monitores montaram 8 caixas de hidratação. Em cada caixa colocaram 5 garrafas de água. Quantas garrafas foram separadas para os participantes?',
      alternatives:[40,35,45,38],
      practice:{groups:8,perGroup:5,groupLabel:'Caixa de hidratação',groupIcon:'📦',itemEmoji:'💧',itemName:'garrafas de água'}
    },
    {
      id:'w8-6',fact:[8,6],title:'Placas nas pontes',
      text:'Oito pequenas pontes receberam 6 placas educativas sobre preservação do rio. Quantas placas foram instaladas ao longo do percurso?',
      alternatives:[48,42,54,46],
      practice:{groups:8,perGroup:6,groupLabel:'Ponte',groupIcon:'🌉',itemEmoji:'🪧',itemName:'placas educativas'}
    },
    {
      id:'w8-7',fact:[8,7],title:'Mudas nas margens',
      text:'Em um mutirão, 8 trechos das margens do rio receberam 7 mudas nativas cada um. Quantas mudas ajudaram a proteger o solo?',
      alternatives:[56,48,64,54],
      practice:{groups:8,perGroup:7,groupLabel:'Trecho da margem',groupIcon:'🌊',itemEmoji:'🌱',itemName:'mudas nativas'}
    },
    {
      id:'w8-8',fact:[8,8],title:'Fotos dos paredões',
      text:'Oito grupos registraram as formações rochosas do cânion. Cada grupo selecionou 8 fotografias para uma exposição. Quantas fotografias foram escolhidas?',
      alternatives:[64,56,72,62],
      practice:{groups:8,perGroup:8,groupLabel:'Grupo',groupIcon:'👥',itemEmoji:'📷',itemName:'fotografias'}
    },
    {
      id:'w8-9',fact:[8,9],title:'Kits de primeiros socorros',
      text:'Para reforçar a segurança, 8 bases de apoio receberam 9 itens de primeiros socorros cada uma. Quantos itens foram distribuídos?',
      alternatives:[72,64,81,70],
      practice:{groups:8,perGroup:9,groupLabel:'Base de apoio',groupIcon:'⛺',itemEmoji:'🩹',itemName:'itens de primeiros socorros'}
    }
  ];

  const worldNine=[
    {
      id:'w9-1',fact:[9,1],title:'Luzes das fachadas',
      text:'Nove casarões do Centro Histórico receberam 1 refletor cada um para uma visita noturna. Quantos refletores foram instalados?',
      alternatives:[9,8,10,18],
      practice:{groups:9,perGroup:1,groupLabel:'Casarão',groupIcon:'🏛️',itemEmoji:'💡',itemName:'refletor'}
    },
    {
      id:'w9-2',fact:[9,2],title:'Vasos nas janelas',
      text:'Para enfeitar as ruas, 9 janelas de casarões receberam 2 vasos de flores cada uma. Quantos vasos foram usados na decoração?',
      alternatives:[18,16,20,12],
      practice:{groups:9,perGroup:2,groupLabel:'Janela',groupIcon:'🪟',itemEmoji:'🪴',itemName:'vasos de flores'}
    },
    {
      id:'w9-3',fact:[9,3],title:'Guias do patrimônio',
      text:'Nove grupos de visitantes iniciaram um passeio pelo centro antigo. Cada grupo recebeu 3 guias impressos sobre o patrimônio de Oeiras. Quantos guias foram entregues?',
      alternatives:[27,24,30,21],
      practice:{groups:9,perGroup:3,groupLabel:'Grupo de visitantes',groupIcon:'👥',itemEmoji:'📖',itemName:'guias do patrimônio'}
    },
    {
      id:'w9-4',fact:[9,4],title:'Bandeirolas nas varandas',
      text:'Nove varandas foram preparadas para uma celebração cultural. Em cada varanda ficaram 4 bandeirolas. Quantas bandeirolas coloriram as ruas?',
      alternatives:[36,32,40,34],
      practice:{groups:9,perGroup:4,groupLabel:'Varanda',groupIcon:'🏠',itemEmoji:'🚩',itemName:'bandeirolas'}
    },
    {
      id:'w9-5',fact:[9,5],title:'Velas da apresentação',
      text:'Durante uma apresentação histórica, 9 lanternas decorativas receberam 5 velas elétricas cada uma. Quantas velas foram utilizadas?',
      alternatives:[45,40,50,42],
      practice:{groups:9,perGroup:5,groupLabel:'Lanterna decorativa',groupIcon:'🏮',itemEmoji:'🕯️',itemName:'velas elétricas'}
    },
    {
      id:'w9-6',fact:[9,6],title:'Cordéis na praça',
      text:'Nove expositores foram montados na praça para valorizar a literatura popular. Cada expositor recebeu 6 folhetos de cordel. Quantos folhetos ficaram disponíveis?',
      alternatives:[54,48,60,52],
      practice:{groups:9,perGroup:6,groupLabel:'Expositor',groupIcon:'🪵',itemEmoji:'📜',itemName:'folhetos de cordel'}
    },
    {
      id:'w9-7',fact:[9,7],title:'Cadeiras do concerto',
      text:'Para um concerto ao ar livre, foram organizadas 9 fileiras. Cada fileira recebeu 7 cadeiras. Quantas pessoas poderão se sentar nessas fileiras?',
      alternatives:[63,56,70,61],
      practice:{groups:9,perGroup:7,groupLabel:'Fileira',groupIcon:'🎼',itemEmoji:'🪑',itemName:'cadeiras'}
    },
    {
      id:'w9-8',fact:[9,8],title:'Azulejos da exposição',
      text:'Uma exposição reuniu 9 painéis sobre a arquitetura de Oeiras. Cada painel apresentou 8 réplicas de azulejos. Quantas réplicas foram expostas?',
      alternatives:[72,64,81,70],
      practice:{groups:9,perGroup:8,groupLabel:'Painel',groupIcon:'🖼️',itemEmoji:'🔷',itemName:'réplicas de azulejos'}
    },
    {
      id:'w9-9',fact:[9,9],title:'Luzes da grande celebração',
      text:'Na noite de encerramento, 9 ruas históricas receberam 9 pontos de luz cada uma. Quantos pontos de luz iluminaram a celebração?',
      alternatives:[81,72,90,79],
      practice:{groups:9,perGroup:9,groupLabel:'Rua histórica',groupIcon:'🛣️',itemEmoji:'✨',itemName:'pontos de luz'}
    }
  ];


  const worldTen = [
    {
      id:'w10-1',fact:[7,8],title:'Tochas do salão sombrio',
      text:'Para iluminar o salão principal do castelo, os Guardiões posicionaram 7 suportes. Cada suporte recebeu 8 tochas de luz. Quantas tochas foram acesas?',
      alternatives:[56,54,63,48],
      practice:{groups:7,perGroup:8,groupLabel:'Suporte',groupIcon:'🗿',itemEmoji:'🔥',itemName:'tochas de luz'}
    },
    {
      id:'w10-2',fact:[6,9],title:'Livros da biblioteca encantada',
      text:'A biblioteca do castelo possui 6 estantes protegidas. Em cada estante foram encontrados 9 livros mágicos. Quantos livros foram recuperados?',
      alternatives:[54,48,56,63],
      practice:{groups:6,perGroup:9,groupLabel:'Estante',groupIcon:'📚',itemEmoji:'📕',itemName:'livros mágicos'}
    },
    {
      id:'w10-3',fact:[8,7],title:'Cristais da ponte suspensa',
      text:'A ponte suspensa é formada por 8 arcos de pedra. Cada arco precisa de 7 cristais luminosos para permanecer seguro. Quantos cristais são necessários?',
      alternatives:[56,49,64,54],
      practice:{groups:8,perGroup:7,groupLabel:'Arco',groupIcon:'🌉',itemEmoji:'💎',itemName:'cristais luminosos'}
    },
    {
      id:'w10-4',fact:[9,6],title:'Escudos da guarda de luz',
      text:'Nove equipes chegaram para proteger as comunidades. Cada equipe trouxe 6 escudos de luz. Quantos escudos foram reunidos?',
      alternatives:[54,45,63,52],
      practice:{groups:9,perGroup:6,groupLabel:'Equipe',groupIcon:'🛡️',itemEmoji:'🔰',itemName:'escudos de luz'}
    },
    {
      id:'w10-5',fact:[4,8],title:'Chaves dos portões internos',
      text:'O castelo possui 4 portões internos. Para desfazer o encantamento de cada portão são necessárias 8 chaves douradas. Quantas chaves serão usadas?',
      alternatives:[32,28,36,24],
      practice:{groups:4,perGroup:8,groupLabel:'Portão',groupIcon:'🚪',itemEmoji:'🗝️',itemName:'chaves douradas'}
    },
    {
      id:'w10-6',fact:[5,9],title:'Frascos do laboratório',
      text:'No laboratório do Senhor da Confusão há 5 bancadas. Cada bancada guarda 9 frascos de energia sombria que precisam ser neutralizados. Quantos frascos existem?',
      alternatives:[45,40,50,54],
      practice:{groups:5,perGroup:9,groupLabel:'Bancada',groupIcon:'🧪',itemEmoji:'⚗️',itemName:'frascos de energia'}
    },
    {
      id:'w10-7',fact:[3,8],title:'Símbolos das muralhas',
      text:'Três muralhas foram marcadas com símbolos antigos. Em cada muralha aparecem 8 símbolos. Quantos símbolos precisam ser iluminados?',
      alternatives:[24,21,27,18],
      practice:{groups:3,perGroup:8,groupLabel:'Muralha',groupIcon:'🧱',itemEmoji:'✦',itemName:'símbolos antigos'}
    },
    {
      id:'w10-8',fact:[7,9],title:'Elos das correntes mágicas',
      text:'O Cristal Mestre está preso por 7 correntes mágicas. Cada corrente possui 9 elos encantados. Quantos elos devem ser libertados?',
      alternatives:[63,56,72,61],
      practice:{groups:7,perGroup:9,groupLabel:'Corrente',groupIcon:'⛓️',itemEmoji:'🔗',itemName:'elos encantados'}
    },
    {
      id:'w10-9',fact:[8,8],title:'Luzes das torres',
      text:'Oito torres cercam o pátio final. Cada torre precisa receber 8 pontos de luz para romper a escuridão. Quantos pontos de luz serão ativados?',
      alternatives:[64,56,72,62],
      practice:{groups:8,perGroup:8,groupLabel:'Torre',groupIcon:'🏰',itemEmoji:'✨',itemName:'pontos de luz'}
    },
    {
      id:'w10-10',fact:[9,9],title:'Fragmentos do Cristal Mestre',
      text:'Na batalha final, 9 círculos de proteção revelaram 9 fragmentos do Cristal Mestre em cada círculo. Quantos fragmentos foram restaurados?',
      alternatives:[81,72,90,79],
      practice:{groups:9,perGroup:9,groupLabel:'Círculo',groupIcon:'⭕',itemEmoji:'💠',itemName:'fragmentos do Cristal Mestre'}
    }
  ];

  G.QuestionDatabase={
    worlds:{1:worldOne,2:worldTwo,3:worldThree,4:worldFour,5:worldFive,6:worldSix,7:worldSeven,8:worldEight,9:worldNine,10:worldTen},
    getWorld(worldId){return (this.worlds[Number(worldId)]||[]).map(q=>JSON.parse(JSON.stringify(q)))}
  };
})(window);
