"use client";
import React, {ChangeEvent, useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
    const [verificationCode, updateVerificationCode] = useState(["", "", "", "", "", ""]);
    const [isFormValid, updateIsFormValid] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [verificationStatus, updateVerificationStatus] = useState<"success" | "idle" | "error">("idle");

    const router = useRouter();

    useEffect(() => {
        const code = verificationCode.join("");
        code.length == 6 ? updateIsFormValid(true): updateIsFormValid(false);
    }, [verificationCode])

    const handleChange = (e:ChangeEvent<HTMLInputElement>, index: number) => {
        const code = [...verificationCode];
        const value = e.target.value;
        
        if (isNaN(parseInt(value))) {
            // not a number
            code[index] = "";
            updateVerificationCode(code);
            e.target.value = "";
            
            return;
        } else {
            // a number
            code[index] = value;
            updateVerificationCode(code);
            e.target.value = value;

            // move to next input element
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    }

    const handleKeyDown = (e: any, digit: string, index: number) => {
        if (e.key == "Backspace" && index != 0) {
            // empty the current input (done by default - change event) and focus on the previous
            const previousInput = document.getElementById(`code-${index - 1}`);
            if (previousInput) previousInput.focus();

            // manually removing content
            const code = [...verificationCode];
            code[index] = "";
            e.target.value = "";
            updateVerificationCode(code);
        }

        if (e.key == "ArrowRight") {
            const nextInput = index == 5? document.getElementById(`code-${0}`): document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }

        if (e.key == "ArrowLeft") {
            const previousInput = index == 0? document.getElementById(`code-${5}`): document.getElementById(`code-${index - 1}`);
            if (previousInput) previousInput.focus();
        }
    }

    const handleVerification = (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        const code = [...verificationCode].join("");

        setTimeout(() => {
            if (code == "123466") {
                updateVerificationStatus("success");

                // move user to login
                router.push("/");
            } else {
                updateVerificationStatus("error");

                // place focus on last input for user to re-enter code
                document.getElementById(`code-5`)?.focus();
            }
            setLoading(false);
        }, 3000);

        try {

        } catch (error) {

        } finally {
            // setLoading(false);
        }
    }

    return (
        <div id='email-verification-page' className='to-white min-h-screen p-8 py-12 md:flex md:justify-center md:items-center'>
            <div id="container" className='flex flex-col items-center md:border md:rounded md:shadow-inner md:p-8 md:w-fit'>
                <div className='rounded-full p-4 bg-purple-100 block w-fit'>
                    {/* mail icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"     className="size-8 text-purple-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                </div>
                <form action="">
                    <div className="py-4 text-center">
                        <h1 className='text-2xl text-purple-900 text-center font-bold'>Email Verification</h1>
                        <p className='text-purple-600 text-sm py-1'>Enter the 6-digit code sent to your email</p>
                    </div>

                    <div id="input-fields" className='flex space-x-2'>
                        {verificationCode.map((digit: string, index: number) => (
                            <input 
                                id={`code-${index}`}
                                key={index}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1} 
                                className='digit border border-gray-200 text-purple-900 rounded-md text-lg w-[3.6rem] text-center font-bold p-5 focus:border-purple-500 focus:ring-purple-500 focus:outline-none focus:border-2'
                                onChange={(e:ChangeEvent<HTMLInputElement>) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, digit, index)}
                                // value={digit}
                                autoFocus={index === 0} // autofocus on first digit
                            />
                        ))}
                    </div>
                    
                    {!loading && verificationStatus !== "idle" ? // check if a response has returned
                        (verificationStatus == "error"? <p className='text-red-500 font-bold text-center py-4 pt-6'>An Error has occured. Please try again.</p> // based on response success or error
                        : <p className='text-green-500 font-bold text-center py-4 pt-6'>Your email has been successfully verified.</p>)
                        : ""
                    }

                    <p className='text-purple-600 text-center py-4'>Didn&apos;t receive a code? <span className='text-purple-900 cursor-pointer'>Resend</span></p>

                    <button className='py-3 px-4 w-full text-center font-bold bg-purple-500 cursor-pointer text-white rounded-lg my-4 disabled:opacity-50' disabled={!isFormValid || loading} onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleVerification(e)}>
                        {loading? "Verifying ...": "Verify Email"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Page;
 