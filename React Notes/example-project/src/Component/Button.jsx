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