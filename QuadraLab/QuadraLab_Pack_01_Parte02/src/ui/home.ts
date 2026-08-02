import {layout} from './layout';
export function home(){
document.body.innerHTML=layout('QuadraLab™',`
<section class='hero'>
<h2>Laboratório Virtual de Equações Quadráticas</h2>
<div class='cards'>
<button id='tutorial'>Tutorial</button>
<button id='lab'>Entrar no Laboratório</button>
<button id='prof'>Modo Professor</button>
</div></section>`);
}