import React, {useState} from 'react';
import HeaderLogin from "/src/components/HeaderLogin";
import {Link, useNavigate} from 'react-router-dom';
import {register} from '../services/api/user.js'
import {toast, ToastContainer} from "react-toastify";
import {InputDefault, InputPassword} from "../components/Inputs.jsx";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        surname: '',
        email: '',
        phone: '',
        role: 'EMPLOYEE',
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({text: '', type: ''});
    const navigate = useNavigate(); // Инициализируем хук для навигации

    // Универсальный обработчик изменений в полях ввода
    const handleChange = (e) => {
        const {name, value} = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Обработчик отправки формы на бэкенд
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const logMessage = `Попытка регистрации с использованием данных: ${JSON.stringify(formData)}`;
        console.log(logMessage);
        //setMessage(logMessage);

        // Клиентская валидация паролей
        if (formData.password !== confirmPassword) {
            const errorMsg = 'Пароли не совпадают!';
            console.warn('Не удалось подтвердить пароль', errorMsg);
            //setMessage(errorMsg);
            return;
        }

        // Подготовка данных для отправки
        try {
            const response = await register(formData);
            console.log('Ответ API регистрации:', response);

            setMessage({text: 'Регистрация прошла успешно!', type: 'success'});

            console.log('Регистрация прошла успешно, переходим к входу в систему');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            // const errorMsg = error.response?.data?.message || error.message || 'Не удалось подключиться к серверу.';
            //setMessage(`Ошибка: ${errorMsg}`);
            // console.error('Ошибка регистрации с сообщением:', errorMsg);
            setMessage({text: error.response.data.detail, type: 'error'});
        }
    };

    return (
        <>
            <ToastContainer/>
            <div className="flex flex-col items-center  justify-center min-h-[calc(100vh-100px)] bg-gray-100">
                <h1 className="text-[40px] mb-6 w-[264px] h-[48px] font-mak">Регистрация</h1>

                {/* Мобильная версия - вертикальный макет */}
                <div
                    className="flex flex-col md:hidden w-full max-w-md bg-white shadow-lg rounded-[20px] overflow-hidden">

                    {/* Форма */}
                    <div className="px-6 py-6">
                        <form onSubmit={handleSubmit}>
                            <label className="block text-base">Зарегистрироваться как</label>
                            <select
                                className="w-full border rounded-xl px-3 py-3 mb-4"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}>
                                <option value={'EMPLOYEE'}>Сотрудник</option>
                                <option value={'CHIEF'}>Начальник</option>
                            </select>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex flex-col flex-1">
                                    <InputDefault
                                        type="text"
                                        title="Фамилия"
                                        placeholder="Иванов"
                                        required
                                        validate={(val) => val.trim().length > 0}
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        name='last_name'
                                        className={'w-full h-[51px]'}
                                    />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <InputDefault
                                        type="text"
                                        title="Имя"
                                        placeholder="Иван"
                                        required
                                        validate={(val) => val.trim().length > 0}
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        name='first_name'
                                        className={'w-full h-[51px]'}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <InputDefault
                                    type="text"
                                    title="Отчество"
                                    placeholder="Иванович"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    name='surname'
                                    className={'w-full h-[51px]'}
                                />
                            </div>

                            <InputDefault
                                type="email"
                                title="Электронная почта"
                                placeholder="ivanovivan@mail.ru"
                                required
                                validate={(val) => /\S+@\S+\.\S+/.test(val)}
                                value={formData.email}
                                onChange={handleChange}
                                name='email'
                                className={'h-[51px]'}
                            />

                            <InputDefault
                                type="tel"
                                title="Телефон"
                                placeholder="+7XXXXXXXXXX"
                                required
                                validate={(val) => /^\+?\d{11}$/.test(val)}
                                value={formData.phone}
                                onChange={handleChange}
                                name='phone'
                                className={'h-[51px]'}
                            />

                            <InputPassword
                                type="password"
                                title="Пароль"
                                placeholder="******"
                                required
                                validate={(val) => val.length >= 1}
                                value={formData.password}
                                onChange={handleChange}
                                name="password"
                            />

                            <InputPassword
                                type="password"
                                title="Подтвердите пароль"
                                placeholder="******"
                                required
                                validate={(val) => val.length >= 1 && val === formData.password}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                name="confirm_password"
                            />

                            {message.text && (
                                <p
                                    className={`text-sm font-medium mt-2 text-center ${
                                        message.type === "success" ? "text-green-600" : "text-red-600"
                                    }`}
                                >
                                    {message.text}
                                </p>
                            )}

                            <button type="submit"
                                    className="w-full bg-black text-white px-4 py-4 rounded-[12px] my-4 text-lg">
                                Зарегистрироваться
                            </button>
                        </form>
                    </div>
                    <div className="bg-[#212121] text-white p-6">
                        <div className="flex justify-center space-x-4 mb-6">
                            <button className="bg-[#303030] px-4 py-2 rounded-lg text-sm">RU</button>
                            <button className="px-4 py-2 text-sm">ENG</button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm mb-6">
                                Панель управления системой электронных голосований
                            </p>
                            <Link to="/login"
                                  className="block border border-white text-center rounded-xl px-4 py-4 w-full">
                                Авторизация
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex bg-white w-[816px] shadow-lg rounded-[20px] overflow-hidden">
                    {/* Левая панель */}
                    <div className="bg-[#212121] rounded-[20px] text-white p-6 w-[285px] flex flex-col justify-between">
                        <div className="flex mb-4">
                            <button className="bg-[#303030] mr-[10px] p-[10px] rounded-lg">RU</button>
                            <button>ENG</button>
                        </div>
                        <div className="justify-between">
                            <span className="text-sm w-[245px] h-[57px]">
                                Панель управления системой электронных голосований
                            </span>
                            <div className="w-full h-[20px]"></div>
                            <Link to="/login"
                                  className="block border border-white text-center rounded-xl px-[20px] py-[16px] w-full">
                                Авторизация
                            </Link>
                        </div>
                    </div>

                    {/* Форма */}
                    <div className="px-[32px] py-6 w-[467px] grow">
                        <form onSubmit={handleSubmit}>

                            <label className="block text-base">Зарегистрироваться как</label>
                            <select
                                className="w-full border rounded-xl px-3 py-2 h-[51px] mb-4"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}>
                                <option value={'EMPLOYEE'}>Сотрудник</option>
                                <option value={'CHIEF'}>Начальник</option>
                            </select>

                            <div className="flex gap-[12px]">
                                <div className="flex flex-col">
                                    <InputDefault
                                        type="text"
                                        title="Фамилия"
                                        placeholder="Иванов"
                                        required
                                        validate={(val) => val.trim().length > 0}
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        name='last_name'
                                        className={'w-[150px] h-[51px]'}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <InputDefault
                                        type="text"
                                        title="Имя"
                                        placeholder="Иван"
                                        required
                                        validate={(val) => val.trim().length > 0}
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        name='first_name'
                                        className={'w-[115px] h-[51px]'}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <InputDefault
                                        type="text"
                                        title="Отчество"
                                        placeholder="Иванович"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        name='surname'
                                        className={'w-[178px] h-[51px]'}
                                    />
                                </div>
                            </div>

                            <InputDefault
                                type="email"
                                title="Электронная почта"
                                placeholder="ivanovivan@mail.ru"
                                required
                                validate={(val) => /\S+@\S+\.\S+/.test(val)}
                                value={formData.email}
                                onChange={handleChange}
                                name='email'
                                className={'h-[51px]'}
                            />

                            <InputDefault
                                type="tel"
                                title="Телефон"
                                placeholder="+7XXXXXXXXXX"
                                required
                                validate={(val) => /^\+?\d{11}$/.test(val)}
                                value={formData.phone}
                                onChange={handleChange}
                                name='phone'
                                className={'h-[51px]'}
                            />

                            <InputPassword
                                type="password"
                                title="Пароль"
                                placeholder="******"
                                required
                                validate={(val) => val.length >= 1}
                                value={formData.password}
                                onChange={handleChange}
                                name="password"
                            />

                            <InputPassword
                                type="password"
                                title="Подтвердите пароль"
                                placeholder="******"
                                required
                                validate={(val) => val.length >= 1 && val === formData.password}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                name="confirm_password"
                            />


                            {message.text && (
                                <p
                                    className={`text-sm font-medium mt-2 text-center ${
                                        message.type === "success" ? "text-green-600" : "text-red-600"
                                    }`}
                                >
                                    {message.text}
                                </p>
                            )}

                            <button type="submit"
                                    className="w-full bg-black  text-white px-[20px] py-[16px] rounded-[12px] mt-10">
                                Зарегистрироваться
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;