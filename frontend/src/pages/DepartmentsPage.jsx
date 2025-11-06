import DepartmentList from "../components/DepartmentList.jsx";
import {useEffect, useState} from "react";
import PageTitle from "../components/PageTitle.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import {getAllDepartments} from "../services/api/department.js";

const DepartmentPage = () => {
    const [departments, setDepartments] = useState([]);
    useEffect(() => {
        const getDepartments = async () => {
            const response = await getAllDepartments();
            console.log(response);
            setDepartments(response.data);
        }
        getDepartments();
    }, [])

    return (
        <>
            <div className='mx-4 2xl:ml-[240px] mt-[60px] 2xl:mr-[240px] lg:ml-[40px] lg:mr-[40px]'>
                <Breadcrumbs title={'Departments'}/>
                <PageTitle title={'Структура отделов'}/>
                <div className="p-6 mt-4 bg-white shadow-md w-full rounded-[10px]">
                    <DepartmentList items={departments}/>
                </div>
            </div>
        </>)
}
export default DepartmentPage;
