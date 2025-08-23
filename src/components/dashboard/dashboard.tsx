"use client";

import { useState, useMemo } from 'react';
import type { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Filters } from '@/components/dashboard/filters';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DataCharts } from '@/components/dashboard/data-charts';
import { StudentTable } from '@/components/dashboard/student-table';
import { RefreshCcw } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  onReset: () => void;
}

export default function Dashboard({ students, onReset }: DashboardProps) {
  const { minIaa, maxIaa, availableYears } = useMemo(() => {
    if (students.length === 0) {
      return { minIaa: 0, maxIaa: 10, availableYears: [] };
    }
    const iaas = students.map(s => s.iaa);
    const years = [...new Set(students.map(s => s.anoIngresso))].sort((a, b) => a - b);
    return {
      minIaa: Math.floor(Math.min(...iaas)),
      maxIaa: Math.ceil(Math.max(...iaas)),
      availableYears: years,
    };
  }, [students]);
  
  const [filters, setFilters] = useState({
    iaa: [minIaa, maxIaa],
    year: [availableYears[0] || new Date().getFullYear() - 5, availableYears[availableYears.length - 1] || new Date().getFullYear()],
  });

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const iaaMatch = student.iaa >= filters.iaa[0] && student.iaa <= filters.iaa[1];
      const yearMatch = student.anoIngresso >= filters.year[0] && student.anoIngresso <= filters.year[1];
      return iaaMatch && yearMatch;
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
            initialIaaRange={[minIaa, maxIaa]}
            initialYearRange={[availableYears[0], availableYears[availableYears.length-1]]}
          />
        </aside>
        <div className="lg:col-span-3 space-y-8">
          <StatsCards students={filteredStudents} />
          <DataCharts students={filteredStudents} />
          <StudentTable students={filteredStudents} />
        </div>
      </div>
    </div>
  );
}
