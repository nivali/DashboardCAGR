
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
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line, Cell, LabelList } from "recharts"
import { Button } from "../ui/button"
import { X, Tag } from "lucide-react"

interface DataChartsProps {
  students: Student[];
  hiddenCharts: string[];
  onToggleChart: (chartId: string) => void;
  analysisType: 'raw' | 'relative';
  comparisonCity: string;
  chartsWithLabels: string[];
  onToggleLabels: (chartId: string) => void;
  availableCourses: string[];
}

const ChartCard: React.FC<React.PropsWithChildren<{ 
    title: string, 
    chartId: string,
    description?: string, 
    className?: string, 
    onRemove: () => void,
    onToggleLabels: () => void,
    labelsVisible: boolean,
}>> = ({ title, chartId, description, children, className, onRemove, onToggleLabels, labelsVisible }) => (
    <Card className={`shadow-sm hover:shadow-md transition-shadow relative flex flex-col ${className}`}>
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            <Button variant={labelsVisible ? "secondary" : "ghost"} size="icon" className="h-6 w-6" onClick={onToggleLabels}>
                <Tag className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                <X className="h-4 w-4" />
            </Button>
        </div>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-1 flex">
            <div className="w-full h-full min-h-[300px]">
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

const aggregateNestedData = (data: { primary: string; secondary: string }[], analysisType: 'raw' | 'relative'): { name: string; [key: string]: number }[] => {
    const primaryKeys = [...new Set(data.map(d => d.primary))];
    const secondaryKeys = [...new Set(data.map(d => d.secondary))].sort();
    const result: { name: string; [key: string]: number }[] = [];

    primaryKeys.forEach(primaryKey => {
        const row: { name: string; [key: string]: number } = { name: primaryKey };
        const primaryGroupData = data.filter(d => d.primary === primaryKey);
        const totalInPrimaryGroup = primaryGroupData.length;

        secondaryKeys.forEach(secondaryKey => {
            const count = primaryGroupData.filter(d => d.secondary === secondaryKey).length;
            if (analysisType === 'relative' && totalInPrimaryGroup > 0) {
                row[secondaryKey] = parseFloat(((count / totalInPrimaryGroup) * 100).toFixed(2));
            } else {
                row[secondaryKey] = count;
            }
        });
        result.push(row);
    });

    return result.sort((a,b) => a.name.localeCompare(b.name));
};

const PALETTE = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))"
];

const colorCache = new Map<string, string>();
let lastColorIndex = -1;

const getStableColor = (name: string): string => {
    if (colorCache.has(name)) {
        return colorCache.get(name)!;
    }
    lastColorIndex = (lastColorIndex + 1) % PALETTE.length;
    const color = PALETTE[lastColorIndex];
    colorCache.set(name, color);
    return color;
};

