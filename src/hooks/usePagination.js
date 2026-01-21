import { useState, useEffect } from 'react';

/**
 * Custom hook for managing pagination state
 */
export const usePagination = (initialPage = 1, initialLimit = 20) => {
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        setTotalPages(Math.ceil(total / limit));
    }, [total, limit]);

    const goToPage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const nextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const reset = () => {
        setPage(1);
    };

    return {
        page,
        limit,
        total,
        totalPages,
        setPage,
        setLimit,
        setTotal,
        goToPage,
        nextPage,
        prevPage,
        reset,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};
