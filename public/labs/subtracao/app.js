"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  screen: "home",
  module: "experiment",
  student: "",
  minuend: 52,
  subtrahend: 28,
  result: 24,
  digits: 2,
  speed: 1800,
  steps: [],
  stepIndex: 0,
  autoPlaying: false,
  timer: null,
  activeColumn: null,
  originalDigits: [],
  workingDigits: [],
  subDigits: [],
  resultDigits: [],
  exchangeSourceChanged: {},
  borrowedDisplay: {},
  revealedResult: new Set(),
  contextSeed: 0,
  challenges: [],
  challengeIndex: 0,
  solvedChallenges: new Set(),
  score: 0,
};

const screens = {
  home: $("#homeScreen"),
  app: $("#appScreen"),
};

const modules = {
  experiment: $("#experimentModule"),
  examples: $("#examplesModule"),
  challenges: $("#challengesModule"),
};

const els = {
  studentName: $("#studentName"),
  minuendInput: $("#minuendInput"),
  subtrahendInput: $("#subtrahendInput"),
  digitsSelect: $("#digitsSelect"),
  configError: $("#configError"),
  trackFill: $("#trackFill"),
  materialStage: $("#materialStage"),
  animationLayer: $("#animationLayer"),
  hundredsBlocks: $("#hundredsBlocks"),
  tensBlocks: $("#tensBlocks"),
  unitsBlocks: $("#unitsBlocks"),
  hundredsCount: $("#hundredsCount"),
  tensCount: $("#tensCount"),
  unitsCount: $("#unitsCount"),
  materialTotal: $("#materialTotal"),
  materialMessage: $("#materialMessage"),
  guideText: $("#guideText"),
  placeLabels: $("#placeLabels"),
  topRow: $("#topRow"),
  bottomRow: $("#bottomRow"),
  resultRow: $("#resultRow"),
  stepTag: $("#stepTag"),
  stepExplanation: $("#stepExplanation"),
  labObservation: $("#labObservation"),
  labAction: $("#labAction"),
  labRecord: $("#labRecord"),
  currentStep: $("#currentStep"),
  totalSteps: $("#totalSteps"),
  backButton: $("#backButton"),
  nextButton: $("#nextButton"),
  autoButton: $("#autoButton"),
  speedSelect: $("#speedSelect"),
  examplesGrid: $("#examplesGrid"),
  challengeButtons: $("#challengeButtons"),
  challengeLevel: $("#challengeLevel"),
  challengeMeaning: $("#challengeMeaning"),
  challengeIcon: $("#challengeIcon"),
  challengeTitle: $("#challengeTitle"),
  challengePrompt: $("#challengePrompt"),
  challengeA: $("#challengeA"),
  challengeB: $("#challengeB"),
  challengeAnswer: $("#challengeAnswer"),
  challengeFeedback: $("#challengeFeedback"),
  scoreValue: $("#scoreValue"),
  manualDialog: $("#manualDialog"),
  placeDialog: $("#placeDialog"),
};

const contexts = [
  { type: "Retirar", icon: "🧃", theme: "lanche", title: "Suquinhos do recreio", text: (a, b, r) => `Na caixa havia ${a} suquinhos. ${b} foram distribuídos no recreio. Quantos suquinhos sobraram? ${a} − ${b} = ${r}.` },
  { type: "Comparar", icon: "🏀", theme: "esporte", title: "Pontuação do jogo", text: (a, b, r) => `Um time marcou ${a} pontos e o outro marcou ${b}. A diferença entre as pontuações é ${r}.` },
  { type: "Completar", icon: "🎴", theme: "coleção", title: "Coleção de figurinhas", text: (a, b, r) => `Uma coleção precisa chegar a ${a} figurinhas. Se já existem ${b}, ainda faltam ${r}.` },
  { type: "Retirar", icon: "✏️", theme: "escola", title: "Lápis emprestados", text: (a, b, r) => `No estojo havia ${a} lápis de cor. ${b} foram emprestados. Restaram ${r} lápis.` },
  { type: "Comparar", icon: "🍎", theme: "mercado", title: "Frutas na cesta", text: (a, b, r) => `Uma cesta tinha ${a} maçãs e outra tinha ${b}. A primeira tinha ${r} maçãs a mais.` },
  { type: "Completar", icon: "💰", theme: "dinheiro", title: "Troco e compras", text: (a, b, r) => `Uma pessoa tinha R$ ${a}. Depois de comprar algo por R$ ${b}, sobraram R$ ${r}.` },
];

