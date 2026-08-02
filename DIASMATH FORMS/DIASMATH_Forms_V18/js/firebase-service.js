// Camada de serviço (placeholder)
// Nesta versão as funções apenas definem a interface que será usada
// quando o Firebase estiver configurado.

export async function signIn(email,password){
  throw new Error("Firebase não configurado.");
}

export async function register(user){
  throw new Error("Firebase não configurado.");
}

export async function saveForm(form){
  throw new Error("Firebase não configurado.");
}

export async function loadForms(){
  return [];
}
