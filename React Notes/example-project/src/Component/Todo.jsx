

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