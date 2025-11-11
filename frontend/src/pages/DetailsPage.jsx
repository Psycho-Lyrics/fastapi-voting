import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import PageTitle from '../components/PageTitle.jsx';
import GeneralInfo from '../components/details/GeneralInfo.jsx';
import VotingStatistic from '../components/details/Stats.jsx';
import Voters from '../components/details/Voters.jsx';
import {ResultsForAdmin, BeforeResults} from '../components/details/Results.jsx';
import Sidebar from '../components/constructor/Sidebar.jsx';
import {
    getVotingData,
    getVotingParticipants,
    getVotingStats,
    registerUserForVoting,
} from '../services/api.js';
import {formatDate, formatTime, getVotingStatusConfigDetails} from '../components/votes/Formatters.jsx';
import MyBulliten from '../components/details/MyBulliten.jsx';
import {CiCircleInfo} from "react-icons/ci";
import {IoMdStats} from "react-icons/io"; //stats
import {GoPeople, GoChecklist} from "react-icons/go"; // icon-voters
import { LiaClipboardListSolid } from "react-icons/lia"; // icon-results


const prepareVotingDataForComponent = (rawData) => {
    if (!rawData) return null;

    return {
        // Копируем все исходные поля
        ...rawData,
        // Создаем новые поля с отформатированными данными
        registration: {
            startDate: formatDate(rawData.voting_full_info.registration_start),
            startTime: formatTime(rawData.voting_full_info.registration_start),
            endDate: formatDate(rawData.voting_full_info.registration_end),
            endTime: formatTime(rawData.voting_full_info.registration_end),
        },
        voting: {
            startDate: formatDate(rawData.voting_full_info.voting_start),
            startTime: formatTime(rawData.voting_full_info.voting_start),
            endDate: formatDate(rawData.voting_full_info.voting_end),
            endTime: formatTime(rawData.voting_full_info.voting_end),
        },
    };
};

