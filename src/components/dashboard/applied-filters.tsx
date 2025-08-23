"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
}

interface AppliedFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  options: {
    iaa: number[];
    year: number[];
    age: number[];
  }
}

const filterLabels: { [key: string]: string } = {
  nomeCurso: "Curso",
  situacao: "Situação",
  sexo: "Gênero",
  racaCor: "Raça/Cor",
  formaIngresso: "Forma de Ingresso",
  categoriaIngresso: "Categoria de Ingresso",
  estadoCivil: "Estado Civil",
  nacionalidade: "Nacionalidade",
};

export function AppliedFilters({ filters, onFilterChange, options }: AppliedFiltersProps) {
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
        if (Array.isArray(value)) {
            if (key === 'iaa' || key === 'year' || key === 'age') {
                const initialRange = options[key as keyof typeof options];
                return value[0] > initialRange[0] || value[1] < initialRange[1];
            }
            return value.length > 0;
        }
        return false;
    });

    if (activeFilters.length === 0) {
        return null;
    }

    const removeFilter = (key: string, valueToRemove?: string | number) => {
        const newFilters = { ...filters };
        const filterValue = newFilters[key as keyof FilterValues];

        if (Array.isArray(filterValue)) {
             if (key === 'iaa' || key === 'year' || key === 'age') {
                const initialRange = options[key as keyof typeof options];
                newFilters[key as 'iaa' | 'year' | 'age'] = [initialRange[0], initialRange[1]];
            } else if (typeof valueToRemove === 'string') {
                 newFilters[key as keyof FilterValues] = filterValue.filter(v => v !== valueToRemove) as any;
            }
        }
        onFilterChange(newFilters);
    };
    
    const clearAllFilters = () => {
         const newFilters = { ...filters };
         Object.keys(newFilters).forEach(key => {
            if(Array.isArray(newFilters[key as keyof FilterValues])) {
                if (key === 'iaa' || key === 'year' || key === 'age') {
                    const initialRange = options[key as keyof typeof options];
                    newFilters[key as 'iaa' | 'year' | 'age'] = [initialRange[0], initialRange[1]];
                } else {
                    newFilters[key as keyof FilterValues] = [] as any;
                }
            }
         });
         onFilterChange(newFilters);
    }

    return (
        <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Filtros Ativos</h4>
                 <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-primary hover:text-primary">
                    <X className="mr-1 h-3 w-3" />
                    Limpar Todos
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {activeFilters.map(([key, values]) => {
                    if (key === 'iaa' || key === 'year' || key === 'age') {
                        const label = key === 'iaa' ? 'IAA' : (key === 'year' ? 'Ano Ingresso' : 'Idade');
                        return (
                             <Badge key={key} variant="secondary" className="flex items-center gap-1">
                                {label}: {values[0]} - {values[1]}
                                <button onClick={() => removeFilter(key)} className="ml-1 rounded-full hover:bg-background/50">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )
                    }
                    return (values as string[]).map(value => (
                        <Badge key={`${key}-${value}`} variant="secondary" className="flex items-center gap-1">
                            {filterLabels[key]}: {value}
                            <button onClick={() => removeFilter(key, value)} className="ml-1 rounded-full hover:bg-background/50">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))
                })}
            </div>
        </div>
    );
}
