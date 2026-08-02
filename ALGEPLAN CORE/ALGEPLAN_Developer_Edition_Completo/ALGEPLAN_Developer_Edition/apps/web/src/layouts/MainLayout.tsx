export function MainLayout({children}:any){
return <div style={{display:'flex'}}>
<aside style={{width:240,padding:16,borderRight:'1px solid #ccc'}}>ALGEPLAN</aside>
<main style={{flex:1,padding:24}}>{children}</main>
</div>
}