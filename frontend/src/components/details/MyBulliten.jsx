import {useState} from 'react'
import {formatRemainingTime} from "../votes/Formatters";
import {sendVote} from '../../services/api';
import {RadioGroup, Radio, FormControlLabel, Checkbox, FormGroup, Typography} from '@mui/material';
import {TbTimezone} from "react-icons/tb";


const MyBulliten = ({votingData, votingId}) => {

    const registrationStartDate = new Date(votingData.voting_full_info.registration_start);
    const registrationEndDate = new Date(votingData.voting_full_info.registration_end);
    const votingStartDate = new Date(votingData.voting_full_info.voting_start)
    const now = new Date();

    const timeUntilRegistrationEndObj = formatRemainingTime(registrationEndDate);
    const timeUntilVotingStartObj = formatRemainingTime(votingStartDate);

    const [selectedAnswers, setSelectedAnswers] = useState({});

    // Обработчик для кнопки "Проголосовать"
    const handleVote = async () => {
        const answers = Object.keys(selectedAnswers).map(questionId => {
            const questionData = votingData.voting_full_info.questions.find(q => q.id === Number(questionId));
            const selectedValue = selectedAnswers[questionId];

            if (!questionData) {
                return null;
            }

            if (questionData.type === 'single_choice') {
                return {
                    question_id: Number(questionId),
                    selected_option_id: Number(selectedValue),
                };
            } else if (questionData.type === 'multiple_choice') {
                return {
                    question_id: Number(questionId),
                    selected_option_ids: selectedValue.map(id => Number(id)),
                };
            }
            return null;
        }).filter(Boolean);

        const payload = {answers: answers};
        console.log("JSON для отправки:", JSON.stringify(payload, null, 2));

        // POST запрос для отправки ответов
        try {
            const response = await sendVote(votingId, payload)
            console.log(response.data.message)
        } catch (error) {
            console.log(error)
        }
    };

    // Обработчик изменения для Radio
    const handleRadioChange = (questionId, optionId) => {
        setSelectedAnswers(prevState => ({
            ...prevState,
            [questionId]: optionId,
        }));
        console.log("Radio changed:", questionId, optionId);
    };

    // Обработчик изменения для Checkbox
    const handleCheckboxChange = (questionId, optionId) => {
        setSelectedAnswers(prevState => {
            const currentAnswers = prevState[questionId] || [];
            const newAnswers = currentAnswers.includes(optionId)
                ? currentAnswers.filter(id => id !== optionId)
                : [...currentAnswers, optionId];
            console.log("Checkbox changed:", questionId, optionId);
            return {
                ...prevState,
                [questionId]: newAnswers,

            };

        });
    };

    // Расчеты для progressBar до конца регистрации
    let registrationProgress = 0;
    const totalRegistrationDuration = registrationEndDate.getTime() - registrationStartDate.getTime();
    const elapsedRegistrationTime = now.getTime() - registrationStartDate.getTime();

    if (totalRegistrationDuration > 0) {
        // Вычисляем процент и ограничиваем его 100%, чтобы он не превышал это значение
        registrationProgress = Math.min((elapsedRegistrationTime / totalRegistrationDuration) * 100, 100);
    } else {
        // Если длительность 0 или меньше (например, даты совпадают), считаем прогресс 100%
        registrationProgress = 100;
    }


    // Расчеты для progressBar до начала голосования
    let overallProgress = 0;
    const totalEventDuration = votingStartDate.getTime() - registrationStartDate.getTime();
    const elapsedEventTime = now.getTime() - registrationStartDate.getTime();

    if (totalEventDuration > 0) {
        // Вычисляем процент и ограничиваем его 100%
        overallProgress = Math.min((elapsedEventTime / totalEventDuration) * 100, 100);
    } else {
        // Если длительность 0 или меньше, считаем прогресс 100%
        overallProgress = 100;
    }


    return (
        <>
            <div className="flex flex-col gap-[10px]">
                <div className="flex flex-col gap-[10px]">
                    <div className="h-auto p-8 bg-white rounded-[20px] shadow-lg">
                        <div
                            className="text-neutral-800 text-xl font-bold mb-4">{votingData.voting_full_info.title}</div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div
                                className="text-stone-300 text-base font-normal">{votingData.voting_full_info.theme}</div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 relative overflow-hidden">
                                        <TbTimezone className='w-6 h-6'/>
                                    </div>
                                    <div className="text-neutral-800 text-base font-normal">(UTC+3) Россия - Москва
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {now < votingStartDate && (
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Таймер до начала регистрации */}
                            <div className="flex-1 h-auto p-8 bg-white rounded-[20px] shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div
                                        className="text-neutral-800 text-4xl sm:text-5xl font-bold">{timeUntilRegistrationEndObj.days} дня
                                    </div>
                                    <div
                                        className="text-stone-300 text-base font-normal">{timeUntilRegistrationEndObj.hours} часов, {timeUntilRegistrationEndObj.minutes} минут
                                        до окончания регистрации
                                    </div>
                                </div>
                                <div className="relative w-full h-24">
                                    <div className="absolute inset-0 h-full bg-amber-200 rounded-xl"
                                         style={{width: `${registrationProgress}%`}}></div>
                                    <div
                                        className="absolute inset-0 w-full h-full px-5 py-4 rounded-xl border border-stone-300"></div>
                                </div>
                            </div>
                            {/* Таймер до начала голосования */}
                            <div className="flex-1 h-auto p-8 bg-white rounded-[20px] shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div
                                        className="text-neutral-800 text-4xl sm:text-5xl font-bold">{timeUntilVotingStartObj.days} дней
                                    </div>
                                    <div
                                        className="text-stone-300 text-base font-normal">{timeUntilVotingStartObj.hours} часов, {timeUntilVotingStartObj.minutes} минут
                                        до начала голосования
                                    </div>
                                </div>
                                <div className="relative w-full h-24">
                                    <div className="absolute inset-0 h-full bg-sky-300 rounded-xl"
                                         style={{width: `${overallProgress}%`}}></div>
                                    <div
                                        className="absolute inset-0 w-full h-full px-5 py-4 rounded-xl border border-stone-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {votingData.voting_full_info.questions.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-[20px] shadow-lg p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="text-neutral-800 text-xl font-bold">{`№${index + 1}. ${question.title}`}</div>
                            </div>
                        </div>
                        <div className="text-stone-300 text-base font-normal mb-6">
                            {question.type === 'single_choice' && 'Необходимо выбрать один вариант ответа'}
                            {question.type === 'multiple_choice' && 'Необходимо выбрать несколько вариантов ответа'}
                        </div>

                        {/*TODO: создать компонент с кастомными radio и checkbox*/}
                        <div className="space-y-4 mb-8">
                            {question.type === 'single_choice' ? (
                                <RadioGroup
                                    name={`question-${question.id}`}
                                    value={selectedAnswers[question.id] || ''}
                                    onChange={(e) => handleRadioChange(question.id, e.target.value)}
                                >
                                    {question.options.map((option) => (
                                        <FormControlLabel
                                            key={option.id}
                                            value={option.id}
                                            control={<Radio/>}
                                            label={<Typography
                                                className="text-neutral-800 text-xl">{option.option}</Typography>}
                                        />
                                    ))}
                                </RadioGroup>
                            ) : (
                                <FormGroup>
                                    {question.options.map((option) => (
                                        <FormControlLabel
                                            key={option.id}
                                            control={
                                                <Checkbox
                                                    checked={selectedAnswers[question.id]?.includes(option.id) || false}
                                                    onChange={() => handleCheckboxChange(question.id, option.id)}
                                                />
                                            }
                                            label={<Typography
                                                className="text-neutral-800 text-xl">{option.option}</Typography>}
                                        />
                                    ))}
                                </FormGroup>
                            )}
                        </div>
                    </div>
                ))}

                <div className="bg-white rounded-[20px] shadow-lg p-8">
                    <button
                        onClick={handleVote}
                        className='w-full py-3 px-3 bg-[#5BC25B] rounded-lg text-lg font-normal text-white flex gap-3 justify-center items-center hover:brightness-90 transition-all cursor-pointer active:scale-98 whitespace-nowrap'
                    >
                        Проголосовать
                    </button>

                </div>
            </div>
        </>
    )
}

export default MyBulliten;