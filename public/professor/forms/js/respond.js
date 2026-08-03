import { DB } from "./storage.js";
import { uid, safeText } from "./utils.js";

const params = new URLSearchParams(location.search);
const formId = params.get("id");
const form = DB.forms.all().find(item => item.id === formId);
const status = document.querySelector("#publicStatus");
const responseForm = document.querySelector("#responseForm");
const themeColors = { blue:"#0b4d86",green:"#19754b",purple:"#6b3da1",orange:"#c96c18" };
let sectionIndex = 0;
let answers = {};
let participant = { name:"", email:"" };

if (!form || !form.published) {
  status.innerHTML = `<h1>Formulário indisponível</h1><p>O link pode estar incorreto ou o professor retirou a publicação.</p>`;
} else {
  document.documentElement.style.setProperty("--primary", themeColors[form.theme] || themeColors.blue);
  status.classList.add("hidden");
  responseForm.classList.remove("hidden");
  document.querySelector("#publicTitle").textContent = form.title;
  document.querySelector("#publicDescription").textContent = form.description;
  document.querySelector("#thankYouText").textContent = form.settings.thankYou;
  document.querySelector("#progressWrap").classList.toggle("hidden", !form.settings.showProgress);
  document.querySelector("#answerAgainBtn").classList.toggle("hidden", !form.settings.allowAnother);
  renderParticipantFields();
  renderSection();
}

document.querySelector("#prevSectionBtn").addEventListener("click", () => {
  collectCurrentSection();
  sectionIndex = Math.max(0, sectionIndex - 1);
  renderSection();
  scrollTo({top:0,behavior:"smooth"});
});
document.querySelector("#nextSectionBtn").addEventListener("click", () => {
  if (!validateCurrentSection()) return;
  collectCurrentSection();
  sectionIndex = Math.min(form.sections.length - 1, sectionIndex + 1);
  renderSection();
  scrollTo({top:0,behavior:"smooth"});
});
responseForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!validateCurrentSection() || !validateParticipant()) return;
  collectCurrentSection();
  participant = {
    name: document.querySelector("#participantName")?.value.trim() || "",
    email: document.querySelector("#participantEmail")?.value.trim() || ""
  };
  const responses = DB.responses.all();
  responses.push({ id:uid("resp"), formId:form.id, submittedAt:new Date().toISOString(), participant, answers });
  DB.responses.save(responses);
  responseForm.classList.add("hidden");
  document.querySelector("#thankYouPanel").classList.remove("hidden");
  scrollTo({top:0,behavior:"smooth"});
});
document.querySelector("#answerAgainBtn").addEventListener("click", () => location.reload());

