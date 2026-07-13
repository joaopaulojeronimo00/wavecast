# WaveCast — Processo de implementação e decisões de arquitetura

Este documento detalha como o frontend do WaveCast foi construído a partir
do seu arquivo de design, e por que cada decisão técnica foi tomada.

---

## 1. Extração do design

O arquivo enviado (`WaveCast_Telas__standalone_.html`) não era HTML/CSS
legível diretamente — era um bundle compilado (~1,5 MB, com uma única
linha de ~1,5 milhão de caracteres) exportado pela ferramenta de design.
Não dava para ler o "código-fonte" desse export; era preciso renderizá-lo
e extrair os valores reais do DOM já calculado pelo navegador.

**Processo usado:**

1. **Renderização headless** — abri o arquivo com Playwright (Chromium)
   num viewport bem largo (10.200px), porque a primeira inspeção revelou
   que as telas não estavam empilhadas verticalmente: eram múltiplas
   seções ("Item 5 · Rotas do Sitemap", "Item 6 · Wireframes") dispostas
   **lado a lado**, cada uma com vários mockups dentro. Um viewport
   estreito cortava o conteúdo e um crop ingênuo por altura misturava telas
   diferentes na mesma captura — foi exatamente esse erro que aconteceu na
   primeira tentativa (o corte por coordenadas X pegou pedaços da tela de
   Favoritos junto com a Landing).
2. **Localização exata dos frames** — em vez de confiar em screenshots
   inteiros, busquei no DOM os elementos de texto `"Tela 1 · Landing Page"`,
   `"Tela 2 · Dashboard"` e `"Tela 3 · Detalhes"`, subi na árvore até achar
   o container que representa o frame de cada mockup, e usei
   `getBoundingClientRect()` para pegar as coordenadas exatas (`left`,
   `top`, `width`, `height`) de cada tela. Isso eliminou qualquer
   ambiguidade sobre onde uma tela começa e termina.
3. **Screenshot recortado por coordenada exata** — com os retângulos
   corretos, recortei cada tela isoladamente em alta resolução para
   inspeção visual pixel a pixel.
4. **Extração de tokens computados** — além do visual, percorri todos os
   nós-folha do DOM dentro de cada frame e coletei `getComputedStyle()`:
   `color`, `background-color`, `font-size`, `font-weight`, `font-family`,
   `border-radius`, posição e texto. Isso deu valores exatos (ex.:
   `rgb(10, 37, 64)`, `"Instrument Serif"`, `17px/600`) em vez de eu ter que
   "chutar" a cor olhando um PNG.

Esse processo foi o que garantiu fidelidade: as cores no Tailwind config
(`#0a2540`, `#06192a`, `#7cbcd3`, `#b3d6e2`, `#5b6e80`...) vieram direto do
`rgb()` computado pelo navegador, não de inspeção visual aproximada.

---

## 2. Por que separar API em `client.js` + `forecast.js` + `utils/`

```
src/api/client.js      → instâncias axios (só configuração de transporte)
src/api/forecast.js    → busca + normalização dos dados
src/utils/moonPhase.js → cálculo local (sem API)
src/utils/tide.js      → mock, isolado e comentado
```

**Justificativa:** o mockup citava três fontes de dados no badge do hero
("Open-Meteo · Stormglass"), mas só uma (Open-Meteo) é gratuita e sem
cadastro. Maré (Stormglass) exige API key paga, e fase da lua não precisa
de API nenhuma — é cálculo astronômico determinístico.

Em vez de esconder essa diferença ou simular tudo com dados fake sem
avisar, isolei cada fonte em seu próprio módulo:

- **`client.js`** só cria as instâncias axios (uma por API do Open-Meteo:
  marine, weather, geocoding). Se amanhã você trocar de provedor, mexe
  aqui e nada mais quebra.
