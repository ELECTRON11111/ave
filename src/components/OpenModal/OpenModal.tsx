import React from 'react';

const OpenModal = (props: any) => {
    return (
        <div className={`${props.hidden? "hidden": ""} top-0 left-0 backdrop-brightness-[.2] z-[500] fixed w-full min-h-[100vh] 
        bg-[#0000001A] flex justify-center items-center`}>
            <div id="content" className='rounded-xl text-black bg-white p-2 mx-4 sm:p-4 md:w-[350px] md:text-2xl dark:bg-gray-900'>{props.children}</div>
        </div>
    );
}

export default OpenModal;