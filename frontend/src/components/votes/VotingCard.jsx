import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getVotingStatusConfig } from './Formatters';
import { Modal, Box, Button, Typography } from '@mui/material';
import { deleteVote } from '../../services/api';
import { toast } from 'react-toastify';
import { TbTimezone } from "react-icons/tb";
import { LuCalendar1, LuAlarmClock, LuTrash2 } from "react-icons/lu";
import { IoMdStats } from "react-icons/io";
import {deleteVoting} from "../../services/api/voting.js";

const VotingCard = ({ voting }) => {
    const status = getVotingStatusConfig(voting);


    const [isModalOpen, setIsModalOpen] = useState(false)

    // Обработчики
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);


    const handleDelete = async () => {
        try {
            await deleteVoting(voting.id);
            toast.success("Голосование успешно удалено!");
            handleCloseModal();
        } catch (error) {
            toast.error("Не удалось удалить голосование")
            console.log(error)
        }
    }


    return (
        <div className="bg-white rounded-[15px] sm:rounded-[20px] w-full shadow-lg p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 relative">
            {/* Заголовок, группа и часовой пояс */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex flex-col gap-1 sm:gap-2">
                    <div className="text-neutral-800 text-lg sm:text-xl leading-tight">
                        {voting.title}
                    </div>
                    <div className="text-stone-300 text-xs sm:text-sm font-normal leading-tight">
                        {voting.groupName}
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-neutral-600 text-xs sm:text-sm font-normal leading-tight">
                    <TbTimezone size={24} />
                    {voting.timezone}
                </div>
            </div>

            {/* Блок статуса и дат - главные изменения */}
            <div className="flex flex-col lg:flex-row lg:space-x-8 flex-grow">
                <div className="flex flex-col gap-2 w-full lg:w-fit mb-4 lg:mb-0">
                    <div className={`h-8 sm:h-10 p-2 sm:p-[10px] rounded-lg w-full 2xl:w-90 flex items-center gap-2 ${status.bg}`}>
                        {status.icon}
                        <div className={`text-base sm:text-sm leading-tight ${status.textColor}`}>
                            {status.text}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-160">
                    {/* Даты регистрации */}
                    <div className="flex flex-col gap-3 sm:gap-4 flex-1">
                        <div className="flex flex-col gap-1 sm:gap-2">
                            <div className="text-neutral-600 text-xs sm:text-base">Начало регистрации</div>
                            <div className="flex items-center gap-1 sm:gap-2 text-neutral-800 text-xs sm:text-base">
                                <LuCalendar1 size={20} />
                                <span className="whitespace-nowrap">{voting.registrationStart.date}</span>
                                <LuAlarmClock size={20} />
                                <span className="whitespace-nowrap">{voting.registrationStart.time}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                            <div className="text-neutral-600 text-xs sm:text-base">
                                Окончание регистрации
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-neutral-800 text-xs sm:text-base">
                                <LuCalendar1 size={20} />
                                <span className="whitespace-nowrap">{voting.registrationEnd.date}</span>
                                <LuAlarmClock size={20} />
                                <span className="whitespace-nowrap">{voting.registrationEnd.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Даты голосования */}
                    <div className="flex flex-col gap-3 sm:gap-4 flex-1 mt-4 sm:mt-0">
                        <div className="flex flex-col gap-1 sm:gap-2">
                            <div className="text-neutral-600 text-xs sm:text-base">
                                Начало голосования
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-neutral-800 text-xs sm:text-base">
                                <LuCalendar1 size={20} />
                                <span className="whitespace-nowrap">{voting.votingStart.date}</span>
                                <LuAlarmClock size={20} />
                                <span className="whitespace-nowrap">{voting.votingStart.time}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                            <div className="text-neutral-600 text-xs sm:text-base">
                                Окончание голосования
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-neutral-800 text-xs sm:text-base">
                                <LuCalendar1 size={20} />
                                <span className="whitespace-nowrap">{voting.votingEnd.date}</span>
                                <LuAlarmClock size={20} />
                                <span className="whitespace-nowrap">{voting.votingEnd.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Кнопки управления */}
            <div className="flex justify-end mt-2 sm:absolute sm:bottom-6 sm:right-6">
                <div className="flex gap-3 sm:gap-[10px]">
                    <Link to={`/votes/${voting.id}`} className='bg-[#f4f4f4] hover:bg-[#ccc] transition-all rounded-lg p-2 cursor-pointer'>
                        <IoMdStats />
                    </Link>
                    {/*user.userId === voting.creator.id*/}
                    {/*{user.roleId === 3 &&*/}
                        <div className='bg-[#f4f4f4] hover:bg-[#EE5B5B] hover:text-[#FFE3E3] transition-all rounded-lg p-2 cursor-pointer' onClick={handleOpenModal} >
                            <LuTrash2 />
                        </div>
                </div>
                <ConfirmationModal
                    open={isModalOpen}
                    handleClose={handleCloseModal}
                    onConfirm={handleDelete}
                    message={`Вы уверены, что хотите удалить голосование "${voting.title}"?`}
                />
            </div>
        </div>
    );
};


// Модальное окно
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
};

const ConfirmationModal = ({ open, handleClose, onConfirm, message }) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            className="flex items-center justify-center p-4"
        >
            <Box
                sx={style}
                className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-sm w-full mx-auto"
            >
                <Typography
                    id="modal-title"
                    variant="h6"
                    component="h2"
                    className="text-xl sm:text-2xl font-bold mb-4 text-center"
                >
                    Подтверждение
                </Typography>
                <Typography
                    id="modal-description"
                    className="text-gray-700 text-center mb-6"
                >
                    {message}
                </Typography>
                <div className="flex justify-around gap-4">
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        className="w-full py-2 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onConfirm}
                        className="w-full py-2 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                    >
                        Удалить
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

export default VotingCard;