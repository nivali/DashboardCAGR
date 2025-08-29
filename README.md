# Edumap - Análise Visual de Dados Educacionais

Edumap é uma aplicação web interativa, desenvolvida com Next.js e TypeScript, para a visualização e análise de dados sociodemográficos de estudantes. A ferramenta permite que educadores e gestores importem facilmente dados em formato CSV, apliquem filtros dinâmicos e gerem visualizações ricas para obter insights valiosos sobre o perfil e o desempenho dos alunos.

## Visão Geral do Dashboard

A interface principal oferece um conjunto de filtros e gráficos que são atualizados em tempo real, permitindo uma exploração fluida e intuitiva dos dados.

![Visão Geral do Dashboard](https://github.com/leandro-couto/edumap/blob/main/docs/dashboard-geral.png?raw=true)

## Principais Funcionalidades

- **Importação de Dados CSV**: Upload simplificado de arquivos CSV com dados de estudantes, usando `;` como separador. O sistema é robusto e valida as colunas necessárias.
- **Transformação Automática de Dados**:
  - **Cálculo de Idade**: Converte `dataNascimento` para a idade atual e também calcula a idade de ingresso do aluno.
  - **Geolocalização**: Extrai `Unidade Federativa` e `Cidade` a partir do campo `Naturalidade`.
  - **Tempo de Curso**: Calcula o número de semestres cursados desde o ingresso.
- **Filtros Avançados e Dinâmicos**: Refine a análise com uma ampla gama de filtros:
  - Intervalo de Ano de Ingresso
  - Faixa de IAA (Índice de Aproveitamento Acumulado)
  - Faixa Etária
  - Curso, Situação, Gênero, Raça/Cor, e muito mais.
- **Visualização Interativa de Dados**: Uma coleção de gráficos personalizáveis que se atualizam instantaneamente com base nos filtros aplicados.
- **Exportação de Relatórios**: Exporte o dashboard completo ou gráficos individuais como imagens (`PNG`) ou como um arquivo `HTML` interativo, preservando as visualizações para relatórios e apresentações.

![Dashboard Exportado para HTML](https://github.com/leandro-couto/edumap/blob/main/docs/dashboard-export.png?raw=true)

## Galeria de Gráficos

A aplicação gera uma variedade de gráficos para analisar os dados sob diferentes perspectivas.

| Mapa de Calor por Estado de Origem | Distribuição de IAA |
| :---: | :---: |
| ![Heatmap Brasil](https://github.com/leandro-couto/edumap/blob/main/docs/heatmap.png?raw=true) | ![Distribuição IAA](https://github.com/leandro-couto/edumap/blob/main/docs/iaa-distribution.png?raw=true) |

| Comparativo de Desempenho (IAA vs. IAP) | Quartis de IAA por Gênero |
| :---: | :---: |
| ![Comparativo IAA e IAP](https://github.com/leandro-couto/edumap/blob/main/docs/iaa-iap.png?raw=true) | ![Quartis IAA por Gênero](https://github.com/leandro-couto/edumap/blob/main/docs/iaa-gender.png?raw=true) |

## Tecnologias Utilizadas

- **Frontend**: Next.js (React), TypeScript
- **UI**: ShadCN/UI, Tailwind CSS
- **Gráficos**: Recharts, Highcharts (para o mapa de calor)
- **Utilitários**: `html2canvas` para exportação de imagens.