const challengeBank = [
  { icon: "🎈", title: "Balões da festa", meaning: "RETIRAR", a: 46, b: 13, prompt: "Havia 46 balões. Durante a brincadeira, 13 estouraram. Quantos balões sobraram?" },
  { icon: "🍪", title: "Biscoitos do lanche", meaning: "RETIRAR", a: 58, b: 24, prompt: "Na caixa havia 58 biscoitos. A turma comeu 24. Quantos biscoitos sobraram?" },
  { icon: "📚", title: "Livros organizados", meaning: "RETIRAR", a: 72, b: 35, prompt: "A biblioteca separou 72 livros para organizar. 35 já foram guardados. Quantos ainda faltam guardar?" },
  { icon: "🏃", title: "Corrida das equipes", meaning: "COMPARAR", a: 63, b: 27, prompt: "Uma equipe fez 63 pontos na corrida e a outra fez 27. Qual é a diferença de pontos?" },
  { icon: "🎨", title: "Caixa de giz", meaning: "RETIRAR", a: 84, b: 29, prompt: "Uma caixa tinha 84 gizes. 29 foram usados na atividade. Quantos gizes restaram?" },
  { icon: "🧩", title: "Peças do quebra-cabeça", meaning: "COMPLETAR", a: 90, b: 48, prompt: "Um quebra-cabeça tem 90 peças. Se 48 já foram colocadas, quantas ainda faltam?" },
  { icon: "🎟️", title: "Ingressos do passeio", meaning: "RETIRAR", a: 132, b: 58, prompt: "A escola recebeu 132 ingressos para um passeio. 58 já foram distribuídos. Quantos ingressos restaram?" },
  { icon: "🥤", title: "Garrafinhas de água", meaning: "RETIRAR", a: 204, b: 87, prompt: "No depósito havia 204 garrafinhas de água. 87 foram entregues. Quantas ainda ficaram no depósito?" },
  { icon: "🏫", title: "Alunos presentes", meaning: "COMPARAR", a: 315, b: 178, prompt: "Em uma escola havia 315 alunos matriculados e 178 estavam presentes. Qual é a diferença entre esses números?" },
];

function showScreen(name) {
  stopAuto();
  Object.entries(screens).forEach(([key, node]) => node.classList.toggle("active", key === name));
  state.screen = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  showScreen("home");
}

function showApp() {
  showScreen("app");
}

function switchModule(module) {
  state.module = module;
  Object.entries(modules).forEach(([key, node]) => node.classList.toggle("active", key === module));
  $$('[data-action="switchModule"]').forEach(button => {
    button.classList.toggle("active", button.dataset.module === module);
  });
  if (module !== "experiment") stopAuto();
}

function openModule(module) {
  state.student = els.studentName.value.trim() || "Estudante";
  showApp();
  switchModule(module);
  if (!state.steps.length) prepareExperiment(false);
}

function sanitizeNumber(value) {
  return Number(String(value).replace(/\D/g, ""));
}

function getDigits(number, size) {
  return String(number).padStart(size, "0").split("").map(Number);
}

function placeName(index, size) {
  const fromRight = size - 1 - index;
  return ["unidades", "dezenas", "centenas"][fromRight] || "ordens";
}

function singularOrder(name) {
  return name === "centenas" ? "centena" : name === "dezenas" ? "dezena" : "unidade";
}

function placeKey(index, size) {
  const fromRight = size - 1 - index;
  return ["units", "tens", "hundreds"][fromRight];
}
function shortOrder(index, size) {
  const fromRight = size - 1 - index;
  return ["U", "D", "C"][fromRight] || "?";
}


function describeNumber(number) {
  const digits = getDigits(number, 3);
  const parts = [];
  if (digits[0]) parts.push(`${digits[0]} ${digits[0] === 1 ? "centena" : "centenas"}`);
  if (digits[1]) parts.push(`${digits[1]} ${digits[1] === 1 ? "dezena" : "dezenas"}`);
  if (digits[2]) parts.push(`${digits[2]} ${digits[2] === 1 ? "unidade" : "unidades"}`);
  return parts.join(", ").replace(/, ([^,]*)$/, " e $1") || "zero";
}

