"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Filter } from "lucide-react"

interface FiltersProps {
  onFilterChange: (filters: { iaa: number[], year: number[] }) => void
  initialIaaRange: number[]
  initialYearRange: number[]
}

export function Filters({ onFilterChange, initialIaaRange, initialYearRange }: FiltersProps) {
  const [iaaRange, setIaaRange] = useState(initialIaaRange)
  const [yearRange, setYearRange] = useState(initialYearRange)

  useEffect(() => {
    setIaaRange(initialIaaRange);
    setYearRange(initialYearRange);
  }, [initialIaaRange, initialYearRange]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ iaa: iaaRange, year: yearRange })
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [iaaRange, yearRange, onFilterChange])

  const handleYearInputChange = (index: number, value: string) => {
    const newYear = parseInt(value, 10);
    if (!isNaN(newYear)) {
        const newRange = [...yearRange];
        newRange[index] = newYear;
        if(newRange[0] <= newRange[1]) {
            setYearRange(newRange);
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
          <Label>IAA - Índice de Aproveitamento</Label>
          <Slider
            value={iaaRange}
            onValueChange={setIaaRange}
            min={initialIaaRange[0]}
            max={initialIaaRange[1]}
            step={0.1}
            minStepsBetweenThumbs={0.1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{iaaRange[0].toFixed(1)}</span>
            <span>{iaaRange[1].toFixed(1)}</span>
          </div>
        </div>
        <div className="space-y-4">
          <Label>Ano de Ingresso</Label>
          <Slider
            value={yearRange}
            onValueChange={setYearRange}
            min={initialYearRange[0]}
            max={initialYearRange[1]}
            step={1}
          />
          <div className="flex justify-between items-center gap-2">
             <Input 
                type="number" 
                value={yearRange[0]}
                onChange={(e) => handleYearInputChange(0, e.target.value)}
                className="w-full"
                min={initialYearRange[0]}
                max={initialYearRange[1]}
             />
             <span className="text-muted-foreground">-</span>
             <Input
                type="number" 
                value={yearRange[1]}
                onChange={(e) => handleYearInputChange(1, e.target.value)}
                className="w-full"
                min={initialYearRange[0]}
                max={initialYearRange[1]}
             />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
