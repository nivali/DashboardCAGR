
"use client"

import { useMemo } from "react"
import type { Student } from "@/types/student"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Cake, Percent, GraduationCap, CalendarPlus } from "lucide-react"

interface StatsCardsProps {
  students: Student[]
}

export function StatsCards({ students }: StatsCardsProps) {
  const stats = useMemo(() => {
    if (students.length === 0) {
      return {
        total: 0,
        avgAge: 0,
        avgEntryAge: 0,
        avgIaa: 0,
        avgSemesters: 0,
      }
    }

    const totalAge = students.reduce((sum, s) => sum + s.age, 0)
    const totalEntryAge = students.reduce((sum, s) => sum + s.idadeIngresso, 0)
    const totalIaa = students.reduce((sum, s) => sum + s.iaa, 0)
    const totalSemesters = students.reduce((sum, s) => sum + s.semestersInCourse, 0)

    return {
      total: students.length,
      avgAge: totalAge / students.length,
      avgEntryAge: totalEntryAge / students.length,
      avgIaa: totalIaa / students.length,
      avgSemesters: totalSemesters / students.length,
    }
  }, [students])

  const StatCard = ({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: string, unit?: string }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        icon={<Users className="h-4 w-4 text-muted-foreground" />} 
        title="Total de Alunos (Filtrado)" 
        value={stats.total.toLocaleString()} 
      />
      <StatCard 
        icon={<Cake className="h-4 w-4 text-muted-foreground" />} 
        title="Idade Média (Atual)" 
        value={stats.avgAge.toFixed(1)}
        unit="anos"
      />
      <StatCard 
        icon={<CalendarPlus className="h-4 w-4 text-muted-foreground" />} 
        title="Idade Média (Ingresso)" 
        value={stats.avgEntryAge.toFixed(1)}
        unit="anos"
      />
      <StatCard 
        icon={<Percent className="h-4 w-4 text-muted-foreground" />} 
        title="IAA Médio" 
        value={(stats.avgIaa / 1000).toFixed(3)} 
      />
      <StatCard 
        icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />} 
        title="Semestres Cursados" 
        value={stats.avgSemesters.toFixed(1)} 
        unit="média"
      />
    </div>
  )
}