- **`forecast.js`** faz as chamadas reais em paralelo
  (`Promise.all`) e **normaliza** a resposta num único formato interno
  (`{ current, tide, moon, next24, daily }`) que os componentes consomem.
  Os componentes de UI nunca veem o formato bruto da API — se a Open-Meteo
  mudar o schema da resposta, só `normalizeForecast()` precisa mudar.
- **`utils/tide.js`** retorna dados fixos, mas com um comentário explícito
  dizendo exatamente onde e como plugar a Stormglass depois (incluindo o
  aviso de não expor a API key no client). Isso evita o cenário comum de
  "mock esquecido em produção" — está marcado, documentado e fácil de
  achar.
- **`utils/moonPhase.js`** é a única "fonte de dados" que já é real de
  verdade (fórmula do ciclo sinódico lunar), só não depende de rede.

**Alternativa que foi descartada:** colocar tudo dentro dos componentes
(fetch direto no `useEffect` da página). Funcionaria para duas telas, mas
misturaria camada de dados com camada visual — qualquer mudança de API
exigiria mexer em JSX, e não daria para reusar a mesma busca de previsão
se uma futura tela de Favoritos precisar dos mesmos dados.

---

## 3. Por que sem gerenciador de estado global (Redux/Zustand/Context)

Cada página (`Landing.jsx`, `Dashboard.jsx`) busca seus próprios dados com
`useState` + `useEffect` local. Não há Context API nem lib de estado
global.

**Justificativa:** com duas telas e nenhum estado que precise ser
compartilhado *entre* páginas (a Landing não precisa saber o que o
Dashboard está mostrando, e vice-versa), uma store global seria
complexidade sem benefício — mais um conceito para você entender, mais
boilerplate, sem ganho real. O React Router já resolve a navegação, e
`location.state` é usado para passar a busca da Landing para o Dashboard
(`navigate('/forecast', { state: { query } })`), que é o único dado que
efetivamente atravessa uma fronteira de rota hoje.

**Quando isso deixaria de valer:** se a Tela 3 (Detalhes) ou "Favoritos"
precisarem compartilhar a lista de praias salvas entre várias rotas, ou se
o fetch de previsão passar a ser reusado em 3+ lugares, aí sim vale
extrair para um Context (`ForecastContext`) ou um hook customizado
(`useForecast(lat, lon)` com cache). Deixei o código já estruturado para
essa extração ser simples — `fetchForecast()` é uma função pura, fácil de
envolver num hook depois.

---

## 4. Por que Tailwind com tokens customizados em vez de CSS módulos ou styled-components

O `tailwind.config.js` define uma paleta nomeada (`navy`, `navy-deep`,
`cream`, `accent`, `accent-soft`, `slate`, `good`, `warn`) em vez de usar
valores arbitrários (`bg-[#0a2540]`) espalhados pelos componentes.

**Justificativa:**

- **Fidelidade rastreável** — cada cor tem nome semântico ligado ao papel
  dela no design (`navy` = fundo escuro, não "azul 1"), então o código
  fica legível sem precisar abrir o mockup.
- **Consistência automática** — se amanhã você decidir que o `accent`
  deveria ser um tom levemente diferente, muda em um lugar
  (`tailwind.config.js`) e todos os componentes atualizam.
- **Menos decisão por componente** — o desenvolvedor (ou eu, ou outra IA)
  escreve `bg-navy-deep` em vez de lembrar o hex `#06192a` de cabeça, o
  que reduz inconsistência visual ao longo do tempo.

Tailwind puro (sem CSS-in-JS) também foi a escolha natural porque você já
especificou TailwindCSS na stack — não havia decisão a tomar aí, só a
organização dos tokens dentro dele.

---

## 5. Decomposição de componentes

