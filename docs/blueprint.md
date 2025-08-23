# **App Name**: AlunoVis

## Core Features:

- CSV Data Import: Accept a CSV file with student sociodemographic data using semicolon (;) as a separator, and extract specific columns: nomeCurso, Situacao, Sexo, racaCor, dataNascimento, Naturalidade, formaIngresso, IAA-indiceAproveitamentoAcumulado, MunicipioSG, UFSG and anoSemestreIngresso.
- Data Transformation: Convert 'dataNascimento' to student age. Split 'Naturalidade' into 'Unidade_Federativa' and 'Nome_cidade'. Calculate the number of semesters the student has been in the course based on 'anoSemestreIngresso'.
- Data Filters: Create filters for 'anoSemestreIngresso' (year range) and 'IAA-indiceAproveitamentoAcumulado' (value range).
- Data Visualization: Visualize data, applying filters on student demographics.

## Style Guidelines:

- Primary color: HSL(210, 65%, 50%) – RGB(45, 144, 230), a vibrant blue to represent knowledge and progress.
- Background color: HSL(210, 20%, 95%) – RGB(242, 247, 255), a light, desaturated blue for a clean interface.
- Accent color: HSL(180, 50%, 50%) – RGB(64, 191, 191), a contrasting cyan to highlight interactive elements and key data points.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text, providing a modern and readable interface.
- Dashboard layout with clear sections for filters, data visualization, and summary statistics.
- Subtle transitions and animations for filter updates and data loading.