function analyzeBorrowing(a, b, size) {
  const top = getDigits(a, size);
  const bottom = getDigits(b, size);
  const working = [...top];
  let borrowCount = 0;

  for (let i = size - 1; i >= 0; i--) {
    if (working[i] < bottom[i]) {
      let source = i - 1;
      while (source >= 0 && working[source] === 0) source--;
      if (source >= 0) {
        for (let j = source; j < i; j++) {
          working[j] -= 1;
          working[j + 1] += 10;
          borrowCount += 1;
        }
      }
    }
    working[i] -= bottom[i];
  }

  return borrowCount;
}

function validateInputs(a, b, digits) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return "Digite valores inteiros válidos.";
  const max = digits === 2 ? 99 : 999;
  const minA = digits === 2 ? 10 : 100;
  if (a < minA || a > max) return `O minuendo deve ter ${digits} ordens.`;
  if (b < 0 || b > max) return "O subtraendo está fora do intervalo permitido.";
  if (b > a) return "O minuendo deve ser maior ou igual ao subtraendo.";
  return "";
}

function loadProblemIntoExperiment(a, b) {
  const digits = a >= 100 || b >= 100 ? 3 : 2;
  els.digitsSelect.value = String(digits);
  state.digits = digits;
  els.minuendInput.maxLength = digits;
  els.subtrahendInput.maxLength = digits;
  els.minuendInput.value = String(a);
  els.subtrahendInput.value = String(b);
}

function buildExamples() {
  const a = state.minuend;
  const b = state.subtrahend;
  const r = state.result;
  const cards = Array.from({ length: 3 }, (_, index) => contexts[(state.contextSeed + index) % contexts.length]);

  els.examplesGrid.innerHTML = cards.map(context => `
    <article class="example-card">
      <div class="example-icon">${context.icon}</div>
      <span class="example-type">${context.type}</span>
      <h3>${context.title}</h3>
      <p>${context.text(a, b, r)}</p>
      <div class="example-equation">${a} − ${b} = ${r}</div>
      <button class="secondary-button" data-action="useExample" data-example-index="${contexts.indexOf(context)}">Levar para o experimento</button>
    </article>
  `).join("");
}

function useExample(index) {
  state.contextSeed = index;
  switchModule("experiment");
  prepareExperiment(true);
}

function challengeLevel(challenge) {
  const digits = challenge.a >= 100 || challenge.b >= 100 ? 3 : 2;
  const borrows = analyzeBorrowing(challenge.a, challenge.b, digits);
  return Math.min(3, Math.max(1, borrows || 1));
}

function renderChallengeMap() {
  els.challengeButtons.innerHTML = state.challenges.map((challenge, index) => `
    <button class="challenge-step level-${challenge.level}" data-action="selectChallenge" data-challenge-index="${index}" aria-label="Desafio ${index + 1}">${index + 1}</button>
  `).join("");
}

function renderChallenge() {
  const challenge = state.challenges[state.challengeIndex];
  if (!challenge) return;
  els.challengeLevel.textContent = `NÍVEL ${challenge.level}`;
  els.challengeMeaning.textContent = challenge.meaning;
  els.challengeIcon.textContent = challenge.icon;
  els.challengeTitle.textContent = challenge.title;
  els.challengePrompt.textContent = challenge.prompt;
  els.challengeA.textContent = challenge.a;
  els.challengeB.textContent = challenge.b;
  els.challengeAnswer.value = "";
  setChallengeFeedback("", null);
  els.scoreValue.textContent = state.score;

  $$(".challenge-step").forEach((button, index) => {
    button.classList.toggle("current", index === state.challengeIndex);
    button.classList.toggle("correct", state.solvedChallenges.has(index));
  });
}

function selectChallenge(index) {
  state.challengeIndex = Math.max(0, Math.min(state.challenges.length - 1, index));
  renderChallenge();
}

function setChallengeFeedback(text, good) {
  els.challengeFeedback.textContent = text;
  els.challengeFeedback.className = "challenge-feedback";
  if (good === true) els.challengeFeedback.classList.add("good");
  if (good === false) els.challengeFeedback.classList.add("bad");
}

