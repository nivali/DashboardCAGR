# Edumap

Edumap é uma aplicação desenvolvida com Next.js para visualização e análise de dados sociodemográficos de estudantes. O objetivo é fornecer uma interface limpa e moderna para importar, transformar e visualizar dados em formato CSV.

## Funcionalidades Principais
- **Importação de Dados CSV**: Aceita arquivos CSV com dados sociodemográficos de estudantes, utilizando `;` como separador.
- **Transformação de Dados**:
  - Conversão de `dataNascimento` para idade.
  - Divisão de `Naturalidade` em `Unidade_Federativa` e `Nome_cidade`.
  - Cálculo do número de semestres desde o ingresso do estudante no curso.
- **Filtros de Dados**:
  - Filtrar por `anoSemestreIngresso` (intervalo de anos).
  - Filtrar por `IAA-indiceAproveitamentoAcumulado` (intervalo de valores).
- **Visualização de Dados**: Aplica filtros e exibe dados demográficos de forma visual e interativa.