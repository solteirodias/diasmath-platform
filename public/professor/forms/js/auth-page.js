import {
  currentUser,
  loginUser,
  registerUser,
  recoverPassword,
  resetPassword,
} from "./auth.js";

if (currentUser()) location.href = "app.html";

const tabs = document.querySelectorAll(".tab");
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const recoverForm = document.querySelector("#recoverForm");
const resetForm = document.querySelector("#resetForm");
const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn");
const backToLoginButtons = document.querySelectorAll("[data-back-login]");
const message = document.querySelector("#authMessage");

function showPanel(panel) {
  loginForm.classList.toggle("hidden", panel !== "login");
  registerForm.classList.toggle("hidden", panel !== "register");
  recoverForm.classList.toggle("hidden", panel !== "recover");
  resetForm.classList.toggle("hidden", panel !== "reset");

  tabs.forEach((item) => {
    item.classList.toggle("active", item.dataset.tab === panel);
  });

  hideMessage();
}

tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    showPanel(tab.dataset.tab === "register" ? "register" : "login");
  })
);

forgotPasswordBtn?.addEventListener("click", () => {
  const loginEmail = document.querySelector("#loginEmail").value;
  if (loginEmail) document.querySelector("#recoverEmail").value = loginEmail;
  showPanel("recover");
});

backToLoginButtons.forEach((button) =>
  button.addEventListener("click", () => showPanel("login"))
);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await loginUser(
      document.querySelector("#loginEmail").value,
      document.querySelector("#loginPassword").value
    );
    location.href = "app.html";
  } catch (error) {
    showMessage(error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.querySelector("#regPassword").value;
  const confirm = document.querySelector("#regConfirm").value;
  if (password !== confirm) return showMessage("As senhas não conferem.", "error");

  try {
    await registerUser({
      name: document.querySelector("#regName").value,
      email: document.querySelector("#regEmail").value,
      school: document.querySelector("#regSchool").value,
      city: document.querySelector("#regCity").value,
      password,
    });
    location.href = "app.html";
  } catch (error) {
    showMessage(error.message, "error");
  }
});

recoverForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.querySelector("#recoverEmail").value.trim().toLowerCase();

  try {
    await recoverPassword(email);
    document.querySelector("#resetEmail").value = email;
    showPanel("reset");
    showMessage(
      "Enviamos um código de recuperação para o e-mail cadastrado. Digite o código e a nova senha.",
      "success"
    );
  } catch (error) {
    showMessage(error.message, "error");
  }
});

resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#resetEmail").value;
  const code = document.querySelector("#resetCode").value;
  const password = document.querySelector("#resetPassword").value;
  const confirm = document.querySelector("#resetConfirm").value;

  if (password !== confirm) return showMessage("As senhas não conferem.", "error");

  try {
    await resetPassword(email, code, password);
    location.href = "app.html";
  } catch (error) {
    showMessage(error.message, "error");
  }
});

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function hideMessage() {
  message.className = "message hidden";
}
