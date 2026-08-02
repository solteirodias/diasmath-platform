
const Storage={
 users(){return JSON.parse(localStorage.getItem("dm_users")||"[]")},
 saveUsers(v){localStorage.setItem("dm_users",JSON.stringify(v))}
};

function register(){
 const n=nome.value.trim(),e=email.value.trim().toLowerCase(),p=senha.value,c=confirmar.value;
 if(!n||!e||!p)return alert("Preencha todos os campos.");
 if(p!==c)return alert("As senhas não conferem.");
 let users=Storage.users();
 if(users.find(u=>u.email===e)) return alert("E-mail já cadastrado.");
 users.push({id:Date.now(),nome:n,email:e,senha:p});
 Storage.saveUsers(users);
 alert("Cadastro realizado (versão local).");
 location.href="login.html";
}
function login(){
 const e=email.value.trim().toLowerCase(),p=senha.value;
 let u=Storage.users().find(x=>x.email===e&&x.senha===p);
 if(!u) return alert("Credenciais inválidas.");
 localStorage.setItem("dm_session",JSON.stringify(u));
 location.href="painel.html";
}
function guard(){
 if(!localStorage.getItem("dm_session")) location.href="login.html";
}
function loadProfile(){
 let u=JSON.parse(localStorage.getItem("dm_session")||"null");
 if(u && document.getElementById("welcome")) welcome.textContent=u.nome;
}
function logout(){
 localStorage.removeItem("dm_session");
 location.href="login.html";
}
