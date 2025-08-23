
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
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts"
import { Button } from "../ui/button"
import { X } from "lucide-react"

interface DataChartsProps {
  students: Student[];
  hiddenCharts: string[];
  onToggleChart: (chartId: string) => void;
}

const ChartCard: React.FC<React.PropsWithChildren<{ title: string, description?: string, className?: string, onRemove: () => void }>> = ({ title, description, children, className, onRemove }) => (
    <Card className={`shadow-sm hover:shadow-md transition-shadow relative ${className}`}>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={onRemove}>
            <X className="h-4 w-4" />
        </Button>
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


export function DataCharts({ students, hiddenCharts, onToggleChart }: DataChartsProps) {
    const { 
        genderData, raceData, situationData, nationalityData,
        iaaByGenderData, iaaByRaceData, iaaByOriginData, iaaQuartiles,
        iaaDistributionData, failureRateBySemesterData
    } = useMemo(() => {
        const genderCounts: { [key: string]: number } = {}
        const raceCounts: { [key: string]: number } = {}
        const situationCounts: { [key: string]: number } = {}
        const nationalityCounts: { [key: string]: number } = {}
        const iaaRanges: { [key: string]: number } = {
            "0-1000": 0, "1001-2000": 0, "2001-3000": 0, "3001-4000": 0, "4001-5000": 0,
            "5001-6000": 0, "6001-7000": 0, "7001-8000": 0, "8001-9000": 0, "9001-10000": 0
        };
        const failureRateBySemester: { [semester: number]: { totalRate: number, count: number } } = {};
        
        const sortedIaa = students.map(s => s.iaa).filter(iaa => iaa > 0).sort((a, b) => a - b);
        const q1 = sortedIaa[Math.floor(sortedIaa.length / 4)] || 0;
        const q2 = sortedIaa[Math.floor(sortedIaa.length / 2)] || 0;
        const q3 = sortedIaa[Math.floor(sortedIaa.length * 3 / 4)] || 0;
        const quartiles = [q1, q2, q3];

        const iaaGenderPairs: {primary: string, secondary: string}[] = [];
        const iaaRacePairs: {primary: string, secondary: string}[] = [];
        const iaaOriginPairs: {primary: string, secondary: string}[] = [];

        for (const student of students) {
            genderCounts[student.sexo] = (genderCounts[student.sexo] || 0) + 1;
            raceCounts[student.racaCor] = (raceCounts[student.racaCor] || 0) + 1;
            situationCounts[student.situacao] = (situationCounts[student.situacao] || 0) + 1;
            nationalityCounts[student.nacionalidade] = (nationalityCounts[student.nacionalidade] || 0) + 1;
            
            const iaa = student.iaa;
            if (iaa >= 0 && iaa <= 1000) iaaRanges["0-1000"]++;
            else if (iaa > 1000 && iaa <= 2000) iaaRanges["1001-2000"]++;
            else if (iaa > 2000 && iaa <= 3000) iaaRanges["2001-3000"]++;
            else if (iaa > 3000 && iaa <= 4000) iaaRanges["3001-4000"]++;
            else if (iaa > 4000 && iaa <= 5000) iaaRanges["4001-5000"]++;
            else if (iaa > 5000 && iaa <= 6000) iaaRanges["5001-6000"]++;
            else if (iaa > 6000 && iaa <= 7000) iaaRanges["6001-7000"]++;
            else if (iaa > 7000 && iaa <= 8000) iaaRanges["7001-8000"]++;
            else if (iaa > 8000 && iaa <= 9000) iaaRanges["8001-9000"]++;
            else if (iaa > 9000 && iaa <= 10000) iaaRanges["9001-10000"]++;

            if(student.iaa > 0){
                const iaaQuartile = getIaaQuartile(student.iaa, quartiles);
                iaaGenderPairs.push({ primary: iaaQuartile, secondary: student.sexo });
                iaaRacePairs.push({ primary: iaaQuartile, secondary: student.racaCor });
                const origin = student.municipioSG.toLowerCase() === 'joinville' ? 'Joinville' : 'Externo';
                iaaOriginPairs.push({ primary: iaaQuartile, secondary: origin });
            }

            if (student.iap !== undefined && student.iaa > 0 && student.iap > 0) {
              const failureRate = student.iaa - student.iap;
              const semester = student.semestersInCourse;
              if (!failureRateBySemester[semester]) {
                failureRateBySemester[semester] = { totalRate: 0, count: 0 };
              }
              failureRateBySemester[semester].totalRate += failureRate;
              failureRateBySemester[semester].count++;
            }
        }
        
        const toChartData = (counts: {[key: string]: number}) => Object.entries(counts).map(([name, value], index) => ({ name, value, fill: `hsl(var(--chart-${(index % 5) + 1}))`}));

        const calculatedFailureRateData = Object.entries(failureRateBySemester)
          .map(([semester, data]) => ({
            name: `${semester}º Sem.`,
            value: data.count > 0 ? parseFloat((data.totalRate / data.count).toFixed(2)) : 0,
          }))
          .sort((a, b) => parseInt(a.name) - parseInt(b.name));

        return {
            genderData: toChartData(genderCounts),
            raceData: toChartData(raceCounts).sort((a,b) => b.value - a.value),
            situationData: toChartData(situationCounts),
            nationalityData: toChartData(nationalityCounts),
            iaaByGenderData: aggregateNestedData(iaaGenderPairs),
            iaaByRaceData: aggregateNestedData(iaaRacePairs),
            iaaByOriginData: aggregateNestedData(iaaOriginPairs),
            iaaQuartiles: {q1, q2, q3},
            iaaDistributionData: toChartData(iaaRanges),
            failureRateBySemesterData: calculatedFailureRateData,
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
    const situationConfig = chartConfig(situationData);
    const nationalityConfig = chartConfig(nationalityData);
    const iaaByGenderConfig = stackedChartConfig(iaaByGenderData);
    const iaaByRaceConfig = stackedChartConfig(iaaByRaceData);
    const iaaByOriginConfig = stackedChartConfig(iaaByOriginData);
    const iaaDistributionConfig = chartConfig(iaaDistributionData);
    
    const charts = [
      { id: 'iaaDistribution', title: 'Distribuição de IAA', className: 'lg:col-span-3', component: (
          <ChartCard title="Distribuição de IAA por Faixa" className="lg:col-span-3" onRemove={() => onToggleChart('iaaDistribution')}>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={iaaDistributionData} margin={{ left: 0, right: 30, bottom: 40 }}>
                      <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                      <YAxis />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                      <Bar dataKey="value" radius={5} fill="var(--color-iaaDistribution)" />
                  </BarChart>
              </ResponsiveContainer>
          </ChartCard>
      )},
      { id: 'gender', title: 'Distribuição por Gênero', component: (
          <ChartCard title="Distribuição por Gênero" onRemove={() => onToggleChart('gender')}>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
                      <Tooltip content={<ChartTooltipContent hideLabel />} />
                      <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
               </ResponsiveContainer>
          </ChartCard>
      )},
      { id: 'situation', title: 'Distribuição por Situação', component: (
           <ChartCard title="Distribuição por Situação" onRemove={() => onToggleChart('situation')}>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={situationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label />
                      <Tooltip content={<ChartTooltipContent hideLabel />} />
                      <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
              </ResponsiveContainer>
          </ChartCard>
      )},
      { id: 'nationality', title: 'Distribuição por Nacionalidade', component: (
          <ChartCard title="Distribuição por Nacionalidade" onRemove={() => onToggleChart('nationality')}>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={nationalityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
                      <Tooltip content={<ChartTooltipContent hideLabel />} />
                      <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
               </ResponsiveContainer>
          </ChartCard>
      )},
      { id: 'race', title: 'Distribuição por Raça/Cor', className: 'lg:col-span-3', component: (
          <ChartCard title="Distribuição por Raça/Cor" className="lg:col-span-3" onRemove={() => onToggleChart('race')}>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={raceData} layout="vertical" margin={{ left: 30, right: 30 }}>
                      <XAxis type="number" hide/>
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                      <Bar dataKey="value" radius={5} fill="var(--color-race)" />
                  </BarChart>
              </ResponsiveContainer>
          </ChartCard>
      )},
       { id: 'failureRate', title: 'Taxa de Reprovação Média por Semestre', className: 'lg:col-span-3', component: (
        <ChartCard title="Taxa de Reprovação Média por Semestre" description="Diferença média entre IAA e IAP" onRemove={() => onToggleChart('failureRate')}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={failureRateBySemesterData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Taxa de Reprovação Média" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )},
      { id: 'iaaByGender', title: 'Quartis de IAA por Gênero', component: (
           <ChartCard title="Quartis de IAA por Gênero" description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`} onRemove={() => onToggleChart('iaaByGender')}>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={iaaByGenderData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                      <Legend />
                      {Object.keys(iaaByGenderConfig).map(key => (
                         <Bar key={key} dataKey={key} stackId="a" fill={iaaByGenderConfig[key].color} radius={5} />
                      ))}
                  </BarChart>
              </ResponsiveContainer>
          </ChartCard>
      )},
      { id: 'iaaByRace', title: 'Quartis de IAA por Raça/Cor', component: (
          <ChartCard title="Quartis de IAA por Raça/Cor" description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`} onRemove={() => onToggleChart('iaaByRace')}>
              <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={iaaByRaceData} layout="horizontal">
                      <YAxis />
                      <XAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                      <Legend />
                      {Object.keys(iaaByRaceConfig).map(key => (
                         <Bar key={key} dataKey={key} stackId="a" fill={iaaByRaceConfig[key].color} radius={[5, 5, 0, 0]} />
                      ))}
                  </BarChart>
              </ResponsiveContainer>
          </ChartCard>
      )},
      { id: 'iaaByOrigin', title: 'Quartis de IAA por Origem', component: (
          <ChartCard title="Quartis de IAA por Origem" description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`} onRemove={() => onToggleChart('iaaByOrigin')}>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={iaaByOriginData} layout="horizontal">
                      <YAxis />
                      <XAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                      <Legend />
                      {Object.keys(iaaByOriginConfig).map(key => (
                         <Bar key={key} dataKey={key} stackId="a" fill={iaaByOriginConfig[key].color} radius={[5, 5, 0, 0]} />
                      ))}
                  </BarChart>
              </ResponsiveContainer>
          </ChartCard>
      )}
    ];


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {charts.filter(chart => !hiddenCharts.includes(chart.id)).map(chart => (
            <div key={chart.id} className={chart.className || ''}>
              {chart.component}
            </div>
        ))}
    </div>
  )
}

    