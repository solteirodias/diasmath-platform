import { DB } from "./storage.js";
import { requireUser, logoutUser } from "./auth.js";
import { TEMPLATES } from "./templates.js";
import { uid, formatDate, downloadFile, csvEscape, copyText, deepClone, safeText, slugify } from "./utils.js";

const user = requireUser();
let currentView = "overview";
let currentForm = null;
let activeSectionId = null;
const TYPE_LABELS = {
  short: "Resposta curta", long: "Parágrafo", single: "Múltipla escolha",
  multiple: "Caixas de seleção", dropdown: "Lista suspensa", scale: "Escala",
  number: "Número", date: "Data", time: "Hora"
};
const OPTION_TYPES = ["single", "multiple", "dropdown"];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function encodeFormForPublicLink(form) {
  const copy = deepClone(form);
  copy.published = true;
  const json = JSON.stringify(copy);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

const RESPONSE_SYNC = {
  loading: {},
  last: {}
};

function mergeRemoteResponses(remoteResponses = []) {
  const local = DB.responses.all();
  const byId = new Map(local.map(item => [item.id, item]));

  remoteResponses.forEach(item => {
    if (item && item.id) byId.set(item.id, item);
  });

  DB.responses.save([...byId.values()]);
}

async function fetchRemoteResponses(formId, options = {}) {
  const { force = false, rerender = true } = options;

  if (!formId) return;

  const now = Date.now();
  if (RESPONSE_SYNC.loading[formId]) return;
  if (!force && RESPONSE_SYNC.last[formId] && now - RESPONSE_SYNC.last[formId] < 12000) return;

  RESPONSE_SYNC.loading[formId] = true;

  try {
    const response = await fetch(`/api/forms/responses?formId=${encodeURIComponent(formId)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      const details = await response.json().catch(() => null);
      throw new Error(details?.error || "Não foi possível buscar respostas online.");
    }

    const data = await response.json();
    mergeRemoteResponses(Array.isArray(data.responses) ? data.responses : []);
    RESPONSE_SYNC.last[formId] = Date.now();

    if (rerender) {
      renderOverview();
      renderForms();
      if (currentView === "responses") renderResponses(false);
    }
  } catch (error) {
    console.warn("Sincronização de respostas indisponível:", error);
  } finally {
    RESPONSE_SYNC.loading[formId] = false;
  }
}

async function syncAllPublishedResponses() {
  const forms = myForms().filter(form => form.published);
  for (const form of forms) {
    await fetchRemoteResponses(form.id, { force: true, rerender: false });
  }
  renderOverview();
  renderForms();
  if (currentView === "responses") renderResponses(false);
}


$("#sidebarUser").textContent = user.name;
$("#logoutBtn").addEventListener("click", logoutUser);
$("#quickNewBtn").addEventListener("click", createBlankForm);
$("#newFormBtn").addEventListener("click", createBlankForm);
$("#formSearch").addEventListener("input", renderForms);
$("#importFormBtn").addEventListener("click", () => $("#importFormInput").click());
$("#importFormInput").addEventListener("change", importForm);
$("#saveFormBtn").addEventListener("click", saveCurrentForm);
$("#previewBtn").addEventListener("click", openPreview);
$("#addSectionBtn").addEventListener("click", addSection);
$("#insertFromBankBtn").addEventListener("click", openBankDialog);
$("#publishToggleBtn").addEventListener("click", togglePublish);
$("#copyPublicLinkBtn").addEventListener("click", copyPublicLink);
$("#formTitle").addEventListener("input", syncFormMeta);
$("#formDescription").addEventListener("input", syncFormMeta);
$("#formTheme").addEventListener("change", syncFormMeta);
$("#collectName").addEventListener("change", syncSettings);
$("#collectEmail").addEventListener("change", syncSettings);
$("#showProgress").addEventListener("change", syncSettings);
$("#allowAnother").addEventListener("change", syncSettings);
$("#thankYouMessage").addEventListener("input", syncSettings);
$("#bankSearch").addEventListener("input", renderBank);
$("#bankTypeFilter").addEventListener("change", renderBank);
$("#saveBankQuestionBtn").addEventListener("click", saveStandaloneBankQuestion);
$("#exportBankBtn").addEventListener("click", exportBank);
$("#responseFormSelect").addEventListener("change", renderResponses);
$("#exportCsvBtn").addEventListener("click", exportResponsesCsv);
$("#exportJsonBtn").addEventListener("click", exportResponsesJson);
$("#printReportBtn").addEventListener("click", () => window.print());
$("#saveProfileBtn").addEventListener("click", saveProfile);
$("#backupAllBtn").addEventListener("click", backupAll);
$("#restoreAllBtn").addEventListener("click", () => $("#restoreAllInput").click());
$("#restoreAllInput").addEventListener("change", restoreAll);
$("#seedDemoBtn").addEventListener("click", seedDemo);
$("#profileName").value = user.name;
$("#profileSchool").value = user.school;
$("#profileCity").value = user.city;

$$(".nav-item").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
$$("[data-add-type]").forEach(button => button.addEventListener("click", () => addQuestion(button.dataset.addType)));
$$("[data-close-dialog]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.closeDialog).close()));

populateBankTypeSelect();
renderAll();
setTimeout(syncAllPublishedResponses, 600);

function myForms() {
  return DB.forms.all().filter(form => form.ownerId === user.id);
}
function myResponses() {
  const ids = new Set(myForms().map(form => form.id));
  return DB.responses.all().filter(response => ids.has(response.formId));
}
function switchView(view) {
  currentView = view;
  $$(".view").forEach(item => item.classList.toggle("active", item.id === `view-${view}`));
  $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === view));
  $("#viewTitle").textContent = {
    overview: "Visão geral", forms: "Meus formulários", builder: "Criar / editar",
    bank: "Banco de questões", responses: "Respostas", settings: "Configurações"
  }[view];
  if (view === "overview") renderOverview();
  if (view === "forms") renderForms();
  if (view === "bank") renderBank();
  if (view === "responses") renderResponsesPage();
}
function renderAll() {
  renderOverview();
  renderForms();
  renderBank();
  renderResponsesPage();
  if (!currentForm) createBlankForm(false);
}
function renderOverview() {
  const forms = myForms();
  const responses = myResponses();
  $("#statForms").textContent = forms.length;
  $("#statPublished").textContent = forms.filter(form => form.published).length;
  $("#statResponses").textContent = responses.length;
  $("#statParticipants").textContent = new Set(responses.map(item => (item.participant?.email || item.participant?.name || item.id))).size;
  $("#recentForms").innerHTML = forms.length
    ? [...forms].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0,5).map(form => `
      <div class="list-item">
        <div class="meta"><strong>${safeText(form.title)}</strong><small>${form.sections.reduce((sum,s)=>sum+s.questions.length,0)} perguntas • ${formatDate(form.updatedAt,true)}</small></div>
        <button class="btn ghost" data-open-form="${form.id}">Abrir</button>
      </div>`).join("")
    : `<div class="list-item"><div class="meta"><strong>Nenhum formulário</strong><small>Crie o primeiro ou use um modelo.</small></div></div>`;
  $$("[data-open-form]").forEach(button => button.addEventListener("click", () => openForm(button.dataset.openForm)));
  $("#templateCards").innerHTML = TEMPLATES.map(template => `
    <div class="template-card"><h3>${template.name}</h3><p>${template.description}</p><button class="btn secondary full" data-template="${template.id}">Usar modelo</button></div>
  `).join("");
  $$("[data-template]").forEach(button => button.addEventListener("click", () => useTemplate(button.dataset.template)));
}
function renderForms() {
  const search = $("#formSearch").value.trim().toLowerCase();
  const forms = myForms().filter(form => `${form.title} ${form.description}`.toLowerCase().includes(search));
  $("#formsGrid").innerHTML = forms.length ? forms.map(form => {
    const responseCount = DB.responses.all().filter(r => r.formId === form.id).length;
    const questionCount = form.sections.reduce((sum, section) => sum + section.questions.length, 0);
    return `<article class="form-card">
      <div><h3>${safeText(form.title)}</h3><p>${safeText(form.description || "Sem descrição")}</p></div>
      <div class="badge-row"><span class="badge ${form.published ? "published" : ""}">${form.published ? "Publicado" : "Rascunho"}</span><span class="badge">${questionCount} perguntas</span><span class="badge">${responseCount} respostas</span></div>
      <small>Atualizado em ${formatDate(form.updatedAt,true)}</small>
      <div class="card-actions">
        <button class="btn primary" data-edit="${form.id}">Editar</button>
        <button class="btn secondary" data-share="${form.id}">Compartilhar</button>
        <button class="btn ghost" data-duplicate="${form.id}">Duplicar</button>
        <button class="btn danger" data-delete="${form.id}">Excluir</button>
      </div>
    </article>`;
  }).join("") : `<div class="list-item"><div class="meta"><strong>Nenhum formulário encontrado</strong><small>Crie um novo formulário para começar.</small></div></div>`;
  $$("[data-edit]").forEach(btn => btn.addEventListener("click", () => openForm(btn.dataset.edit)));
  $$("[data-share]").forEach(btn => btn.addEventListener("click", () => shareForm(btn.dataset.share)));
  $$("[data-duplicate]").forEach(btn => btn.addEventListener("click", () => duplicateForm(btn.dataset.duplicate)));
  $$("[data-delete]").forEach(btn => btn.addEventListener("click", () => deleteForm(btn.dataset.delete)));
}
function blankForm() {
  const now = new Date().toISOString();
  return {
    id: uid("form"), ownerId: user.id, title: "Formulário sem título", description: "",
    theme: "blue", published: false, createdAt: now, updatedAt: now,
    settings: { collectName: true, collectEmail: false, showProgress: true, allowAnother: false, thankYou: "Resposta enviada com sucesso. Obrigado pela participação!" },
    sections: [{ id: uid("sec"), title: "Seção 1", description: "", questions: [] }]
  };
}
function blankQuestion(type = "short") {
  return {
    id: uid("q"), type, title: "Nova pergunta", required: false,
    options: OPTION_TYPES.includes(type) ? ["Opção 1", "Opção 2"] : [],
    min: 1, max: 5, tags: []
  };
}
function createBlankForm(go = true) {
  currentForm = blankForm();
  activeSectionId = currentForm.sections[0].id;
  populateBuilder();
  if (go) switchView("builder");
}
function useTemplate(templateId) {
  const template = TEMPLATES.find(item => item.id === templateId);
  currentForm = template.create(user.id);
  activeSectionId = currentForm.sections[0].id;
  populateBuilder();
  switchView("builder");
}
function openForm(formId) {
  const form = myForms().find(item => item.id === formId);
  if (!form) return toast("Formulário não encontrado.");
  currentForm = deepClone(form);
  activeSectionId = currentForm.sections[0]?.id;
  populateBuilder();
  switchView("builder");
}
function populateBuilder() {
  $("#formTitle").value = currentForm.title;
  $("#formDescription").value = currentForm.description;
  $("#formTheme").value = currentForm.theme;
  $("#collectName").checked = currentForm.settings.collectName;
  $("#collectEmail").checked = currentForm.settings.collectEmail;
  $("#showProgress").checked = currentForm.settings.showProgress;
  $("#allowAnother").checked = currentForm.settings.allowAnother;
  $("#thankYouMessage").value = currentForm.settings.thankYou;
  $("#publishToggleBtn").textContent = currentForm.published ? "Retirar publicação" : "Publicar formulário";
  $("#publishToggleBtn").className = `btn ${currentForm.published ? "danger" : "success"} full`;
  renderBuilder();
}
function syncFormMeta() {
  if (!currentForm) return;
  currentForm.title = $("#formTitle").value;
  currentForm.description = $("#formDescription").value;
  currentForm.theme = $("#formTheme").value;
}
function syncSettings() {
  if (!currentForm) return;
  currentForm.settings = {
    collectName: $("#collectName").checked,
    collectEmail: $("#collectEmail").checked,
    showProgress: $("#showProgress").checked,
    allowAnother: $("#allowAnother").checked,
    thankYou: $("#thankYouMessage").value
  };
}
function saveCurrentForm() {
  syncFormMeta(); syncSettings();
  currentForm.updatedAt = new Date().toISOString();
  const forms = DB.forms.all();
  const index = forms.findIndex(form => form.id === currentForm.id);
  if (index >= 0) forms[index] = deepClone(currentForm); else forms.push(deepClone(currentForm));
  DB.forms.save(forms);
  toast("Formulário salvo.");
  renderOverview(); renderForms(); renderResponsesPage();
}
function addSection() {
  const newSection = { id: uid("sec"), title: `Seção ${currentForm.sections.length + 1}`, description: "", questions: [] };
  currentForm.sections.push(newSection);
  activeSectionId = newSection.id;
  renderBuilder();
}
function addQuestion(type) {
  const section = currentForm.sections.find(item => item.id === activeSectionId) || currentForm.sections[0];
  if (!section) return;
  section.questions.push(blankQuestion(type));
  renderBuilder();
}
function renderBuilder() {
  $("#sectionsContainer").innerHTML = currentForm.sections.map((section, sectionIndex) => `
    <article class="section-card" data-section="${section.id}">
      <div class="section-head">
        <div style="flex:1">
          <input class="section-title" value="${safeText(section.title)}" data-section-title="${section.id}">
          <textarea rows="2" placeholder="Descrição da seção" data-section-description="${section.id}">${safeText(section.description || "")}</textarea>
        </div>
        <div class="inline-actions">
          <button class="btn ghost" data-activate-section="${section.id}">${section.id === activeSectionId ? "Seção ativa" : "Editar aqui"}</button>
          <button class="btn ghost" data-duplicate-section="${section.id}">Duplicar</button>
          ${currentForm.sections.length > 1 ? `<button class="btn danger" data-delete-section="${section.id}">Excluir</button>` : ""}
        </div>
      </div>
      <div>
        ${section.questions.length ? section.questions.map((question, questionIndex) => questionEditor(question, section, sectionIndex, questionIndex)).join("") : `<div class="list-item"><div class="meta"><strong>Seção vazia</strong><small>Selecione um tipo de pergunta na barra lateral.</small></div></div>`}
      </div>
    </article>
  `).join("");
  bindBuilderEvents();
}
function questionEditor(question, section, sectionIndex, questionIndex) {
  const optionEditor = OPTION_TYPES.includes(question.type) ? `
    <div class="option-editor">
      ${question.options.map((option, optionIndex) => `<div class="option-row"><input value="${safeText(option)}" data-option="${section.id}|${question.id}|${optionIndex}"><button data-remove-option="${section.id}|${question.id}|${optionIndex}">✕</button></div>`).join("")}
      <button class="btn ghost" data-add-option="${section.id}|${question.id}">+ Adicionar opção</button>
    </div>` : "";
  const scaleEditor = question.type === "scale" ? `<div class="form-grid two"><label>Mínimo<input type="number" min="0" max="10" value="${question.min}" data-scale-min="${section.id}|${question.id}"></label><label>Máximo<input type="number" min="1" max="10" value="${question.max}" data-scale-max="${section.id}|${question.id}"></label></div>` : "";
  return `<div class="question-card">
    <div class="question-top">
      <input value="${safeText(question.title)}" data-question-title="${section.id}|${question.id}">
      <select data-question-type="${section.id}|${question.id}">
        ${Object.entries(TYPE_LABELS).map(([value,label]) => `<option value="${value}" ${value===question.type?"selected":""}>${label}</option>`).join("")}
      </select>
    </div>
    ${optionEditor}${scaleEditor}
    <div class="question-actions">
      <label class="choice-item"><input type="checkbox" ${question.required?"checked":""} data-required="${section.id}|${question.id}"> Obrigatória</label>
      <button class="btn ghost" data-up-question="${section.id}|${question.id}">↑</button>
      <button class="btn ghost" data-down-question="${section.id}|${question.id}">↓</button>
      <button class="btn ghost" data-bank-question="${section.id}|${question.id}">Salvar no banco</button>
      <button class="btn ghost" data-duplicate-question="${section.id}|${question.id}">Duplicar</button>
      <button class="btn danger" data-delete-question="${section.id}|${question.id}">Excluir</button>
    </div>
  </div>`;
}
function parsePair(value) {
  const [sectionId, questionId, extra] = value.split("|");
  const section = currentForm.sections.find(item => item.id === sectionId);
  const question = section?.questions.find(item => item.id === questionId);
  return { section, question, extra: Number(extra) };
}
function bindBuilderEvents() {
  $$("[data-section-title]").forEach(el => el.addEventListener("input", () => currentForm.sections.find(s=>s.id===el.dataset.sectionTitle).title = el.value));
  $$("[data-section-description]").forEach(el => el.addEventListener("input", () => currentForm.sections.find(s=>s.id===el.dataset.sectionDescription).description = el.value));
  $$("[data-activate-section]").forEach(el => el.addEventListener("click", () => { activeSectionId = el.dataset.activateSection; renderBuilder(); }));
  $$("[data-duplicate-section]").forEach(el => el.addEventListener("click", () => {
    const section = currentForm.sections.find(s=>s.id===el.dataset.duplicateSection);
    const copy = deepClone(section); copy.id = uid("sec"); copy.title += " (Cópia)"; copy.questions.forEach(q=>q.id=uid("q"));
    currentForm.sections.splice(currentForm.sections.indexOf(section)+1,0,copy); renderBuilder();
  }));
  $$("[data-delete-section]").forEach(el => el.addEventListener("click", () => {
    if (!confirm("Excluir esta seção e suas perguntas?")) return;
    currentForm.sections = currentForm.sections.filter(s=>s.id!==el.dataset.deleteSection);
    activeSectionId = currentForm.sections[0].id; renderBuilder();
  }));
  $$("[data-question-title]").forEach(el => el.addEventListener("input", () => parsePair(el.dataset.questionTitle).question.title = el.value));
  $$("[data-question-type]").forEach(el => el.addEventListener("change", () => {
    const { question } = parsePair(el.dataset.questionType);
    question.type = el.value;
    if (OPTION_TYPES.includes(el.value) && !question.options.length) question.options = ["Opção 1","Opção 2"];
    renderBuilder();
  }));
  $$("[data-required]").forEach(el => el.addEventListener("change", () => parsePair(el.dataset.required).question.required = el.checked));
  $$("[data-option]").forEach(el => el.addEventListener("input", () => {
    const { question, extra } = parsePair(el.dataset.option); question.options[extra] = el.value;
  }));
  $$("[data-remove-option]").forEach(el => el.addEventListener("click", () => {
    const { question, extra } = parsePair(el.dataset.removeOption); question.options.splice(extra,1); renderBuilder();
  }));
  $$("[data-add-option]").forEach(el => el.addEventListener("click", () => {
    parsePair(el.dataset.addOption).question.options.push(`Opção ${parsePair(el.dataset.addOption).question.options.length+1}`); renderBuilder();
  }));
  $$("[data-scale-min]").forEach(el => el.addEventListener("input", () => parsePair(el.dataset.scaleMin).question.min = Number(el.value)));
  $$("[data-scale-max]").forEach(el => el.addEventListener("input", () => parsePair(el.dataset.scaleMax).question.max = Number(el.value)));
  $$("[data-delete-question]").forEach(el => el.addEventListener("click", () => {
    const { section, question } = parsePair(el.dataset.deleteQuestion);
    section.questions = section.questions.filter(q=>q.id!==question.id); renderBuilder();
  }));
  $$("[data-duplicate-question]").forEach(el => el.addEventListener("click", () => {
    const { section, question } = parsePair(el.dataset.duplicateQuestion);
    const copy = deepClone(question); copy.id = uid("q");
    section.questions.splice(section.questions.indexOf(question)+1,0,copy); renderBuilder();
  }));
  $$("[data-up-question]").forEach(el => el.addEventListener("click", () => moveQuestion(el.dataset.upQuestion,-1)));
  $$("[data-down-question]").forEach(el => el.addEventListener("click", () => moveQuestion(el.dataset.downQuestion,1)));
  $$("[data-bank-question]").forEach(el => el.addEventListener("click", () => {
    const { question } = parsePair(el.dataset.bankQuestion); addQuestionToBank(question);
  }));
}
function moveQuestion(pair, direction) {
  const { section, question } = parsePair(pair);
  const index = section.questions.indexOf(question);
  const target = index + direction;
  if (target < 0 || target >= section.questions.length) return;
  [section.questions[index], section.questions[target]] = [section.questions[target], section.questions[index]];
  renderBuilder();
}
function togglePublish() {
  currentForm.published = !currentForm.published;
  saveCurrentForm(); populateBuilder();
}
function publicLink(formId = currentForm.id) {
  const form = formId === currentForm?.id
    ? currentForm
    : myForms().find(item => item.id === formId);

  if (!form) {
    return new URL(`respond.html?id=${encodeURIComponent(formId)}`, location.href).href;
  }

  const encoded = encodeFormForPublicLink(form);
  return new URL(`respond.html?f=${encoded}`, location.href).href;
}
async function copyPublicLink() {
  if (!currentForm.published) return toast("Publique o formulário antes de compartilhar.");
  await copyText(publicLink());
  toast("Link público copiado. Ele abrirá em outros navegadores e dispositivos.");
}
async function shareForm(formId) {
  const form = myForms().find(item=>item.id===formId);
  if (!form?.published) return toast("Este formulário ainda não foi publicado.");
  await copyText(publicLink(formId));
  toast("Link copiado. Ele abrirá em outros navegadores e dispositivos.");
}
function duplicateForm(formId) {
  const form = myForms().find(item=>item.id===formId);
  const copy = deepClone(form); copy.id = uid("form"); copy.title += " (Cópia)"; copy.published = false; copy.createdAt = copy.updatedAt = new Date().toISOString();
  copy.sections.forEach(s=>{s.id=uid("sec");s.questions.forEach(q=>q.id=uid("q"));});
  const forms = DB.forms.all(); forms.push(copy); DB.forms.save(forms); renderAll(); toast("Formulário duplicado.");
}
function deleteForm(formId) {
  if (!confirm("Excluir o formulário e todas as respostas associadas?")) return;
  DB.forms.save(DB.forms.all().filter(form=>form.id!==formId));
  DB.responses.save(DB.responses.all().filter(response=>response.formId!==formId));
  renderAll(); toast("Formulário excluído.");
}
function openPreview() {
  syncFormMeta(); syncSettings();
  $("#previewContent").innerHTML = previewHtml(currentForm);
  $("#previewDialog").showModal();
}
function previewHtml(form) {
  return `<div class="preview-form">
    <h1>${safeText(form.title)}</h1><p>${safeText(form.description)}</p>
    ${form.settings.collectName ? `<div class="preview-question"><b>Nome do participante</b><input disabled></div>`:""}
    ${form.settings.collectEmail ? `<div class="preview-question"><b>E-mail</b><input disabled></div>`:""}
    ${form.sections.map(section=>`<div class="preview-section"><h2>${safeText(section.title)}</h2><p>${safeText(section.description||"")}</p>${section.questions.map(q=>previewQuestion(q)).join("")}</div>`).join("")}
  </div>`;
}
function previewQuestion(q) {
  let control = `<input disabled>`;
  if (q.type==="long") control=`<textarea disabled></textarea>`;
  if (q.type==="single"||q.type==="multiple") control=`<div class="choice-list">${q.options.map(o=>`<label class="choice-item"><input type="${q.type==="single"?"radio":"checkbox"}" disabled>${safeText(o)}</label>`).join("")}</div>`;
  if (q.type==="dropdown") control=`<select disabled><option>Selecione</option>${q.options.map(o=>`<option>${safeText(o)}</option>`).join("")}</select>`;
  if (q.type==="scale") control=`<div class="scale-list">${Array.from({length:q.max-q.min+1},(_,i)=>q.min+i).map(n=>`<span>${n}</span>`).join(" ")}</div>`;
  if (q.type==="date") control=`<input type="date" disabled>`;
  if (q.type==="time") control=`<input type="time" disabled>`;
  if (q.type==="number") control=`<input type="number" disabled>`;
  return `<div class="preview-question"><b>${safeText(q.title)}${q.required?' <span class="required-star">*</span>':""}</b>${control}</div>`;
}
function populateBankTypeSelect() {
  $("#bankQuestionType").innerHTML = Object.entries(TYPE_LABELS).map(([value,label])=>`<option value="${value}">${label}</option>`).join("");
}
function myBank() {
  return DB.bank.all().filter(item=>item.ownerId===user.id);
}
function addQuestionToBank(question) {
  const bank = DB.bank.all();
  const copy = deepClone(question); copy.id = uid("bank"); copy.ownerId = user.id; copy.createdAt = new Date().toISOString();
  bank.push(copy); DB.bank.save(bank); toast("Pergunta salva no banco."); renderBank();
}
function saveStandaloneBankQuestion() {
  const title = $("#bankQuestionTitle").value.trim();
  if (!title) return toast("Digite o enunciado.");
  const type = $("#bankQuestionType").value;
  const question = {
    id: uid("bank"), ownerId:user.id, title, type, required:false,
    tags: $("#bankQuestionTags").value.split(",").map(x=>x.trim()).filter(Boolean),
    options: OPTION_TYPES.includes(type) ? $("#bankQuestionOptions").value.split("\n").map(x=>x.trim()).filter(Boolean) : [],
    min:1,max:5,createdAt:new Date().toISOString()
  };
  const bank = DB.bank.all(); bank.push(question); DB.bank.save(bank);
  $("#bankQuestionTitle").value=""; $("#bankQuestionTags").value=""; $("#bankQuestionOptions").value="";
  renderBank(); toast("Questão adicionada ao banco.");
}
function renderBank() {
  const search = $("#bankSearch").value.trim().toLowerCase();
  const type = $("#bankTypeFilter").value;
  const items = myBank().filter(item => (!type || item.type===type) && `${item.title} ${(item.tags||[]).join(" ")}`.toLowerCase().includes(search));
  $("#bankList").innerHTML = items.length ? items.map(item=>`
    <div class="list-item">
      <div class="meta"><strong>${safeText(item.title)}</strong><small>${TYPE_LABELS[item.type]} • ${(item.tags||[]).map(safeText).join(", ")||"sem tags"}</small></div>
      <div class="inline-actions"><button class="btn secondary" data-bank-use="${item.id}">Usar</button><button class="btn danger" data-bank-delete="${item.id}">Excluir</button></div>
    </div>`).join("") : `<div class="list-item"><div class="meta"><strong>Banco vazio</strong><small>Salve perguntas do editor ou crie uma questão avulsa.</small></div></div>`;
  $$("[data-bank-use]").forEach(btn=>btn.addEventListener("click",()=>insertBankQuestion(btn.dataset.bankUse)));
  $$("[data-bank-delete]").forEach(btn=>btn.addEventListener("click",()=>{DB.bank.save(DB.bank.all().filter(i=>i.id!==btn.dataset.bankDelete));renderBank();}));
}
function openBankDialog() {
  const items=myBank();
  $("#bankDialogList").innerHTML=items.length?items.map(item=>`<div class="list-item"><div class="meta"><strong>${safeText(item.title)}</strong><small>${TYPE_LABELS[item.type]}</small></div><button class="btn secondary" data-dialog-bank="${item.id}">Inserir</button></div>`).join(""):`<p>Banco vazio.</p>`;
  $$("[data-dialog-bank]").forEach(btn=>btn.addEventListener("click",()=>{insertBankQuestion(btn.dataset.dialogBank);$("#bankDialog").close();}));
  $("#bankDialog").showModal();
}
function insertBankQuestion(id) {
  const item=myBank().find(q=>q.id===id); if(!item)return;
  const copy=deepClone(item);copy.id=uid("q");delete copy.ownerId;delete copy.createdAt;
  const section=currentForm.sections.find(s=>s.id===activeSectionId)||currentForm.sections[0];section.questions.push(copy);
  renderBuilder();switchView("builder");toast("Questão inserida.");
}
function exportBank() {
  downloadFile("diasmath_banco_questoes.json",JSON.stringify(myBank(),null,2));
}
function importForm(event) {
  const file=event.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const payload=JSON.parse(reader.result);
      const form=normalizeImportedForm(payload.form||payload);
      const forms=DB.forms.all();forms.push(form);DB.forms.save(forms);renderAll();toast("Formulário importado.");
    }catch{toast("Arquivo inválido.");}
  };reader.readAsText(file);event.target.value="";
}
function normalizeImportedForm(source) {
  if (!source || !Array.isArray(source.sections)) throw new Error("Estrutura inválida");
  const now = new Date().toISOString();
  return {
    id: uid("form"), ownerId: user.id,
    title: String(source.title || "Formulário importado"),
    description: String(source.description || ""),
    theme: ["blue","green","purple","orange"].includes(source.theme) ? source.theme : "blue",
    published: false, createdAt: now, updatedAt: now,
    settings: {
      collectName: source.settings?.collectName !== false,
      collectEmail: Boolean(source.settings?.collectEmail),
      showProgress: source.settings?.showProgress !== false,
      allowAnother: Boolean(source.settings?.allowAnother),
      thankYou: String(source.settings?.thankYou || "Resposta enviada com sucesso!")
    },
    sections: source.sections.map((section,index)=>({
      id: uid("sec"), title: String(section.title || `Seção ${index+1}`),
      description: String(section.description || ""),
      questions: Array.isArray(section.questions) ? section.questions.map(item=>({
        ...blankQuestion(Object.hasOwn(TYPE_LABELS,item.type) ? item.type : "short"),
        title: String(item.title || "Nova pergunta"),
        required: Boolean(item.required),
        options: Array.isArray(item.options) ? item.options.map(String) : [],
        min: Number.isFinite(Number(item.min)) ? Number(item.min) : 1,
        max: Number.isFinite(Number(item.max)) ? Number(item.max) : 5,
        tags: Array.isArray(item.tags) ? item.tags.map(String) : []
      })) : []
    }))
  };
}
function renderResponsesPage() {
  const forms=myForms();
  const previous=$("#responseFormSelect").value;
  $("#responseFormSelect").innerHTML=forms.map(f=>`<option value="${f.id}">${safeText(f.title)}</option>`).join("");
  if(forms.some(f=>f.id===previous))$("#responseFormSelect").value=previous;
  renderResponses();
}
function selectedResultForm() {
  return myForms().find(f=>f.id===$("#responseFormSelect").value)||myForms()[0];
}
function renderResponses(shouldSync = true) {
  const form=selectedResultForm();
  if(!form){
    $("#analysisContainer").innerHTML="<p>Nenhum formulário disponível.</p>";$("#responsesTable thead").innerHTML="";$("#responsesTable tbody").innerHTML="";return;
  }

  if (shouldSync) {
    fetchRemoteResponses(form.id, { rerender: true });
  }

  const responses=DB.responses.all().filter(r=>r.formId===form.id);
  $("#resultResponseCount").textContent=responses.length;
  $("#resultParticipantCount").textContent=new Set(responses.map(r=>r.participant?.email||r.participant?.name||r.id)).size;
  $("#resultLastResponse").textContent=responses.length?formatDate([...responses].sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt))[0].submittedAt,true):"—";
  const questions=form.sections.flatMap(s=>s.questions);
  $("#analysisContainer").innerHTML=questions.map(q=>analysisCard(q,responses)).join("");
  renderResponseTable(form,responses);
}
function analysisCard(question,responses) {
  const values=responses.map(r=>r.answers?.[question.id]).filter(v=>v!==undefined&&v!==null&&v!=="");
  if(["single","multiple","dropdown","scale"].includes(question.type)){
    const counts={};
    const options=question.type==="scale"?Array.from({length:question.max-question.min+1},(_,i)=>String(question.min+i)):question.options;
    options.forEach(o=>counts[o]=0);
    values.forEach(value=>Array.isArray(value)?value.forEach(v=>counts[v]=(counts[v]||0)+1):counts[value]=(counts[value]||0)+1);
    const max=Math.max(1,...Object.values(counts));
    return `<article class="analysis-card"><h3>${safeText(question.title)}</h3><div class="bar-list">${Object.entries(counts).map(([label,count])=>`<div class="bar-row"><span>${safeText(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(count/max)*100}%"></div></div><strong>${count}</strong></div>`).join("")}</div></article>`;
  }
  if(question.type==="number"){
    const nums=values.map(Number).filter(Number.isFinite);
    const avg=nums.length?(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2):"—";
    return `<article class="analysis-card"><h3>${safeText(question.title)}</h3><p>Média: <strong>${avg}</strong></p><p>Respostas numéricas: ${nums.length}</p></article>`;
  }
  return `<article class="analysis-card"><h3>${safeText(question.title)}</h3><div class="text-responses">${values.length?values.slice(-20).reverse().map(v=>`<div class="text-response">${safeText(Array.isArray(v)?v.join(", "):v)}</div>`).join(""):"<p>Sem respostas.</p>"}</div></article>`;
}
function renderResponseTable(form,responses) {
  const questions=form.sections.flatMap(s=>s.questions);
  $("#responsesTable thead").innerHTML=`<tr><th>Enviado em</th>${form.settings.collectName?"<th>Nome</th>":""}${form.settings.collectEmail?"<th>E-mail</th>":""}${questions.map(q=>`<th>${safeText(q.title)}</th>`).join("")}</tr>`;
  $("#responsesTable tbody").innerHTML=responses.map(r=>`<tr><td>${formatDate(r.submittedAt,true)}</td>${form.settings.collectName?`<td>${safeText(r.participant?.name||"")}</td>`:""}${form.settings.collectEmail?`<td>${safeText(r.participant?.email||"")}</td>`:""}${questions.map(q=>`<td>${safeText(Array.isArray(r.answers?.[q.id])?r.answers[q.id].join(", "):(r.answers?.[q.id]??""))}</td>`).join("")}</tr>`).join("");
}
async function exportResponsesCsv() {
  const form=selectedResultForm();if(!form)return;
  await fetchRemoteResponses(form.id, { force: true, rerender: false });
  const responses=DB.responses.all().filter(r=>r.formId===form.id);
  const questions=form.sections.flatMap(s=>s.questions);
  const header=["Enviado em",...(form.settings.collectName?["Nome"]:[]),...(form.settings.collectEmail?["E-mail"]:[]),...questions.map(q=>q.title)];
  const rows=[header.map(csvEscape).join(",")];
  responses.forEach(r=>rows.push([
    r.submittedAt,
    ...(form.settings.collectName?[r.participant?.name||""]:[]),
    ...(form.settings.collectEmail?[r.participant?.email||""]:[]),
    ...questions.map(q=>r.answers?.[q.id]??"")
  ].map(csvEscape).join(",")));
  downloadFile(`${slugify(form.title)||"respostas"}.csv`, "\ufeff"+rows.join("\n"), "text/csv;charset=utf-8");
}
async function exportResponsesJson() {
  const form=selectedResultForm();if(!form)return;
  await fetchRemoteResponses(form.id, { force: true, rerender: false });
  const responses=DB.responses.all().filter(r=>r.formId===form.id);
  downloadFile(`${slugify(form.title)||"respostas"}.json`,JSON.stringify({form,responses},null,2));
}
function saveProfile() {
  const users=DB.users.all();const index=users.findIndex(u=>u.id===user.id);
  users[index]={...users[index],name:$("#profileName").value.trim(),school:$("#profileSchool").value.trim(),city:$("#profileCity").value.trim()};
  DB.users.save(users);$("#sidebarUser").textContent=users[index].name;toast("Perfil atualizado.");
}
function backupAll() {
  downloadFile(`diasmath_forms_backup_${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(DB.backup(),null,2));
}
function restoreAll(event) {
  const file=event.target.files[0];if(!file)return;const reader=new FileReader();
  reader.onload=()=>{try{DB.restore(JSON.parse(reader.result));toast("Backup restaurado. Recarregando...");setTimeout(()=>location.reload(),900);}catch(e){toast(e.message);}};
  reader.readAsText(file);event.target.value="";
}
function seedDemo() {
  if(!confirm("Adicionar formulários e respostas de demonstração?"))return;
  const forms=DB.forms.all();const responses=DB.responses.all();const bank=DB.bank.all();
  const demo=TEMPLATES[0].create(user.id);demo.published=true;forms.push(demo);
  const questions=demo.sections.flatMap(s=>s.questions);
  ["Ana","Bruno","Carla","Diego","Elisa"].forEach((name,i)=>responses.push({
    id:uid("resp"),formId:demo.id,submittedAt:new Date(Date.now()-i*86400000).toISOString(),
    participant:{name,email:""},answers:{
      [questions[0].id]:["Excelente","Boa","Excelente","Regular","Boa"][i],
      [questions[1].id]:["As atividades práticas.","Os exemplos.","A troca de experiências.","O material.","A organização."][i],
      [questions[2].id]:["Mais tempo.","Continuar assim.","Mais oficinas.","Mais exemplos.","Sem sugestões."][i]
    }
  }));
  questions.forEach(question=>bank.push({...deepClone(question),id:uid("bank"),ownerId:user.id,tags:["demonstração"],createdAt:new Date().toISOString()}));
  DB.forms.save(forms);DB.responses.save(responses);DB.bank.save(bank);renderAll();toast("Dados de demonstração adicionados.");
}
function toast(text) {
  const el=$("#toast");el.textContent=text;el.classList.remove("hidden");clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.add("hidden"),2600);
}
