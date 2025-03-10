import React from "react";

const Backdrop = (props: {show: boolean, clicked: () => void}) => (
    props.show? <div className="w-full h-full fiexd z-100 left-0 top-0 bg-pink" onClick={() => props.clicked}> </div> : null
);

export default Backdrop;