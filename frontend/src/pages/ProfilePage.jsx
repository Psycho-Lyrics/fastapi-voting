import Breadcrumbs from "../components/Breadcrumbs";
import PageTitle from "../components/PageTitle";
import PersonalDataForm from "../components/profile/PersonalDataForm";
import PasswordChangeForm from "../components/profile/PasswordChangeFrom";
import TimezoneSettings from "../components/profile/TimezoneSetting";
import {useEffect, useRef, useState} from "react";
import {confirmEmail, getProfileData, requestVerificationCode} from "../services/api.js";

const ProfilePage = () => {
    const inputRef = useRef();
    const [isInputVisible, setIsInputVisible] = useState(false)
    const [formData, setFormData] = useState({
        last_name: '', first_name: '', surname: '', email: ''
    });
    const [profileData, setProfileData] = useState({})
    const [loading, setLoading] = useState(true);
    const [resendTimer, setResendTimer] = useState(0);

    // GET-запрос
    useEffect(() => {


        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const data = await getProfileData();
                setFormData(data);
                setProfileData(data);
            } catch (error) {
                console.error('Ошибка при получении данных профиля:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);


    const handleRequestCode = async () => {
        setIsInputVisible(true)
        await requestVerificationCode(formData.email)
        setResendTimer(120)
    }

    // таймер
    useEffect(() => {
        if (resendTimer > 0) {
            const timerId = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);

            // очистка таймера
            return () => clearTimeout(timerId);
        }
    }, [resendTimer]);


    const handleConfirmCode = async () => {
        const code = inputRef.current.value;
        await confirmEmail(formData.email, code)
        setIsInputVisible(false)
        setProfileData(prev => ({...prev, is_email_verified: true}));
    }

    return (
        <>
            <div className="min-h-screen">

                <div className="xl:ml-[240px] mt-[60px] xl:mr-[240px] px-4 lg:px-0 py-4 lg:py-0">
                    <Breadcrumbs
                        title="Администратор / Личный кабинет / Общая информация"
                        className="text-sm lg:text-base"
                    />

                    <PageTitle
                        title="Личный кабинет"
                        className="text-2xl lg:text-3xl lg:mt-0"
                    />
                    {loading ? (
                            <div>Загрузка...</div>
                        ) :
                        (<main className="xl:flex flex-col lg:flex-row gap-4 lg:gap-[10px] mt-4 lg:mt-[24px]">
                            {/* Левая колонка (формы) */}
                            <div className="flex flex-col gap-4 lg:gap-[10px] w-full lg:w-auto">
                                <PersonalDataForm
                                    formData={formData}
                                    setFormData={setFormData}/>
                                <PasswordChangeForm/>
                            </div>

                            {/* Правая колонка (настройки) */}
                            <div
                                className="flex flex-col mt-4 md:mt-3 lg:mt-3 sm:mt-3 xl:mt-0 w-full gap-4 lg:gap-[10px]">
                                <TimezoneSettings/>
                                {!profileData.is_email_verified &&
                                    <div className="shadow-lg bg-white rounded-[15px] md:rounded-[20px] w-auto">
                                        <div className="p-4 md:p-[32px] space-y-4 md:space-y-[20px]">
                                            <h1 className="text-neutral-800 text-xl md:text-2xl font-semibold">Подтвердите
                                                адрес
                                                электронной почты</h1>
                                            <div className="flex flex-col gap-2 md:gap-[10px]">
                                                {isInputVisible && (<div className="flex flex-col gap-2">
                                                    <input
                                                        type='text'
                                                        ref={inputRef}
                                                        placeholder='Введите код подтверждения'
                                                        className='border border-black rounded-lg w-full h-12 md:h-[51px] px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-normal text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500'
                                                    />
                                                    <div className='group flex justify-normal'>
                                                        <button
                                                            className="justify-normal inline-flex flex-col w-fit"
                                                            onClick={handleRequestCode}
                                                            disabled={resendTimer > 0}
                                                        >
                                                            <p className={`${resendTimer > 0 ? 'text-gray-500' : 'text-blue-700'} select-none cursor-pointer`}>
                                                                Отправить повторно

                                                            </p>

                                                            {/*<div className='h-[1px] w-0 group-hover:w-full bg-[#212121] transition-all duration-300'></div>*/}
                                                            {resendTimer > 0 && <span>{resendTimer}</span>}
                                                        </button>
                                                    </div>
                                                </div>)}
                                                <button
                                                    className="w-full h-12 md:h-[51px] bg-[#437DE9] rounded-lg flex items-center justify-center gap-2 text-white text-sm md:text-base font-semibold"
                                                    onClick={!isInputVisible ? handleRequestCode : handleConfirmCode}
                                                >
                                                    {/* <img src="/icons/cloud.svg" alt="" className="w-5 h-5 md:w-auto md:h-auto" /> */}
                                                    {!isInputVisible ? 'Отправить код' : 'Подтвердить почту'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>}
                            </div>
                        </main>)}
                </div>
            </div>
        </>
    );
};

export default ProfilePage;