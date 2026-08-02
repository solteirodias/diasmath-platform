export class Router{
private routes=new Map<string,()=>void>();
register(path:string,fn:()=>void){this.routes.set(path,fn);}
go(path:string){this.routes.get(path)?.();}
}