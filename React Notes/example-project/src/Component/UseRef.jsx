

import {useRef,useEffect}  from 'react';

const UseRef = () => {
    const inputRef = useRef(null);
    const textRef = useRef(null);

    console.log(inputRef);

    useEffect(()=> {
        inputRef.current.focus();
        textRef.current.innerText = 'Hello aj';
    },[])

    return (
        <>
            <input ref={inputRef} type='text'/>
            <p ref={textRef}>aj</p>
        </>
    )
}

export default UseRef;
