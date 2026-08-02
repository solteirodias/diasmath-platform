// Mock de API local.
// Futuramente será substituído pelo Firebase/Firestore.

const MockAPI={
 saveForm(form){
   const forms=JSON.parse(localStorage.getItem("mock_forms")||"[]");
   forms.push({...form,id:crypto.randomUUID?.()||Date.now().toString()});
   localStorage.setItem("mock_forms",JSON.stringify(forms));
 },
 listForms(){
   return JSON.parse(localStorage.getItem("mock_forms")||"[]");
 }
};
