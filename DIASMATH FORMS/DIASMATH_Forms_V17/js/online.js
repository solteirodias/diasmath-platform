// Estrutura inicial para futura integração.
// Nesta versão ainda não há comunicação real com Firebase.

function createPublicLink(formId){
    const origin = location.origin || "https://diasmath.com.br";
    return origin + "/professor/forms/responder.html?id=" + formId;
}

function mockSync(){
    console.log("Sincronização online será implementada na próxima etapa.");
}
