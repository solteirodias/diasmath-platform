# Guardiões da Divisão — V48 Correção forte da ajuda

## O que foi corrigido

A versão anterior não funcionou em todas as fases porque o próprio game tinha blocos avançados que sobrescreviam a função `answerChallenge`.

Agora a correção foi aplicada diretamente nos blocos internos de erro:

- Baú do Saber;
- Bloco da Divisão;
- Portal da Vida;
- Portal do Escudo;
- Portal da Partilha;
- escolha final do resultado;
- portais bônus;
- Chefão.

## Resultado esperado

Sempre que o estudante errar uma resposta, deve aparecer perto da mensagem de erro:

```text
🛡️ Pedir ajuda ao Guardião
```

Ao clicar, aparece o balão com a dica progressiva.

## Privacidade

A rota de IA continua recebendo apenas dados matemáticos da tentativa, sem nome, escola ou turma.
