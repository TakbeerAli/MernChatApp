import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./ProfileModel";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../../animations/typing.json";


import io from "socket.io-client";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import { ChatState } from "../../Context/ChatProvider";
const ENDPOINT = "http://localhost:5000"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
   const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false)
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  
  const { selectedChat, setSelectedChat, user, notification, setNotification } =  ChatState();

  const {data:{name,pic,token}} = user;

  // console.log("selectedchaat",selectedChat._id)
  console.log("userr",user)

  const fetchMessages =async () => {

  
    if(!selectedChat) return;
    
    

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      setLoading(true);

      const gettingAllMessagesById = await axios.get(`/api/message/${selectedChat._id}`,config).then((res) =>{
      
         
          setMessages(res.data);
          setLoading(false);
          
          socket.emit("join chat", selectedChat._id)
      });
      
    } catch (error) {
      toast({
        title: "Error Occured",
        discription:"Failed to send Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }

 

  //useEffect for real time msg

  // useEffect(()=>{
  // socket.on("message recieved",newMessageRecieved) => {
  //   if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id)
  //   {
  //     // give msg
  //   } else {
  //     setMessages([...messages, newMessageRecieved]);
  //   }
  // }
  // });
 

  const SendMessage = async (event) => {
   
    if(event.key === "Enter" && newMessage){
      socket.emit("stop typing", selectedChat._id);  
      try {
        // const config = {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   }
        // }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        setNewMessage("");
  
        ///////////
        const gettingRenameGroup = await axios.post(`/api/message`,{content:newMessage, chatId:selectedChat._id},config).then((res) =>{
          console.log(res.data);
           
             
            socket.emit("new message",res.data);
            setMessages([...messages, res.data]);
        });
  

        // const sendingMessage = await axios.post("api/message",{content:newMessage, chatId:selectedChat._Id},config).then((res) =>{
        //   console.log(res.data);
        //   setNewMessage("");
        //   setMessages([...messages, res.data]);
        // });
      } catch (error) {
        toast({
          title: "Error Occured",
          discription:"Failed to send Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }

  };

  /////////HOOKS//////
 // this useEffect for socket.io
 useEffect(() => {
  socket = io(ENDPOINT);
  socket.emit("setup", user);
  socket.on("connected", () => setSocketConnected(true));
  // socket for typing indicator
  socket.on('typing', ()=>setIsTyping(true));
  socket.on('stop typing', ()=>setIsTyping(false));
 },[])


  //when ever user switch to another chat it effect by selectedChat
useEffect(()=> {
fetchMessages();
selectedChatCompare = selectedChat;
},[selectedChat]);


 console.log(notification,"-----");
 useEffect(() => {
  socket.on("message recieved", (newMessageRecieved) => {
    if (
      !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
    ) {
      if (!notification.includes(newMessageRecieved)) {
        setNotification([newMessageRecieved, ...notification]);
        setFetchAgain(!fetchAgain);
      }
    } else {
      setMessages([...messages, newMessageRecieved]);
    }
  });
});












  ////////////////

  const typingHandler = (e) => {
   setNewMessage(e.target.value);

   // logic for typing indicator
   if(!socketConnected) return;
  

  if(!typing){
    setTyping(true);
    socket.emit("typing", selectedChat._id);
  }

  let lastTypingTime = new Date().getTime();
  var timerLength = 3000;
  setTimeout(() => {
    var timeNow = new Date().getTime();
    var timeDiff = timeNow - lastTypingTime;
    if (timeDiff >= timerLength && typing) {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }
  }, timerLength);

  };

  
  return  <>{
    selectedChat ? (
        <>
         <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
        >

            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                 {getSender(user,selectedChat.users)}
                 <ProfileModal user={getSenderFull(user,selectedChat.users)}/>
              </>
            ):(
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  
                   fetchAgain={fetchAgain}
                   setFetchAgain={setFetchAgain}
                   fetchMessages={fetchMessages}
                />
              </>
            )
            }

        </Text>

        {/* This is for messaging area */}
        <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        p={3}
        bg="#E8E8E8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
        >

        {loading ? (
          <Spinner
            size="xl"
            w={20}
            h={20}
            alignSelf="center"
            margin="auto"
          />
        ): (
           <div className="messages">
            <ScrollableChat messages={messages}/>
           </div>
        )}

        

        <FormControl onKeyDown={SendMessage} isRequired mt={3}>
        {istyping ? <div>
        <Lottie
          options={defaultOptions}
            // height={50}
            width={70}
            style={{ marginBottom: 15, marginLeft: 0 }}
        /></div> : <></>}
          <Input
            varient="filled"
            bg="#E0E0E0"
            placeholder="Enter a Message"
            value={newMessage}
            onChange={typingHandler}
          />
        </FormControl>

        </Box>
         </>
    ): (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work Sans">
          Click on a user to start Chat

          </Text>

        </Box>
    )
  }

  </>
    
  
};

export default SingleChat;