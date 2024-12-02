// // This is a general UI element that wraps some content - order summary
import React, { ReactElement } from "react";

// function Modal(props: {show: boolean, modalClosed: () => void, children: ReactElement}) {
//     return (
//         <>
//             <Backdrop show = {props.show} clicked={props.modalClosed}/>
//             <div 
//                 className="fixed z-[500] bg-white w-[70%] border border-[#ccc] p-[16px] left-[15%] top-[10%] box-border transition-all
//                 ease-out duration-300 translate-y-[-100vh] rounded-md sm:w-[500px] sm:left-[calc(50% - 250px)] md:left-[28%] lg:left-[34%]"
//                 style={{
//                     transform: props.show? "translateY(0)": "translateY(-100vh)",
//                     opacity: props.show? "1": "0"
//                 }}
//             >
//                 {props.children}
//             </div>
//         </>
//     )
// }
 
// export default Modal;

function Modal(props: {show: boolean, modalClosed: () => void, children: ReactElement}) {
    return (
        <>
            <div 
                className="fixed z-[2000] top-0 left-0 backdrop-brightness-[.2] w-full h-screen px-16 flex justify-center items-center"
                style={{
                    transform: props.show? "translateY(0)": "translateY(-100vh)",
                    opacity: props.show? "1": "0"
                }}
            >
                <div className="p-6 bg-white rounded-lg">{props.children}</div>
            </div>
        </>
    )
}
 
export default Modal;