// components/custom-pagination.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Pagination as ShadPagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
    total: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function CustomPagination({ total, currentPage, onPageChange }: CustomPaginationProps) {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (total <= 1) return null;

    // Função para gerar array de páginas com ellipsis
    const generatePageNumbers = () => {
        // Para telas pequenas, mostrar menos páginas
        const delta = isSmallScreen ? 1 : 2; // Menos páginas em telas pequenas
        const range = [];
        const rangeWithDots = [];

        // Sempre mostrar primeira página
        range.push(1);

        // Calcular páginas ao redor da página atual
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(total - 1, currentPage + delta); i++) {
            range.push(i);
        }

        // Sempre mostrar última página se houver mais de 1
        if (total > 1) {
            range.push(total);
        }

        // Remover duplicatas e ordenar
        const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

        // Adicionar ellipsis onde necessário
        let prev = 0;
        for (const page of uniqueRange) {
            if (page - prev === 2) {
                rangeWithDots.push(prev + 1);
            } else if (page - prev !== 1) {
                rangeWithDots.push('ellipsis');
            }
            rangeWithDots.push(page);
            prev = page;
        }

        return rangeWithDots;
    };

    const pageNumbers = generatePageNumbers();

    return (
        <div className="w-full overflow-hidden">
            <ShadPagination>
                <PaginationContent className="mt-4 flex-wrap justify-center gap-1 max-w-full">
                    {/* Botão anterior */}
                    {currentPage > 1 && (
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => onPageChange(currentPage - 1)}
                                className="text-xs sm:text-sm"
                            />
                        </PaginationItem>
                    )}

                    {/* Links das páginas */}
                    {pageNumbers.map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis className="text-xs sm:text-sm" />
                            ) : (
                                <PaginationLink
                                    isActive={page === currentPage}
                                    onClick={() => onPageChange(page as number)}
                                    className="text-xs sm:text-sm min-w-[32px] h-8"
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    {/* Botão próximo */}
                    {currentPage < total && (
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => onPageChange(currentPage + 1)}
                                className="text-xs sm:text-sm"
                            />
                        </PaginationItem>
                    )}
                </PaginationContent>
            </ShadPagination>
        </div>
    );
}
