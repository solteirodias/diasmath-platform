# Guardiões da Divisão — V46 Ajuda do Guardião

## Objetivo pedagógico

Criar um sistema de dicas progressivas para ajudar o estudante a compreender a divisão sem receber imediatamente a resposta pronta.

## Regra de privacidade

A rota `/api/guardiao-divisao/dica` recebe somente:

- dividendo;
- divisor;
- resposta informada;
- resposta correta;
- número da tentativa;
- existência ou não de resto;
- etapa ou nível atual do game.

Não recebe nome, escola, turma ou dado pessoal.

## Dicas progressivas

- Primeiro erro: dica breve com agrupamento, estimativa, decomposição ou multiplicação inversa.
- Segundo erro: dica mais direta com cálculo intermediário.
- Terceiro erro: explicação passo a passo, deixando o estudante concluir.

## Regra de segurança pedagógica

A dica não deve revelar diretamente o quociente final.

Caso a resposta da IA tente revelar a resposta, o sistema substitui por uma dica local segura.
