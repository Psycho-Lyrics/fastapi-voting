import {useState} from 'react';
import {changePassword} from "../../services/api";
import {TbCloudDownload} from "react-icons/tb";
import {InputPassword} from "../Inputs.jsx";
import {BlueButton} from "../Button.jsx";


const PasswordChangeForm = () => {

    const [password, setPassword] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
    });

    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setPassword(prevPasswords => ({
            ...prevPasswords,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password.new_password !== password.confirm_new_password) {
            console.log('Новый пароль и его подтверждение не совпадают.');
            return;
        }

        setIsSaving(true);
        try {
            const dataToSend = {
                old_password: password.old_password,
                new_password: password.new_password,
            };

            await changePassword(dataToSend);

            console.log("Пароль успешно изменен!");
            setPassword({
                old_password: '',
                new_password: '',
                confirm_new_password: '',
            });
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form className="shadow-lg bg-white rounded-[15px] md:rounded-[20px] xl:w-[473px]">
            <div className="p-4 md:p-[32px] space-y-4 md:space-y-[20px]">
                <h1 className="text-neutral-800 text-xl md:text-2xl font-semibold">Пароль</h1>

                {/* Старый пароль */}
                <InputPassword
                    type="password"
                    title="Старый пароль"
                    placeholder="hiown9823u0n"
                    value={password.old_password}
                    onChange={handleChange}
                    name="old_password"
                />

                {/* Новый пароль */}
                <InputPassword
                    type="password"
                    title="Новый пароль"
                    placeholder="******"
                    required
                    validate={(val) => val.length >= 1}
                    value={password.new_password}
                    onChange={handleChange}
                    name="new_password"
                />

                {/* Подтвердить новый пароль */}
                <InputPassword
                    type="password"
                    title="Подтвердите новый пароль"
                    placeholder="******"
                    required
                    validate={(val) => val.length >= 1 && val === password.new_password}
                    value={password.confirm_new_password}
                    onChange={handleChange}
                    name="confirm_new_password"
                />

                <BlueButton onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            Сохранение...
                        </>
                    ) : (
                        <>
                            <TbCloudDownload size={24}/>
                            Сохранить изменения
                        </>
                    )}
                </BlueButton>
            </div>
        </form>
    );
};

export default PasswordChangeForm