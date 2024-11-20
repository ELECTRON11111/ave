"use client";
import axios from "axios";
import { useEffect, useState } from "react";
// import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Modal from "@/components/Model/Model";

export default function Signup():any {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
    const router = useRouter();
    const [formData, updateFormData] = useState({
        name: "",
        email: "",
        password: "",
        id: "",
        role: "student",
        areTermsAgreed: false
    });
    const [showModal, updateShowModal] = useState(false);
    const [wasPostSuccessful, updateWasPostSuccessful] = useState(false);

    const [isFormReady, updateIsFormReady] = useState(false);

    const [emailErrorState, updateEmailErrorState] = useState(true);
    const [idErrorState, updateIdErrorState] = useState(true);
    const [passwordErrorState, updatePasswordErrorState] = useState(true);
    const [errorState, updateErrorState] = useState(emailErrorState || passwordErrorState);
    const [errorMessage, updateErrorMessage] = useState("");
    const [loading, updateLoading] = useState(false);

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
        // On page load/component mount, clear all form inputs 
        updateFormData({
            name: "",
            email: "",
            password: "",
            id: "",
            role: "student",
            areTermsAgreed: false
        });
        updateIsFormReady(false);
        updateErrorState(true);
        updateErrorMessage("");
        updateShowModal(false);
        updateWasPostSuccessful(false);
        updateLoading(false);

        // Check if token is ready and move to respective dashboards
    }, [])

    const sendFormData =  async () => {
        try {
            const response = await axios.post(`${baseUrl}/auth/create_user/`, {
                "user_matric": formData.id,
                "username": formData.name,
                "password": formData.password,
                "role": formData.role,
                "email": formData.email,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response);

            updateShowModal(true);
            updateWasPostSuccessful(true);
            updateLoading(false);
            updateErrorMessage("");
        } catch (error:any) {
            console.log(error);
            updateShowModal(true);
            updateWasPostSuccessful(false);
            updateErrorMessage(error.response.data.detail);
            updateLoading(false);
        }
    }

        
    const submitHandler = (e:any) => {
        e.preventDefault();
        updateLoading(true);
        // console.log("Form Submitted", formData);
        updateIsFormReady(true);
        sendFormData();
    }

    const handleEmailError = (e: any) => {
        if (e.target.value === "") {
            updateEmailErrorState(true);
        } else {
            updateEmailErrorState(false);
        }

        updateErrorState(emailErrorState && passwordErrorState)
    }
    
    const handleIdError = (e: any) => {
        if (e.target.value === "") {
            updateErrorState(true);
        } else {
            updateIdErrorState(false);
        }

        updateErrorState(idErrorState && passwordErrorState)
    }

    const handleConfirmPassword = (e: any) => {
        if (e.target.value !== formData.password) {
            updatePasswordErrorState(true);
        } else if (e.target.value == "") {
            updatePasswordErrorState(true);
        } else {
            updatePasswordErrorState(false);
        }
        
        updateErrorState(emailErrorState && passwordErrorState)
    }

    const handleChange = (event: any) => {
        event.persist();
        const { name, value, type, checked } = event.target;

        // Take previous state and update only the input field changed.
        updateFormData(prevState => ({
            ...prevState,
            [name]: type === "checkbox"? checked: value
        }));
    }
     
    return (
        <div id="login" className="w-full bg-white p-4 py-8 md:flex md:flex-col md:justify-center md:px-60 md:pb-16">
            <Modal show={showModal} modalClosed = {() => updateShowModal(false)}>
                <div className="text-red h-[60vh] my-10 gap-5 mx-2 flex flex-col items-center">
                    <Image src={wasPostSuccessful? "/success.svg" :"/warning.svg"} className="mx-auto mt-5" width={50} height={50} alt="error-icon"/>

                    {wasPostSuccessful? 
                        <h1 className="font-extrabold text-lg text-center"> Congratulations, <br />You registered successfully!</h1>
                        : <h1 className="font-extrabold text-lg text-center"> Unfortunately, <br />There was an Error!</h1>
                    }

                    {wasPostSuccessful? "" :<p className="text-xs">Consider the error message below</p>}

                    {wasPostSuccessful? 
                        ""
                        :<h3 className={`pt-4 font-bold text-red-600 text-center`}>{errorMessage != ""? errorMessage: "Kindly check your network connecttion"}</h3>
                    }

                    {wasPostSuccessful?     
                        <button className="py-2 px-4 w-full border rounded mt-auto cursor-pointer
                        transition duration-300 ease-out hover:border-green-600" 
                        onClick={(e) => {
                            // restore defaults
                            updateShowModal(false); 
                            updateWasPostSuccessful(false);
                            
                            //  Redirect user to the log in page
                            router.push(`/#login`);
                        }}>Proceed to login.</button>
                        : <button className="py-2 px-4 w-full border rounded mt-auto cursor-pointer
                        transition duration-300 ease-out hover:border-red-600" 
                        onClick={(e) => {updateShowModal(false); updateWasPostSuccessful(false)}}>Close</button>
                    }
                </div>
            </Modal>

            <div id="head" className="my-8">
                <h1 className="my-2 text-3xl md:text-center">Sign Up with AVE.</h1>
                <h1 className="text-purple-600 md:text-center">
                    Input your details <span className="hidden sm:inline">||</span><br className="sm:hidden"/> Create an admin/student account.
                </h1>
            </div>
            
            <form action="#" className="flex flex-col justify-around" onSubmit={(e) => submitHandler(e)}>
                <input type="name" name="name" className="input" onChange = {(e:any) => {handleChange(e);}} placeholder={`Enter your full name`} />
                <input type="email" name="email" className="input" onChange = {(e:any) => {handleChange(e); handleEmailError(e)}} placeholder={`Enter your email`} />
                <input type="text" name="id" className="input" onChange = {(e:any) => {handleChange(e); handleIdError(e)}} placeholder={`Enter your ID/Matric number`} />
                <input type="password" name="password" onChange = {(e) => {handleChange(e); handleConfirmPassword(e)}} className="input" placeholder="Enter Password" />
                <input type="password" className="input" onChange = {(e) => handleConfirmPassword(e)} placeholder="Confirm Password" />

                {
                    passwordErrorState ? <p className="text-red-700 text-sm">Passwords do not match.</p>
                                : <p className="text-green-700 text-sm">Passwords match, continue ..</p>
                } 

                <select name="role" defaultValue={"student"} onChange = {(e) => handleChange(e)} id="role" className="input text-gray-400">
                    <option value="student">Student</option>
                    <option value="admin">Lecturer (admin)</option>
                </select>

                <div id="terms_and_services" className="flex gap-2 items-baseline">
                    <input type="checkbox" onChange={(e) => {handleChange(e)}} name="areTermsAgreed" />
                    <span> I agree to the <Link href={"#"} className="font-light underline">terms and Conditions.</Link></span>
                </div>
                
                <button type="submit" className={`${formData.areTermsAgreed && !errorState? "opacity-100": "opacity-60"} my-4 p-2 w-full bg-purple-600 rounded text-white transition duration-300 ease-out hover:shadow-lg`} disabled={!(formData.areTermsAgreed && !errorState)}>
                    {loading ? Spinner: "Submit"}
                </button>
                
                {errorState? <p className="text-md text-red-700">Error, Fill all form inputs.</p>: ""}
            </form>

            <p className="my-2 text-md">Already have an account? <Link href={"/#login"} className="font-light underline">   Log In</Link></p>
        </div>
    )
}
