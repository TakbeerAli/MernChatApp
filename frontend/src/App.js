import { Button, ButtonGroup } from '@chakra-ui/react'
import { Route } from 'react-router-dom';

import Home from "./Pages/Home";
import ChatPage from './Pages/ChatPage';
import './App.css';

function App() {
  return (
    <div className="App">
     <Route path="/" exact component={Home}/>
     <Route path="/chats" component={ChatPage} />     
    </div>
  );
}

export default App;
