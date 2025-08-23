
"use client"

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Student } from '@/types/student';

interface BrazilHeatmapProps {
  students: Student[];
}

const StatePath = ({ path, fill, label }: { path: string; fill: string; label: string }) => (
  <path d={path} fill={fill} stroke="#FFF" strokeWidth="0.5">
    <title>{label}</title>
  </path>
);

export function BrazilHeatmap({ students }: BrazilHeatmapProps) {
  const stateCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (const student of students) {
        if(student.ufSG && student.ufSG !== "N/A"){
            counts[student.ufSG] = (counts[student.ufSG] || 0) + 1;
        }
    }
    return counts;
  }, [students]);

  const maxCount = useMemo(() => Math.max(1, ...Object.values(stateCounts)), [stateCounts]);

  const getColor = (uf: string | undefined) => {
    if(!uf) return 'hsl(210 20% 90%)';
    const count = stateCounts[uf] || 0;
    if (count === 0) return 'hsl(210 20% 90%)'; // Muted color for no data
    const intensity = Math.round((count / maxCount) * (100 - 40) + 40); // from 40% to 100% lightness
    return `hsl(var(--primary), ${100 - intensity}%)`;
  };
  
  // SVG paths for Brazilian states
  const states = {
    AC: { path: "M 83,183 L 70,200 L 98,228 L 130,220 L 122,206 L 106,182 z", name: "Acre" },
    AL: { path: "M 504,212 L 493,212 L 498,224 L 512,220 z", name: "Alagoas" },
    AP: { path: "M 300,80 L 280,100 L 320,130 L 350,90 z", name: "Amapá" },
    AM: { path: "M 130,120 L 70,200 L 190,200 L 250,110 z", name: "Amazonas" },
    BA: { path: "M 420,220 L 400,280 L 480,280 L 500,220 z", name: "Bahia" },
    CE: { path: "M 450,160 L 420,180 L 440,200 L 470,180 z", name: "Ceará" },
    DF: { path: "M 370,270 L 360,275 L 365,285 L 375,280 z", name: "Distrito Federal" },
    ES: { path: "M 440,310 L 430,320 L 440,330 L 450,320 z", name: "Espírito Santo" },
    GO: { path: "M 320,260 L 300,310 L 380,310 L 370,260 z", name: "Goiás" },
    MA: { path: "M 380,150 L 350,200 L 410,200 L 420,150 z", name: "Maranhão" },
    MT: { path: "M 250,220 L 200,300 L 300,300 L 320,220 z", name: "Mato Grosso" },
    MS: { path: "M 280,310 L 240,360 L 320,360 L 340,310 z", name: "Mato Grosso do Sul" },
    MG: { path: "M 350,290 L 320,350 L 420,350 L 430,290 z", name: "Minas Gerais" },
    PA: { path: "M 250,110 L 190,200 L 350,200 L 350,90 z", name: "Pará" },
    PB: { path: "M 493,190 L 480,195 L 485,205 L 500,200 z", name: "Paraíba" },
    PR: { path: "M 320,370 L 280,410 L 360,410 L 370,370 z", name: "Paraná" },
    PE: { path: "M 490,200 L 450,210 L 493,224 L 512,210 z", name: "Pernambuco" },
    PI: { path: "M 410,180 L 380,220 L 420,220 L 440,180 z", name: "Piauí" },
    RJ: { path: "M 420,355 L 400,370 L 430,375 L 440,360 z", name: "Rio de Janeiro" },
    RN: { path: "M 480,175 L 465,180 L 475,195 L 490,185 z", name: "Rio Grande do Norte" },
    RS: { path: "M 290,440 L 250,490 L 350,490 L 360,440 z", name: "Rio Grande do Sul" },
    RO: { path: "M 190,200 L 130,220 L 180,280 L 250,220 z", name: "Rondônia" },
    RR: { path: "M 190,80 L 130,120 L 250,110 L 240,70 z", name: "Roraima" },
    SC: { path: "M 340,415 L 300,450 L 380,450 L 380,415 z", name: "Santa Catarina" },
    SP: { path: "M 340,340 L 300,380 L 400,380 L 400,340 z", name: "São Paulo" },
    SE: { path: "M 500,228 L 490,230 L 495,240 L 505,235 z", name: "Sergipe" },
    TO: { path: "M 350,200 L 320,260 L 380,260 L 400,200 z", name: "Tocantins" },
  };

  const firstStateWithStudents = Object.keys(states).find(s => (stateCounts[s] || 0) > 0);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Mapa de Calor por Estado</CardTitle>
        <CardDescription>Distribuição de alunos de acordo com o estado de origem (UFSG).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[22rem] flex justify-center items-center">
             <svg viewBox="0 0 600 500" className="w-full h-full">
                {Object.entries(states).map(([uf, {path, name}]) => (
                    <StatePath 
                        key={uf} 
                        path={path} 
                        fill={getColor(uf)} 
                        label={`${name}: ${stateCounts[uf] || 0} aluno(s)`} 
                    />
                ))}
             </svg>
             <div className="absolute bottom-4 right-4 bg-card/80 p-2 rounded-md border text-xs">
                <div className="flex items-center gap-2">
                    <span>Menos</span>
                    <div className="flex">
                        <div className="w-4 h-4" style={{backgroundColor: getColor(firstStateWithStudents)}}></div>
                        <div className="w-4 h-4" style={{backgroundColor: `hsl(var(--primary), 30%)`}}></div>
                        <div className="w-4 h-4" style={{backgroundColor: `hsl(var(--primary), 10%)`}}></div>
                        <div className="w-4 h-4" style={{backgroundColor: `hsl(var(--primary), 0%)`}}></div>
                    </div>
                    <span>Mais</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

