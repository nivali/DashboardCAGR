
"use client"

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Student } from '@/types/student';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import mapData from '@highcharts/map-collection/countries/br/br-all.geo.json';
import HighchartsMap from 'highcharts/modules/map';

if (typeof Highcharts === 'object') {
    HighchartsMap(Highcharts);
}

interface BrazilHeatmapProps {
  students: Student[];
}

const stateMapping: { [key: string]: string } = {
    'AC': 'br-ac', 'AL': 'br-al', 'AP': 'br-ap', 'AM': 'br-am', 'BA': 'br-ba',
    'CE': 'br-ce', 'DF': 'br-df', 'ES': 'br-es', 'GO': 'br-go', 'MA': 'br-ma',
    'MT': 'br-mt', 'MS': 'br-ms', 'MG': 'br-mg', 'PA': 'br-pa', 'PB': 'br-pb',
    'PR': 'br-pr', 'PE': 'br-pe', 'PI': 'br-pi', 'RJ': 'br-rj', 'RN': 'br-rn',
    'RS': 'br-rs', 'RO': 'br-ro', 'RR': 'br-rr', 'SC': 'br-sc', 'SP': 'br-sp',
    'SE': 'br-se', 'TO': 'br-to'
};

export function BrazilHeatmap({ students }: BrazilHeatmapProps) {
  const { stateData, scData } = useMemo(() => {
    const counts: { [key: string]: { total: number, joinville: number, others: number} } = {};

    for (const student of students) {
        if(student.ufSG && student.ufSG !== "N/A"){
            const hcKey = stateMapping[student.ufSG];
            if(hcKey) {
                 if (!counts[hcKey]) {
                    counts[hcKey] = { total: 0, joinville: 0, others: 0 };
                 }
                 counts[hcKey].total++;
                 if (student.ufSG === 'SC') {
                    if (student.municipioSG.toLowerCase() === 'joinville') {
                        counts[hcKey].joinville++;
                    } else {
                        counts[hcKey].others++;
                    }
                 }
            }
        }
    }
    const data = Object.entries(counts).map(([key, value]) => [key, value.total]);
    return { stateData: data, scData: counts['br-sc'] };
  }, [students]);

  const mapOptions = {
    chart: {
        map: 'countries/br/br-all',
        height: 400,
    },
    title: {
        text: ''
    },
    credits: {
        enabled: false,
    },
    mapNavigation: {
        enabled: true,
        buttonOptions: {
            verticalAlign: 'bottom'
        }
    },
    colorAxis: {
        min: 0,
        minColor: '#E6E7E8',
        maxColor: 'hsl(210, 65%, 40%)',
        stops: [
            [0, '#E6E7E8'], // No data
            [0.01, 'hsl(210, 65%, 80%)'], // Lightest blue for min value > 0
            [1, 'hsl(210, 65%, 30%)'] // Darkest blue for max value
        ]
    },
    series: [{
        data: stateData,
        name: 'Número de Alunos',
        states: {
            hover: {
                color: 'hsl(210, 80%, 60%)'
            }
        },
        dataLabels: {
            enabled: true,
            format: '{point.value}',
            style: {
                fontSize: '10px',
                color: '#333',
                textOutline: 'none'
            }
        }
    }],
    tooltip: {
        formatter: function(this: Highcharts.TooltipFormatterContextObject): string {
            const point = this.point as any;
            if (point['hc-key'] === 'br-sc' && scData) {
                return `${point.name}<br/><b>Total: ${point.value}</b><br/>Joinville: ${scData.joinville}<br/>Demais: ${scData.others}`;
            }
            return `${point.name}: <b>${point.value}</b> aluno(s)`;
        }
    },
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Mapa de Calor por Estado</CardTitle>
        <CardDescription>Distribuição de alunos de acordo com o estado de origem (UFSG).</CardDescription>
      </CardHeader>
      <CardContent>
         <HighchartsReact
            highcharts={Highcharts}
            constructorType={'mapChart'}
            options={{...mapOptions, series: [{...mapOptions.series[0], data: stateData, mapData: mapData}]}}
        />
      </CardContent>
    </Card>
  );
}
