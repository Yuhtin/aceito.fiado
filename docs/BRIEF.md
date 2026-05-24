# AceitoFiado — Brief v0.1
**AfroCapital Hack · Dia 2 · 2026-05-24**

---

## 1. Em uma frase

AceitoFiado é a infraestrutura de crédito mercantil pra cadeia afroempreendedora: a empreendedora compra estoque ou insumo a prazo do fornecedor, o fornecedor recebe à vista, a gente compra a dívida e cobra direto do recebível da empreendedora.

**Não competimos com Serasa. Construímos uma cadeia onde Serasa não decide nada.**

---

## 2. Problema

- Empreendedor negro tem crédito negado 3x mais que branco nas mesmas condições (BID).
- 60,1% estão na informalidade. Não passam no Serasa.
- O restante, formalizado mas em CEP periférico, é penalizado pelo proxy do CEP — variável mais informativa e mais discriminatória dos modelos de score brasileiros.
- Capital de giro é o pain #1 do MEI/ME (Sebrae). Sem ele, a empreendedora não repõe estoque, não cresce, não escala canais.

**Conclusão estratégica:** construir um bureau alternativo melhor que o Serasa é uma corrida que ninguém ganha em 3 anos, quanto mais em 3 dias. A jogada inteligente é construir uma cadeia onde o score do bureau não decide nada.

---

## 3. Solução

### Os 3 atores

- **Empreendedora (Persona B)**: MEI/ME, mulher negra, 28–42 anos, fatura R$ 5k–80k/mês, vende em 3–5 canais (Pix, Instagram, marketplace, feira).
- **Fornecedor**: atacadista, distribuidor, indústria que vende pra ela (Brás, Mercadão de Madureira, distribuidor de cosméticos, atacadista de alimentos).
- **AceitoFiado**: plataforma que origina, securitiza e faz servicing da operação de crédito.

### Fluxo

1. Empreendedora seleciona produtos no fornecedor parceiro e escolhe pagar a prazo via AceitoFiado.
2. Fornecedor emite duplicata escritural e recebe à vista da AceitoFiado, com pequeno desconto.
3. AceitoFiado adquire a duplicata. No MVP usa capital próprio. Em produção, cede pra FIDC parceiro.
4. Empreendedora paga AceitoFiado no vencimento (30, 45 ou 60 dias).
5. **Trava de recebíveis**: parcela do Pix, cartão e marketplace da empreendedora é direcionada automaticamente pra AceitoFiado, registrada em B3.

### Por que funciona

- Empreendedora ganha capital de giro sem precisar de score.
- Fornecedor ganha liquidez imediata e vende mais.
- AceitoFiado ganha spread e fee de servicing.
- Risco é amarrado ao recebível, não à pessoa.

---

## 4. Por que isso contorna o Serasa

- Não precisamos que ninguém aceite nosso score. **Nós somos o lender.**
- Não precisamos que a empreendedora tenha histórico no bureau.
- Underwriting é feito com sinais alternativos: extrato bancário, vendas em marketplaces, faturamento Pix, contas de utility, histórico com o fornecedor.
- O risco é mitigado pela trava digital de recebíveis, não pela cobrança ativa.

O CEP da empreendedora não entra na decisão. O Serasa dela não entra na decisão. A discriminação algorítmica é resolvida estruturalmente — não consertando o algoritmo, mas removendo ele do caminho crítico.

---

## 5. Modelo de negócio

**Receita**
- Spread entre desconto pago ao fornecedor e juros cobrados da empreendedora.
- Fee de servicing por operação.
- Eventual fee do fornecedor por integração e originação.

**Custo principal**
- Capital (próprio no MVP, FIDC depois).
- Custo de risco (default).
- Tecnologia e operação.

**Unit economics (estimativa MVP)**
- Ticket médio: R$ 5.000, prazo de 45 dias.
- Desconto pago ao fornecedor: 3%.
- Custo cobrado da empreendedora: 5%.
- Margem bruta por operação: ~2% sobre ticket = R$ 100.
- Operações por empreendedora/mês: 1–3.
- Take rate efetivo: ~2% sobre volume mensal.

