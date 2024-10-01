import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';
import ButtonComponent from './Component/Button';
import UseRef from './Component/UseRef';
import Stopwatch from './Component/Stopwatch';
import Debounce from './Component/Debounce';
import UndoRedo from './Component/UndoRedo';
import NestedComponent from './Component/NestedComments';
import Todo from './Component/Todo';
import Pagination from './Component/Pagination';
import OTPPage from './Component/OtpVerify';
import ChatGpt from './Component/ChatGpt';
import CodeEditorComponent from './Component/CodeEditor';
import LargeList from './Pages/LargeList';
import { ThemeProvider } from './Component/Context/ThemeContext';
import ToggleTheme from './Component/Context/TogglePage';

function App() {
  // const [form, setForm] = useState({name: '', age: ''})
  // const [data, setData] = useState([])
  // function submitBtn(){
  //   console.log(form)
  // }

  // function getData(){
  //   axios.get('https://jsonplaceholder.typicode.com/posts')
  //   .then((res)=> setData(res.data))
  //   .catch((err)=> console.log(err))
  // }

  // console.log(data)


  return (
    <ThemeProvider>
      {/* <ButtonComponent/> */}
      {/* <UseRef/> */}
      {/* <Stopwatch/> */}
      {/* <Debounce/> */}
      {/* <UndoRedo/> */}
{/* <NestedComponent/> */}
{/* <Todo/> */}
{/* <Pagination/> */}
{/* <OTPPage/> */}
{/* <ChatGpt/> */}
{/* <CodeEditorComponent /> */}
{/* <LargeList/> */}
<ToggleTheme />
      {/* <input type="text" name='name' onChange={(e)=> setForm({...form,name:e.target.value})}/>
      <input type="text" name='age' onChange={(e)=> setForm({...form,age:e.target.value})}/>
      <button onClick={submitBtn}>Click me</button>
      <button onClick={getData}>Show data</button>
      {data.length > 0 ? data.map((ele) => {
        return (<>
          <h2>{ele.id}</h2>
          <p>{ele.title}</p>
        </>)
      }) : <h2>No data</h2>} */}
    </ThemeProvider>
  )
}

export default App
