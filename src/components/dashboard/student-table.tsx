"use client"

import { useState, useMemo } from "react"
import type { Student } from "@/types/student"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface StudentTableProps {
  students: Student[]
}

const ROWS_PER_PAGE = 10

export function StudentTable({ students }: StudentTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(students.length / ROWS_PER_PAGE)

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE
    return students.slice(startIndex, startIndex + ROWS_PER_PAGE)
  }, [students, currentPage])

  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, pageNumber)))
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
            <CardTitle>Lista de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Curso</TableHead>
                            <TableHead>Situação</TableHead>
                            <TableHead>Sexo</TableHead>
                            <TableHead>Idade</TableHead>
                            <TableHead>Ano Ingresso</TableHead>
                            <TableHead className="text-right">IAA</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedStudents.length > 0 ? (
                            paginatedStudents.map((student, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium max-w-xs truncate">{student.nomeCurso}</TableCell>
                                    <TableCell>{student.situacao}</TableCell>
                                    <TableCell>{student.sexo}</TableCell>
                                    <TableCell>{student.age}</TableCell>
                                    <TableCell>{student.anoIngresso}</TableCell>
                                    <TableCell className="text-right">{student.iaa.toFixed(3)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhum aluno encontrado com os filtros selecionados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={() => goToPage(1)} disabled={currentPage === 1}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                           <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  )
}