Com 1.000 empreendedoras ativas comprando R$ 10k/mês cada → R$ 10M de volume mensal → R$ 200k de receita bruta mensal.

---

## 6. Estrutura técnica e financeira

- **Título de crédito**: duplicata mercantil escritural (Lei 5.474/1968), registrada em CERC, CIP ou outra registradora autorizada pelo BC.
- **Comprador da dívida**: FIDC parceiro via securitizadora white-label (VERT, Fortesec ou similar). No MVP, capital próprio.
- **Trava de recebíveis**: integração com B3 Registradora de Recebíveis (Res. BC 4.734/2019).
- **Underwriting V0**: regra de negócio com 5–7 variáveis ponderadas + threshold. Não é ML. ML vai pro V2.
- **Pagamentos**: PIX entrada e saída, boleto pra cobrança fallback.
- **Stack**: ver `README.md` na raiz.

---

## 7. MVP do demo

Implementado e funcionando. Ver `README.md` na raiz pra setup + walkthrough.

### Personas no seed
- **Joana Bezerra** — Onda Preta Biquínis (MEI, Heliópolis/SP)
- **Distribuidora Tropical Brás** — fornecedor têxtil
- **Atacado Afro Cosméticos** — fornecedor cosméticos
- **Brás Têxteis Estampas** — fornecedor têxtil estampado

---

## 8. Diferenciação

| Concorrente | O que faz | Por que não compete com a gente |
|---|---|---|
| Serasa | Bureau de crédito | A gente não precisa de score deles — somos lender. |
| Conta Black | Conta digital pra negros | Não financia compra de estoque. |
| Cora antecipação | Antecipa Pix recebido | Empresta contra futuro vendido, não contra compra a ser feita. |
| Stone Credit | Empresta pra cliente Stone | Só pra quem já é cliente da maquininha. |
| Marvin, Wayflyer | Antecipa recebível pra ecommerce médio | Não atende ticket < R$ 50k nem cadeia periférica. |
| Factoring tradicional | Compra duplicata | Não origina, não tem trava digital, não tem canal afro. |
| Favela Brasil Xpress | Logística periférica | Não é crédito. |

**Nosso slot**: originação + securitização + trava digital + canal afro + underwriting alternativo, num único produto, pra ticket médio R$ 1k–50k que ninguém atende.

---

## 9. Alinhamento com critérios do hackathon

- **Inovação técnica + financeira**: combinamos duplicata escritural + trava de recebíveis B3 + underwriting cross-channel num produto único, voltado pra cadeia que nenhum incumbent serve.
- **Inteligência comunitária**: distribuição via Feira Preta, PretaHub, AfroBusiness. Fornecedores curados na cadeia afro. Empreendedoras conectadas entre si.
- **Resposta ao Instituto DOT sobre viés algorítmico**: nossa resposta é estrutural, não algorítmica. Não tentamos consertar o score discriminatório — construímos uma cadeia onde ele não toma decisão nenhuma.

---

## 10. Roadmap pós-MVP

- **V1**: agente WhatsApp que sugere fornecedores e produtos.
- **V2**: P2P lending — pessoas físicas afro investindo nas próprias empreendedoras (Res. BC 4.656).
- **V3**: marketplace de fornecedores afro curados (cadeia fechada).
- **V4**: cartão de compras AceitoFiado com limite dinâmico.
- **V5**: extensão pra outras cadeias periféricas (não só afro).

---

## 11. Referências

- **Estrutura financeira**: Duplicata Mercantil (Lei 5.474/1968), Duplicata Escritural (Lei 13.775/2018), B3 Registradora de Recebíveis (Res. BC 4.734/2019), FIDC (Res. CVM 175).
- **Mercado**: Sebrae sobre crédito MEI e capital de giro; pesquisa IRME 2023 sobre mulheres empreendedoras; dados Sebrae/PNADC sobre afroempreendedorismo.
- **Concorrentes referência**: Monkey, Liber Capital, Marvin, Cora, Stone Credit, Conta Black.
- **Mentoria de fundo**: Instituto DOT sobre custos da discriminação racial em algoritmos de score.
