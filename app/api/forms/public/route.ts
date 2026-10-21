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
