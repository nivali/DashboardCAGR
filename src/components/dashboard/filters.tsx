
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

type FilterValues = {
  iaa: number[],
  year: number[],
  age: number[],
  nomeCurso: string,
  situacao: string,
  sexo: string,
  racaCor: string,
  formaIngresso: string,
}

interface FiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  filters: FilterValues;
  options: {
    courses: string[];
    situations: string[];
    genders: string[];
    races: string[];
    entryForms: string[];
  };
  initialRanges: {
    iaa: number[];
    year: number[];
    age: number[];
  }
}

const FilterSelect: React.FC<{label: string, value: string, onValueChange: (v:string) => void, options: string[]}> = ({ label, value, onValueChange, options}) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
                <SelectValue placeholder={`Todos os ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {options.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);


export function Filters({ onFilterChange, filters, options, initialRanges }: FiltersProps) {
  const [currentFilters, setCurrentFilters] = useState(filters);

  useEffect(() => {
    setCurrentFilters(filters)
  }, [filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(currentFilters)
    }, 300)

    return () => clearTimeout(handler)
  }, [currentFilters, onFilterChange])

  const handleRangeChange = (key: 'iaa' | 'year' | 'age', value: number[]) => {
      setCurrentFilters(prev => ({...prev, [key]: value}));
  }
  
  const handleSelectChange = (key: 'nomeCurso' | 'situacao' | 'sexo' | 'racaCor' | 'formaIngresso', value: string) => {
      setCurrentFilters(prev => ({...prev, [key]: value}));
  }

  const handleInputChange = (key: 'year' | 'age', index: number, value: string) => {
    const newNum = parseInt(value, 10);
    if (!isNaN(newNum)) {
        const newRange = [...currentFilters[key]];
        newRange[index] = newNum;
        if(newRange[0] <= newRange[1]) {
            setCurrentFilters(prev => ({...prev, [key]: newRange}));
        }
    }
  };

  return (
    <Card className="sticky top-8 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FilterSelect label="Curso" value={currentFilters.nomeCurso} onValueChange={(v) => handleSelectChange('nomeCurso', v)} options={options.courses} />
        <FilterSelect label="Situação" value={currentFilters.situacao} onValueChange={(v) => handleSelectChange('situacao', v)} options={options.situations} />
        <FilterSelect label="Gênero" value={currentFilters.sexo} onValueChange={(v) => handleSelectChange('sexo', v)} options={options.genders} />
        <FilterSelect label="Raça/Cor" value={currentFilters.racaCor} onValueChange={(v) => handleSelectChange('racaCor', v)} options={options.races} />
        <FilterSelect label="Forma de Ingresso" value={currentFilters.formaIngresso} onValueChange={(v) => handleSelectChange('formaIngresso', v)} options={options.entryForms} />

        <div className="space-y-4">
          <Label>Idade</Label>
          <Slider
            value={currentFilters.age}
            onValueChange={(v) => handleRangeChange('age', v)}
            min={initialRanges.age[0]}
            max={initialRanges.age[1]}
            step={1}
          />
          <div className="flex justify-between items-center gap-2">
             <Input 
                type="number" 
                value={currentFilters.age[0]}
                onChange={(e) => handleInputChange('age', 0, e.target.value)}
                className="w-full"
                min={initialRanges.age[0]}
                max={initialRanges.age[1]}
             />
             <span className="text-muted-foreground">-</span>
             <Input
                type="number" 
                value={currentFilters.age[1]}
                onChange={(e) => handleInputChange('age', 1, e.target.value)}
                className="w-full"
                min={initialRanges.age[0]}
                max={initialRanges.age[1]}
             />
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>IAA - Índice de Aproveitamento</Label>
          <Slider
            value={currentFilters.iaa}
            onValueChange={(v) => handleRangeChange('iaa', v)}
            min={initialRanges.iaa[0]}
            max={initialRanges.iaa[1]}
            step={0.1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{currentFilters.iaa[0].toFixed(1)}</span>
            <span>{currentFilters.iaa[1].toFixed(1)}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>Ano de Ingresso</Label>
          <Slider
            value={currentFilters.year}
            onValueChange={(v) => handleRangeChange('year', v)}
            min={initialRanges.year[0]}
            max={initialRanges.year[1]}
            step={1}
          />
          <div className="flex justify-between items-center gap-2">
             <Input 
                type="number" 
                value={currentFilters.year[0]}
                onChange={(e) => handleInputChange('year', 0, e.target.value)}
                className="w-full"
                min={initialRanges.year[0]}
                max={initialRanges.year[1]}
             />
             <span className="text-muted-foreground">-</span>
             <Input
                type="number" 
                value={currentFilters.year[1]}
                onChange={(e) => handleInputChange('year', 1, e.target.value)}
                className="w-full"
                min={initialRanges.year[0]}
                max={initialRanges.year[1]}
             />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

