import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import {loginUser} from '../services/api/user.js'
import {InputDefault, InputPassword} from "../components/Inputs.jsx";

const LoginPage = () => {

    const [message, setMessage] = useState({text: '', type: ''});

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember_flag: false,
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;

        let parsedValue;

        if (type === 'checkbox') {
            parsedValue = checked;
        } else {
            parsedValue = value;
        }

        setFormData(prevState => {
            return {
                ...prevState,
                [name]: parsedValue,
            };
        });
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await loginUser(formData.email, formData.password, formData.remember_flag);
            // console.log("Ответ API для входа в систему:", response);
            console.log(response);
            //setMessage(`Ответ API для входа в систему: ${JSON.stringify(response)}`);
            console.log(response.headers)
            // console.log(csrfRefreshToken);
            localStorage.setItem('x-csrf-token', response.headers['x-csrf-token']);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('role', response.data.user.role);
            localStorage.setItem('first_name', response.data.user.first_name);
            localStorage.setItem('last_name', response.data.user.last_name);
            localStorage.setItem('surname', response.data.user.surname);
            setMessage({text: 'Авторизация прошла успешно!', type: 'success' });


            setTimeout(() => {
                navigate('/');
            }, 1000);


        } catch (error) {
            console.log('Полный error:', error);
            console.log('error.response:', error.response);
            console.log('error.response.data:', error.response?.data);
            setMessage({text: error.response.data.detail, type: 'error' });
        }
    };


    return (
        <>
            <ToastContainer/>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-gray-100">

                    <h1 className="text-[40px] mb-6 w-[264px] h-[48px] font-mak">Авторизация</h1>

                    <div
                        className="flex flex-col md:flex-row max-w-4xl bg-white shadow-lg rounded-[20px] overflow-hidden">
                        {/* Левая часть (форма) */}
                        <div className="px-6 md:px-[32px] py-6 w-full md:w-[467px] grow">
                            <form onSubmit={handleSubmit}>
                                <InputDefault
                                    type="email"
                                    title="Электронная почта"
                                    placeholder="ivanovivan@mail.ru"
                                    required
                                    validate={(val) => /\S+@\S+\.\S+/.test(val)}
                                    value={formData.email}
                                    onChange={handleChange}
                                    name="email"
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


                                <div className="flex justify-start mb-6">
                                    <a href="#" className="text-gray-500 text-sm hover:underline">
                                        Забыли пароль?
                                    </a>
                                </div>

                                <label className="flex items-center text-base">
                                    <input
                                        type="checkbox"
                                        name="remember_flag"
                                        checked={formData.remember_flag}
                                        onChange={handleChange}
                                        className="mr-2 w-4 h-4"
                                    />
                                    Запомнить меня
                                </label>

                                {message.text && (
                                    <p
                                        className={`text-sm font-medium mt-2 text-center ${
                                            message.type === "success" ? "text-green-600" : "text-red-600"
                                        }`}
                                    >
                                        {message.text}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-black text-white px-4 py-4 md:px-[20px] md:py-[16px] rounded-[12px] mt-6 md:mt-12"
                                >
                                    Войти
                                </button>
                            </form>
                        </div>

                        {/* Правая часть (панель) */}
                        <div
                            className="bg-[#212121] text-white p-6 flex flex-col justify-between md:rounded-l-[20px] w-full md:w-[285px]">
                            <div className="flex justify-center md:justify-end mb-6">
                                <button className="bg-[#303030] mr-2 px-4 py-2 rounded-lg">RU</button>
                                <button className="px-4 py-2">ENG</button>
                            </div>

                            <div className="text-center md:text-left">
                                <p className="text-sm mb-6">
                                    Панель управления системой электронных голосований
                                </p>
                                <Link
                                    to="/register"
                                    className="block border border-white text-center rounded-xl px-4 py-4 md:px-[20px] md:py-[16px] w-full"
                                >
                                    Регистрация
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
        </>
    );
};

export default LoginPage;