```
components/
  Navbar.jsx        (compartilhado, com variant="dark"|"light")
  WaveBackdrop.jsx   (decoração SVG do hero)
  HeroSearch.jsx     (busca + sugestões — só Tela 1)
  HeroInfoCards.jsx  (4 cards do rodapé do hero — só Tela 1)
  DateStrip.jsx      (seletor de 8 dias — só Tela 2)
  OndasCard.jsx      (card grande + mini-gráfico — só Tela 2)
  MetricCard.jsx     (card branco genérico — reusado 3x na Tela 2)
  LuaCard.jsx        (card escuro da lua — Tela 2, mas visualmente
                       parecido com o card de Lua da Tela 1)
  HourlyChart.jsx    (gráfico inferior com abas — só Tela 2)
```

**Critério de corte:** cada componente representa um bloco visual que
tem identidade própria no mockup (tem um rótulo, uma borda, um propósito
único), **não** uma divisão arbitrária de linhas de código. Dois casos
merecem explicação:

- **`Navbar` compartilhado com prop `variant`** em vez de dois componentes
  separados (`NavbarDark`/`NavbarLight`): o mockup usa a *mesma* navbar
  nas duas telas, só muda a cor do texto/fundo. Duplicar o componente
  criaria dois lugares para manter em sincronia (links, espaçamento,
  responsividade) por uma diferença que é puramente de tema. Uma prop
  resolve isso com uma linha de diferença.
- **`MetricCard` genérico** para Vento/Maré/Temperatura/Umidade: os quatro
  cards do Dashboard têm exatamente a mesma estrutura (ícone + rótulo,
  valor grande em serifa, badge opcional, conteúdo extra) e só mudam o
  conteúdo. Em vez de 4 componentes quase idênticos, um componente com
  `children` para a parte variável evita repetição e faz qualquer ajuste
  de espaçamento/tipografia valer para os quatro de uma vez.

`OndasCard` e `LuaCard`, apesar de também serem "cards escuros", ficaram
**fora** do `MetricCard` genérico de propósito: o card de Ondas tem uma
estrutura interna bem mais rica (mini-gráfico, 3 sub-métricas, badge de
condição dinâmica) que não caberia bem no slot genérico sem virar um
componente com dezenas de props condicionais — nesse ponto, a duplicação
controlada é mais legível que uma abstração forçada.

---

## 6. Gráficos: Recharts com dados normalizados, não SVG feito à mão

Os dois gráficos (mini-gráfico do card de Ondas e o gráfico horário com
abas Ondas/Vento/Maré) usam `AreaChart` do Recharts, alimentado pelo mesmo
array `next24` que vem de `normalizeForecast()`.

**Justificativa:** você já pediu Recharts na stack, então a escolha da
lib estava dada — a decisão de arquitetura foi **onde os dados do gráfico
são preparados**. Optei por fazer a normalização (horas, valores) uma
única vez em `forecast.js`, e os componentes de gráfico só consomem esse
formato pronto. Isso evita que cada componente reimplemente sua própria
lógica de "pegar as próximas 24h a partir de agora", que é um detalhe de
dados, não de apresentação.

O gráfico inferior (`HourlyChart`) tem abas (Ondas/Vento/Maré) que trocam
o `dataKey` do mesmo `AreaChart` em vez de renderizar três gráficos
diferentes — menos código, e a transição entre abas fica mais barata
(o Recharts só re-renderiza a série, não desmonta o gráfico inteiro).

---

## 7. Tratamento de dados ausentes / fallback

Todo componente de dado (`HeroInfoCards`, `OndasCard`, `MetricCard` na
Dashboard) recebe `data` como prop e usa `??` para cair num valor de
exemplo idêntico ao do mockup quando a API ainda não respondeu ou falhou:

```js
const wave = data?.current?.waveHeight ?? 1.8
```