function checkChallenge() {
  const challenge = state.challenges[state.challengeIndex];
  const value = String(els.challengeAnswer.value || "").trim();
  if (!value) {
    setChallengeFeedback("Digite uma resposta antes de verificar.", false);
    return;
  }
  const answer = sanitizeNumber(value);
  const correct = challenge.a - challenge.b;
  if (answer === correct) {
    if (!state.solvedChallenges.has(state.challengeIndex)) {
      state.solvedChallenges.add(state.challengeIndex);
      state.score += challenge.level * 10;
      els.scoreValue.textContent = state.score;
    }
    renderChallengeMap();
    renderChallenge();
    setChallengeFeedback(`Excelente! ${challenge.a} − ${challenge.b} = ${correct}.`, true);
  } else {
    const hint = analyzeBorrowing(challenge.a, challenge.b, challenge.a >= 100 || challenge.b >= 100 ? 3 : 2)
      ? "Observe as unidades e verifique se é necessário fazer uma troca."
      : "Comece pelas unidades e avance para a esquerda.";
    setChallengeFeedback(`Ainda não. ${hint}`, false);
  }
}

function nextChallenge() {
  state.challengeIndex = (state.challengeIndex + 1) % state.challenges.length;
  renderChallenge();
}

function challengeToLab() {
  const challenge = state.challenges[state.challengeIndex];
  loadProblemIntoExperiment(challenge.a, challenge.b);
  switchModule("experiment");
  prepareExperiment(true);
}

function prepareChallenges() {
  state.challenges = challengeBank.map(challenge => ({ ...challenge, level: challengeLevel(challenge) }));
  state.challengeIndex = 0;
  renderChallengeMap();
  renderChallenge();
}

function resetVisualState() {
  state.workingDigits = [...state.originalDigits];
  state.exchangeSourceChanged = {};
  state.borrowedDisplay = {};
  state.revealedResult = new Set();
  state.activeColumn = null;
}

function buildLesson() {
  state.result = state.minuend - state.subtrahend;
  state.originalDigits = getDigits(state.minuend, state.digits);
  state.subDigits = getDigits(state.subtrahend, state.digits);
  state.resultDigits = getDigits(state.result, state.digits);
  resetVisualState();
  state.stepIndex = 0;
  stopAuto();

  const steps = [];
  steps.push({
    type: "represent",
    message: `Vamos representar o minuendo ${state.minuend}.`,
    explanation: `O número ${state.minuend} é formado por ${describeNumber(state.minuend)}.`,
    materialMessage: `O número ${state.minuend} é formado por ${describeNumber(state.minuend)}.`,
    observation: `Identifique as ordens do número ${state.minuend} e observe quanto temos em cada uma delas.`,
    action: `Monte o minuendo na bancada do Material Dourado, separando centenas, dezenas e unidades.`,
    record: `Na conta armada, o número ${state.minuend} aparece organizado nas mesmas ordens do material.`
  });

  const working = [...state.originalDigits];

  for (let col = state.digits - 1; col >= 0; col--) {
    const order = placeName(col, state.digits);
    steps.push({
      type: "inspect",
      col,
      message: `Agora observamos as ${order}.`,
      explanation: `Temos ${working[col]} ${order} e precisamos retirar ${state.subDigits[col]}.`,
      materialMessage: `Compare a quantidade disponível e a quantidade que precisa ser retirada nas ${order}.`,
      observation: `Observe se ${working[col]} ${order} são suficientes para tirar ${state.subDigits[col]}.`,
      action: `Olhe para a coluna destacada no material e compare a quantidade existente com a quantidade que será retirada.`,
      record: `Na conta armada, analisamos a ordem ${shortOrder(col, state.digits)} antes de calcular.`
    });

    if (working[col] < state.subDigits[col]) {
      let source = col - 1;
      while (source >= 0 && working[source] === 0) source--;

      if (source >= 0) {
        for (let j = source; j < col; j++) {
          const beforeFrom = working[j];
          const beforeTo = working[j + 1];
          steps.push({
            type: "exchange",
            col,
            from: j,
            to: j + 1,
            fromKey: placeKey(j, state.digits),
            toKey: placeKey(j + 1, state.digits),
            beforeFrom,
            beforeTo,
            afterFrom: beforeFrom - 1,
            afterTo: beforeTo + 10,
            message: `Precisamos fazer uma troca.`,
            explanation: `Trocamos 1 ${singularOrder(placeName(j, state.digits))} por 10 ${placeName(j + 1, state.digits)}.`,
            materialMessage: `Primeiro ocorre a troca no material. Depois ela aparece corretamente na conta armada.`,
            observation: `Como ${beforeTo} é menor que ${state.subDigits[col]}, não dá para subtrair ainda nessa ordem.`,
            action: `Na bancada, 1 ${singularOrder(placeName(j, state.digits))} se transforma em 10 ${placeName(j + 1, state.digits)}.`,
            record: `Na conta armada, o ${beforeFrom} da ordem ${shortOrder(j, state.digits)} vira ${beforeFrom - 1} e a ordem ${shortOrder(j + 1, state.digits)} recebe mais 10.`
          });
          working[j] -= 1;
          working[j + 1] += 10;
        }
      }
    }

    const topValue = working[col];
    const bottomValue = state.subDigits[col];
    const digitResult = topValue - bottomValue;
    steps.push({
      type: "subtract",
      col,
      placeKey: placeKey(col, state.digits),
      topValue,
      bottomValue,
      digitResult,
      message: `Agora vamos subtrair nessa ordem.`,
      explanation: `${topValue} − ${bottomValue} = ${digitResult}.`,
      materialMessage: `Retiramos ${bottomValue} e registramos ${digitResult} no resultado.`,
      observation: `Agora sim, já temos quantidade suficiente para tirar ${bottomValue} nessa ordem.`,
      action: `Retire ${bottomValue} blocos da coluna destacada e observe o que sobra no material.`,
      record: `Na conta armada, escrevemos ${digitResult} na ordem ${shortOrder(col, state.digits)} porque ${topValue} − ${bottomValue} = ${digitResult}.`
    });
    working[col] = digitResult;
  }

  steps.push({
    type: "conclude",
    message: `Concluímos a subtração!`,
    explanation: `${state.minuend} − ${state.subtrahend} = ${state.result}.`,
    materialMessage: `O resultado final é ${state.result}. Agora você pode ver exemplos práticos e resolver desafios.`,
    observation: `Revise todo o percurso: representar, comparar, trocar quando necessário e subtrair.`,
    action: `Observe o que restou na bancada experimental e confirme a quantidade final.`,
    record: `A conta armada e o material mostram a mesma resposta: ${state.result}.`
  });

  state.steps = steps;
  els.totalSteps.textContent = String(steps.length);
  els.challengeFeedback.textContent = "";

  renderPlaceLabels();
  renderAlgorithm();
  renderMaterial(state.originalDigits);
  buildExamples();
}

