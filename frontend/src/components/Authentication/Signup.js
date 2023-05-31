import React,{useState} from 'react'
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'

import axios from "axios";
import {useHistory} from 'react-router-dom';

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast()
  const history = useHistory();


    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [pic, setPic] = useState();
    const [picLoading, setPicLoading] = useState(false);

   
 
   


    // this function is for pic uploading where we upload image to cloud then copy url and save in mongodb 
    const postDetails =(pics)=>{
        setPicLoading(true);
        if(pics === undefined){
          toast({
            title:"please select an image",
            status:"warning",
            duration:5000,
            isClosable:true,
            position:'bottom',
          });
          return;
        };

        if(pics.type === "image/jpeg" || pics.type === "image/png"){
          const data = new FormData();
          data.append("file", pics);
          data.append("upload_preset", "chatapp");
          data.append("cloud_name", "dzynuxyt1");
          fetch("https://api.cloudinary.com/v1_1/dzynuxyt1/image/upload", {
            method: "post",
            body: data,
          })
          .then((res) => res.json())
          .then((data) => {
            setPic(data.url.toString());
            console.log(data.url.toString());
            setPicLoading(false);
            })
            .catch((err) => {
              console.log(err);
              setPicLoading(false);
            });
        } else {
          toast({
            title:"please select an image",
            status:"warning",
            duration:5000,
            isClosable:true,
            position:'bottom',
          });
          setPicLoading(false); 
          return;
        }
    };

    const submitHandler = async() => {
        setPicLoading(true);
        if(!name || !email || !password || !confirmpassword){
          toast({
            title:"Please fil all the Fields",
            status:"warning",
            duration:5000,
            isClosable:true,
            position:"bottom",
          });
          setPicLoading(false);
          return;
        }

        if( password  !== confirmpassword){
          toast({
            title:"Password Do Not match",
            status:"warning",
            duration:5000,
            isClosable:true,
            position:"bottom",
          });
          return;
        }
        console.log("midd",name,email,password,confirmpassword,pic);
        try {
          const config = {
            headers:{
              "Content-type": "application/json",
            },
          };

          const registerUser = await axios.post(
            "/api/user",
            {
              name,
              email,
              password,
              pic,
            }).then((res) =>{ 
              localStorage.setItem("userInfo", JSON.stringify(res));
              console.log(res);
              toast({
                title: "Registration Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
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
        <FormControl id="name" isRequired>
            <FormLabel>Name</FormLabel>
                <Input
                    placeholder="Enter Your Name"
                    onChange={(e) => setName(e.target.value)}
                />
        </FormControl>

        <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
                <Input
                    placeholder="Enter Your Email"
                    onChange={(e) => setEmail(e.target.value)}
                />
        </FormControl>


  
    
  
        <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
                <Input
                   type={show?"text":"password"}
                    placeholder="Enter Your Password"
                    onChange={(e) => setPassword (e.target.value)}
                />
                <InputRightElement width="4.5rem">
                   <Button h="1.75rem" size="sm" onClick={handleClick}>
                 {show? "Hide":"Show"}
                    </Button>
                  </InputRightElement>
                 </InputGroup>
        </FormControl>

        
        <FormControl id="password" isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
                <Input
                   type={show?"text":"password"}
                    placeholder="Confirm Password"
                    onChange={(e) => setConfirmpassword (e.target.value)}
                />
                <InputRightElement width="4.5rem">
                   <Button h="1.75rem" size="sm" onClick={handleClick}>
                 {show? "Hide":"Show"}
                    </Button>
                  </InputRightElement>
                 </InputGroup>
        </FormControl>


        <FormControl id="pic" isRequired>
            <FormLabel>Upload your Picture</FormLabel>
                <Input
                type="file"
                p={1.5}
                accept="image/*"
                onChange={(e) => postDetails(e.target.files[0])}
                />
        </FormControl>
          
          <Button
           colorScheme="blue"
            width="100%"
            style={{marginTop: 15}}
            onClick={submitHandler}
            isLoading={picLoading}
          >
           Sign Up
          </Button>

        
    </VStack>
  )
}

export default Signup