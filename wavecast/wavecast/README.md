# WaveCast — Frontend

Frontend do WaveCast implementado a partir do design (Tela 1 · Landing e
Tela 2 · Dashboard), com **React 18 + Vite + React Router DOM + Axios +
Tailwind CSS + Lucide React + Recharts**.

## Como rodar

Este projeto foi gerado como código-fonte puro (sem `node_modules`), então
rode localmente:

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

- `/` — Tela 1 · Landing Page
- `/forecast` — Tela 2 · Dashboard de previsão
- `/favorites`, `/about` — placeholders simples ("Em breve"), prontos para
  receber as próximas telas do seu design quando quiser

## Estrutura

```
src/
  api/
    client.js       # instâncias axios (marine, weather, geocoding)
    forecast.js      # busca + normaliza os dados de previsão
  components/
    Navbar.jsx        # navbar clara/escura reutilizada nas duas telas
    WaveBackdrop.jsx  # ondas decorativas do hero
    HeroSearch.jsx    # busca + sugestões da Landing
    HeroInfoCards.jsx # 4 cards de resumo no rodapé do hero
    DateStrip.jsx     # seletor de 8 dias do Dashboard
    OndasCard.jsx     # card grande e escuro de ondas (com mini-gráfico)
    MetricCard.jsx    # card branco genérico (Vento/Maré/Temp/Umidade)
    LuaCard.jsx        # card escuro da fase da lua
    HourlyChart.jsx    # gráfico inferior com abas Ondas/Vento/Maré
  pages/
    Landing.jsx       # Tela 1
    Dashboard.jsx     # Tela 2
    ComingSoon.jsx    # placeholder para as demais rotas
  utils/
    format.js         # formatação pt-BR (vírgula decimal, datas)
    moonPhase.js       # cálculo local de fase lunar
    tide.js            # MOCK de maré (ver abaixo)
```

## De onde vêm os dados

A API usada é a **[Open-Meteo](https://open-meteo.com/)** (gratuita, sem
API key), escolhida por já aparecer citada no seu mockup ("v1.0 ·
Open-Meteo · Stormglass"):

- **Ondas** → [Marine API](https://open-meteo.com/en/docs/marine-weather-api)
  (`wave_height`, `wave_period`, `wave_direction`)
- **Vento, temperatura, umidade, UV** →
  [Forecast API](https://open-meteo.com/en/docs)
- **Localização (busca)** →
  [Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

### O que ainda é mock

Duas informações do design não têm fonte gratuita equivalente:

1. **Maré** — não existe na Open-Meteo. `src/utils/tide.js` retorna dados
   fixos e está comentado explicando como plugar a **Stormglass** (que já
   aparecia no seu mockup) quando você tiver uma API key. Recomendo não
   chamar a Stormglass direto do browser em produção — passe por um
   backend/proxy simples para não expor a key.
2. **Fase da lua** — calculada localmente em `src/utils/moonPhase.js`
   (fórmula astronômica padrão, sem precisar de API), então já funciona de
   verdade, só não vem de um serviço externo.

Tudo isso está isolado em arquivos próprios (`api/`, `utils/tide.js`,
`utils/moonPhase.js`) para ficar fácil de trocar depois sem mexer nos
componentes visuais.

## Design tokens

As cores e fontes foram extraídas pixel a pixel do seu mockup e centralizadas
em `tailwind.config.js`:

| Token | Valor | Uso |
|---|---|---|
| `navy` | `#0a2540` | fundo escuro / botões |
| `navy-deep` | `#06192a` | cards escuros / texto principal em fundo claro |
| `cream` | `#f4f7f9` | fundo claro / texto em fundo escuro |
| `accent` | `#7cbcd3` | destaques, itálico do headline |
| `accent-soft` | `#b3d6e2` | parágrafos sobre fundo escuro |
| `slate` | `#5b6e80` | texto secundário |
| `good` / `warn` | verde / âmbar | badges de condição |

Fontes: **Instrument Serif** (números e headlines) + **Geist/Inter**
(interface), carregadas via Google Fonts no `index.html`.

## Próximos passos sugeridos

- Plugar a Stormglass (ou outra fonte) para maré real
- Implementar as telas de Favoritos e Sobre (Item 5/6 do seu mockup)
- Adicionar loading skeletons durante o fetch inicial
- Testes de acessibilidade (o projeto já usa `:focus-visible` e contraste
  AA nas cores principais, mas vale revisar com um leitor de tela)
