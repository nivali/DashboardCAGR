"use client";

import { useState } from 'react';
import type { Student } from '@/types/student';
import FileUploader from '@/components/dashboard/file-uploader';
import Dashboard from '@/components/dashboard/dashboard';
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);

  const handleDataLoaded = (data: Student[]) => {
    setStudents(data);
  };

  const handleReset = () => {
    setStudents([]);
  };

  return (
    <>
      <main className="bg-background min-h-screen">
        <div className="container mx-auto py-10 px-4">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">AlunoVis</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Análise interativa de dados sociodemográficos de estudantes
            </p>
          </header>

          {students.length === 0 ? (
            <FileUploader onDataLoaded={handleDataLoaded} />
          ) : (
            <Dashboard students={students} onReset={handleReset} />
          )}
        </div>
      </main>
      <Toaster />
    </>
  );
}
