

import { useState,useEffect } from "react";

const Stopwatch = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const reset = () =>{
        setTime(0);
    }

    useEffect(() => {
        let intervalId;
        if (isRunning) {
          // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
          intervalId = setInterval(() => setTime(time + 1), 1000);
        }
        return () => clearInterval(intervalId);
      }, [isRunning, time]);

    const startWatch = () => {
        setIsRunning(prev => !prev);
    };

     // Hours calculation
  const hours = Math.floor(time / 36000);

  // Minutes calculation
  const minutes = Math.floor((time) / 60);

  // Seconds calculation
  const seconds = time

    

    return <>
        <p className="stopwatch-time">
        {hours}:{minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </p>        <button onClick={startWatch}>{isRunning ? 'Stop' : 'Start'}</button>
        <button onClick={reset}>reset</button>
    </>;
};

export default Stopwatch;