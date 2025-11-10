import {useEffect, useState} from "react";
import {LuCircleCheck} from "react-icons/lu";
import {AiOutlineEye, AiOutlineEyeInvisible} from "react-icons/ai";

const InputDefault = ({
                          type,
                          placeholder,
                          title,
                          required,
                          validate,
                          className,
                          value,
                          onChange,
                          name,
                      }) => {
    const [inputStatus, setInputStatus] = useState(false);

    const handleInputChange = (e) => {
        let val = e.target.value;

        if (type === "tel") {
            val = val.replace(/[^0-9+]/g, ""); // убираем всё, кроме цифр и "+"
        }

        setInputStatus(validate ? validate(val) : val.trim() !== "");
        if (onChange) onChange(e);
    };

    return (
        <div className="w-full inline-flex flex-col mb-4">
            {title && (
                <div className="inline-flex items-center gap-[10px]">
                    <p>{title}</p>
                    {required && (
                        <LuCircleCheck
                            color={!inputStatus ? "#212121" : "#008200"}
                            size={16}
                        />
                    )}
                </div>
            )}

            <input
                type={type}
                name={name}
                value={value}
                onChange={handleInputChange}
                className={`rounded-xl border border-[#212121] p-[12px] text-[#212121] placeholder:text-[#ccc] ${className}`}
                placeholder={placeholder}
                autoComplete="on"
                inputMode={type === "tel" ? "numeric" : undefined}
                pattern={type === "tel" ? "[0-9+]*" : undefined}
                maxLength={type === "tel" ? 12 : undefined}
                required={required}
            />
        </div>
    );
};

const InputPassword = ({
                           value,
                           onChange,
                           name = "password",
                           placeholder = "Password",
                           title,
                           required = false,
                           validate,
                           className = "",
                       }) => {
    const [type, setType] = useState("password");
    const [visible, setVisible] = useState(false);
    const [inputStatus, setInputStatus] = useState(false);

    useEffect(() => {
        const val = value ?? "";
        setInputStatus(validate ? validate(val) : val.trim() !== "");
    }, [value, validate]);

    // Переключатель видимости пароля
    const handleToggle = () => {
        setVisible((v) => !v);
        setType((t) => (t === "password" ? "text" : "password"));
    };

    const handleChange = (e) => {
        if (onChange) onChange(e);
        const val = e.target.value;
        setInputStatus(validate ? validate(val) : val.trim() !== "");
    };

    return (
        <div className="w-full inline-flex flex-col mb-4">
            {title && (
                <div className="inline-flex items-center gap-[10px]">
                    <p className="text-[#212121]">{title}</p>
                    {/*Иконка статуса*/}
                    {required && (
                        <LuCircleCheck
                            color={!inputStatus ? "#212121" : "#008200"}
                            size={16}
                        />
                    )}
                </div>
            )}

            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    className={`rounded-xl border border-[#212121] p-[12px] pr-11 text-[#212121] placeholder:text-[#ccc] w-full ${className}`}
                    placeholder={placeholder}
                    autoComplete="current-password"
                    required={required}
                    aria-invalid={!inputStatus}
                />

                {/* Кнопка переключения видимости пароля */}
                <button
                    type="button"
                    onClick={handleToggle}
                    aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-[#212121] hover:opacity-80"
                >
                    {visible ? (
                        <AiOutlineEye size={20}/>
                    ) : (
                        <AiOutlineEyeInvisible size={20}/>
                    )}
                </button>
            </div>
        </div>
    );
};


export {InputDefault, InputPassword};
