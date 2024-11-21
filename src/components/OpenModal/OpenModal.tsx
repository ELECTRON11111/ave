import React from 'react';

const OpenModal = (props: any) => {
    return (
        <div className={`${props.hidden? "hidden": ""} top-0 left-0 backdrop-blur-[15px] z-[500] fixed w-full min-h-[100vh] 
        bg-[#0000001A] flex justify-center items-center`}>
            <div id="content" className='rounded-xl bg-white p-2 mx-4 sm:p-4'>{props.children}</div>
        </div>
    );
}

export default OpenModal;