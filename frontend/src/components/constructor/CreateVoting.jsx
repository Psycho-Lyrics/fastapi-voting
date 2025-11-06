import React, {useState, useEffect} from 'react';
import StepHeader from '/src/components/constructor/CreateVoting/StepHeader';
import InputField from '/src/components/constructor/CreateVoting/InputField';
import DateTimePicker from '/src/components/constructor/CreateVoting/DateTimePicker';
import QuestionForm from '/src/components/constructor/CreateVoting/QuestionForm';
import AddQuestionButton from '/src/components/constructor/CreateVoting/AddQuestionButton';
import {getDepartments, saveTemplate} from '../../services/api'
import {toast, ToastContainer} from 'react-toastify';
import {CiViewList} from "react-icons/ci";
import {MdOutlineRocketLaunch} from "react-icons/md";
import {useDepartments} from "../../hooks/useDepartments.js";
import {createVoting} from "../../services/api/voting.js";


const CreateVoting = ({selectedTemplate}) => {
    const today = new Date().toISOString().split("T")[0]; // текущая дата

    const [votingTitle, setVotingTitle] = useState('');
    const [registrationStart, setRegistrationStart] = useState({date: today, time: '10:00'});
    const [registrationEnd, setRegistrationEnd] = useState({date: today, time: '10:00'});
    const [votingStart, setVotingStart] = useState({date: today, time: '10:00'});
    const [votingEnd, setVotingEnd] = useState({date: today, time: '10:00'});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Управление открытием/закрытием выпадающего списка для департаментов

    // Департаменты
    const {
        departments,
        selectedDepartmentIds,
        handleDepartmentChange,
        isLoadingDepartments,
        hasMoreDepartments,
        handleLoadMore
    } = useDepartments();

    // Загружаем данные из выбранного шаблона
    useEffect(() => {
        if (selectedTemplate) {
            // Устанавливаем заголовок и условие кворума из шаблона
            setVotingTitle(selectedTemplate.title || "");
            setQuorumCondition(selectedTemplate.quorum || "");

            // Нормализуем вопросы из шаблона:
            // добавляем уникальный id
            // приводим title => header (для совместимости с QuestionForm)
            // options: вытаскиваем строку из объекта { option: "..." }
            const normalized = (selectedTemplate.questions || []).map((q, idx) => ({
                id: idx + 1,
                type: q.type || 'single_choice',
                header: q.title || '',
                options: (q.options || []).map(opt =>
                    typeof opt === 'object' && opt !== null ? opt.option : opt
                )
            }));

            setQuestions(normalized);
            console.log(selectedTemplate);
        }
    }, [selectedTemplate]);

    const [questions, setQuestions] = useState([
        {
            id: 1,
            type: '',
            header: '',
            options: ['', '']
        }
    ]);

    const [quorumCondition, setQuorumCondition] = useState('');

    // --- Обработчики изменений ---
    const handleChange = (setter) => (e) => {
        setter(e.target.value);
    };

    // Универсальный обработчик для полей date/time
    const handleDateTimeChange = (setter, key) => (value) => {
        setter(prev => ({ ...prev, [key]: value }));
    };

    const removeQuestion = (id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const addNewQuestion = () => {
        const newId = Math.max(0, ...questions.map(q => q.id)) + 1;
        setQuestions(prev => [
            ...prev,
            {id: newId, type: '', header: '', options: ['']}
        ]);
    };

    // Функция для объединения даты и времени в ISO-формат
    const combineDateTime = (date, time) => {

        const dateTimeString = `${date}T${time}:00.000Z`;

        const utcDate = new Date(dateTimeString);

        const year = utcDate.getUTCFullYear();
        const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = utcDate.getUTCDate().toString().padStart(2, '0');
        const hours = utcDate.getUTCHours().toString().padStart(2, '0');
        const minutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
        const seconds = utcDate.getUTCSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const data = {
        title: votingTitle || 'Без названия',
        theme: 'string',
        public: true,
        quorum: quorumCondition === '50_plus_1' ? 50 : quorumCondition === 'two_thirds' ? 66 : 0,
        registration_start: combineDateTime(registrationStart.date, registrationStart.time),
        registration_end: combineDateTime(registrationEnd.date, registrationEnd.time),
        voting_start: combineDateTime(votingStart.date, votingStart.time),
        voting_end: combineDateTime(votingEnd.date, votingEnd.time),
        // questions: questions.map(q => ({
        //     type: q.type || 'single_choice',
        //     title: q.header || 'Без названия',
        //     options: (q.options || [])
        //         .filter(opt => opt.trim() !== '')
        //         .map(opt => ({ option: opt.trim() }))
        // })),
        // department_ids: selectedDepartmentIds // Используем выбранные ID департаментов
    };


    const renderDepartments = (depts, level = 0) => {
        return depts.map(dept => (
            <div key={dept.id}>
                <div
                    className="p-3 hover:bg-gray-100 flex items-center"
                    style={{ paddingLeft: `${level * 16}px` }} // отступ для вложенности
                >
                    <input
                        type="checkbox"
                        id={`dept-${dept.id}`}
                        checked={selectedDepartmentIds.includes(dept.id)}
                        onChange={() => handleDepartmentChange(dept.id)}
                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`dept-${dept.id}`} className="cursor-pointer flex-1">
                        {dept.name}
                    </label>
                </div>

                {/* Рекурсивный вызов для поддепартаментов */}
                {dept.children && dept.children.length > 0 && (
                    <div>
                        {renderDepartments(dept.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    };


    // Создание голосования
    const sendToServer = async () => {
        await createVoting(data);
        toast.success("Голосование успешно создано");
    };

    // Отправка шаблона
    const sendTemplateToServer = async () => {
        await saveTemplate(data)
        toast.success('Шаблон сохранен');
    };


    return (
        <>

            <div className="bg-white p-6 rounded-[20px] shadow-lg ">
                <StepHeader stepNumber={1} title="Настройки"/>

                <InputField
                    label="Название голосования"
                    value={votingTitle}
                    onChange={handleChange(setVotingTitle)}
                    placeholder="Введите название"
                />

                {/* Условие кворума */}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Условие кворума
                </label>
                <select
                    value={quorumCondition}
                    onChange={handleChange(setQuorumCondition)}
                    className="my-1 p-2 py-[20px] border border-gray-300 rounded-[12px] w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="" disabled>Выберите условие...</option>
                    <option value="50_plus_1">50% + 1</option>
                    <option value="two_thirds">2/3 голосов</option>
                    <option value="unanimous">Единогласно</option>
                </select>

                {/*TODO: Добавить выбор открытое/закрытое голосование*/}
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                    Группа пользователей
                </label>
                <div className="relative">
                    {/* Кастомный селект/выпадающий список */}
                    <div
                        className="mt-1 mb-1 p-4 border border-gray-300 rounded-[12px] text-gray-500 w-full bg-white focus:outline-none focus:ring-2 focus:ring-grey-500 cursor-pointer flex justify-between items-center"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Переключение открытия
                    >
                        <span>
                            {Array.isArray(selectedDepartmentIds) && selectedDepartmentIds.length > 0
                                ? `${selectedDepartmentIds.length} выбрано`
                                : 'Выберите группы...'}
                        </span>
                        <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>

                    {/* Выпадающий список */}
                    {isDropdownOpen && (
                        <div
                            className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {/* Список департаментов */}
                            {departments.length > 0 ? (
                                renderDepartments(departments)
                            ) : (
                                <div className="p-3 text-gray-500">Нет доступных групп.</div>
                            )}

                            {/* Индикатор загрузки */}
                            {isLoadingDepartments && (
                                <div className="p-3 text-center text-gray-500">Загрузка...</div>
                            )}

                            {/* Кнопка "Загрузить еще" */}
                            {hasMoreDepartments && !isLoadingDepartments && (
                                <button
                                    onClick={handleLoadMore}
                                    className="w-full p-3 text-center text-blue-500 hover:bg-gray-50 border-t border-gray-200"
                                    disabled={isLoadingDepartments}
                                >
                                    Загрузить еще
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Даты и время */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
                    <DateTimePicker
                        label="Начало регистрации"
                        initialDate={registrationStart.date}
                        initialTime={registrationStart.time}
                        onDateChange={handleDateTimeChange(setRegistrationStart, 'date')}
                        onTimeChange={handleDateTimeChange(setRegistrationStart, 'time')}
                    />
                    <DateTimePicker
                        label="Окончание регистрации"
                        initialDate={registrationEnd.date}
                        initialTime={registrationEnd.time}
                        onDateChange={handleDateTimeChange(setRegistrationEnd, 'date')}
                        onTimeChange={handleDateTimeChange(setRegistrationEnd, 'time')}
                    />
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-4 mt-2">
                    <DateTimePicker
                        label="Начало голосования"
                        initialDate={votingStart.date}
                        initialTime={votingStart.time}
                        onDateChange={handleDateTimeChange(setVotingStart, 'date')}
                        onTimeChange={handleDateTimeChange(setVotingStart, 'time')}
                    />
                    <DateTimePicker
                        label="Окончание голосования"
                        initialDate={votingEnd.date}
                        initialTime={votingEnd.time}
                        onDateChange={handleDateTimeChange(setVotingEnd, 'date')}
                        onTimeChange={handleDateTimeChange(setVotingEnd, 'time')}
                    />
                </div>

                <div className='mt-6'></div>
                <StepHeader stepNumber={2} title="Вопросы"/>

                {questions.map((question) => (
                    <QuestionForm
                        key={question.id}
                        question={question}
                        onChange={(updated) => {
                            setQuestions(prev =>
                                prev.map(q => q.id === question.id ? updated : q)
                            );
                        }}
                        onRemove={() => removeQuestion(question.id)}
                    />
                ))}

                <AddQuestionButton onClick={addNewQuestion}/>

                {/* Кнопки управления */}
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                        onClick={sendToServer}
                        className="w-full sm:w-auto bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base"
                    >
                        <MdOutlineRocketLaunch size={24}/>
                        <span>Запустить голосование</span>
                    </button>

                    <button
                        onClick={sendTemplateToServer}
                        className="w-full sm:w-auto border border-blue-500 text-blue-500 px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center sm:justify-start space-x-2 hover:bg-blue-50 transition text-sm sm:text-base"
                    >
                        <CiViewList size={24}/>
                        <span>Сохранить шаблон</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default CreateVoting;