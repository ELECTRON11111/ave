"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/Model/Model";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Alert from "@/components/Alert/Alert";
import OpenModal from "@/components/OpenModal/OpenModal";
import AuthenticatedNav from "@/components/AuthenticatedNav/AuthenticatedNav";

function Admin_dashboard() {
    // Get user co-ordinates here, take longitude and latitude
    const [location, setLocation] = useState({
        latitude: 0,
        longitude: 0,
    });
    const [isSessionExpired, updateIsSessionExpired] = useState(false);
    const [NavHidden, changeNavHidden] = useState(true);
    const [classStarted, updateClassStarted] = useState(false);
    const [loading, updateLoading] = useState(false);
    const [geofences, updateGeofences] = useState([]);
    const [geofencesByThisAdmin, updateGeofencesByThisAdmin] = useState([]);
    const [loadingActiveClasses, updateLoadingActiveClasses] = useState(false);
    const [classStartedLoading, updateClassStartedLoading] = useState(false);
    const [isTimeInputValid, updateIsTimeInputValid] = useState(false);
    const [alertMessage, updateAlertMessage] = useState("");
    const [showAlert, updateShowAlert] = useState(false);
    const [showLogoutModal, updateShowLogoutModal] = useState(false);
    const [error, updateError] = useState({
        state: false,
        message: "",
    });
    const [jwtToken, setJwtToken] = useState("");
    const [decodedToken, setDecodedToken] = useState({
        sub: '', 
        username: '', 
        role: 'admin', 
        user_matric: '', 
        duration: 30
    });
    const [code, updateCode] = useState("");
    const [formData, updateFormData] = useState({
        className: "",
        radius: 0,
        duration: 30,
        start_time: ""
    });

    const router = useRouter();
    const pathName = usePathname();

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
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords;
                setLocation({ latitude, longitude });
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, [])

    useEffect(() => {
        // Get JWT token
        const token:any = localStorage.getItem('token');
        if (token == null || token == "" || isSessionExpired) {
            // router.push("/#login");
            updateIsSessionExpired(true);
        } else {
            // console.log(token);
            setJwtToken(token);
            setDecodedToken(jwtDecode(token));
            updateIsSessionExpired(false);
        }

        // Get geolocation
        getGeolocation();

        // If the above fails, use the method below.
        if (location.latitude == 0 && location.longitude == 0) {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(({ coords }) => {
                    const { latitude, longitude } = coords;
                    // setLocation({ latitude, longitude });
                });
            } else {
                console.log("Geolocation is not supported by this browser.");
            }
        }

        return () => {
            // clean up function 
            localStorage.setItem("sessionExpired", JSON.stringify(isSessionExpired));
        }
    }, [isSessionExpired]);

    useEffect(() => {
        if (jwtToken != "") getClassesCreatedByMe();
    }, [jwtToken])

    const burgerClickedHandler = (e: any) => {
        e.preventDefault();

        // change NavHidden value and maintain state immutability
        const value = NavHidden;
        changeNavHidden(!value);
    }

    const getGeolocation = async () => {

        try {
            const response = await fetch(
                `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`, 
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}) // Google Geolocation API expects an empty body
                }
            );
        
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error:", errorData);
                return;
            }
        
            const data = await response.json();
            console.log("Location data:", data);
        } catch (error) {
            console.error("Fetch error:", error);
        }
        

    }

    const handleChange = (event: any) => {
        event.persist();
        const {name, value} = event.target;

        if (name == "start_time") {
            if (event.target.validity.valid) {
                updateIsTimeInputValid(true)
            } else {
                updateIsTimeInputValid(false);
            } 
        }

        updateFormData(prevState => ({...prevState, [name]: value}));
    }

    const classCancelledHandler = () => {
        updateClassStarted(false);
    }
    
    function getCurrentFormattedDate(addMinutes = 0, time = "", start_date_time = "") {
        // If addMinutes is provided and non-zero, use start_date_time if available, otherwise use the current date
        const baseDate = (addMinutes !== 0 && start_date_time) ? new Date(start_date_time) : new Date();
    
        let hours:any, minutes:any;
    
        // If a time is provided (in HH:mm format), update hours and minutes
        if (time != "") {
            hours = time.split(":")[0];
            minutes = time.split(":")[1];
    
            // Set hours and minutes based on the provided time
            baseDate.setHours(hours);
            baseDate.setMinutes(minutes);
        }
    
        // If addMinutes is non-zero, clone the baseDate object and add the specified number of minutes
        const updatedDate = new Date(baseDate.getTime() + addMinutes * 60000);
    
        const year = updatedDate.getFullYear();
        const month = String(updatedDate.getMonth() + 1).padStart(2, '0');
        const day = String(updatedDate.getDate()).padStart(2, '0');
        const hours_main = String(updatedDate.getHours()).padStart(2, '0');
        const minutes_main = String(updatedDate.getMinutes()).padStart(2, '0');
        const seconds = String(updatedDate.getSeconds()).padStart(2, '0');
        const milliseconds = String(updatedDate.getMilliseconds()).padStart(3, '0');
    
        // Return the formatted date string, adjusting for provided time or default to updatedDate time
        return `${year}-${month}-${day}T${time != "" ? hours : hours_main}:${time != "" ? minutes : minutes_main}:00.${0}`;
    }
    

    const getMinTime = () => {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        const currentMinute = currentDate.getMinutes();

        // Define the lower bound (6:00)
        const lowerBoundHour = 6;
        const upperBoundHour = 22;

        // Ensure the time is between 6:00 AM and 10:00 PM
        if (currentHour < lowerBoundHour) {
            return '06:00';
        } else if (currentHour >= upperBoundHour) {
            // return '22:00'; // If the current time is beyond 22:00, restrict to max
        } else {
            // Return the current time formatted to 'hh:mm'
            return `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        }
    }

    const getClassesCreatedByMe = async () => {
        updateLoadingActiveClasses(true);
        // console.log(`This is the token taken for admin: ${jwtToken}`)
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/get_my_geofences_created/`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json"
                }
            });
            updateLoadingActiveClasses(false)
            if (response.data) {
                // console.log(response.data)
                updateGeofencesByThisAdmin(response.data.geofences);
            } else {
                console.log(response.data)
            }
        } catch (error:any) {
            console.log(error);
            updateLoadingActiveClasses(false);

            if (!error.response.data) return

            if (error.response.data?.detail?.includes("not validate user") || error.response.data.detail?.includes("Not enough permissions")) {
                // alert(error.response.data.detail); Show error alert
                updateAlertMessage("Sorry, your session expired.");
                updateShowAlert(true);

                // Delete the token
                localStorage.removeItem('token');
            }
        }
    }

    const classStartedHandler = async () => {
        updateClassStartedLoading(true);
        getGeolocation();

        // get current date and time
        const now = getCurrentFormattedDate(0, formData.start_time);
        const endTime = getCurrentFormattedDate(formData.duration, "", now);

        // Determine how many minutes away from from start date then add to start time
        
        console.log(location);
        console.log(formData, `start_time: ${now}, end_time: ${endTime}`);
        // Send user location, generated code, name and radius to backend server 
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/create_geofences/`, {
                "name": formData.className,
                "latitude": location.latitude,
                "longitude": location.longitude,
                "radius": formData.radius,
                "fence_type": "circle",
                "start_time": now,
                "end_time": endTime,
            }, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json"
                }
            });

            // console.log(response); // response in form {data: {code: "", name: ""}}
            updateCode(response.data.Code);
            updateLoading(false);
            updateClassStartedLoading(false);
            updateError({message: "", state: false});
            
            router.push('/dashboard/admin/class');
            localStorage.setItem("classData", JSON.stringify({...response.data, date: now}));
        } catch (error:any) {
            // console.error(error);
            if (error.response.data.detail) {
                updateError({message: error.response.data.detail, state: true});
            } else {
                updateError({message: error.response, state: true});
            }

            updateClassStartedLoading(false);
            console.log(error.response.data.detail);

            if (!error.response.data) {
                updateError({message: "Newtwork Error, please check your network", state: true});
                updateIsSessionExpired(true);
                return;
            }

            if (error.response.data.detail.includes("not validate user")) {
                // alert(error.response.data.detail);
                // Delete the token
                localStorage.removeItem('token');
                
                updateAlertMessage("Sorry, your session expired");
                updateShowAlert(true); 
            }
        }
    }


    async function classRecordClicked(event: any, geofence:any) {
        event.preventDefault();
        
        // update the local storage class Data to that of clicked class.
        localStorage.setItem("classData", JSON.stringify({Code: geofence.fence_code, name: geofence.name, date: geofence.start_time}));

        router.push('/dashboard/admin/class');
    }

    const handleLogout = () => {
        // delete the token and redirect user back to the home page
        localStorage.removeItem("token");
        localStorage.removeItem("admin_token");
        router.push("/#login");
    }

    return (
        <main className="">
            <Alert message={alertMessage} show={showAlert} closeAlert={() => {
                updateShowAlert(prev => !prev); 
                localStorage.removeItem("token"); 
                router.push("/#login");
            }}/>
            <Modal show={classStarted} modalClosed= {() => classCancelledHandler}>
                <div className="flex flex-col items-center justify-center w-full h-full py-4 md:py-20 px-6 gap-5 rounded">
                    <h1 className="text-2xl font-bold text-center">Select Geofence.</h1>

                    <p className="text-center text-gray-500">Your class code would be generated</p>
                    {/* <p className="text-center text-gray-500">Your class code is <span className="font-bold">{code}</span></p> */}

                    <form action="" className="flex flex-col items-center justify-center">
                        <input type="name" name="className" onChange = {(e) => handleChange(e)} className="input w-[130%] px-5" placeholder={`Enter class name`} />
                        {/* <input type="number" name="radius" onChange = {(e) => handleChange(e)} className="input w-[130%]" min={5} placeholder={`Enter valid radius e.g 150`} /> */}
                        <select name="radius" defaultValue={10} onChange = {(e) => handleChange(e)} onBlur={(e) => handleChange(e)} id="radius" 
                        className="input w-[130%] text-gray-500" aria-placeholder="Select class duration.">
                            <option value="20">Small Classroom e.g B4 (10m)</option>
                            <option value="50">Medium Classroom e.g B6 (20m)</option>
                            <option value="40">Large Class e.g ELT (30m) </option>
                            <option value="130">Extra-Large Hall e.g LT2 (100m)</option>
                        </select>

                        <label htmlFor="time" className="">Input the start time:</label>
                        <input type="time" name="start_time" id="start_time" min={getMinTime()} 
                        className="input w-[130%] text-gray-500" placeholder="Select start time" onChange={(e) => handleChange(e)} onBlur={(e) => handleChange(e)}/>
                        {/* <input type="time" name="start_time" id="start_time" min={getMinTime()} max={"22:00"}
                        className="input w-[130%] text-gray-500" placeholder="Select start time" onChange={(e) => handleChange(e)} onBlur={(e) => handleChange(e)}/> */}

                        {!isTimeInputValid ? <p className="text-sm text-red-500">Enter a valid time</p>: ""}
                        
                        <select name="duration" defaultValue={30} onChange = {(e) => handleChange(e)} onBlur={(e) => handleChange(e)} id="duration" 
                        className="input w-[130%] text-gray-500" aria-placeholder="Select class duration.">
                            <option value="30">Class duration - 30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="90">1 hour 30 minutes</option>
                            <option value="120">2 hours</option>
                        </select>
                    </form>

                    { error.state && !loading? 
                        <div className=" text-sm text-center text-red-500">{error.message}</div>
                        : ""   
                    }

                    {classStartedLoading? Spinner: 
                        <div className="flex justify-center mt-4">
                            <button onClick={classCancelledHandler} className="px-4 py-2 bg-purple-500 text-white hover-effect 
                            rounded-md hover:scale-105 hover:bg-purple-950">Cancel</button>
                            <button onClick={classStartedHandler} className="px-4 py-2 bg-purple-500 text-white hover-effect 
                            rounded-md ml-4 hover:scale-105 hover:bg-purple-950 disabled:opacity-50 disabled:cursor-pointer" disabled={!isTimeInputValid}>Confirm</button>
                        </div>
                    }
                </div>
            </Modal>

            {/* admin navigations */}
            {/* LOGOUT MODAL */}
            <OpenModal hidden = {!showLogoutModal}>
                <div className='flex flex-col p-8 px-2 gap-12 md:gap-16 text-sm'>
                    <h1 className='font-bold text-xl text-black text-center sm:text-2xl md:text-4xl'>Are you sure you want to log out?</h1>
                    <div className='flex gap-3 justify-center w-full md:scale-125'>
                        <button 
                            onClick={() => handleLogout()}
                            className='text-red-500 border border-red-500 px-3 py-2 rounded hover-effect hover:text-white hover:bg-red-500'
                        >
                            Yes, leave
                        </button>
                        <button 
                            onClick={() => updateShowLogoutModal(false)}
                            className='text-green-500 border border-green-500 px-3 py-2 rounded hover-effect hover:text-white hover:bg-green-500'
                        >
                            No, go back
                        </button>
                    </div>
                </div>
            </OpenModal>

            <AuthenticatedNav handleLogout={() => updateShowLogoutModal(true)}/>
            

            <div id="topSection" className="flex items-center justify-center mt-20 gap-16 my-6">
                {/* Input first name from backend */}
                {/* <div>Long: {location.longitude}, Lat: {location.latitude}</div> */}
                <div id="left-of-section" className="flex flex-col gap-5 mx-10">
                    <div className="flex gap-2 items-center justify-center">
                        <h1 className="text-3xl font-bold">Hello there, <span className="text-purple-700 pl-1">{decodedToken.username}</span>.</h1>
                        <Image src= "/pngwing.com.png" width={"34"} height={"34"} alt="crown"/>
                    </div>

                    <h3>You&apos;re an admin! don&apos;t know what to do?</h3>

                    <ul className="list-disc">
                        <li>Start a class.</li>
                        <li>Unique class code is generated.</li>
                        <li>Choose geofence.</li>
                        <li>See students attendace and end session.</li>
                    </ul>
                </div>

                <Image src="/location_vector.svg" width={"320"} height={"120"} className="hidden md:inline-block" alt="location vector"/>
            </div>

            <div id="Class_and_past_attendance" className="flex flex-col items-center justify-center my-10 mx-auto gap-4">
                <button 
                    className="w-[70%] bg-purple-700 py-2 rounded text-white hover-effect hover:scale-105"
                    onClick={(e) => updateClassStarted(true)}
                >
                    Start a class.
                </button>
                <button 
                    onClick={(e) => {getClassesCreatedByMe()}}
                    className="w-[70%] border-2 border-purple-700 py-2 bg-inherit rounded text-purple-700 hover-effect hover:scale-105"
                >
                    Get your classes.
                </button>
            </div>
            
            <div id="classes_created_by_admin" className="px-6">
                {geofences.length !== 0 ? <h1 className="text-center py-2 font-bold">These are your created classes.</h1>: ""}

                {loadingActiveClasses 
                    ? (<div className="w-full flex justify-center py-10">{Spinner}</div>)
                    : (<div id='fences_list' className='w-full grid grid-cols-2 gap-4 sm:grid-cols-4'>
                        {geofencesByThisAdmin.length !== 0 ? geofencesByThisAdmin.map((geofence:any, index) => (
                            <div key={index} 
                                onClick={(e):any => classRecordClicked(e, geofence)}  // record attendance when a class card is clicked
                                className='border-2 border-purple-400 px-2 py-2 rounded-md my-2 cursor-pointer hover-effect hover:scale-[102%]'
                            >
                                <div id='top-geofence-card' className='flex justify-between items-center'>
                                    <Image src='/classroom.svg' className='rounded-full' width={50} height={50} alt="class-room-vector"/>
                                    <span className='font-bold text-purple-500 text-sm sm:text-base'>{geofence.name}</span>
                                </div>
                                <div id='bottom-geofence-card' className='flex justify-between py-2 border-t-2 mt-3'>
                                    <span>{`${parseInt(geofence.start_time.slice(11,16).split(":")[0]) + 1}:${geofence.start_time.slice(11,16).split(":")[1]}`}</span>
                                    <div id='active-status-geofence-card' className='flex gap-2 items-center'>
                                        <span className={`w-[10px] h-[10px] rounded-full 
                                            ${geofence.status == "active"? "bg-green-500 text-green-500" 
                                                :(geofence.status == "scheduled"? "bg-yellow-500 text-yellow-500" : "bg-red-500 text-red-500")}`}
                                        ></span>
                                        {/** red or green dot depending on active status*/}
                                        <span>{geofence.status}</span>
                                    </div>
                                </div>
                            </div>
                        )): <div className='py-4 text-lg w-[90vw] flex justify-center text-center'>You have not created any class. <br /> Create one to take your attendace.</div>}

                    </div>)
                }
            </div>
        </main>
    )
}

export default Admin_dashboard;