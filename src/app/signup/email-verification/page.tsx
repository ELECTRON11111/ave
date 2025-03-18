"use client";
import React, {ChangeEvent, useState} from 'react';
import { Mail } from "lucide-react";

const Page = () => {
    const [verificationCode, updateVerificationCode] = useState(["", "", "", "", "", ""]);

    const handleChange = (e:ChangeEvent, digit:string, index: number) => {
        // validate input - only allow numbers
    }

    const handleKeyDown = (e: any, digit: string, index: number) => {

    }

    return (
        <div id='email-verification-page' className='to-white min-h-screen p-8 py-12 md:flex md:justify-center md:items-center'>
            <div id="container" className='flex flex-col items-center md:border md:rounded md:shadow-inner md:p-8 md:w-fit'>
                <div className='rounded-full p-4 bg-purple-100 block w-fit'>
                    <Mail className='h-8 w-8 text-purple-500'/>
                </div>
                <form action="">
                    <div className="py-4 text-center">
                        <h1 className='text-2xl text-purple-900 text-center font-bold'>Email Verification</h1>
                        <p className='text-purple-600 text-sm py-1'>Enter the 6-digit code sent to your email</p>
                    </div>

                    <div id="input-fields" className='flex space-x-2'>
                        {verificationCode.map((digit: string, index: number) => (
                            <input 
                                key={index}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1} 
                                className='digit border border-gray-200 text-purple-900 rounded-md text-lg w-[3.6rem] text-center font-bold p-5 focus:border-purple-500 focus:ring-purple-500 focus:outline-none focus:border-2'
                                onChange={(e:ChangeEvent) => handleChange(e, digit, index)}
                                onKeyDown={(e) => handleKeyDown(e, digit, index)}
                                // value={digit}
                                autoFocus={index === 0} // autofocus on first digit
                            />
                        ))}
                    </div>
                    
                    {false ? // check if a response has returned
                        false? <p className='text-red-500 font-bold text-center py-4'>An Error has occured. Please try again.</p> // based on response success or error
                        : <p className='text-green-500 font-bold text-center py-4'>Your email had been successfully verified.</p>
                        : ""
                    }

                    <p className='text-purple-600 text-center py-4'>Didn't receive a code? <span className='text-purple-900 cursor-pointer'>Resend</span></p>

                    <button className='py-3 px-4 w-full text-center font-bold bg-purple-500 text-white rounded-lg my-4'>Verify Email</button>
                </form>
            </div>
        </div>
    );
}

export default Page;
 