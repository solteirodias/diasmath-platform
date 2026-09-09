# SAP V13 — IA Pedagógica Consistente

## Correção feita

A IA Pedagógica foi ajustada para:

- gerar respostas mais úteis para professores, coordenadores e gestores;
- retirar avisos técnicos da interface;
- não exibir mensagem de modo local;
- não exibir `OPENAI_API_KEY`;
- não exibir status HTTP, como 429;
- manter uma resposta pedagógica consistente mesmo quando a API online não responder.

## Novo padrão de resposta

A resposta agora tende a trazer:

1. síntese do diagnóstico;
2. habilidades prioritárias;
3. possíveis causas pedagógicas;
4. plano de intervenção;
5. acompanhamento da gestão/GRE;
6. encaminhamento final.

## Observação técnica

Internamente, o sistema ainda protege dados pessoais e usa a variável de ambiente `OPENAI_API_KEY`, mas essas informações não aparecem mais para o usuário final no painel do SAP.
