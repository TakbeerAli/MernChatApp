import React,{useState} from 'react'
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import axios from "axios";
import {useHistory} from 'react-router-dom';



const Login = () => {
  const toast = useToast()
  const history = useHistory();

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [show, setShow] = useState(false);
    const [picLoading, setPicLoading] = useState(false);



    console.log(email,password)
    const handleClick = () => setShow(!show);


    const submitHandler = async()=> {
      setPicLoading(true);
      if( !email || !password){
        toast({
          title:"Please fil all the Fields",
          status:"warning",
          duration:5000,
          isClosable:true,
          position:"bottom",
        });
        setPicLoading(false);
        return;
      };

      try {
        const login = await axios.post(
          "/api/user/login",
          {
            email,
            password,
          }).then((res) =>{ 
            localStorage.setItem("userInfo", JSON.stringify(res));
            console.log(res);
            toast({
              title: "login Successful",
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "top-left",
            });
            setPicLoading(false); //neeed to watc
            history.push("/chats");// need to watch
          });
      } catch (error) {
        console.log(error);
        toast({
          title:"Error occure",
          description: error.response.data.message,
          status:"warning",
          duration:5000,
          isClosable:true,
          position:"bottom",
        });
        setPicLoading(false);
      }
      };

     
    

  return (
    <VStack spacing="5px">
        

        <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
                <Input
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
        </FormControl>


  
    
  
        <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
                <Input  
                   type={show?"text":"password"}
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword (e.target.value)}
                />
                <InputRightElement width="4.5rem">
                   <Button h="1.75rem" size="sm" onClick={handleClick}>
                 {show? "Hide":"Show"}
                    </Button>
                  </InputRightElement>
                 </InputGroup>
        </FormControl>

        
      


          
          <Button
           colorScheme="blue"
            width="100%"
            isLoading={picLoading}
            style={{marginTop: 15}}
            onClick={submitHandler}
          >
           Login
          </Button>

          <Button
          variant="solid"
           colorScheme="red"
            width="100%"
           
            style={{marginTop: 15}}
            onClick={() => {
                setEmail("Guest@gmail.com");
                setPassword("asdf");
            }}
          >
           Get Guest User Credientials
          </Button>

        
    </VStack>
  )
}

export default Login