export function DataCharts({ students, hiddenCharts, onToggleChart, analysisType, comparisonCity, chartsWithLabels, onToggleLabels, availableCourses }: DataChartsProps) {
    const totalStudents = students.length;

    const { 
        genderData, raceData, situationData, nationalityData,
        iaaByGenderData, iaaByRaceData, iaaByOriginData, iaaByCourseData, iaaQuartiles,
        iaaDistributionData, failureRateBySemesterData, top7CitiesOutsideSCData, top7CitiesSCData
    } = useMemo(() => {
        const genderCounts: { [key: string]: number } = {}
        const raceCounts: { [key: string]: number } = {}
        const situationCounts: { [key: string]: number } = {}
        const nationalityCounts: { [key: string]: number } = {}
        const cityCountsOutsideSC: { [key: string]: number } = {};
        const cityCountsSC: { [key: string]: number } = {};
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
        const iaaCoursePairs: {primary: string, secondary: string}[] = [];

        for (const student of students) {
            genderCounts[student.sexo] = (genderCounts[student.sexo] || 0) + 1;
            raceCounts[student.racaCor] = (raceCounts[student.racaCor] || 0) + 1;
            situationCounts[student.situacao] = (situationCounts[student.situacao] || 0) + 1;
            nationalityCounts[student.nacionalidade] = (nationalityCounts[student.nacionalidade] || 0) + 1;
            
            if (student.municipioSG && student.municipioSG !== 'N/A') {
                if (student.ufSG !== 'SC') {
                    cityCountsOutsideSC[student.municipioSG] = (cityCountsOutsideSC[student.municipioSG] || 0) + 1;
                } else {
                    cityCountsSC[student.municipioSG] = (cityCountsSC[student.municipioSG] || 0) + 1;
                }
            }


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
                const origin = student.municipioSG.toLowerCase() === comparisonCity.toLowerCase() ? comparisonCity : 'Externo';
                iaaOriginPairs.push({ primary: iaaQuartile, secondary: origin });
                iaaCoursePairs.push({ primary: student.nomeCurso, secondary: iaaQuartile });
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
        
        const toChartData = (counts: {[key: string]: number}, total: number = totalStudents) => {
             return Object.entries(counts).map(([name, value]) => ({ 
                name, 
                value: analysisType === 'relative' && total > 0 ? parseFloat(((value / total) * 100).toFixed(2)) : value,
                fill: getStableColor(name)
            }));
        }

        const calculatedFailureRateData = Object.entries(failureRateBySemester)
          .map(([semester, data]) => ({
            name: `${semester}º Sem.`,
            value: data.count > 0 ? parseFloat((data.totalRate / data.count).toFixed(2)) : 0,
          }))
          .sort((a, b) => parseInt(a.name) - parseInt(b.name));
        
        const sortedCitiesOutsideSC = Object.entries(cityCountsOutsideSC).sort(([, a], [, b]) => b - a).slice(0, 7);
        const top7TotalOutsideSC = sortedCitiesOutsideSC.reduce((sum, [, count]) => sum + count, 0);

        const sortedCitiesSC = Object.entries(cityCountsSC).sort(([, a], [, b]) => b - a).slice(0, 7);
        const top7TotalSC = sortedCitiesSC.reduce((sum, [, count]) => sum + count, 0);

        return {
            genderData: toChartData(genderCounts),
            raceData: toChartData(raceCounts).sort((a,b) => b.value - a.value),
            situationData: toChartData(situationCounts),
            nationalityData: toChartData(nationalityCounts),
            iaaByGenderData: aggregateNestedData(iaaGenderPairs, analysisType),
            iaaByRaceData: aggregateNestedData(iaaRacePairs, analysisType),
            iaaByOriginData: aggregateNestedData(iaaOriginPairs, analysisType),
            iaaByCourseData: aggregateNestedData(iaaCoursePairs, analysisType),
            iaaQuartiles: {q1, q2, q3},
            iaaDistributionData: toChartData(iaaRanges),
            failureRateBySemesterData: calculatedFailureRateData,
            top7CitiesOutsideSCData: toChartData(Object.fromEntries(sortedCitiesOutsideSC), top7TotalOutsideSC).sort((a,b) => b.value - a.value),
            top7CitiesSCData: toChartData(Object.fromEntries(sortedCitiesSC), top7TotalSC).sort((a,b) => b.value - a.value),
        }
    }, [students, analysisType, totalStudents, comparisonCity]);

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
      return keys.reduce((acc, key) => {
        acc[key] = { label: key, color: getStableColor(key) };
        return acc;
      }, {} as any)
    }
    
    const tooltipFormatter = (value: number) => {
        if (analysisType === 'relative') {
            return `${value.toFixed(2)}%`;
        }
        return value.toLocaleString();
    };

    const stackedTooltipFormatter = (value: number, name: string, props: any) => {
        if (analysisType === 'relative') {
            return `${value.toFixed(2)}%`;
        }
        return value.toLocaleString();
    };

    const genderConfig = chartConfig(genderData);
    const raceConfig = chartConfig(raceData);
    const situationConfig = chartConfig(situationData);
    const nationalityConfig = chartConfig(nationalityData);
    const iaaByGenderConfig = stackedChartConfig(iaaByGenderData);
    const iaaByRaceConfig = stackedChartConfig(iaaByRaceData);
    const iaaByOriginConfig = stackedChartConfig(iaaByOriginData);
    const iaaByCourseConfig = stackedChartConfig(iaaByCourseData);
    const iaaDistributionConfig = chartConfig(iaaDistributionData);
    const top7CitiesOutsideSCConfig = chartConfig(top7CitiesOutsideSCData);
    const top7CitiesSCConfig = chartConfig(top7CitiesSCData);
    
    const charts = [
      { id: 'iaaDistribution', title: 'Distribuição de IAA', component: (
          <ChartCard chartId="iaaDistribution" title="Distribuição de IAA por Faixa" onRemove={() => onToggleChart('iaaDistribution')} onToggleLabels={() => onToggleLabels('iaaDistribution')} labelsVisible={chartsWithLabels.includes('iaaDistribution')}>
            <ChartContainer config={iaaDistributionConfig}>
              <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={iaaDistributionData} margin={{ left: 0, right: 30, top: 20, bottom: 60 }}>
                      <XAxis dataKey="name" angle={-60} textAnchor="end" interval={0} height={100} />
                      <YAxis tickFormatter={(value) => analysisType === 'relative' ? `${value}%` : value} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                      <Bar dataKey="value" radius={5}>
                        {iaaDistributionData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        {chartsWithLabels.includes('iaaDistribution') && <LabelList dataKey="value" position="top" formatter={tooltipFormatter} fontSize={12} />}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
             </ChartContainer>
          </ChartCard>
      )},
      { id: 'gender', title: 'Distribuição por Gênero', component: (
          <ChartCard chartId="gender" title="Distribuição por Gênero" onRemove={() => onToggleChart('gender')} onToggleLabels={() => onToggleLabels('gender')} labelsVisible={chartsWithLabels.includes('gender')}>
             <ChartContainer config={genderConfig}>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} 
                           label={chartsWithLabels.includes('gender') ? ({ name, value }) => `${name}: ${tooltipFormatter(value)}` : false}
                      >
                         {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                      <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
               </ResponsiveContainer>
              </ChartContainer>
          </ChartCard>
      )},
      { id: 'situation', title: 'Distribuição por Situação', component: (
           <ChartCard chartId="situation" title="Distribuição por Situação" onRemove={() => onToggleChart('situation')} onToggleLabels={() => onToggleLabels('situation')} labelsVisible={chartsWithLabels.includes('situation')}>
             <ChartContainer config={situationConfig}>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={situationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} 
                        label={chartsWithLabels.includes('situation') ? ({ name, value }) => `${name}: ${tooltipFormatter(value)}` : false}
                      >
                        {situationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                      <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
              </ResponsiveContainer>
              </ChartContainer>
          </ChartCard>
      )},
      { id: 'nationality', title: 'Distribuição por Nacionalidade', component: (
          <ChartCard chartId="nationality" title="Distribuição por Nacionalidade" onRemove={() => onToggleChart('nationality')} onToggleLabels={() => onToggleLabels('nationality')} labelsVisible={chartsWithLabels.includes('nationality')}>
            <ChartContainer config={nationalityConfig}>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={nationalityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} 
                        label={chartsWithLabels.includes('nationality') ? ({ name, value }) => `${name}: ${tooltipFormatter(value)}` : false}
                      >
                         {nationalityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                      <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
               </ResponsiveContainer>
              </ChartContainer>
          </ChartCard>
      )},
      { id: 'race', title: 'Distribuição por Raça/Cor', component: (
          <ChartCard chartId="race" title="Distribuição por Raça/Cor" onRemove={() => onToggleChart('race')} onToggleLabels={() => onToggleLabels('race')} labelsVisible={chartsWithLabels.includes('race')}>
            <ChartContainer config={raceConfig}>
              <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={raceData} layout="vertical" margin={{ left: 60, right: 40 }}>
                      <XAxis type="number" hide tickFormatter={(value) => analysisType === 'relative' ? `${value}%` : value} />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                      <Bar dataKey="value" radius={5} >
                         {raceData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                          {chartsWithLabels.includes('race') && <LabelList dataKey="value" position="right" formatter={tooltipFormatter} fontSize={12} />}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
             </ChartContainer>
          </ChartCard>
      )},
      { id: 'topCitiesOutsideSC', title: 'Top 7 Cidades (Fora de SC)', component: (
          <ChartCard chartId="topCitiesOutsideSC" title="Top 7 Cidades de Origem (Fora de SC)" onRemove={() => onToggleChart('topCitiesOutsideSC')} onToggleLabels={() => onToggleLabels('topCitiesOutsideSC')} labelsVisible={chartsWithLabels.includes('topCitiesOutsideSC')}>
            <ChartContainer config={top7CitiesOutsideSCConfig}>
              <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={top7CitiesOutsideSCData} layout="vertical" margin={{ left: 60, right: 40 }} barSize={20}>
                      <XAxis type="number" hide tickFormatter={(value) => analysisType === 'relative' ? `${value}%` : value} />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} tick={{width: 110, textOverflow: 'ellipsis'}}/>
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                      <Bar dataKey="value" radius={5} >
                         {top7CitiesOutsideSCData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                          {chartsWithLabels.includes('topCitiesOutsideSC') && <LabelList dataKey="value" position="right" formatter={tooltipFormatter} fontSize={12} />}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
             </ChartContainer>
          </ChartCard>
      )},
      { id: 'topCitiesSC', title: 'Top 7 Cidades (SC)', component: (
        <ChartCard chartId="topCitiesSC" title="Top 7 Cidades de Origem (SC)" onRemove={() => onToggleChart('topCitiesSC')} onToggleLabels={() => onToggleLabels('topCitiesSC')} labelsVisible={chartsWithLabels.includes('topCitiesSC')}>
          <ChartContainer config={top7CitiesSCConfig}>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={top7CitiesSCData} layout="vertical" margin={{ left: 60, right: 40 }} barSize={20}>
                    <XAxis type="number" hide tickFormatter={(value) => analysisType === 'relative' ? `${value}%` : value} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} tick={{width: 110, textOverflow: 'ellipsis'}} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                    <Bar dataKey="value" radius={5} >
                       {top7CitiesSCData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                        {chartsWithLabels.includes('topCitiesSC') && <LabelList dataKey="value" position="right" formatter={tooltipFormatter} fontSize={12} />}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
           </ChartContainer>
        </ChartCard>
    )},
       { id: 'failureRate', title: 'Desempenho Acadêmico por Semestre', component: (
        <ChartCard chartId="failureRate" title="Desempenho Acadêmico por Semestre" description="Diferença média entre IAA e IAP" onRemove={() => onToggleChart('failureRate')} onToggleLabels={() => onToggleLabels('failureRate')} labelsVisible={chartsWithLabels.includes('failureRate')}>
          <ChartContainer config={{value: {label: 'Diferença Média IAA-IAP', color: 'hsl(var(--chart-1))'}}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={failureRateBySemesterData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Diferença Média IAA-IAP">
                  {chartsWithLabels.includes('failureRate') && <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(2)} />}
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      )},
      { id: 'iaaByGender', title: 'Quartis de IAA por Gênero', component: (
           <ChartCard chartId="iaaByGender" title="Quartis de IAA por Gênero" description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`} onRemove={() => onToggleChart('iaaByGender')} onToggleLabels={() => onToggleLabels('iaaByGender')} labelsVisible={chartsWithLabels.includes('iaaByGender')}>
            <ChartContainer config={iaaByGenderConfig}>
              <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={iaaByGenderData} layout="vertical">
                      <XAxis type="number" hide tickFormatter={(value) => analysisType === 'relative' ? `${value}%` : ''}/>
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={stackedTooltipFormatter} />} />
                      <Legend />
                      {Object.keys(iaaByGenderConfig).map(key => (
                         <Bar key={key} dataKey={key} stackId="a" fill={iaaByGenderConfig[key].color} radius={5}>
                           {chartsWithLabels.includes('iaaByGender') && <LabelList dataKey={key} formatter={tooltipFormatter} position="center" className="fill-white" />}
                         </Bar>
                      ))}
                  </BarChart>
              </ResponsiveContainer>
             </ChartContainer>
          </ChartCard>
      )},
      { id: 'iaaByRace', title: 'Quartis de IAA por Raça/Cor', component: (
          <ChartCard chartId="iaaByRace" title="Quartis de IAA por Raça/Cor" description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`} onRemove={() => onToggleChart('iaaByRace')} onToggleLabels={() => onToggleLabels('iaaByRace')} labelsVisible={chartsWithLabels.includes('iaaByRace')}>
            <ChartContainer config={iaaByRaceConfig}>
              <ResponsiveContainer width="100%" height={400}>
                   <BarChart data={iaaByRaceData} layout="horizontal" margin={{bottom: 20}}>
                      <YAxis tickFormatter={(value) => analysisType === 'relative' ? `${value}%` : value} />
                      <XAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={stackedTooltipFormatter} />} />
                      <Legend wrapperStyle={{paddingTop: 30}} />
                      {Object.keys(iaaByRaceConfig).map(key => (
                         <Bar key={key} dataKey={key} stackId="a" fill={iaaByRaceConfig[key].color} radius={[5, 5, 0, 0]}>
                            {chartsWithLabels.includes('iaaByRace') && <LabelList dataKey={key} formatter={tooltipFormatter} position="center" className="fill-white" />}
                         </Bar>
                      ))}
                  </BarChart>
              </ResponsiveContainer>
             </ChartContainer>
          </ChartCard>
      )},
      { id: 'iaaByOrigin', title: `Quartis de IAA: ${comparisonCity} vs Externo`, component: (
          <ChartCard chartId="iaaByOrigin" title={`Quartis de IAA: ${comparisonCity} vs Externo`} description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`} onRemove={() => onToggleChart('iaaByOrigin')} onToggleLabels={() => onToggleLabels('iaaByOrigin')} labelsVisible={chartsWithLabels.includes('iaaByOrigin')}>
            <ChartContainer config={iaaByOriginConfig}>
              <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={iaaByOriginData} layout="horizontal" margin={{bottom: 20}}>
                      <YAxis tickFormatter={(value) => analysisType === 'relative' ? `${value}%` : value} />
                      <XAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={stackedTooltipFormatter} />} />
                      <Legend wrapperStyle={{paddingTop: 30}} />
                      {Object.keys(iaaByOriginConfig).map(key => (
                         <Bar key={key} dataKey={key} stackId="a" fill={iaaByOriginConfig[key].color} radius={[5, 5, 0, 0]}>
                            {chartsWithLabels.includes('iaaByOrigin') && <LabelList dataKey={key} formatter={tooltipFormatter} position="center" className="fill-white" />}
                         </Bar>
                      ))}
                  </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
      )},
      ...(availableCourses.length > 1 ? [{
        id: 'iaaByCourse', title: `Quartis de IAA por Curso`, component: (
            <ChartCard chartId="iaaByCourse" title={`Quartis de IAA por Curso`} description={`Q1: ≤ ${iaaQuartiles.q1?.toFixed(2)}, Q2: ≤ ${iaaQuartiles.q2?.toFixed(2)}, Q3: ≤ ${iaaQuartiles.q3?.toFixed(2)}`} onRemove={() => onToggleChart('iaaByCourse')} onToggleLabels={() => onToggleLabels('iaaByCourse')} labelsVisible={chartsWithLabels.includes('iaaByCourse')}>
              <ChartContainer config={iaaByCourseConfig}>
                <ResponsiveContainer width="100%" height={Math.max(400, iaaByCourseData.length * 50)}>
                    <BarChart data={iaaByCourseData} layout="vertical" margin={{ left: 200, bottom: 20 }}>
                        <XAxis type="number" hide tickFormatter={(value) => analysisType === 'relative' ? `${value}%` : ''}/>
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={200} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={stackedTooltipFormatter} />} />
                        <Legend />
                        {Object.keys(iaaByCourseConfig).map(key => (
                           <Bar key={key} dataKey={key} stackId="a" fill={iaaByCourseConfig[key].color} radius={5}>
                              {chartsWithLabels.includes('iaaByCourse') && <LabelList dataKey={key} formatter={tooltipFormatter} position="center" className="fill-white" />}
                           </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </ChartCard>
        )
    }] : [])
    ];


  return (
    <div className="flex flex-col space-y-8">
        {charts.filter(chart => !hiddenCharts.includes(chart.id)).map(chart => (
            <div key={chart.id}>
              {chart.component}
            </div>
        ))}
    </div>
  )
}
