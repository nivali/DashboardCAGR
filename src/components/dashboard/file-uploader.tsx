"use client";

import { useState, useCallback } from 'react';
import type { Student } from '@/types/student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUp, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

interface FileUploaderProps {
  onDataLoaded: (data: Student[]) => void;
}

const parseAndTransformData = (csvText: string): Student[] => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error("Arquivo CSV vazio ou sem dados.");
    }

    const headerLine = lines.shift();
    if (!headerLine) throw new Error("Cabeçalho não encontrado.");

    const headers = headerLine.split(';').map(h => h.trim());
    
    const requiredColumns = [
        "nomeCurso", "Situacao", "Sexo", "racaCor", "dataNascimento", 
        "Naturalidade", "formaIngresso", "IAA-indiceAproveitamentoAcumulado", 
        "MunicipioSG", "UFSG", "anoSemestreIngresso"
    ];
    
    const indices: { [key: string]: number } = {};
    requiredColumns.forEach(col => {
        const index = headers.findIndex(h => h.toLowerCase() === col.toLowerCase());
        if (index === -1) {
            throw new Error(`Coluna obrigatória não encontrada: ${col}`);
        }
        indices[col] = index;
    });

    return lines.map(line => {
        const values = line.split(';').map(v => v.trim());
        if (values.length < headers.length) return null;

        const dataNascimentoStr = values[indices.dataNascimento];
        if (!/^\d{2}-\d{2}-\d{4}$/.test(dataNascimentoStr)) return null;
        
        const [day, month, year] = dataNascimentoStr.split('-').map(Number);
        const birthDate = new Date(year, month - 1, day);
        let age = new Date().getFullYear() - birthDate.getFullYear();
        const m = new Date().getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
            age--;
        }

        const naturalidade = values[indices.Naturalidade] || 'N/A';
        const [unidadeFederativa, cidadeNaturalidade] = naturalidade.includes(' - ') 
            ? naturalidade.split(' - ').map(s => s.trim()) 
            : [naturalidade, 'N/A'];

        const anoSemestreIngressoStr = values[indices.anoSemestreIngresso];
        if (!/^\d{5}$/.test(anoSemestreIngressoStr)) return null;

        const anoIngresso = parseInt(anoSemestreIngressoStr.substring(0, 4));
        const semestreIngresso = parseInt(anoSemestreIngressoStr.substring(4, 5));
        
        const currentYear = new Date().getFullYear();
        const currentSemester = new Date().getMonth() < 6 ? 1 : 2;

        const semestersInCourse = (currentYear - anoIngresso) * 2 + (currentSemester - semestreIngresso) + 1;

        const iaaStr = values[indices['IAA-indiceAproveitamentoAcumulado']];
        const iaa = iaaStr ? parseFloat(iaaStr) / 1000 : 0;

        return {
            nomeCurso: (values[indices.nomeCurso] || 'N/A').replace(/\[.*?\]/g, '').trim(),
            situacao: values[indices.Situacao] || 'N/A',
            sexo: values[indices.Sexo] || 'N/A',
            racaCor: values[indices.racaCor] || 'N/A',
            dataNascimento: dataNascimentoStr,
            age: age,
            naturalidade: naturalidade,
            unidadeFederativa: unidadeFederativa,
            cidadeNaturalidade: cidadeNaturalidade,
            formaIngresso: values[indices.formaIngresso] || 'N/A',
            iaa: isNaN(iaa) ? 0 : iaa,
            municipioSG: values[indices.MunicipioSG] || 'N/A',
            ufSG: values[indices.UFSG] || 'N/A',
            anoSemestreIngresso: parseInt(anoSemestreIngressoStr),
            semestersInCourse: semestersInCourse > 0 ? semestersInCourse : 1,
            anoIngresso: anoIngresso,
            semestreIngresso: semestreIngresso,
        };
    }).filter((student): student is Student => student !== null);
};


export default function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const data = parseAndTransformData(text);
      if(data.length === 0) {
        throw new Error("Nenhum dado válido encontrado no arquivo. Verifique o formato e o conteúdo.");
      }
      onDataLoaded(data);
      toast({
        title: "Sucesso!",
        description: `${data.length} registros de alunos foram carregados.`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
      toast({
        variant: "destructive",
        title: "Erro ao processar arquivo",
        description: errorMessage,
      })
      console.error(error);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  }, [onDataLoaded, toast]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg text-center shadow-lg animate-fade-in">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <FileUp className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="mt-4">Carregar arquivo CSV</CardTitle>
          <CardDescription>
            Selecione o arquivo com os dados sociodemográficos dos alunos. <br/>
            O arquivo deve usar ';' como separador de colunas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} disabled={isLoading} className="hidden"/>
            <label htmlFor="csv-file" className="w-full">
              <Button asChild className="w-full cursor-pointer">
                {isLoading ? (
                  <span>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </span>
                ) : (
                  <span>Selecionar Arquivo</span>
                )}
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">Tamanho máximo do arquivo: 10MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
