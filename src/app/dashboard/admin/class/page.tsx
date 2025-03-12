"use client";

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Alert from '@/components/Alert/Alert';
import process from "process"

const Page = () => {
    const [classData, updateClassData] = useState({Code: "", name: "", date: "", active: false});
    const [token, setToken] = useState("");
    const [attendanceList, updateAttendanceList] = useState([]);
    const [refreshListLoading, updateRefreshListLoading] = useState(false);
    const router = useRouter();
    const [endClassLoading, updateEndClassLoading] = useState(false);
    const [alertMessage, updateAlertMessage] = useState("");
    const [showAlert, updateShowAlert] = useState(false);
    const [error, updateError] = useState({state: false, message: ""});

    // Div reference showing no attendance records.
    const divRef: any = useRef();

    const Spinner = (    
        <div role="status">
            <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
    )

    useEffect(() => {
        let data:any = localStorage.getItem("classData");
        const token:any = localStorage.getItem('token');
        if (token == null) {
            router.push("/#login");
        } else {
            setToken(token);
            // updateClassEnded(false);
        }

        if (data) {
            data = JSON.parse(data);
            // console.log(data);
            updateClassData(data);
        } else {
            router.push("/#login");
        }
    }, [router]);

    useEffect(() => {
        // Once token is ready, refresh attendance list
        if (token != "") {
            getAttendanceHandler()
        }
    }, [classData, token])

    const downloadCSV = () => {
        const table:any = document.getElementById('classAttendanceTable');
        const rows = table.querySelectorAll('tr');
        let csvContent = '';

        rows.forEach((row:any) => {
            const cells = row.querySelectorAll('th, td');
            const rowContent = Array.from(cells)
                .map((cell:any) => `"${cell.innerText}"`)
                .join(',');
            csvContent += rowContent + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${classData.name}-attendance.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getAttendanceHandler = async () => {
        updateRefreshListLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/geofence/get_attendances`, { params: {
                    "fence_code": classData.Code,
                }, 
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            console.log(response);

            if (response.data.attendance && Array.isArray(response.data.attendance)) {
                //  if its not a string, its an array
                const classRecordString = `${classData.name} attendance records`;
                console.log(classRecordString)
                updateAttendanceList(response.data.attendance); 
 
                updateRefreshListLoading(false);
            } else {
                // There are no attendance records
                divRef.current.textContent = "There are no attendance records yet.";
                updateRefreshListLoading(false);
            }
        } catch (error:any) {
            if (error.response.data.detail !== undefined) {
                divRef.current.textContent = error.response.data.detail;

                if (error.status = 401) {
                    // Session has expired, Redirect to the login page
                    localStorage.removeItem("token");
                    localStorage.removeItem("student_token");
    
                    router.push("/");
                }    

                if (error.response.data.detail.includes("not validate user") || error.response.data.detail.includes("Not enough permissions")) {
                    // Show Alert component
                    updateShowAlert(true);
                    updateAlertMessage("Sorry, your session expired.");
                }
                return;
            }

            console.log(error);
            updateRefreshListLoading(false);

            if (error.response.data.detail.includes("not validate user") || error.response.data.detail.includes("Not enough permissions")) {
                updateShowAlert(true);
                updateAlertMessage("Sorry, your session expired.");
                // router.push("/#login");
            }
        }
    }
    
    const endClassHandler = async () => {
        updateEndClassLoading(true);
        // send put rquest to deativate geofence
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/geofence/deactivate`,
                {}, 
                {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                params: {
                    "geofence_name": classData.name,
                    "date": classData.date.slice(0,10) // get only the date part of the string
                },
            });

            console.log(response);
            updateEndClassLoading(false);

            // Show alert component
            updateShowAlert(true);
            updateAlertMessage(response.data.message);
            if (showAlert !== false) router.back();
        } catch (error:any) {
            console.log(error);
            updateEndClassLoading(false);

            if (error.status = 401) {
                // Here the response comes back as forbidden, 403 but with a status code of 401
                updateError({state: true, message: error.response.data.detail});

                // when class is already inactive, update classData state to have active to false
                updateClassData((prevClassData: any): any => {return {...prevClassData, active: false}});
            }   
        }
    }
     

    return (
        <div className='flex px-6 py-6 flex-col gap-4'>
            <Alert message={alertMessage} show={showAlert} closeAlert={() => {updateShowAlert(prev => !prev); router.push("/#login")}}/>
            <h1 className='text-4xl font-extrabold text-center'>{classData.name}</h1>
            <h2 className='text-xl text-gray-500 text-center'>
                Your class code is <span className='font-bold'>{classData.Code}</span>
                <br /><span className='text-sm sm:text-base'>(Share this code with all students of this class)</span>
            </h2>

            <div id="classAttendance">
                <button 
                    onClick={getAttendanceHandler}
                    className='py-2 px-6 w-full text white border border-white my-3 rounded text-white bg-purple-500
                transition ease-out duration-300 hover:bg-purple-800'>
                    Refresh List
                </button>
                {/* Manual de-activate geofence */}
                <div className='flex justify-between'>
                    <button 
                        onClick={endClassHandler}
                        className='py-2 px-6 w-[90%] border border-purple-500 my-3 text-red bg-white
                        transition ease-out duration-300 hover:bg-red-600 hover:text-white disabled:bg-red-500 disabled:opacity-75 disabled:text-white'
                        disabled={!classData.active}
                    >
                        {endClassLoading? Spinner :(classData.active? "End Class": "Class is inactive")}
                    </button>
                    <button 
                        className='px-4 border border-purple-500 scale-[65%]' 
                        title='Download Attendance' 
                        onClick={downloadCSV}
                    >
                        <Image src="/download-svg.svg" width={30} height={3} alt='Download Image' />
                    </button>
                </div>

                {error.state && <p>{error.message}</p>}

                <header className='text-lg py-4 pb-0 text-purple-500 font-bold text-center'>ATTENDANCE LIST FOR THE CLASS</header>
 
                <p className='text-center py-2 pb-4'>(Refresh to see updated list)</p>
                
                {refreshListLoading? 
                    (<div className='flex justify-center py-6' ref={divRef}>
                        {Spinner}
                    </div>)
                    : (<table id="classAttendanceTable" className='table-auto w-full text-left border-collapse'>
                        <thead>
                            <tr>
                                <th className='border px-4 py-2 w-[8%]'>S/N</th>
                                <th className='border px-4 py-2 w-[60%]'>Name</th>
                                <th className='border px-4 py-2'>Matric No.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* only render if attendance list comes back as an array and is not empty */}
                            {Array.isArray(attendanceList) && attendanceList.length !== 0? attendanceList.map((student:any, index) => (
                                <tr key={index}>
                                    <td className='border px-4 py-2'>{index + 1}</td>
                                    <td className='border px-4 py-2'>{student.username}</td>
                                    <td className='border px-4 py-2'>{student.user_matric}</td>
                                </tr>
                            )): <tr></tr>}
                        </tbody>
                    </table>)
                }
            </div>
        </div>
    );
}

export default Page;