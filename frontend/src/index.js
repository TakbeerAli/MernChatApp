import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from 'react-router-dom';
import ChatProvider from "./Context/ChatProvider";
import './index.css';
import App from './App';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
     <BrowserRouter>
       <ChatProvider>
           <App />
      </ChatProvider>
     </BrowserRouter>  
     </ChakraProvider>                   

);

