
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Filter, ChevronDown, X } from "lucide-react"

type FilterValues = {
  iaa: number[],
  year: number[],
  age: number[],
  nomeCurso: string[],
  situacao: string[],
  sexo: string[],
  racaCor: string[],
  formaIngresso: string[],
  categoriaIngresso: string[],
  estadoCivil: string[],
  nacionalidade: string[],
  semestreIngresso: string[],
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
    categories: string[];
    maritalStatus: string[];
    nationalities: string[];
    semesters: string[];
  };
  initialRanges: {
    iaa: number[];
    year: number[];
    age: number[];
  }
}

const MultiSelectFilter: React.FC<{
    label: string, 
    selected: string[], 
    onSelectionChange: (selected: string[]) => void, 
    options: string[]
}> = ({ label, selected, onSelectionChange, options}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onSelectionChange(newSelected);
    };
    
    const displayText = selected.length > 0
        ? `${selected.length} selecionado(s)`
        : `Todos`;

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-normal">
                        <span className="truncate">{displayText}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <ScrollArea className="h-64">
                        <div className="p-2 space-y-1">
                            {options.map(option => (
                                <div key={option} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                    <Checkbox
                                        id={`${label}-${option}`}
                                        checked={selected.includes(option)}
                                        onCheckedChange={() => handleSelect(option)}
                                    />
                                    <label
                                        htmlFor={`${label}-${option}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                     {selected.length > 0 && (
                        <div className="p-2 border-t">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="w-full justify-center"
                                onClick={() => onSelectionChange([])}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Limpar seleção
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
};


export function Filters({ onFilterChange, filters, options, initialRanges }: FiltersProps) {
  const [currentFilters, setCurrentFilters] = useState(filters);

  useEffect(() => {
    setCurrentFilters(filters)
  }, [filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(currentFilters)
    }, 500)

    return () => clearTimeout(handler)
  }, [currentFilters, onFilterChange])

  const handleRangeChange = (key: 'iaa' | 'year' | 'age', value: number[]) => {
      setCurrentFilters(prev => ({...prev, [key]: value}));
  }
  
  const handleMultiSelectChange = (key: keyof FilterValues, value: string[]) => {
    if (Array.isArray(currentFilters[key])) {
        setCurrentFilters(prev => ({...prev, [key]: value}));
    }
  }

  const handleInputChange = (key: 'year' | 'age' | 'iaa', index: number, value: string) => {
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

        <MultiSelectFilter label="Situação" selected={currentFilters.situacao} onSelectionChange={(v) => handleMultiSelectChange('situacao', v)} options={options.situations} />
        
        <MultiSelectFilter label="Semestre de Ingresso" selected={currentFilters.semestreIngresso} onSelectionChange={(v) => handleMultiSelectChange('semestreIngresso', v)} options={options.semesters} />

        <div className="space-y-4">
            <Label>IAA - Índice de Aproveitamento</Label>
            <Slider
                value={currentFilters.iaa}
                onValueChange={(v) => handleRangeChange('iaa', v)}
                min={initialRanges.iaa[0]}
                max={initialRanges.iaa[1]}
                step={100}
            />
            <div className="flex justify-between items-center gap-2">
                <Input 
                    type="number" 
                    value={currentFilters.iaa[0]}
                    onChange={(e) => handleInputChange('iaa', 0, e.target.value)}
                    className="w-full"
                    min={initialRanges.iaa[0]}
                    max={initialRanges.iaa[1]}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                    type="number" 
                    value={currentFilters.iaa[1]}
                    onChange={(e) => handleInputChange('iaa', 1, e.target.value)}
                    className="w-full"
                    min={initialRanges.iaa[0]}
                    max={initialRanges.iaa[1]}
                />
            </div>
        </div>

        <MultiSelectFilter label="Gênero" selected={currentFilters.sexo} onSelectionChange={(v) => handleMultiSelectChange('sexo', v)} options={options.genders} />

        <MultiSelectFilter label="Raça/Cor" selected={currentFilters.racaCor} onSelectionChange={(v) => handleMultiSelectChange('racaCor', v)} options={options.races} />
        
        <MultiSelectFilter label="Curso" selected={currentFilters.nomeCurso} onSelectionChange={(v) => handleMultiSelectChange('nomeCurso', v)} options={options.courses} />

        <MultiSelectFilter label="Estado Civil" selected={currentFilters.estadoCivil} onSelectionChange={(v) => handleMultiSelectChange('estadoCivil', v)} options={options.maritalStatus} />

        <MultiSelectFilter label="Nacionalidade" selected={currentFilters.nacionalidade} onSelectionChange={(v) => handleMultiSelectChange('nacionalidade', v)} options={options.nationalities} />

        <MultiSelectFilter label="Forma de Ingresso" selected={currentFilters.formaIngresso} onSelectionChange={(v) => handleMultiSelectChange('formaIngresso', v)} options={options.entryForms} />
        
        <MultiSelectFilter label="Categoria de Ingresso" selected={currentFilters.categoriaIngresso} onSelectionChange={(v) => handleMultiSelectChange('categoriaIngresso', v)} options={options.categories} />

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
      </CardContent>
    </Card>
  )
}
