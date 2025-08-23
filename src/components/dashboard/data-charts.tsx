"use client"

import { useMemo } from "react"
import type { Student } from "@/types/student"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface DataChartsProps {
  students: Student[]
}

const ChartCard: React.FC<React.PropsWithChildren<{ title: string, description?: string }>> = ({ title, description, children }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
            <div className="w-full h-64">
                {children}
            </div>
        </CardContent>
    </Card>
)

export function DataCharts({ students }: DataChartsProps) {
    const { genderData, raceData, courseData, situationData } = useMemo(() => {
        const genderCounts: { [key: string]: number } = {}
        const raceCounts: { [key: string]: number } = {}
        const courseCounts: { [key: string]: number } = {}
        const situationCounts: { [key: string]: number } = {}

        for (const student of students) {
            genderCounts[student.sexo] = (genderCounts[student.sexo] || 0) + 1;
            raceCounts[student.racaCor] = (raceCounts[student.racaCor] || 0) + 1;
            courseCounts[student.nomeCurso] = (courseCounts[student.nomeCurso] || 0) + 1;
            situationCounts[student.situacao] = (situationCounts[student.situacao] || 0) + 1;
        }
        
        const toChartData = (counts: {[key: string]: number}) => Object.entries(counts).map(([name, value]) => ({ name, value, fill: `hsl(var(--chart-${(Object.keys(counts).indexOf(name) % 5) + 1}))`}));

        return {
            genderData: toChartData(genderCounts),
            raceData: toChartData(raceCounts).sort((a,b) => b.value - a.value),
            courseData: toChartData(courseCounts).sort((a,b) => b.value - a.value).slice(0, 10),
            situationData: toChartData(situationCounts)
        }
    }, [students])

  return (
    <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Distribuição por Gênero">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    </Pie>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Distribuição por Raça/Cor">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={raceData} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <XAxis type="number" hide/>
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={5} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top 10 Cursos com mais Alunos">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} fontSize={12} interval={0} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={5} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
         <ChartCard title="Distribuição por Situação">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={situationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                    </Pie>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    </div>
  )
}
