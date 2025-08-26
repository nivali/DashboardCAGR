
"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import type { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Filters } from '@/components/dashboard/filters';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DataCharts } from '@/components/dashboard/data-charts';
import { AppliedFilters } from '@/components/dashboard/applied-filters';
import { RefreshCcw, Download, Loader2, EyeOff, X, Filter as FilterIcon } from 'lucide-react';
import { BrazilHeatmap } from './brazil-heatmap';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface DashboardProps {
  students: Student[];
  onReset: () => void;
}

const chartNames: { [key: string]: string } = {
    stats: 'Cartões de Estatísticas',
    heatmap: 'Mapa de Calor',
    iaaDistribution: 'Distribuição de IAA',
    failureRate: 'Taxa de Reprovação',
    gender: 'Gráfico de Gênero',
    situation: 'Gráfico de Situação',
    nationality: 'Gráfico de Nacionalidade',
    race: 'Gráfico de Raça/Cor',
    iaaByGender: 'Gráfico IAA por Gênero',
    iaaByRace: 'Gráfico IAA por Raça/Cor',
    iaaByOrigin: 'Gráfico IAA por Origem',
    topCitiesOutsideSC: 'Top 7 Cidades de Origem (Fora de SC)',
    topCitiesSC: 'Top 7 Cidades de Origem (SC)',
};

const comparisonCities = ["Florianópolis", "Joinville", "Blumenau", "Araranguá"];

