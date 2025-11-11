import {useEffect, useState} from "react";
import { getProfileData, updateProfileData } from '/src/services/api.js'
import { TbCloudDownload } from "react-icons/tb";
import {InputDefault} from "../Inputs.jsx";
import {changeCredentials} from "../../services/api/user.js";


const PersonalData = () => {
    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        surname: '',
        email: '',
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const dataFromStorage = {
            last_name: localStorage.getItem('last_name') ?? '',
            first_name: localStorage.getItem('first_name') ?? '',
            surname: localStorage.getItem('surname') ?? '',
            email: localStorage.getItem('email') ?? '',
        };
        setFormData(prev => ({ ...prev, ...dataFromStorage }));
    }, []);

    // Обработчик изменений в полях формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // PUT-запрос
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updatableData = {
                last_name: formData.last_name,
                first_name: formData.first_name,
                surname: formData.surname,
                email: formData.email
            };

            const response = await changeCredentials(updatableData);
            console.log(response);
            localStorage.setItem('first_name', response.data.first_name);
            localStorage.setItem('last_name', response.data.last_name);
            localStorage.setItem('surname', response.data.surname);
            localStorage.setItem('email', response.data.email);
            console.log('Данные успешно сохранены!');
            
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error.message);
            
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <form 
            className="shadow-lg bg-white rounded-[15px] md:rounded-[20px] xl:w-[473px]"
            onSubmit={handleSubmit}
        >
            <div className="p-4 md:p-[32px] space-y-4 md:space-y-[20px]">
                <h1 className="text-neutral-800 text-xl md:text-2xl font-semibold">Персональные данные</h1>
                
                {/* Фамилия */}
                <InputDefault
                    type="text"
                    title="Фамилия"
                    value={formData.last_name}
                    onChange={handleChange}
                    name='last_name'
                />

                {/* Имя */}
                <InputDefault
                    type="text"
                    title="Имя"
                    value={formData.first_name}
                    onChange={handleChange}
                    name='first_name'
                />

                {/* Отчество */}
                <InputDefault
                    type="text"
                    title="Отчество"
                    value={formData.surname}
                    onChange={handleChange}
                    name='surname'
                />

                {/* Электронная почта */}
                <InputDefault
                    type="email"
                    title="Электронная почта"
                    validate={(val) => /\S+@\S+\.\S+/.test(val)}
                    value={formData.email}
                    onChange={handleChange}
                    name='email'
                />

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-12 md:h-[51px] bg-[#437DE9] rounded-lg flex items-center justify-center gap-2 text-white text-sm md:text-base font-semibold disabled:opacity-50"
                >
                    {isSaving ? (
                        <span>Сохранение...</span>
                    ) : (
                        <>
                            <TbCloudDownload size={24}/>
                            Сохранить изменения
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default PersonalData;