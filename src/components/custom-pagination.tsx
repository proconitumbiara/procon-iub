// components/custom-pagination.tsx
"use client";

import {
    Pagination as ShadPagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
    total: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function CustomPagination({ total, currentPage, onPageChange }: CustomPaginationProps) {
    if (total <= 1) return null;

    const pages = Array.from({ length: total }, (_, i) => i + 1);

    return (
        <ShadPagination>
            <PaginationContent>
                {/* Botão anterior */}
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
                    </PaginationItem>
                )}

                {/* Links das páginas */}
                {pages.map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {/* Botão próximo */}
                {currentPage < total && (
                    <PaginationItem>
                        <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </ShadPagination>
    );
}
