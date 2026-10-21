export const runtime="nodejs";
import { formsConfig, formsError, getStoredForm } from "../../../../lib/formsSecurity";

export async function GET(request: Request) {
  try {
    const id=new URL(request.url).searchParams.get("id")||"";
    if(!/^form_[\w-]{4,120}$/.test(id))return formsError("Formulário indisponível.",404);
    const config=formsConfig();
    if(!config)return formsError("Serviço temporariamente indisponível.",503);
    const row=await getStoredForm(config,id);
    if(!row||!row.published)return formsError("Formulário indisponível.",404);
    const source=row.form||{};
    const safeId=/^[A-Za-z0-9_-]{1,120}$/;
    const sections=Array.isArray(source.sections)?source.sections:[];
    if(!sections.length||sections.length>50||sections.some((section:any)=>
      !safeId.test(String(section?.id||""))||
      !Array.isArray(section.questions)||section.questions.length>100||
      section.questions.some((q:any)=>!safeId.test(String(q?.id||"")))
    ))return formsError("Formulário indisponível.",404);
    return Response.json({
      ok:true,
      form:{
        id:row.id,title:row.title||source.title||"Formulário DIASMATH",
        description:source.description||"",theme:source.theme||"blue",
        settings:source.settings||{},sections:Array.isArray(source.sections)?source.sections:[],
        published:true,
      }
    },{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("[Forms public GET]",error instanceof Error?error.message:"erro");
    return formsError("Não foi possível carregar o formulário.",503);
  }
}
