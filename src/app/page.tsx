"use client";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Alert from "@/components/Alert/Alert";
import Modal from "@/components/Model/Model";
import process from "process"

// Home is the login page
export default function Home () {
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}`;
  const [isStudent, changeIsStudent] = useState(false);
  const [loading, updateLoading] = useState(false);
  const [showAlert, updateShowAlert] = useState(false);
  const [alertMessage, updateAlertMessage] = useState("");
  const [adminToken, updateAdminToken] = useState("");
  const [studentToken, updateStudentToken] = useState("");
  const [submitDisabled, updateSubmitDisabled] = useState(true);
  const [showDisclaimer, updateShowDisclaimer] = useState(true);
  const [error, updateError] = useState({
    state: false,
    message: ""
  });
  const [formData, updateFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const router = useRouter();
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
    const admin_token = localStorage.getItem("token");
    const student_token = localStorage.getItem("student_token");

    if (admin_token || student_token) router.replace(`${admin_token? "/dashboard/admin": "/dashboard/student"}`);
  }, []);

  const spanClickHandler = (newState:boolean) => {
    changeIsStudent(newState);
  }

  const sendFormData =  async () => {
    updateSubmitDisabled(true);
    // if token is not expired, send user to dashboard
    if (adminToken || studentToken) router.replace(`${adminToken? "/dashboard/admin": "/dashboard/student"}`);

    updateLoading(true);
    let token = "";
    try {
      const response = await axios.post(`${baseUrl}/auth/token`, {
        "username": formData.email,
        "password": formData.password,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "x-api-key": `${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        
      });
      updateLoading(false);
      updateSubmitDisabled(false);

      console.log(response);
      
      // update token variable
      if (typeof response !== 'undefined') {
        token = response.data.session_token;
      } else {
        updateError({state: true, message: "Network Error. Please check your connection and try again."});    
      }
      
      // Save Session token to local storage
      if (response.data.role == "student") {
        localStorage.setItem("student_token", response.data.session_token); // 
        localStorage.setItem("user_name", response.data.username);
      } else {
        localStorage.setItem("token", response.data.session_token); // type "bearer"
        localStorage.setItem("user_name", response.data.username);
      }
      
      // Dynamically route the user based on their role
      router.push(`/dashboard/${response.data.role}`);
    } catch (error:any) {
      console.log(error);
      updateLoading(false);
      if (error.message == "Network Error") {
        updateError({state: true, message: "There was a network error. Please check your connection and try again."});
      }

      if (error.response.data.detail){
        updateError({state: true, message: error.response.data.detail});
      } else {
        console.log(error);

        // Show Alert component
        updateShowAlert(true);
        updateAlertMessage("An error occured. Please try again.");
      }

      updateSubmitDisabled(false);
    }
  }

  const handleChange = (event: any) => {
    event.persist();
    const { name, value, type, checked } = event.target;

    // Take previous state and update only the input field changed.
    updateFormData(prevState => ({
      ...prevState,
      [name]: type === "checkbox"? checked: value
    }));

    // const submitDisabled = formData.email == "" && formData.password == "";
    let submitDisabled = formData.email == "" && formData.password == "" || formData.email !== "" && formData.password == "" || formData.email == "" && formData.password !== "";
    submitDisabled = formData.password === "" && formData.email !== ""? true : false;

    updateSubmitDisabled(submitDisabled);
  }

  return (
    <div id="login" className="w-full bg-white p-4 py-8 md:flex md:flex-col md:justify-center md:px-60 md:pb-16">
      <Modal show={showDisclaimer} modalClosed= {() => updateShowDisclaimer(false)}>
        <div className="flex flex-col gap-4">
          <h1 className="text-center font-extrabold">Important notice!</h1>
          <ul className="flex flex-col gap-2 text-sm sm:text-base">
            <li>1. This site is more optimized to mobile</li>
            <li>2. Consider switching to mobile for better accuracy</li>
          </ul>
          <button 
            className="w-full py-2 px-auto bg-purple-500 text-center text-white rounded-lg hover:bg-purple-700" 
            onClick={() => updateShowDisclaimer(false)}
          >
            Ok
          </button>
        </div>
      </Modal>

      <Alert message={alertMessage} show={showAlert} closeAlert={() => {updateShowAlert(prev => !prev); router.push("/#login")}}/>
      <div id="head" className="my-8">
        <h1 className="my-2 text-3xl font-extrabold md:text-center">Login to AVE.</h1>
        <h1 className="text-purple-600 md:text-center">Enter your Login details.</h1>
        <div id="links" className="m-4 flex justify-around">
          <span className={`border-b-2 p-2 cursor-pointer select-none ${isStudent? "border-b-purple-500": ""}`} onClick={() => changeIsStudent(true)}>Student</span>
          <span className={`border-b-2 p-2 cursor-pointer select-none ${!isStudent? "border-b-purple-500": ""}`} onClick={() => changeIsStudent(false)}>Admin (Lecturer)</span>
        </div>
      </div>
      
      <form action="#" className="flex flex-col justify-around" onSubmit={(e) => e.preventDefault()}>
        <input name='email' className="input" onChange={(e) => handleChange(e)} placeholder={`Enter ${isStudent? "Student Email or Matric Number": "Admin Email or ID Number" }`} />
        <input type="password" name='password' className="input" onChange={(e) => handleChange(e)} placeholder="Password" />
        
        {error.state? <p className='text-red-500'>{error.message}</p>: ""}
        
        <button 
          type="submit" 
          disabled={submitDisabled}
          onClick={sendFormData}
          className="my-4 p-2 w-full bg-purple-600 rounded text-white transition duration-300 ease-out hover:shadow-lg disabled:opacity-50"
        >
          {loading? Spinner: "Login"}
        </button>
      </form>

      <p className="my-2 text-md">Don&apos;t have an account? <Link href={"/signup"} className="font-light underline">   Sign Up</Link></p>
      <p className="my-2 text-md">Forgotten Password? <Link href={"/forgot-password"} className="font-light underline">   Reset Password</Link></p>
    </div>
  )
}