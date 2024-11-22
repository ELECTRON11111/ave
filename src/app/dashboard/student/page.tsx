"use client"
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';    
import Modal from '@/components/Model/Model';
import Alert from '@/components/Alert/Alert';
import AuthenticatedNav from '@/components/AuthenticatedNav/AuthenticatedNav';
import OpenModal from '@/components/OpenModal/OpenModal';

const Page = () => {
    const [jwtToken, setJwtToken] = useState("");
    const [loading, updateLoading] = useState(true);
    const [confirmButtonClicked, updateConfirmButtonClicked] = useState(false);
    const [confirmationLoading, updateConfirmationLoading] = useState(false);
    const [confirmationError, updateConfirmationError] = useState({state: false, message: ""});
    const [confirmationSuccess, updateConfirmationSuccess] = useState({state: false, message: "", caution: false});
    const [geofences, updateGeofences] = useState([]);
    const [selectedGeofenceData, updateSelectedGeofenceData] = useState({name: "", radius: 0, fence_code:"", status: ""})
    const [showModal, updateShowModal] = useState(false);
    const [showLogoutModal, updateShowLogoutModal] = useState(false);

    const [alertMessage, updateAlertMessage] = useState("");
    const [showAlert, updateShowAlert] = useState(false);
    
    const [decodedToken, setDecodedToken] = useState({
        sub: '', 
        username: '', 
        role: 'student', 
        user_matric: '', 
    });
    const [location, setLocation] = useState({
        latitude: 0,
        longitude: 0,
    });
    const [formData, updateFormData] = useState({
        fenceCode: "",
    });
    const router = useRouter();
    const renderCount = useRef(0);

    
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
        const token:any = localStorage.getItem('student_token');
        if (token == null) {
            router.push("/#login");
        } else {
            setJwtToken(token);
            setDecodedToken(jwtDecode(token));
        }

        // Get user location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords;
                setLocation({ latitude, longitude });
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, []);

    useEffect(() => {
        // Get user location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords;
                setLocation({ latitude, longitude });
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, [confirmButtonClicked])
    
    // Fetch desired fences from token after third render, so necessary data is gotten
    useEffect(() => {
      renderCount.current += 1;
      
      if (renderCount.current === 3) {
        getGeofencesHandler();
      }
    });

    async function getGeofencesHandler() {
        updateLoading(true);
        // fetch geofences from server
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get_geofences/`, { 
                headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json"
            }
        });
            // console.log(response);
            updateGeofences(response.data.geofences);
            updateLoading(false);
            
        } catch (error: any) {
            console.log(error);
            updateLoading(false);

            if (error.response.data.detail == "Could not validate user.") {
                // alert(error.response.data.detail);
                showAlertHandler(error.response.data.detail);
            }
        }
    }

    async function recordAttendance (fenceCode:string, geofenceStatus:String) {

        if (geofenceStatus == "inactive") {
            updateConfirmationSuccess({state: false, message: "", caution: false});
            updateConfirmationError({state: true, message: "The geofence you have selected is currently inactive"});
            updateConfirmButtonClicked(true);

            return;
        }

        updateConfirmationLoading(true);
        try {
            const response:any = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/record_attendance/`, 
                {},
                {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
                params: {
                    // getting form data not working correctly, fix this. (make this dynamic)
                    "fence_code": formData.fenceCode,
                    "lat": location.latitude,
                    "long": location.longitude
                }   
            });

            updateConfirmationLoading(false);
            // console.log(response);

            if (typeof response.data.message == "undefined") {
                updateConfirmationSuccess({state: false, message: "", caution: false});
                updateConfirmationError({state: true, message: response.data});
                console.log(response.data);

                updateConfirmationSuccess({state: true, message: response.data, caution: false});
                updateConfirmationError(prevState => ({...prevState, state: false}));
                updateConfirmButtonClicked(true);

                return;
            }

            if (response.data.message == "User is not within the geofence, no attendance recorded") {
                updateConfirmationSuccess({state: true, message: response.data.message, caution: true});
                updateConfirmationError({state: false, message: "The geofence you have selected is currently inactive"});
                updateConfirmButtonClicked(true);
                return;
            }

            updateConfirmationSuccess({state: true, message: "Attendance recorded successfully.", caution: false});
            updateConfirmationError(prevState => ({...prevState, state: false}));
            updateConfirmButtonClicked(true);

        } catch (error: any) {
            updateConfirmationLoading(false);
            // console.log(error)

            if (error.message.toLowerCase().includes("network")) {
                updateConfirmationSuccess({state: false, message: "", caution: false});
                updateConfirmationError({state: true, message: error.message});
    
                return;
            }

            if (typeof error.response.data.detail == "undefined") {
                updateConfirmationSuccess({state: false, message: "", caution: false});
                updateConfirmationError({state: true, message: error.response.data});
                console.log(error.response);

                return;
            }

            if (error.response.data.detail.includes("Not enough permissions")) {
                updateConfirmationSuccess({state: false, message: "", caution: false});
                updateConfirmationError({state: true, message: error.response.data.detail});

                // setTimeout(() => router.push("/#login"), 4000);
            }

            updateConfirmationSuccess({state: false, message: "", caution: false});
            updateConfirmationError({state: true, message: error.response.data.detail});
            // console.log(error.response.data.detail);
            
            if (error.response.data.detail == "Could not validate user.") {
                // alert(error.response.data.detail);
                
                showAlertHandler(error.response.data.detail);
            }

            updateConfirmButtonClicked(true);
        }
    }

    async function showAlertHandler(message: any) {
        await updateAlertMessage(message);
        updateShowAlert(true);
        // setTimeout(() => updateShowAlert(false), 4000);
    }

    const handleChange = (event: any) => {
        event.persist();
        const {name, value} = event.target;

        updateFormData(prevState => ({...prevState, [name]: value}));
    }

    const handleLogout = () => {
        // delete the token and redirect user back to the home page
        localStorage.removeItem("student_token");
        router.push("/#login");
    }

    return (
        <div id='Student-dashboard-page' className='p-4 flex font-body flex-col py-16'>
            <Alert message={alertMessage} show={showAlert} closeAlert={() => {updateShowAlert(false); localStorage.removeItem("student_token"); router.push("/#login")}}/>
            <Modal show={showModal} modalClosed= {() => updateShowModal(false)}>     
                {confirmButtonClicked == false
                    ? (<div className="flex flex-col items-center justify-center w-full h-full py-20 px-6 gap-5 rounded">
                            <h1 className="text-2xl font-bold text-center">Enter the class fence code.</h1>

                            <form action="" className="flex flex-col items-center justify-center">
                                <input type="name" name="fenceCode" id='fence_code' onChange = {(e) => handleChange(e)} className="input w-[130%] px-5" placeholder={`Enter fence code`} />
                            </form>

                            {/* Update this logic */}
                            {confirmationLoading? Spinner: 
                                <div className="flex justify-center mt-4">
                                    <button onClick={() => {updateShowModal(false)}} className="px-4 py-2 bg-purple-500 text-white hover-effect 
                                    rounded-md hover:scale-105 hover:bg-purple-950">Cancel</button>
                                    <button onClick={() => {recordAttendance(formData.fenceCode, selectedGeofenceData.status)}} 
                                        className="px-4 py-2 bg-purple-500 text-white hover-effect 
                                        rounded-md ml-4 hover:scale-105 hover:bg-purple-950">
                                            Confirm
                                    </button>
                                </div>
                            }
                        </div>)
                    :(
                        <div className='flex flex-col gap-4 items-center text-center py-8 px-4'>
                            {confirmationSuccess.state && confirmationSuccess.caution?
                                <Image src="/caution.svg" className="mx-auto mt-5" width={50} height={50} alt="caution-icon"/>
                                :<Image src={confirmationError.state? "/warning.svg" :"/success.svg"} className="mx-auto mt-5" width={50} height={50} alt="error-icon"/>
                            }

                            {confirmationSuccess.state? 
                                <h1 className={`font-bold ${confirmationSuccess.caution? "text-orange-500": "text-green-500"}`}>{confirmationSuccess.message}</h1> 
                                :<h1 className='font-bold text-red-500'>{confirmationError.message}</h1>
                            }
                            
                            {confirmationSuccess.state? 
                                <p className='py-2'>{`${confirmationSuccess.caution? "Please note the caution above": "Your records have been taken."}`}</p> 
                                :<p className='py-2'>Please consider the error message above</p>
                            }

                            {confirmationSuccess.state? 
                                <button 
                                    className={`
                                        py-3 pt-auto w-3/4 px-4 border ${confirmationSuccess.caution? "border-orange-600 text-orange-500" 
                                        : "border-green-500 text-green-500"}
                                    `}
                                    onClick={() => {updateConfirmButtonClicked(false); updateShowModal(false)}}
                                >Go back</button> 
                                :<button className='py-3 pt-auto w-3/4 px-4 border border-red-500 text-red-500' 
                                    onClick={() => {updateConfirmButtonClicked(false); updateShowModal(false)}}
                                >Go back</button>
                            }   
                        </div>
                    )}
            </Modal>

            {/* LOGOUT MODAL */}
            <OpenModal hidden = {!showLogoutModal}>
                <div className='flex flex-col p-8 px-2 gap-12 md:gap-16 text-sm'>
                    <h1 className='font-bold text-xl text-gray-500 text-center sm:text-2xl md:text-4xl'>Are you sure you want to log out?</h1>
                    <div className='flex gap-3 justify-center w-full md:scale-125'>
                        <button 
                            onClick={() => handleLogout()}
                            className='text-red-500 border-2 border-gray-100 px-3 py-2 rounded hover-effect hover:text-white hover:bg-red-500'
                        >
                            Yes, leave
                        </button>
                        <button 
                            onClick={() => updateShowLogoutModal(false)}
                            className='text-green-500 border-2 border-gray-100 px-3 py-2 rounded hover-effect hover:text-white hover:bg-green-500'
                        >
                            No, go back
                        </button>
                    </div>
                </div>
            </OpenModal>

            <AuthenticatedNav handleLogout={() => updateShowLogoutModal(true)}/>
            <Image src="/students.svg" alt ="students svg" width={200} height={200} className='self-center'/>
    
            <h1 className='text-center text-4xl font-bold'>Welcome to your student dashboard.</h1>
            <h3 className='text-center py-4'>Hello <span className='text-purple-500'>{decodedToken.username}</span>, join your class.</h3>
            <button 
                onClick={getGeofencesHandler}
                className='py-2 px-6 w-full text white border border-white my-3 rounded text-white bg-purple-500
                transition ease-out duration-300 hover:bg-purple-800'
            >
                Refresh List
            </button>
            <input type='text' 
                className='py-2 px-6 w-full border border-purple-500 my-3 text-black bg-white
                transition ease-out duration-300 hover:border-2'
                placeholder='Search for a class.'
            />

            <h3 className='border-b-2 w-full px-4 my-6'>All available classes</h3>
            <div className='flex justify-center items-center w-full'>
                {loading 
                    ? Spinner
                    : (<div id='fences_list' className='w-full grid grid-cols-2 gap-4 md:grid-cols-4'>
                        {typeof(geofences) !== "undefined" ? geofences.map((geofence:any, index) => (
                            <div key={index} 
                                onClick={() => {updateShowModal(true); updateSelectedGeofenceData({...geofence})}}  // record attendance when a class card is clicked
                                className='border-2 border-purple-400 px-2 py-2 rounded-md my-2 cursor-pointer hover-effect hover:scale-[102%]'
                            >
                                <div id='top-geofence-card' className='flex justify-between items-center'>
                                    <img src='/classroom.svg' className='rounded-full' width={50} height={50}/>
                                    <span className='font-bold text-purple-500 text-sm sm:text-base'>{geofence.name}</span>
                                </div>
                                <div id='bottom-geofence-card' className='flex justify-between py-2 border-t-2 mt-3'>
                                    {/* <span>{geofence.creator.split(" ").length == 1? geofence.creator.split(" ")[0] :geofence.creator.split(" ")[1]}</span> */}
                                    <div id='active-status-geofence-card' className='flex w-full text-sm gap-2 items-center sm:text-lg'>
                                        <span className={`w-[10px] h-[10px] rounded-full ${geofence.status == "active"? "bg-green-500 text-green-500": (geofence.status == "scheduled"? "bg-yellow-500 text-yellow-500" :"bg-red-500 text-red-500")}`}></span>
                                        {/** red or green dot depending on active status*/}
                                        <span className='text-nowrap'>{geofence.status}</span>
                                        <span className="self-end ml-auto text-end">
                                            {`${parseInt(geofence.start_time.slice(11,16).split(":")[0]) + 1}:${geofence.start_time.slice(11,16).split(":")[1]}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )): <div className='py-4 text-lg'>There are no active classes at the moment. Please try again later.</div>}

                    </div>)
                }
            </div>
        </div>
    );
}

export default Page;
