// Validação da configuração
export function checkConfig(cfg){
  const required=["apiKey","authDomain","projectId","appId"];
  return required.filter(k=>!cfg[k]);
}
