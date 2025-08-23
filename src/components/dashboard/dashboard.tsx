
"use client";

import { useState, useMemo } from 'react';
import type { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Filters } from '@/components/dashboard/filters';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DataCharts } from '@/components/dashboard/data-charts';
import { RefreshCcw } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  onReset: () => void;
}

export default function Dashboard({ students, onReset }: DashboardProps) {
  const { 
    minIaa, maxIaa, availableYears, 
    minAge, maxAge,
    courses, situations, genders, races, entryForms,
    categories, maritalStatus, nationalities
  } = useMemo(() => {
    if (students.length === 0) {
      return { 
        minIaa: 0, maxIaa: 10, availableYears: [],
        minAge: 15, maxAge: 80,
        courses: [], situations: [], genders: [], races: [], entryForms: [],
        categories: [], maritalStatus: [], nationalities: []
      };
    }
    const iaas = students.map(s => s.iaa);
    const ages = students.map(s => s.age);
    const years = [...new Set(students.map(s => s.anoIngresso))].sort((a, b) => a - b);
    
    return {
      minIaa: Math.floor(Math.min(...iaas)),
      maxIaa: Math.ceil(Math.max(...iaas)),
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
    };
  }, [students]);
  
  const [filters, setFilters] = useState({
    iaa: [minIaa, maxIaa],
    year: [availableYears[0] || new Date().getFullYear() - 10, availableYears[availableYears.length - 1] || new Date().getFullYear()],
    age: [minAge, maxAge],
    nomeCurso: [] as string[],
    situacao: [] as string[],
    sexo: [] as string[],
    racaCor: [] as string[],
    formaIngresso: [] as string[],
    categoriaIngresso: [] as string[],
    estadoCivil: [] as string[],
    nacionalidade: [] as string[],
  });

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const iaaMatch = student.iaa >= filters.iaa[0] && student.iaa <= filters.iaa[1];
      const yearMatch = student.anoIngresso >= filters.year[0] && student.anoIngresso <= filters.year[1];
      const ageMatch = student.age >= filters.age[0] && student.age <= filters.age[1];
      const courseMatch = filters.nomeCurso.length === 0 || filters.nomeCurso.includes(student.nomeCurso);
      const situationMatch = filters.situacao.length === 0 || filters.situacao.includes(student.situacao);
      const genderMatch = filters.sexo.length === 0 || filters.sexo.includes(student.sexo);
      const raceMatch = filters.racaCor.length === 0 || filters.racaCor.includes(student.racaCor);
      const entryFormMatch = filters.formaIngresso.length === 0 || filters.formaIngresso.includes(student.formaIngresso);
      const categoryMatch = filters.categoriaIngresso.length === 0 || filters.categoriaIngresso.includes(student.categoriaIngresso);
      const maritalStatusMatch = filters.estadoCivil.length === 0 || filters.estadoCivil.includes(student.estadoCivil);
      const nationalityMatch = filters.nacionalidade.length === 0 || filters.nacionalidade.includes(student.nacionalidade);

      return iaaMatch && yearMatch && ageMatch && courseMatch && situationMatch && genderMatch && raceMatch && entryFormMatch && categoryMatch && maritalStatusMatch && nationalityMatch;
    });
  }, [students, filters]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <Button onClick={onReset} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Carregar Novo Arquivo
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 space-y-8 lg:space-y-0">
        <aside className="lg:col-span-1">
          <Filters
            onFilterChange={setFilters}
            filters={filters}
            options={{ courses, situations, genders, races, entryForms, categories, maritalStatus, nationalities }}
            initialRanges={{
                iaa: [minIaa, maxIaa],
                year: [availableYears[0] || 2010, availableYears[availableYears.length - 1] || new Date().getFullYear()],
                age: [minAge, maxAge],
            }}
          />
        </aside>
        <div className="lg:col-span-3 space-y-8">
          <StatsCards students={filteredStudents} />
          <DataCharts students={filteredStudents} />
        </div>
      </div>
    </div>
  );
}