function reconstructState(targetIndex) {
  resetVisualState();
  if (targetIndex < 0) return;

  for (let i = 0; i <= targetIndex; i++) {
    const step = state.steps[i];
    if (step.type === "exchange") {
      state.workingDigits[step.from] -= 1;
      state.workingDigits[step.to] += 10;
      state.exchangeSourceChanged[step.from] = state.workingDigits[step.from];
      if (!Object.prototype.hasOwnProperty.call(state.borrowedDisplay, step.to)) {
        state.borrowedDisplay[step.to] = state.workingDigits[step.to];
      } else {
        state.borrowedDisplay[step.to] = state.workingDigits[step.to];
      }
    }
    if (step.type === "subtract") {
      state.workingDigits[step.col] = step.digitResult;
      state.revealedResult.add(step.col);
    }
  }
}

function renderPlaceLabels() {
  els.placeLabels.innerHTML = "";
  const labels = state.digits === 2 ? ["D", "U"] : ["C", "D", "U"];
  labels.forEach(label => {
    const cell = document.createElement("span");
    cell.className = "place-label";
    cell.textContent = label;
    els.placeLabels.appendChild(cell);
  });
}

function renderBlocks(container, type, count, highlight = 0) {
  container.innerHTML = "";
  const limit = type === "unit" ? 30 : type === "ten" ? 18 : 9;
  const safeCount = Math.max(0, Math.min(count, limit));

  for (let i = 0; i < safeCount; i++) {
    const block = document.createElement("div");
    block.className = `${type}-block block base-block`;
    if (highlight && i >= safeCount - highlight) block.classList.add("highlight-block");
    block.style.animationDelay = `${Math.min(i * 35, 320)}ms`;
    container.appendChild(block);
  }

  if (count > safeCount) {
    const overflow = document.createElement("span");
    overflow.className = "overflow-count";
    overflow.textContent = `+${count - safeCount}`;
    container.appendChild(overflow);
  }
}