const Details = () => {
    const {votingId} = useParams();
    const [votingData, setVotingData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Инициализируем mobileMenuOpen, чтобы избежать ошибок
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeContent, setActiveContent] = useState("general-info");
    const [votingStats, setVotingStats] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);

    // для role_id и user_id
    const [user_id, setUserId] = useState(null);
    const [role_id, setRoleId] = useState(null);

    // запрос на получение role_id и user_id
    useEffect(() => {
        const fetchUser = async () => {

            setUserId(20);
            setRoleId(3);
        };
        fetchUser();
    }, []);


    // Функция, которая будет вызываться при клике на пункт сайдбара
    const handleMenuItemClick = (itemKey) => {
        setActiveContent(itemKey);
        // Закрываем меню на мобильном устройстве при выборе пункта
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };

    const handleRegistration = async () => {
        try {
            await registerUserForVoting(votingId);
            setIsRegistered(true);
            setActiveContent('my-bulletin');
        } catch (error) {
            console.log(error)
        }
    };

    const handleNavigateToMyBulliten = () => {
        setActiveContent('my-bulletin');
    };

    const handleNavigateToResults = () => {
        setActiveContent('results');
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {

                // Запросы на общие данные, статистику и голосующих, что бы сравнить с создателем
                const [rawData, statsData, votersData] = await Promise.all([
                    getVotingData(votingId),
                    getVotingStats(votingId),
                    getVotingParticipants(votingId)
                ]);

                // Преобразуем данные в нужный формат и сохраняем в состояние
                const formattedData = prepareVotingDataForComponent(rawData);

                const isUserRegistered = votersData.participants.some(voter => voter.id === user_id);


                setIsRegistered(isUserRegistered);
                setVotingData(formattedData);
                setVotingStats(statsData);
            } catch (e) {
                console.error("Ошибка при получении данных:", e);
                // Можно добавить тост, чтобы показать ошибку пользователю
            } finally {
                setLoading(false);
            }
        };

        if (votingId) {
            fetchData();
        }
    }, [votingId, user_id, role_id]); // Зависимости: запрос повторится при смене ID, токена, или данных пользователя.

    if (loading) {
        return <div className="text-center py-10">Загрузка...</div>;
    }

    if (!votingData) {
        return <div className="text-center py-10">Данные о голосовании не найдены.</div>;
    }


    // Определяем пункты меню на основе userRole и isRegistered
    const getMenuItems = () => {
        const baseItems = [
            {
                key: 'general-info',
                label: 'Общая информация',
                icon: (isActive) => <CiCircleInfo
                    size={24}
                    color={isActive ? '#437DE9' : '#4B5563'}
                    strokeWidth={isActive ? 1 : 0.5}
                />
            },
        ];


        if (role_id === 3 || votingData.voting_full_info.creator.id === user_id) {
            baseItems.push(
                {
                    key: 'stats',
                    label: 'Статистика голосования',
                    icon: (isActive) => <IoMdStats
                        size={24}
                        color={isActive ? '#437DE9' : '#4B5563'}
                        strokeWidth={isActive ? 0.5 : 0}
                    />
                },
                {
                    key: 'voters',
                    label: 'Голосующие',
                    icon: (isActive) => <GoPeople
                        size={24}
                        color={isActive ? '#437DE9' : '#4B5563'}
                        strokeWidth={isActive ? 0.5 : 0}
                    />
                }
            );
        }


        if (isRegistered || role_id === 3) {
            baseItems.push({
                key: 'my-bulletin',
                label: 'Мой бюллетень',
                icon: (isActive) => <GoChecklist
                    size={24}
                    color={isActive ? '#437DE9' : '#4B5563'}
                    strokeWidth={isActive ? 0.5 : 0}
                />
            });
        }


        if (isRegistered || votingData.voting_full_info.creator.id === user_id || role_id === 3) {
            baseItems.push({
                key: 'results',
                label: 'Результаты',
                icon: (isActive) => <LiaClipboardListSolid
                    size={24}
                    color={isActive ? '#437DE9' : '#4B5563'}
                    strokeWidth={isActive ? 0.5 : 0}
                />
            });
        }
        return baseItems;
    };

    const menuItems = getMenuItems();
    const status = getVotingStatusConfigDetails(votingData);

    const renderContent = () => {
        switch (activeContent) {
            case "general-info":
                return <GeneralInfo votingData={votingData}
                                    isRegistered={isRegistered}
                                    onRegister={handleRegistration}
                                    onNavigateToMyBulliten={handleNavigateToMyBulliten}
                                    onNavigateToResults={handleNavigateToResults}
                                    user_id = {user_id}
                                    role_id = {role_id}/>;
            case "stats":
                return <VotingStatistic votingData={votingData} votingStats={votingStats}
                                        quorum={votingData.voting_full_info.quorum}/>;
            case "voters":
                return <Voters votingId={votingId}/>;
            case "results":
                return status.text === 'Голосование завершено' ? <ResultsForAdmin votingId={votingId}/> :
                    <BeforeResults/>;
            case "my-bulletin":
                return <MyBulliten votingData={votingData} votingId={votingId}/>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen">
            <div className="2xl:mx-[240px] mt-[60px]">
                <Breadcrumbs title='Администратор / Детали голосования / Общая информация'/>
                <div className="flex items-center justify-between">
                    <PageTitle title="Детали голосования"/>
                    {/* Кнопка меню только на экранах меньше 2xl */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="2xl:hidden mt-[20px] flex items-center gap-2 p-2 bg-white rounded-md hover:bg-gray-200 transition-colors z-20"
                    >
                        <span>Меню</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 6h16M4 12h16M4 18h16"/>
                            )}
                        </svg>
                    </button>
                </div>

                <main className="flex flex-col 2xl:flex-row mt-6 gap-6 relative">
                    {/* Мобильный оверлей */}
                    {mobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-opacity-50 z-10 2xl:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        ></div>
                    )}

                    {/* Сайдбар - адаптивная позиция и видимость */}
                    <div className={`${mobileMenuOpen ? 'top-0 left-0 h-full w-full block' : 'hidden'} 
                        2xl:block 2xl:relative 2xl:w-64 z-20 transition-transform transform
                        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 2xl:translate-x-0`}>
                        <Sidebar
                            menuItems={menuItems}
                            activeItem={activeContent}
                            onMenuItemClick={handleMenuItemClick}
                        />
                    </div>

                    {/* Основное содержимое */}
                    <div className="flex-1 w-full 2xl:ml-31">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Details;