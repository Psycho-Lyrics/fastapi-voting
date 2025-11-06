import {useState, useEffect} from 'react';
import {CgProfile} from "react-icons/cg";
import {VscSettings} from "react-icons/vsc";
import {LuScanSearch} from "react-icons/lu";
import {NavLink, useNavigate, Link} from 'react-router-dom'
import {MdLogout} from "react-icons/md";
import HeaderDropdown from './Header/HeaderDropdown';
import AltHeaderDropdown from './Header/AltHeaderDropdown';
import {accessLogout, refreshLogout} from "../services/api/user.js";

const Header = () => {
    const [user, setUser] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        setUser({
            last_name: localStorage.getItem('last_name'),
            first_name: localStorage.getItem('first_name'),
            surname: localStorage.getItem('surname'),
            role: localStorage.getItem('role'),
        })
    }, [])

    const Add = [
        {id: 1, title: 'Голосование', to: '/constructor'},
        {id: 2, title: 'Шаблон голосований', to: '/constructor'},
    ]

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


    const logoutProfile = async () => {
        const csrf = localStorage.getItem("x-csrf-token");
        await accessLogout()
        await refreshLogout(csrf)

        localStorage.clear();
        navigate('/login');
    }
    //
    // if (!user) {
    //     return <header className="w-full h-24 bg-neutral-800 "></header>;
    // }

    return (
        <div className='h-25 bg-[#212121]'>
            {/* Desktop Header */}
            <div
                className='hidden md:flex justify-between py-[18px] md:mx-3 lg:mx-20 xl:mx-40 2xl:mx-[240px] text-white text-md font-semibold'>
                <div className='flex gap-5 items-start'>
                    <div className='flex items-start'>
                        <img
                            className='rounded-full h-16 w-16'
                            src='https://placehold.co/64x64.png'
                            alt='User avatar'
                        />
                    </div>
                    <div className='mt-1 flex gap-5'>
                        <NavLink
                            to={'/'}
                            className='px-5 h-13 flex items-start py-3 cursor-pointer hover:bg-[#505050] rounded-2xl'
                        >
                            Главная
                        </NavLink>

                        <NavLink
                            to={'/votes'}
                            className='px-5 h-13 flex items-start py-3 cursor-pointer hover:bg-[#505050] rounded-2xl'
                        >
                            Голосования
                        </NavLink>

                        {user.role === 'CHIEF' &&
                            <div className='h-full flex items-start z-20'>
                                <AltHeaderDropdown title={'Добавить'} options={Add}/>
                            </div>
                        }


                    </div>
                </div>
                <div className='flex h-15 gap-6 items-center'>


                    <div className="w-8 h-8 cursor-pointer">
                        <LuScanSearch size={32}/>
                    </div>
                    <div className="w-8 h-8 cursor-pointer">
                        <VscSettings size={32}/>
                    </div>


                    <p className='whitespace-nowrap max-2xl:hidden'>
                        {user.last_name} {user.first_name?.slice(0, 1) + "."} {user.surname?.slice(0, 1) + "."}
                    </p>

                    <NavLink to={'/profile'}>
                        <div className="w-8 h-8 cursor-pointer">
                            <CgProfile size={32}/>

                        </div>
                    </NavLink>
                    <div className="w-8 h-8 cursor-pointer">
                        <MdLogout className='cursor-pointer' onClick={logoutProfile} size={32}/>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className='md:hidden flex justify-between items-center py-7 px-6 text-white'>
                <div className='flex items-center'>
                    <img
                        className='rounded-full h-10 w-10'
                        src='https://placehold.co/64x64.png'
                        alt='User avatar'
                    />
                    <NavLink
                        to={'/'}
                        className='ml-3 text-lg font-semibold'
                    >
                        Главная
                    </NavLink>
                </div>

                <div className='flex items-center gap-3'>


                    <div className="w-8 h-8 cursor-pointer">
                        <LuScanSearch size={32}/>
                    </div>
                    <div className="w-8 h-8 cursor-pointer">
                        <VscSettings size={32}/>
                    </div>


                    <NavLink to={'/profile'}>
                        <div className="w-8 h-8 cursor-pointer">
                            <CgProfile size={32}/>
                        </div>
                    </NavLink>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className='ml-2'
                    >
                        <div className='w-6 h-0.5 bg-white mb-1.5'></div>
                        <div className='w-6 h-0.5 bg-white mb-1.5'></div>
                        <div className='w-6 h-0.5 bg-white'></div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className='md:hidden bg-[#212121] px-7 pb-4 absolute top-20 left-0 right-0 z-30'>
                    <div className='flex flex-col gap-2'>
                        <div className='text-white'>
                            <NavLink
                                to={'/votes'}
                                className='px-5 h-13 flex items-start py-3 cursor-pointer hover:bg-[#505050] rounded-2xl'
                            >
                                Голосования
                            </NavLink>
                        </div>
                        {user.role === 'CHIEF' &&
                            <div className='rounded-2xl text-white w-57'>
                                <AltHeaderDropdown title={'Добавить'} options={Add}/>
                            </div>
                        }
                    </div>
                </div>
            )}
        </div>

    );
};

export default Header;