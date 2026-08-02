function cadastro(){
let n=nome.value,e=email.value,s=senha.value,c=conf.value,esc=escola.value,m=municipio.value;
if(!n||!e||!s){alert('Preencha os campos.');return;}
if(s!==c){alert('Senhas diferentes');return;}
localStorage.setItem('professor',JSON.stringify({nome:n,email:e,senha:s,escola:esc,municipio:m}));
alert('Cadastro realizado!');
location='index.html';
}
function login(){
let p=JSON.parse(localStorage.getItem('professor')||'null');
if(!p){alert('Cadastre-se primeiro.');return;}
if(email.value===p.email&&senha.value===p.senha){location='painel.html';}
else alert('Login inválido');
}