**Justificativa:** a chamada à Open-Meteo é assíncrona e pode falhar (rede
do usuário, CORS em algum ambiente, rate limit). Sem fallback, a tela
"pisca" com zeros ou fica em branco no primeiro segundo, ou quebra
visualmente se a API cair. Usar os mesmos números do mockup como fallback
garante que a interface **nunca fica visualmente incorreta** — na pior das
hipóteses, mostra um dado de exemplo estático em vez de dado real, o que é
preferível a mostrar `undefined`, `NaN` ou um card vazio.

Isso é uma escolha deliberada de *graceful degradation* em vez de
skeleton/spinner bloqueante, adequada para duas telas de apresentação de
dados onde "mostrar algo plausível" é mais importante que "mostrar que
está carregando".

---

## 8. Roteamento e páginas "Em breve"

`App.jsx` define rotas para `/`, `/forecast`, `/favorites`, `/about` e uma
rota coringa (`*`). As duas últimas e a coringa apontam para o mesmo
componente `ComingSoon`, parametrizado por `title`.

**Justificativa:** o Navbar do mockup já linka para Favoritos e Sobre.
Deixar esses links quebrados (404 do navegador) ou removê-los silenciosamente
seria pior do que reconhecer explicitamente que essas telas não foram
pedidas neste recorte — o `ComingSoon` comunica isso ao usuário final e
evita a sensação de link quebrado, além de já deixar o "encaixe" pronto
(rota + componente) para quando você pedir a Tela 3 ou o restante do
sitemap.

---

## 9. Validação sem `npm install`

O ambiente onde construí o projeto não tem acesso à internet, então não
dava para rodar `npm install && npm run dev` de verdade para testar. Para
não entregar código não verificado, usei um `esbuild` já disponível no
ambiente para:

1. Checar a sintaxe de **cada arquivo** `.jsx`/`.js` individualmente.
2. Fazer um **bundle completo** a partir de `main.jsx`, com as dependências
   externas (`react`, `react-router-dom`, `axios`, `lucide-react`,
   `recharts`) marcadas como `--external`, para validar que **toda a árvore
   de imports internos resolve** sem erro de referência.

Isso pegou dois bugs reais antes da entrega (um import duplicado e uma
referência a uma função renomeada) que só apareceriam em tempo de build.
Não substitui rodar o projeto de verdade no seu ambiente, mas reduziu bem
a chance de erro trivial na primeira execução.

---

## 10. O que ficou deliberadamente fora do escopo

- **Testes automatizados** — não pedidos, e prematuros para duas telas
  ainda sujeitas a ajuste visual.
- **TypeScript** — você especificou a stack em JS puro; adicionar tipos
  teria sido decisão minha, não sua.
- **Skeleton loaders / spinners** — optei pelo fallback de dados (item 7)
  em vez de estados de loading visuais, por ser mais simples e adequado ao
  volume de dados das duas telas.
- **Cache de requisições (React Query, SWR)** — com duas páginas e uma
  chamada cada, o ganho não justificaria a dependência extra ainda; é o
  primeiro lugar que eu extrairia se o projeto crescer para mais telas
  reusando os mesmos dados.

---

## Resumo das decisões e o critério por trás de cada uma

| Decisão | Critério |
|---|---|
| Extrair design via DOM computado, não visual | Precisão pixel-a-pixel > estimativa visual |
| API em camada separada (`api/` + `utils/`) | Isolar o que é real do que é mock, sem esconder |
| Sem estado global | Nenhum estado cruza rotas hoje; YAGNI |
| Tokens Tailwind nomeados | Rastreabilidade e consistência futura |
| `Navbar` com `variant`, `MetricCard` genérico | Reuso onde a estrutura é idêntica |
| `OndasCard`/`LuaCard` fora do genérico | Reuso forçado pioraria a legibilidade |
| Fallback de dados em vez de skeleton | Interface nunca "quebra" visualmente |
| Rotas `ComingSoon` para links não implementados | Nenhum link do design fica quebrado |
| Validação via esbuild sem `npm install` | Ambiente sem rede; reduzir erro na 1ª execução |
