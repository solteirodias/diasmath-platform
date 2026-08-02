import { currentUser, loginUser, registerUser } from "./auth.js";

if (currentUser()) location.href = "app.html";

const tabs = document.querySelectorAll(".tab");
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const message = document.querySelector("#authMessage");

tabs.forEach(tab => tab.addEventListener("click", () => {
  tabs.forEach(item => item.classList.toggle("active", item === tab));
  const login = tab.dataset.tab === "login";
  loginForm.classList.toggle("hidden", !login);
  registerForm.classList.toggle("hidden", login);
  hideMessage();
}));

loginForm.addEventListener("submit", async event => {
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

registerForm.addEventListener("submit", async event => {
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
      password
    });
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