function renderMaterial(digits, subtractStep = null) {
  const normalized = state.digits === 2 ? [0, ...digits] : [...digits];
  const counts = {
    hundreds: normalized[0] || 0,
    tens: normalized[1] || 0,
    units: normalized[2] || 0,
  };

  renderBlocks(els.hundredsBlocks, "hundred", counts.hundreds, subtractStep?.placeKey === "hundreds" ? subtractStep.bottomValue : 0);
  renderBlocks(els.tensBlocks, "ten", counts.tens, subtractStep?.placeKey === "tens" ? subtractStep.bottomValue : 0);
  renderBlocks(els.unitsBlocks, "unit", counts.units, subtractStep?.placeKey === "units" ? subtractStep.bottomValue : 0);

  els.hundredsCount.textContent = counts.hundreds;
  els.tensCount.textContent = counts.tens;
  els.unitsCount.textContent = counts.units;
  els.materialTotal.textContent = String(counts.hundreds * 100 + counts.tens * 10 + counts.units);
}

function buildTopCell(value, col) {
  const cell = document.createElement("span");
  cell.className = "digit-cell";
  if (state.activeColumn === col) cell.classList.add("active");

  const currentValue = Object.prototype.hasOwnProperty.call(state.exchangeSourceChanged, col)
    ? state.exchangeSourceChanged[col]
    : (Object.prototype.hasOwnProperty.call(state.borrowedDisplay, col) ? value : value);

  const hasRewrite = Object.prototype.hasOwnProperty.call(state.exchangeSourceChanged, col) || Object.prototype.hasOwnProperty.call(state.borrowedDisplay, col);

  if (!hasRewrite) {
    const current = document.createElement("span");
    current.className = "number-current";
    current.textContent = value;
    cell.appendChild(current);
    return cell;
  }

  const old = document.createElement("span");
  old.className = "number-old";
  old.textContent = value;
  cell.appendChild(old);

  const rewrite = document.createElement("span");
  rewrite.className = "number-rewrite";
  rewrite.textContent = Object.prototype.hasOwnProperty.call(state.exchangeSourceChanged, col)
    ? state.exchangeSourceChanged[col]
    : state.borrowedDisplay[col];
  cell.appendChild(rewrite);

  if (Object.prototype.hasOwnProperty.call(state.borrowedDisplay, col) && Object.prototype.hasOwnProperty.call(state.exchangeSourceChanged, col)) {
    const history = document.createElement("span");
    history.className = "history-mini";
    history.textContent = `(${state.borrowedDisplay[col]})`;
    cell.appendChild(history);
  }

  cell.classList.add("changed-cell");
  return cell;
}

