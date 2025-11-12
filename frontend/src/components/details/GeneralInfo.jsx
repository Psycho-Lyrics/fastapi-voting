import {getVotingStatusConfigDetails} from '../votes/Formatters';
import {Button} from '@material-tailwind/react'
import {TbTimezone, TbLock, TbFileZip} from "react-icons/tb";
import {LuCalendar1, LuAlarmClock} from "react-icons/lu";
import {sendToArchive, unArchive, getLinkToVoting, getQRcode} from "../../services/api.js";
import React, {useState} from "react";
import {CopyToClipboard} from "react-copy-to-clipboard-ts";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography
} from "@mui/material";
import {useSearchParams} from "react-router-dom";

const GeneralInfo = ({
                         votingData,
                         isRegistered,
                         onRegister,
                         onNavigateToMyBulliten,
                         onNavigateToResults,
                         user_id,
                         role_id,
                     }) => {
    const [isArchived, setIsArchived] = useState(votingData.voting_full_info.archived);
    const [open, setOpen] = useState(false);
    const [linkToVoting, setLinkToVoting] = useState('');
    const [qrCode, setQRcode] = useState('');

    const [searchParams] = useSearchParams();
    const statusSearch = searchParams.get('status');
    if (statusSearch === 'success') {
        console.log('Вы успешно зарегистрировались на голосование')
    }

    const status = getVotingStatusConfigDetails(votingData);

    // qrcode
    const imageUrl = `data:image/png;base64,${qrCode.message}`;

    console.log(qrCode)

    // Определяем текст и обработчик для кнопки
    let buttonText = '';
    let onButtonClick = () => {
    };
    let isButtonDisabled = false;

    if (status.text === 'Голосование на этапе регистрации') {
        buttonText = 'Зарегистрироваться';
        onButtonClick = onRegister;
        isButtonDisabled = isRegistered;
    } else if (status.text === 'Голосование активно') {
        buttonText = 'Проголосовать';
        onButtonClick = onNavigateToMyBulliten;
        isButtonDisabled = !isRegistered;
    } else if (status.text === 'Голосование завершено') {
        buttonText = 'Результаты';
        onButtonClick = onNavigateToResults;
        isButtonDisabled = !isRegistered;
    } else if (status.text === 'Ожидает начала') {
        buttonText = 'Зарегистрироваться';
        onButtonClick = onNavigateToResults;
        isButtonDisabled = !isRegistered;
    }


    // Архивация голосования
    const handleSendToArchive = async () => {
        if (!isArchived) {
            await sendToArchive(votingData.voting_full_info.id)
            console.log('Голосование успешно заархивировано')
            setIsArchived(true)
        } else {
            await unArchive(votingData.voting_full_info.id)
            console.log('Голосование успешно разархивировано')
            setIsArchived(false)
        }
    }

    const handleOpenModal = async () => {
        const linkToVoting = await getLinkToVoting(votingData.voting_full_info.id)
        const qrCodeToVoting = await getQRcode(votingData.voting_full_info.id)
        setQRcode(qrCodeToVoting);
        setLinkToVoting(linkToVoting.registration_link);
        setOpen(true)
    }

    if (!votingData) {
        return <div>Данные о голосовании не найдены.</div>;
    }

    return (
        <>
            <main
                className="p-4 sm:p-6 bg-white rounded-[20px] w-full shadow-lg"> {/* Уменьшаем padding на маленьких экранах */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Левая колонка */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-start gap-2.5">
                            <div
                                className="text-neutral-800 text-xl font-bold">{votingData.voting_full_info.title}</div>
                            <div className="flex items-center justify-between w-full flex-wrap gap-2">
                                <div
                                    className="text-stone-300 text-base font-normal">{votingData.voting_full_info.theme}</div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <TbTimezone className='w-6 h-6'/>
                                        <div className="text-neutral-800 text-base font-normal">(UTC+3) Россия - Москва
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-2.5">
                            <div className={`flex items-center gap-2.5 p-2.5 ${status.bg} rounded-lg w-full`}>
                                {status.icon}
                                <div className={`${status.textColor} text-base font-medium`}>{status.text}</div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 bg-zinc-100 rounded-lg">
                                {votingData.voting_full_info.public ?
                                    <TbFileZip size={24} className="text-neutral-800"/> :
                                    <TbLock size={24} className="text-neutral-800"/>
                                }
                                <div
                                    className="text-neutral-800 text-base font-medium">{votingData.voting_full_info.public ? 'Публичное' : 'Тайное'}</div>
                            </div>
                        </div>

                        {/*Кнопка для архивации*/}
                        {(role_id === 3 || user_id === votingData.voting_full_info.creator.id) &&
                            <Button
                                className='bg-[#437DE9] text-base px-5 lg:mt-auto py-4 w-full rounded-lg flex justify-center items-center gap-2.5'
                                onClick={handleSendToArchive}
                            >
                                {isArchived ? 'Разархивировать' : 'Заархивировать'}
                            </Button>}

                        {/*Кнопка проголосовать/зарегестрироваться/результаты*/}
                        <Button
                            className={`bg-[#437DE9] text-base px-5 py-4 w-full rounded-lg flex justify-center ${(role_id === 1 || role_id === 2) ? 'mt-32.5' : ''} items-center gap-2.5`}
                            onClick={onButtonClick}
                            disabled={isButtonDisabled}
                        >
                            {buttonText}
                        </Button>

                    </div>

                    {/* Правая колонка */}
                    <div className="flex flex-col gap-6">
                        {/* Flexbox-контейнер для дат, чтобы они переносились на новую строку */}
                        <div className="flex flex-wrap gap-4">
                            <div
                                className="flex-1 min-w-[45%] px-4 py-2.5 bg-green-50 rounded-lg flex flex-col items-start gap-2.5">
                                <div className="text-stone-300 text-base font-normal">Начало регистрации</div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <LuCalendar1 size={24} className="text-neutral-800"/>
                                        <div
                                            className="text-neutral-800 text-base font-normal">{votingData.registration.startDate}</div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <LuAlarmClock size={24} className="text-neutral-800"/>
                                        <div
                                            className="text-neutral-800 text-base font-normal">{votingData.registration.startTime}</div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="flex-1 min-w-[45%] px-4 py-2.5 bg-pink-50 rounded-lg flex flex-col items-start gap-2.5">
                                <div className="text-stone-300 text-base font-normal">Окончание регистр.</div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <LuCalendar1 size={24} className="text-neutral-800"/>
                                        <div
                                            className="text-neutral-800 text-base font-normal">{votingData.registration.endDate}</div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <LuAlarmClock size={24} className="text-neutral-800"/>
                                        <div
                                            className="text-neutral-800 text-base font-normal">{votingData.registration.endTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div
                                className="w-full px-4 py-2.5 bg-green-50 rounded-lg flex flex-col items-start gap-2.5">
                                <div className="text-stone-300 text-base font-normal">Начало голосования</div>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2.5">
                                        <LuCalendar1 size={24} className="text-neutral-800"/>
                                        <div
                                            className="text-neutral-800 text-base font-normal">{votingData.voting.startDate}</div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <LuAlarmClock size={24} className="text-neutral-800"/>
                                        <div
                                            className="text-neutral-800 text-base font-normal">{votingData.voting.startTime}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full px-4 py-2.5 bg-pink-50 rounded-lg flex flex-col items-start gap-2.5">
                                <div className="text-stone-300 text-base font-normal">Окончание голосования</div>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2.5">
                                        <LuCalendar1 size={24} className="text-neutral-800"/>
                                        <div
                                            className="text-neutral-800 text-base font-normal">{votingData.voting.endDate}</div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <LuAlarmClock size={24} className="text-neutral-800"/>
                                        <div
                                            className="text-neutral-800 text-base font-normal">{votingData.voting.endTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*<div className="items-center justify-center">*/}
                        {/*    <CopyToClipboard text={linkToVoting} onCopy={() => alert("Скопировано!")}>*/}
                        <button className='px-5 py-4 bg-gray-200 rounded-[10px] flex justify-center items-center'
                                onClick={handleOpenModal}>Поделиться
                        </button>
                        {/*</CopyToClipboard>*/}
                        {/*</div>*/}

                        {/*Модальное окно для ссылки и qrcode*/}
                        <Dialog open={open} onClose={() => setOpen(false)} keepMounted>
                            <DialogTitle>Поделиться голосованием</DialogTitle>
                            <DialogContent>
                                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                    <Typography variant="body2" sx={{wordBreak: "break-all"}}>
                                        <img src={imageUrl} alt='QR code'/>
                                    </Typography>


                                    <CopyToClipboard text={linkToVoting} onCopy={() => alert("Скопировано!")}>
                                        <button className="w-full px-5 py-3 bg-[#437DE9] text-white rounded-lg">
                                            Скопировать ссылку на регистрацию
                                        </button>
                                    </CopyToClipboard>

                                    <button onClick={() => setOpen(false)}
                                            className="w-full px-5 py-3 bg-gray-200 text-black rounded-lg">Закрыть
                                    </button>


                                    {/*<QRCodeCanvas value={linkToVoting} size={180} />*/}
                                </Box>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </main>
        </>
    );
};

export default React.memo(GeneralInfo);