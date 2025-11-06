import React, {useState, useEffect} from "react";
import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import PageTitle from "../components/PageTitle";
import VotingControls from "../components/votes/VotingControls";
import PaginationControls from "../components/votes/PaginationControls";
import SearchInput from "../components/votes/SearchInput";
import VotingCard from "../components/votes/VotingCard";
import Button from "../components/Button";
import {formatDate, formatTime, getVotingStatusConfig} from '../components/votes/Formatters';
import {TbFilterEdit, TbSortDescending} from "react-icons/tb";
import {ToastContainer} from "react-toastify";
import {getAllVoting} from "../services/api/voting.js";


const VotesPage = () => {
    const [votings, setVotings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');

    const [activeTab, setActiveTab] = useState('active')


    const handleNextPage = () => {
        if (hasNext) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (hasPrev) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSearchChange = () => {
        setSearchQuery(inputValue);
        setCurrentPage(1);
    };

    // Функция для смены вкладки
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    useEffect(() => {
        const fetchVotings = async () => {
            try {
                const status = activeTab === 'archived' ? 'archived' : '';

                // Запрос на получение всех голосований
                const response = await getAllVoting(currentPage, searchQuery, status);
                console.log("Response Data:", response.data);
                const {items, pagination} = response.data;

                const formattedVotings = items.map((voting) => ({
                    ...voting,
                    registrationStart: {
                        date: formatDate(voting.registration_start),
                        time: formatTime(voting.registration_start),
                    },
                    registrationEnd: {
                        date: formatDate(voting.registration_end),
                        time: formatTime(voting.registration_end),
                    },
                    votingStart: {
                        date: formatDate(voting.voting_start),
                        time: formatTime(voting.voting_start),
                    },
                    votingEnd: {
                        date: formatDate(voting.voting_end),
                        time: formatTime(voting.voting_end),
                    },
                    status: getVotingStatusConfig(voting),
                    groupName: voting.departments?.[0]?.name || "Общая группа",
                    timezone: "(UTC+3) Россия - Москва",
                }));

                setVotings(formattedVotings);
                setTotalPages(pagination.total_count);
                setHasNext(pagination.has_next);
                setHasPrev(pagination.has_prev);
            } catch (e) {
                console.error("Ошибка при загрузке голосований:", e);
                setError(e.message || "Не удалось загрузить голосования.");
            } finally {
                setLoading(false);
            }
        };
        fetchVotings();
    }, [currentPage, searchQuery, activeTab]);

    return (
        <>
            <ToastContainer/>
            <div className="min-h-screen">
                <div className="mx-4 2xl:ml-[240px] mt-[60px] 2xl:mr-[240px] lg:ml-[40px] lg:mr-[40px]">
                    <Breadcrumbs title="Главная / Голосования"/>
                    <PageTitle title="Голосования"/>

                    <div className="flex mt-6 gap-4 flex-wrap">
                        <Button
                            className="outline outline-neutral-400 text-neutral-800 font-normal px-3 py-2 text-sm md:text-base md:px-4 md:py-2 flex items-center justify-center gap-2">
                            <TbFilterEdit size={32}/>
                            <span>Фильтры</span>
                        </Button>
                        <Button
                            className="outline outline-neutral-400 text-neutral-800 font-normal px-3 py-2 text-sm md:text-base md:px-4 md:py-2 flex items-center justify-center gap-2">
                            <TbSortDescending size={32}/>
                            <span>Сортировка</span>
                        </Button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        <div
                            className="flex flex-col md:flex-row md:justify-between bg-white shadow-lg items-center p-4 md:p-6 rounded-xl md:rounded-[20px] gap-4 lg:flex-nowrap">
                            <div className="flex gap-4 w-full justify-center md:w-auto md:justify-start">
                                <VotingControls activeTab={activeTab} onTabChange={handleTabChange}/>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    hasNext={hasNext}
                                    hasPrev={hasPrev}
                                    onNextPage={handleNextPage}
                                    onPrevPage={handlePrevPage}
                                />
                                <div className="w-full md:w-auto">
                                    <SearchInput
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onSearch={handleSearchChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {loading && <div className="text-center">Загрузка голосований...</div>}
                            {error && <div className="text-center text-red-500">Ошибка: {error}</div>}
                            {!loading && !error && votings.length === 0 &&
                                <div className="text-center text-neutral-600">Нет доступных голосований.</div>}
                            {!loading && !error && votings.map((voting) => (
                                <VotingCard key={voting.id} voting={voting}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VotesPage;