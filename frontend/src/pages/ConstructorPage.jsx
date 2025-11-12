import {useState} from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import PageTitle from "../components/PageTitle";
import Sidebar from '../components/constructor/Sidebar';
import Constructor from '../components/constructor/CreateVoting';
import Templates from "../components/constructor/Templates";
import {CiSquarePlus, CiViewList} from "react-icons/ci";


const ConstructorPage = () => {
    const [activeContent, setActiveContent] = useState("create-poll");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleMenuItemClick = (itemKey) => {
        setActiveContent(itemKey);
        setMobileMenuOpen(false);
    };

    const menuItems = [
        {
            key: 'create-poll',
            label: 'Добавить голосование',
            icon: (isActive) => <CiSquarePlus size={24} strokeWidth={isActive ? 1 : 0.5}
                                              color={isActive ? '#4385E9' : "#6B7280"}/>
        },
        {
            key: 'poll-templates',
            label: 'Шаблоны голосований',
            icon: (isActive) => <CiViewList size={24} strokeWidth={isActive ? 1 : 0.5}
                                            color={isActive ? '#4385E9' : "#6B7280"}/>
        },
    ];

    const renderContent = () => {
        switch (activeContent) {
            case "create-poll":
                return <Constructor selectedTemplate={selectedTemplate} />;
            case "poll-templates":
                return <Templates setActiveContent={setActiveContent}
                                  setSelectedTemplate={setSelectedTemplate} />;
            default:
                return <Constructor/>;
        }
    };

    return (
        <>
            <div className="min-h-screen">
                {/* Контейнер с адаптивными отступами: гибкие на моб. и фиксированные на 2xl */}
                <div className="2xl:mx-[240px] mt-[60px]">

                    <Breadcrumbs title="Администратор / Конструктор голосований / Добавить голосование"/>

                    <div className="flex items-center justify-between">
                        <PageTitle title="Конструктор голосований"/>

                        {/* Кнопка меню только на экранах меньше 2xl */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="2xl:hidden flex items-center gap-2 p-2 bg-white rounded-md hover:bg-gray-200 transition-colors z-20"
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
        </>
    );
};

export default ConstructorPage;