
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TypingEffect = ({ text, typingSpeed = 100 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setDisplayedText((prev) => prev + text[index]);
            index += 1;

            if (index === text.length-1) {
                clearInterval(timer);
            }
        }, typingSpeed);

        // Cleanup the interval on component unmount
        return () => clearInterval(timer);
    }, [text, typingSpeed]);

    return <div>{displayedText}</div>;
};

// Example usage
const ChatGpt = () => {

    const [data,setData] = useState('');

    const btnClick = () => {
        axios.get('http://localhost:3000/get-data')
        .then((res) => setData(res.data.payload))
        .catch((err) => console.log(err));
    }

    return (
        <div>
            <button onClick = {btnClick}>Click me</button>
            {data && <TypingEffect text={data} typingSpeed={100} />}
        </div>
    );
};

export default ChatGpt;