export default function Dashboard({ students, onReset }: DashboardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [backgroundColor, setBackgroundColor] = useState('rgb(248, 250, 252)');
  const [hiddenCharts, setHiddenCharts] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState<'raw' | 'relative'>('raw');
  const [showFilters, setShowFilters] = useState(true);
  const [comparisonCity, setComparisonCity] = useState('Joinville');


  useEffect(() => {
    if (dashboardRef.current) {
        const bgStyle = window.getComputedStyle(document.body).backgroundColor;
        setBackgroundColor(bgStyle || 'rgb(248, 250, 252)');
    }
  }, []);

  const { 
    minIaa, maxIaa, availableYears, 
    minAge, maxAge,
    courses, situations, genders, races, entryForms,
    categories, maritalStatus, nationalities, semesters
  } = useMemo(() => {
    if (students.length === 0) {
      return { 
        minIaa: 0, maxIaa: 10000, availableYears: [],
        minAge: 15, maxAge: 80,
        courses: [], situations: [], genders: [], races: [], entryForms: [],
        categories: [], maritalStatus: [], nationalities: [], semesters: []
      };
    }
    const iaas = students.map(s => s.iaa).filter(Boolean);
    const ages = students.map(s => s.age).filter(Boolean);
    const years = [...new Set(students.map(s => s.anoIngresso))].sort((a, b) => a - b);
    
    return {
      minIaa: Math.floor(Math.min(...iaas, 0)),
      maxIaa: Math.ceil(Math.max(...iaas, 1)),
      availableYears: years,
      minAge: Math.min(...ages),
      maxAge: Math.max(...ages),
      courses: [...new Set(students.map(s => s.nomeCurso))].sort(),
      situations: [...new Set(students.map(s => s.situacao))].sort(),
      genders: [...new Set(students.map(s => s.sexo))].sort(),
      races: [...new Set(students.map(s => s.racaCor))].sort(),
      entryForms: [...new Set(students.map(s => s.formaIngresso))].sort(),
      categories: [...new Set(students.map(s => s.categoriaIngresso))].sort(),
      maritalStatus: [...new Set(students.map(s => s.estadoCivil))].sort(),
      nationalities: [...new Set(students.map(s => s.nacionalidade))].sort(),
      semesters: [...new Set(students.map(s => s.semestreIngresso.toString()))].sort(),
    };
  }, [students]);
  
  const initialRanges = useMemo(() => {
    return {
        iaa: [minIaa, maxIaa],
        year: [availableYears[0] || 2010, availableYears[availableYears.length - 1] || new Date().getFullYear()],
        age: [minAge, maxAge],
    };
  }, [minIaa, maxIaa, availableYears, minAge, maxAge]);
  
  const [filters, setFilters] = useState({
    iaa: initialRanges.iaa,
    year: initialRanges.year,
    age: initialRanges.age,
    nomeCurso: [] as string[],
    situacao: [] as string[],
    sexo: [] as string[],
    racaCor: [] as string[],
    formaIngresso: [] as string[],
    categoriaIngresso: [] as string[],
    estadoCivil: [] as string[],
    nacionalidade: [] as string[],
    semestreIngresso: [] as string[],
  });

  // Reset filters when the underlying data changes to avoid invalid filter states
  useEffect(() => {
    setFilters({
      iaa: initialRanges.iaa,
      year: initialRanges.year,
      age: initialRanges.age,
      nomeCurso: [],
      situacao: [],
      sexo: [],
      racaCor: [],
      formaIngresso: [],
      categoriaIngresso: [],
      estadoCivil: [],
      nacionalidade: [],
      semestreIngresso: [],
    });
  }, [initialRanges]);


  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const iaaMatch = student.iaa >= filters.iaa[0] && student.iaa <= filters.iaa[1];
      const yearMatch = filters.year.length === 0 || (student.anoIngresso >= filters.year[0] && student.anoIngresso <= filters.year[1]);
      const ageMatch = student.age >= filters.age[0] && student.age <= filters.age[1];
      const courseMatch = filters.nomeCurso.length === 0 || filters.nomeCurso.includes(student.nomeCurso);
      const situationMatch = filters.situacao.length === 0 || filters.situacao.includes(student.situacao);
      const genderMatch = filters.sexo.length === 0 || filters.sexo.includes(student.sexo);
      const raceMatch = filters.racaCor.length === 0 || filters.racaCor.includes(student.racaCor);
      const entryFormMatch = filters.formaIngresso.length === 0 || filters.formaIngresso.includes(student.formaIngresso);
      const categoryMatch = filters.categoriaIngresso.length === 0 || filters.categoriaIngresso.includes(student.categoriaIngresso);
      const maritalStatusMatch = filters.estadoCivil.length === 0 || filters.estadoCivil.includes(student.estadoCivil);
      const nationalityMatch = filters.nacionalidade.length === 0 || filters.nacionalidade.includes(student.nacionalidade);
      const semesterMatch = filters.semestreIngresso.length === 0 || filters.semestreIngresso.includes(student.semestreIngresso.toString());

      return iaaMatch && yearMatch && ageMatch && courseMatch && situationMatch && genderMatch && raceMatch && entryFormMatch && categoryMatch && maritalStatusMatch && nationalityMatch && semesterMatch;
    });
  }, [students, filters]);

  const handleSaveDashboard = async () => {
    if (!dashboardRef.current) return;
    setIsSaving(true);
    try {
        const canvas = await html2canvas(dashboardRef.current, {
            useCORS: true,
            scale: 2, 
            backgroundColor: backgroundColor,
        });
        const link = document.createElement('a');
        link.download = 'dashboard-alunovis.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error("Erro ao salvar o dashboard:", error);
    } finally {
        setIsSaving(false);
    }
  };

  const toggleChartVisibility = (chartId: string) => {
    setHiddenCharts(prev => 
      prev.includes(chartId) ? prev.filter(id => id !== chartId) : [...prev, chartId]
    );
  };
  
  const allCharts = Object.keys(chartNames);

  const filterOptions = {
    courses, situations, genders, races, entryForms,
    categories, maritalStatus, nationalities, semesters,
  };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex flex-wrap justify-end items-center gap-4">
        <div className="flex items-center space-x-2">
            <Label htmlFor="analysis-type">Valores Absolutos</Label>
            <Switch 
                id="analysis-type"
                checked={analysisType === 'relative'}
                onCheckedChange={(checked) => setAnalysisType(checked ? 'relative' : 'raw')}
            />
            <Label htmlFor="analysis-type">Valores Relativos</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Label htmlFor="comparison-city">Cidade de Comparação</Label>
            <Select value={comparisonCity} onValueChange={setComparisonCity}>
                <SelectTrigger id="comparison-city" className="w-[180px]">
                    <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                    {comparisonCities.map(city => (
                         <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <FilterIcon className="mr-2 h-4 w-4" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <EyeOff className="mr-2 h-4 w-4" />
                    Ocultar Gráficos
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                {allCharts.map(chartId => (
                    <DropdownMenuCheckboxItem
                    key={chartId}
                    checked={!hiddenCharts.includes(chartId)}
                    onCheckedChange={() => toggleChartVisibility(chartId)}
                    >
                    {chartNames[chartId]}
                    </DropdownMenuCheckboxItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleSaveDashboard} variant="outline" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {isSaving ? "Salvando..." : "Salvar Painel"}
            </Button>
            <Button onClick={onReset} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Carregar Novo Arquivo
            </Button>
        </div>
      </div>
      <div className={`grid grid-cols-1 ${showFilters ? 'lg:grid-cols-4 lg:gap-8' : ''} space-y-8 lg:space-y-0`}>
        {showFilters && (
            <aside className="lg:col-span-1">
                <Filters
                    onFilterChange={setFilters}
                    filters={filters}
                    options={filterOptions}
                    initialRanges={initialRanges}
                />
            </aside>
        )}
        <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-8`} ref={dashboardRef}>
           <AppliedFilters filters={filters} onFilterChange={setFilters} options={initialRanges} />
          {!hiddenCharts.includes('stats') && <StatsCards students={filteredStudents} />}
          <DataCharts students={filteredStudents} hiddenCharts={hiddenCharts} onToggleChart={toggleChartVisibility} analysisType={analysisType} comparisonCity={comparisonCity} />
          {!hiddenCharts.includes('heatmap') && (
            <div className="relative">
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10" onClick={() => toggleChartVisibility('heatmap')}>
                    <X className="h-4 w-4" />
                </Button>
                <BrazilHeatmap students={filteredStudents} comparisonCity={comparisonCity} />
            </div>
           )}
        </div>
      </div>
    </div>
  );
}
