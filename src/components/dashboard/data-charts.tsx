
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
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

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

const getIaaQuartile = (iaa: number, quartiles: number[]): string => {
    if (iaa <= quartiles[0]) return "Q1 (Inferior)";
    if (iaa <= quartiles[1]) return "Q2";
    if (iaa <= quartiles[2]) return "Q3";
    return "Q4 (Superior)";
};

const aggregateNestedData = (data: { primary: string; secondary: string }[]): { name: string; [key: string]: number }[] => {
    const primaryKeys = [...new Set(data.map(d => d.primary))];
    const secondaryKeys = [...new Set(data.map(d => d.secondary))];
    const result: { name: string; [key: string]: number }[] = [];

    primaryKeys.forEach(primaryKey => {
        const row: { name: string; [key: string]: number } = { name: primaryKey };
        secondaryKeys.forEach(secondaryKey => {
            row[secondaryKey] = data.filter(d => d.primary === primaryKey && d.secondary === secondaryKey).length;
        });
        result.push(row);
    });

    return result.sort((a,b) => a.name.localeCompare(b.name));
};


export function DataCharts({ students }: DataChartsProps) {
    const { 
        genderData, raceData, situationData, cityData,
        iaaByGenderData, iaaByRaceData, iaaQuartiles
    } = useMemo(() => {
        const genderCounts: { [key: string]: number } = {}
        const raceCounts: { [key: string]: number } = {}
        const situationCounts: { [key: string]: number } = {}
        const cityCounts: { [key: string]: number } = {}
        
        const sortedIaa = students.map(s => s.iaa).filter(iaa => iaa > 0).sort((a, b) => a - b);
        const q1 = sortedIaa[Math.floor(sortedIaa.length / 4)] || 0;
        const q2 = sortedIaa[Math.floor(sortedIaa.length / 2)] || 0;
        const q3 = sortedIaa[Math.floor(sortedIaa.length * 3 / 4)] || 0;
        const quartiles = [q1, q2, q3];

        const iaaGenderPairs: {primary: string, secondary: string}[] = [];
        const iaaRacePairs: {primary: string, secondary: string}[] = [];

        for (const student of students) {
            genderCounts[student.sexo] = (genderCounts[student.sexo] || 0) + 1;
            raceCounts[student.racaCor] = (raceCounts[student.racaCor] || 0) + 1;
            situationCounts[student.situacao] = (situationCounts[student.situacao] || 0) + 1;
            cityCounts[student.municipioSG] = (cityCounts[student.municipioSG] || 0) + 1;
            
            if(student.iaa > 0){
                const iaaQuartile = getIaaQuartile(student.iaa, quartiles);
                iaaGenderPairs.push({ primary: iaaQuartile, secondary: student.sexo });
                iaaRacePairs.push({ primary: iaaQuartile, secondary: student.racaCor });
            }
        }
        
        const toChartData = (counts: {[key: string]: number}) => Object.entries(counts).map(([name, value], index) => ({ name, value, fill: `hsl(var(--chart-${(index % 5) + 1}))`}));

        return {
            genderData: toChartData(genderCounts),
            raceData: toChartData(raceCounts).sort((a,b) => b.value - a.value),
            situationData: toChartData(situationCounts),
            cityData: toChartData(cityCounts).sort((a,b) => b.value - a.value).slice(0, 10),
            iaaByGenderData: aggregateNestedData(iaaGenderPairs),
            iaaByRaceData: aggregateNestedData(iaaRacePairs),
            iaaQuartiles: {q1, q2, q3}
        }
    }, [students])

    const chartConfig = (data: {name: string, value?: any, fill?: string}[]) => {
        return data.reduce((acc, item) => {
            const name = item.name;
            const color = item.fill;
            acc[name] = { label: name, color: color };
            return acc;
        }, {} as any);
    }
    
    const stackedChartConfig = (data: {name: string, [key: string]: any}[]) => {
      if (data.length === 0) return {};
      const keys = Object.keys(data[0]).filter(k => k !== 'name');
      return keys.reduce((acc, key, index) => {
        acc[key] = { label: key, color: `hsl(var(--chart-${(index % 5) + 1}))` };
        return acc;
      }, {} as any)
    }

    const genderConfig = chartConfig(genderData);
    const raceConfig = chartConfig(raceData);
    const cityConfig = chartConfig(cityData);
    const situationConfig = chartConfig(situationData);
    const iaaByGenderConfig = stackedChartConfig(iaaByGenderData);
    const iaaByRaceConfig = stackedChartConfig(iaaByRaceData);


  return (
    <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Distribuição por Gênero">
            <ChartContainer config={genderConfig} className="min-h-[200px] w-full">
                <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
             </ChartContainer>
        </ChartCard>
        <ChartCard title="Distribuição por Raça/Cor">
            <ChartContainer config={raceConfig} className="min-h-[200px] w-full">
                <BarChart data={raceData} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <XAxis type="number" hide/>
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={5} />
                </BarChart>
            </ChartContainer>
        </ChartCard>
        <ChartCard title="Top 10 Cidades de Origem">
            <ChartContainer config={cityConfig} className="min-h-[200px] w-full">
                <BarChart data={cityData} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} fontSize={12} interval={0} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={5} />
                </BarChart>
            </ChartContainer>
        </ChartCard>
         <ChartCard title="Distribuição por Situação">
            <ChartContainer config={situationConfig} className="min-h-[200px] w-full">
                <PieChart>
                    <Pie data={situationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label />
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
            </ChartContainer>
        </ChartCard>
        <ChartCard title="Quartis de IAA por Gênero" description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`}>
            <ChartContainer config={iaaByGenderConfig} className="min-h-[200px] w-full">
                <BarChart data={iaaByGenderData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                    <Legend />
                    {Object.keys(iaaByGenderConfig).map(key => (
                       <Bar key={key} dataKey={key} stackId="a" fill={iaaByGenderConfig[key].color} radius={5} />
                    ))}
                </BarChart>
            </ChartContainer>
        </ChartCard>
        <ChartCard title="Quartis de IAA por Raça/Cor" description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`}>
            <ChartContainer config={iaaByRaceConfig} className="min-h-[200px] w-full">
                 <BarChart data={iaaByRaceData} layout="horizontal">
                    <YAxis />
                    <XAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                    <Legend />
                    {Object.keys(iaaByRaceConfig).map(key => (
                       <Bar key={key} dataKey={key} stackId="a" fill={iaaByRaceConfig[key].color} radius={[5, 5, 0, 0]} />
                    ))}
                </BarChart>
            </ChartContainer>
        </ChartCard>
    </div>
  )
}