function renderParticipantFields() {
  const container = document.querySelector("#participantFields");
  container.innerHTML = [
    form.settings.collectName ? `<div class="public-question"><label>Seu nome <span class="required-star">*</span></label><input id="participantName" required></div>` : "",
    form.settings.collectEmail ? `<div class="public-question"><label>Seu e-mail <span class="required-star">*</span></label><input id="participantEmail" type="email" required></div>` : ""
  ].join("");
  container.classList.toggle("hidden", !container.innerHTML.trim());
}
function renderSection() {
  const section = form.sections[sectionIndex];
  document.querySelector("#publicSection").innerHTML = `
    <h2>${safeText(section.title)}</h2>
    ${section.description ? `<p>${safeText(section.description)}</p>` : ""}
    ${section.questions.map(question => renderQuestion(question)).join("")}`;
  document.querySelector("#prevSectionBtn").classList.toggle("hidden", sectionIndex === 0);
  document.querySelector("#nextSectionBtn").classList.toggle("hidden", sectionIndex === form.sections.length - 1);
  document.querySelector("#submitResponseBtn").classList.toggle("hidden", sectionIndex !== form.sections.length - 1);
  const progress = ((sectionIndex + 1) / form.sections.length) * 100;
  document.querySelector("#progressBar").style.width = `${progress}%`;
  document.querySelector("#progressLabel").textContent = `Seção ${sectionIndex + 1} de ${form.sections.length}`;
  restoreSectionValues(section);
}
function renderQuestion(q) {
  const required = q.required ? `<span class="required-star">*</span>` : "";
  let control = `<input id="q_${q.id}" data-qid="${q.id}" ${q.required?"required":""}>`;
  if (q.type === "long") control = `<textarea id="q_${q.id}" data-qid="${q.id}" rows="5" ${q.required?"required":""}></textarea>`;
  if (q.type === "number") control = `<input id="q_${q.id}" data-qid="${q.id}" type="number" ${q.required?"required":""}>`;
  if (q.type === "date") control = `<input id="q_${q.id}" data-qid="${q.id}" type="date" ${q.required?"required":""}>`;
  if (q.type === "time") control = `<input id="q_${q.id}" data-qid="${q.id}" type="time" ${q.required?"required":""}>`;
  if (q.type === "single") control = `<div class="choice-list">${q.options.map((o,i)=>`<label class="choice-item"><input type="radio" name="q_${q.id}" value="${safeText(o)}" ${q.required&&i===-1?"required":""}>${safeText(o)}</label>`).join("")}</div>`;
  if (q.type === "multiple") control = `<div class="choice-list">${q.options.map(o=>`<label class="choice-item"><input type="checkbox" name="q_${q.id}" value="${safeText(o)}">${safeText(o)}</label>`).join("")}</div>`;
  if (q.type === "dropdown") control = `<select id="q_${q.id}" data-qid="${q.id}" ${q.required?"required":""}><option value="">Selecione</option>${q.options.map(o=>`<option value="${safeText(o)}">${safeText(o)}</option>`).join("")}</select>`;
  if (q.type === "scale") control = `<div class="scale-list">${Array.from({length:q.max-q.min+1},(_,i)=>q.min+i).map(n=>`<label class="scale-option"><span>${n}</span><input type="radio" name="q_${q.id}" value="${n}"></label>`).join("")}</div>`;
  return `<div class="public-question" data-question="${q.id}"><label>${safeText(q.title)} ${required}</label>${control}</div>`;
}
function collectCurrentSection() {
  form.sections[sectionIndex].questions.forEach(q => {
    if (q.type === "single" || q.type === "scale") {
      answers[q.id] = document.querySelector(`input[name="q_${q.id}"]:checked`)?.value || "";
    } else if (q.type === "multiple") {
      answers[q.id] = [...document.querySelectorAll(`input[name="q_${q.id}"]:checked`)].map(el=>el.value);
    } else {
      answers[q.id] = document.querySelector(`#q_${q.id}`)?.value ?? "";
    }
  });
}
function restoreSectionValues(section) {
  section.questions.forEach(q => {
    const value = answers[q.id];
    if (value === undefined) return;
    if (q.type === "single" || q.type === "scale") {
      const el = [...document.querySelectorAll(`input[name="q_${q.id}"]`)].find(item=>item.value==value);
      if (el) el.checked = true;
    } else if (q.type === "multiple") {
      document.querySelectorAll(`input[name="q_${q.id}"]`).forEach(el=>el.checked=Array.isArray(value)&&value.includes(el.value));
    } else {
      const el=document.querySelector(`#q_${q.id}`); if(el) el.value=value;
    }
  });
}
function validateCurrentSection() {
  let valid = true;
  document.querySelectorAll(".invalid").forEach(el=>el.classList.remove("invalid"));
  form.sections[sectionIndex].questions.forEach(q => {
    if (!q.required) return;
    let filled = false;
    if (q.type === "single" || q.type === "scale") filled = !!document.querySelector(`input[name="q_${q.id}"]:checked`);
    else if (q.type === "multiple") filled = document.querySelectorAll(`input[name="q_${q.id}"]:checked`).length > 0;
    else filled = !!document.querySelector(`#q_${q.id}`)?.value.trim();
    if (!filled) {
      valid = false;
      document.querySelector(`[data-question="${q.id}"]`)?.classList.add("invalid");
    }
  });
  if (!valid) alert("Preencha todas as perguntas obrigatórias desta seção.");
  return valid;
}
function validateParticipant() {
  const name = document.querySelector("#participantName");
  const email = document.querySelector("#participantEmail");
  if (name && !name.value.trim()) { name.classList.add("invalid"); alert("Informe seu nome."); return false; }
  if (email && !email.reportValidity()) { email.classList.add("invalid"); return false; }
  return true;
}
