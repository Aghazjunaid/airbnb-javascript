import {useState} from 'react';
import axios from 'axios';

const ButtonComponent = () => {
    const [data,setData] = useState([]);
    const [form, setForm] = useState({name: '', age: ''});
    const [rev,setRev] = useState('');

    const btnClick = () => {
        axios.get('https://jsonplaceholder.typicode.com/posts')
        .then((res) => setData(res.data))
        .catch((err) => console.log(err));
    }

    const submitBtn = () => {
        console.log(form);
    }

    const handleChange = (e) => {
        setRev(e.target.value.split('').reverse().join(''));
    }
    
    return (
        <>
                <input type='text' name='name' onChange={(e) => setForm({...form, name:e.target.value})}/>
                <input type='number' name='age' onChange={(e) => setForm({...form, age:e.target.value})}/>
                <button onClick={submitBtn}>Submit</button >
            <br/>   
            <button onClick={btnClick}>click me</button>
            {data.length > 0 ? data.map((ele) => {
                return (
                    <div key={ele.id}>
                        <h2 >{ele.id}</h2>
                        <p>{ele.title}</p>
                    </div>
                )
            }) : <div>'No data'</div>}
            <p>{rev?rev:'no data'}</p>
            <input type='text' onChange={handleChange} />
        </>
    )
}

export default ButtonComponent;



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


const Debounce = () => {

    function debounce(cb,delay){
        let timer = null;
        return function(){
            if(timer) clearTimeout(timer);
            timer = setTimeout(()=>{
                cb(...arguments)
            },delay)
        }
    }

    const change = debounce((e)=> {
        console.log(e.target.value)
    },2000)

    return (
        <div>
            <h1>Debounce</h1>
            <input type='text' onChange={change}/>
        </div>
    )
}

export default Debounce;

import React, { useEffect, useRef } from 'react';

const EventListenerExample = () => {
    const divRef = useRef();

    useEffect(() => {
        const handleScroll = () => {
            console.log('Window scrolled');
        };

        window.addEventListener('scroll', handleScroll);

        // Clean up function
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    return <div ref={divRef}>Scroll the window</div>;
};

export default EventListenerExample;

import {useState, useEffect,Profiler} from 'react';

const Pagination = () => {
    const [data, setData] = useState(Array.from({length:100}).map((ele,i) => `Item ${i+1}`));
    const [currentData, setCurrentData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        setCurrentData(data.slice(0,limit))
        setTotalPage(Math.ceil(data.length/limit))
    },[limit])

    function nextClick(){
        if(currentPage < totalPage){
            setCurrentPage(currentPage + 1);
            setCurrentData(data.slice(currentPage*limit,(currentPage+1)*limit))
        }
    }

    function prevClick(){
        setCurrentPage(currentPage - 1);
        setCurrentData(data.slice((currentPage-2)*limit,(currentPage-1)*limit))
    }
    const handleRender = (id, phase, actualDuration) => {
        console.log({ id, phase, actualDuration });
      };

    return(
        <Profiler id="App" onRender={handleRender}>
            <div>Pagination Tutorial</div>
            {currentData.length > 0 && currentData.map((ele,i) => {
                return (
                    <div key={i}>
                        <p>{ele}</p>
                    </div>
                )
            })}
            <button onClick={nextClick} disabled={currentPage === totalPage} > Next </button>
            <select value={limit} onChange={(e) => setLimit(e.target.value)}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
            </select>
            <button onClick={prevClick} disabled={currentPage === 1}> Previous </button>
            <div>Total : {data.length}</div>
            <div>current page: {currentPage}</div>
            <div>Total page: {totalPage}</div>
        
      </Profiler>
    )
}

export default Pagination;

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

import {useState} from 'react';


const Todo = () => {
    const [data, setData] = useState([]);
    const [task, setTask] = useState('');
    const [update, setUpdate] = useState({});

    function handleClick(){
        if(update.id){
            let temp = [...data];
            temp = temp.map(ele => {
                if(ele.id == update.id){
                    ele.name = task;
                }
                return ele;
            })
            setData(temp);
            setTask('');
            setUpdate({});
        }else {
            let temp = [...data]; // create a new copy of data
            temp.push({
                id: Date.now(),
                name: task
            });
            setData(temp);
            setTask('');
        }
    }

    console.log(data)
    function handleDelete(id){
        setData(data.filter(ele => ele.id != id))
    }

    function handleUpadte(id){
        let newData = data.filter(ele => ele.id == id);
        setTask(newData[0].name);
        setUpdate({
            id: id,
            name: newData[0].name
        })
    }
    return (
        <>
            <div>Todo App</div>
            <input type='text' value = {task} onChange={(e) => setTask(e.target.value)}/>
            <button onClick={handleClick}>click me</button>
            <br/>
            <br/>
            <ul>
                {data.map(ele => {
                    return (                    
                        <div key={ele.id}>
                            <li >{ele.name}</li>
                            <a onClick={() => handleDelete(ele.id)}>delete</a>
                            <a onClick={() => handleUpadte(ele.id)}>update</a>
                        </div>
                    )
                })}
            </ul>
        </>
    )
}

export default Todo

import { useState } from "react";


const UndoRedo = ()=>{
    const [state, setState] = useState(null);
    const [history, setHistory] = useState([]);
    const [future, setFuture] = useState([]);

    const undo = () => {
        if(history.length > 0){
            setFuture([...future, state]);
            setState(history[history.length - 1]);
            setHistory(history.slice(0, history.length - 1));   
        }
    }

    const redo = () => {
        if(future.length > 0){
            setState(future[future.length - 1]);
            setFuture(future.slice(0, future.length - 1));
            setHistory([...history, state]);
        }
    }

    const set = () => {
        if(state){
            setHistory([...history, state]);
        }
        setState(Math.floor(Math.random()*1000));
    }
    return (<>
        <h1>{state}</h1>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={set}>click me</button>
    </>)
}

export default UndoRedo;

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
