import {useState, useEffect} from 'react';
import {getDepartments} from '../services/api';

export const useDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [hasMoreDepartments, setHasMoreDepartments] = useState(true);
    const [page, setPage] = useState(1);

    const handleDepartmentChange = (id) => {
        setSelectedDepartmentIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const fetchDepartments = async (pageNum = 1, reset = false) => {
        if (isLoadingDepartments && !reset) return;
        setIsLoadingDepartments(true);
        try {
            const data = await getDepartments(pageNum);
            setHasMoreDepartments(data.pagination.has_next);

            const all = reset ? data.items : [...departments, ...data.items];
            const unique = Array.from(new Map(all.map(d => [d.id, d])).values());
            setDepartments(unique);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingDepartments(false);
        }
    };

    const handleLoadMore = () => {
        if (hasMoreDepartments && !isLoadingDepartments) {
            const next = page + 1;
            setPage(next);
            fetchDepartments(next);
        }
    };

    useEffect(() => {
        fetchDepartments(1, true);
    }, []);

    return {
        departments,
        selectedDepartmentIds,
        handleDepartmentChange,
        isLoadingDepartments,
        hasMoreDepartments,
        handleLoadMore,
    };
};