function renderAlgorithm() {
  els.topRow.innerHTML = "";
  els.bottomRow.innerHTML = "";
  els.resultRow.innerHTML = "";

  state.originalDigits.forEach((value, col) => {
    els.topRow.appendChild(buildTopCell(value, col));
  });

  state.subDigits.forEach((value, col) => {
    const cell = document.createElement("span");
    cell.className = "digit-cell";
    if (state.activeColumn === col) cell.classList.add("active");
    cell.textContent = value;
    els.bottomRow.appendChild(cell);
  });

  state.resultDigits.forEach((value, col) => {
    const cell = document.createElement("span");
    cell.className = "digit-cell";
    if (state.activeColumn === col) cell.classList.add("active");
    const span = document.createElement("span");
    span.textContent = value;
    span.className = state.revealedResult.has(col) || state.steps[state.stepIndex]?.type === "conclude" ? "result-value" : "result-placeholder";
    cell.appendChild(span);
    els.resultRow.appendChild(cell);
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function highlightColumn(col) {
  $$(".place-column").forEach(node => node.classList.remove("active-place"));
  if (!Number.isInteger(col)) {
    state.activeColumn = null;
    return;
  }
  state.activeColumn = col;
  const key = placeKey(col, state.digits);
  $(`.place-column[data-place="${key}"]`)?.classList.add("active-place");
}

async function animateExchange(step) {
  const displayBefore = [...state.workingDigits];
  renderMaterial(displayBefore);

  const fromContainer = ({ hundreds: els.hundredsBlocks, tens: els.tensBlocks })[step.fromKey];
  const toContainer = ({ tens: els.tensBlocks, units: els.unitsBlocks })[step.toKey];
  const sourceBlock = $$(".base-block", fromContainer).at(-1);
  if (!sourceBlock) return;

  const stageRect = els.materialStage.getBoundingClientRect();
  const sourceRect = sourceBlock.getBoundingClientRect();
  const targetRect = toContainer.getBoundingClientRect();
  const clone = sourceBlock.cloneNode(true);
  clone.classList.add("moving-exchange", "highlight-block");
  clone.style.left = `${sourceRect.left - stageRect.left}px`;
  clone.style.top = `${sourceRect.top - stageRect.top}px`;
  clone.style.setProperty("--exchange-duration", `${state.speed}ms`);
  els.animationLayer.appendChild(clone);
  sourceBlock.style.opacity = "0";
  await wait(120);

  const targetX = targetRect.left - stageRect.left + targetRect.width * 0.45 - sourceRect.width / 2;
  const targetY = targetRect.top - stageRect.top + 115;
  clone.style.transform = `translate(${targetX - (sourceRect.left - stageRect.left)}px, ${targetY - (sourceRect.top - stageRect.top)}px) rotate(6deg) scale(.92)`;
  await wait(state.speed);

  const flash = document.createElement("div");
  flash.className = "exchange-flash";
  flash.style.left = `${targetX - 42}px`;
  flash.style.top = `${targetY - 42}px`;
  els.animationLayer.appendChild(flash);

  const label = document.createElement("div");
  label.className = "exchange-label";
  label.textContent = `1 ${singularOrder(placeName(step.from, state.digits))} = 10 ${placeName(step.to, state.digits)}`;
  label.style.left = `${Math.max(8, targetX - 78)}px`;
  label.style.top = `${Math.max(65, targetY - 72)}px`;
  els.animationLayer.appendChild(label);

  const afterDigits = [...displayBefore];
  afterDigits[step.from] -= 1;
  afterDigits[step.to] += 10;
  renderMaterial(afterDigits);
  $$(".base-block", toContainer).slice(-10).forEach((block, index) => {
    block.classList.add("new-from-exchange");
    block.style.animationDelay = `${index * 60}ms`;
  });

  await wait(Math.min(1200, state.speed + 420));
  clone.remove();
  flash.remove();
  label.remove();
}

async function animateRemoval(step) {
  const container = ({ hundreds: els.hundredsBlocks, tens: els.tensBlocks, units: els.unitsBlocks })[step.placeKey];
  const blocks = $$(".base-block", container).slice(-step.bottomValue);
  blocks.forEach((block, index) => {
    setTimeout(() => block.classList.add("removing"), index * Math.max(110, state.speed / 8));
  });
  await wait(Math.min(1100, state.speed) + blocks.length * 110);
}

async function applyStep(index, immediate = false) {
  if (index < 0 || index >= state.steps.length) return;

  const previousIndex = state.stepIndex;
  const movingForwardOne = index === previousIndex + 1;
  const step = state.steps[index];
  state.stepIndex = index;

  const updateTexts = () => {
    highlightColumn(step.col);
    els.currentStep.textContent = String(index + 1);
    els.stepTag.textContent = `ETAPA ${index + 1}`;
    els.guideText.textContent = step.message;
    els.stepExplanation.textContent = step.explanation;
    els.materialMessage.textContent = step.materialMessage;
    els.labObservation.textContent = step.observation || "Observe com o experimento está se desenvolvendo.";
    els.labAction.textContent = step.action || "Acompanhe a ação na bancada experimental.";
    els.labRecord.textContent = step.record || "Veja a mesma ação aparecer na conta armada.";
    els.trackFill.style.width = `${Math.min(100, index / (state.steps.length - 1) * 100)}%`;
    els.backButton.disabled = index === 0;
    els.nextButton.disabled = index === state.steps.length - 1;
    els.nextButton.textContent = index === state.steps.length - 2 ? "Concluir →" : "Próxima etapa →";
  };

  if (!immediate && movingForwardOne && (step.type === "exchange" || step.type === "subtract")) {
    reconstructState(previousIndex);
    highlightColumn(step.col);
    updateTexts();
    renderAlgorithm();

    if (step.type === "exchange") {
      renderMaterial(state.workingDigits);
      await animateExchange(step);
      await wait(280);
      reconstructState(index);
      updateTexts();
      renderAlgorithm();
      renderMaterial(state.workingDigits);
    } else {
      renderMaterial(state.workingDigits, step);
      await animateRemoval(step);
      await wait(220);
      reconstructState(index);
      updateTexts();
      renderAlgorithm();
      renderMaterial(state.workingDigits);
    }
  } else {
    reconstructState(index);
    updateTexts();
    renderAlgorithm();
    renderMaterial(state.workingDigits);
  }
}

function nextStep() {
  if (state.stepIndex < state.steps.length - 1) applyStep(state.stepIndex + 1);
}

function previousStep() {
  if (state.stepIndex > 0) applyStep(state.stepIndex - 1, true);
}

function startAuto() {
  state.autoPlaying = true;
  els.autoButton.textContent = "Ⅱ Pausar";
  autoAdvance();
}

function stopAuto() {
  state.autoPlaying = false;
  clearTimeout(state.timer);
  els.autoButton.textContent = "▶ Reproduzir";
}

function toggleAuto() {
  if (state.autoPlaying) stopAuto();
  else startAuto();
}

function autoAdvance() {
  clearTimeout(state.timer);
  if (!state.autoPlaying) return;
  if (state.stepIndex >= state.steps.length - 1) {
    stopAuto();
    return;
  }
  state.timer = setTimeout(async () => {
    await applyStep(state.stepIndex + 1);
    autoAdvance();
  }, state.speed + 1100);
}

function prepareExperiment(goToExperiment = true) {
  const a = sanitizeNumber(els.minuendInput.value);
  const b = sanitizeNumber(els.subtrahendInput.value);
  const digits = Number(els.digitsSelect.value);
  const error = validateInputs(a, b, digits);
  els.configError.textContent = error;
  if (error) return;

  state.student = els.studentName.value.trim() || "Estudante";
  state.minuend = a;
  state.subtrahend = b;
  state.digits = digits;
  state.contextSeed = (state.contextSeed + 1) % contexts.length;
  buildLesson();
  if (goToExperiment) switchModule("experiment");
  applyStep(0, true);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function openDialog(dialog) {
  if (dialog && !dialog.open) dialog.showModal();
}

function closeDialogs() {
  $$("dialog[open]").forEach(dialog => dialog.close());
}

function handleAction(element) {
  const action = element.dataset.action;
  switch (action) {
    case "home": showHome(); break;
    case "manual": openDialog(els.manualDialog); break;
    case "fullscreen": toggleFullscreen(); break;
    case "openModule": openModule(element.dataset.module); break;
    case "switchModule": switchModule(element.dataset.module); break;
    case "randomProblem": {
      const digits = Number(els.digitsSelect.value);
      const min = digits === 2 ? 20 : 120;
      const max = digits === 2 ? 99 : 999;
      let a, b;
      do {
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (a - 10)) + 10;
      } while (analyzeBorrowing(a, b, digits) === 0);
      loadProblemIntoExperiment(a, b);
      break;
    }
    case "prepareExperiment": prepareExperiment(true); break;
    case "previousStep": previousStep(); break;
    case "nextStep": nextStep(); break;
    case "toggleAuto": toggleAuto(); break;
    case "useExample": useExample(Number(element.dataset.exampleIndex)); break;
    case "selectChallenge": selectChallenge(Number(element.dataset.challengeIndex)); break;
    case "checkChallenge": checkChallenge(); break;
    case "challengeToLab": challengeToLab(); break;
    case "nextChallenge": nextChallenge(); break;
    case "placeInfo": openDialog(els.placeDialog); break;
    case "closeDialog": closeDialogs(); break;
  }
}

document.addEventListener("click", event => {
  const actionElement = event.target.closest("[data-action]");
  if (actionElement) handleAction(actionElement);
});

[els.minuendInput, els.subtrahendInput, els.challengeAnswer].forEach(input => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 3);
    els.configError.textContent = "";
  });
});

els.digitsSelect.addEventListener("change", () => {
  const size = Number(els.digitsSelect.value);
  els.minuendInput.maxLength = size;
  els.subtrahendInput.maxLength = size;
  if (size === 2 && sanitizeNumber(els.minuendInput.value) > 99) {
    loadProblemIntoExperiment(52, 28);
  }
  if (size === 3 && sanitizeNumber(els.minuendInput.value) < 100) {
    loadProblemIntoExperiment(302, 178);
  }
});

els.speedSelect.addEventListener("change", () => {
  state.speed = Number(els.speedSelect.value);
});

els.challengeAnswer.addEventListener("keydown", event => {
  if (event.key === "Enter") checkChallenge();
});

[els.manualDialog, els.placeDialog].forEach(dialog => {
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

loadProblemIntoExperiment(52, 28);
prepareChallenges();
prepareExperiment(false);
showHome();
