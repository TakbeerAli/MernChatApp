const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");


  // this code is for one 1 one chat
    const accessChat = asyncHandler(async (req, res) => {
        const { userId } = req.body;
      
        // This all is for one 1 one chating
        if (!userId) {
          console.log("UserId param not sent with request");
          return res.sendStatus(400);
        }
      
        var isChat = await Chat.find({
          isGroupChat: false,
          $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
          ],
        })
          .populate("users", "-password")
          .populate("latestMessage");
      
        isChat = await User.populate(isChat, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
      
        if (isChat.length > 0) {
          res.send(isChat[0]);
        } else {
          var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
          };
      
          try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
              "users",
              "-password"
            );
            res.status(200).json(FullChat);
          } catch (error) {
            res.status(400);
            throw new Error(error.message);
          }
        }
      });

     // this is for geting all chats
    const fetchChats = asyncHandler(async(req, res) => {
        try {
        Chat.find({users: {$elemMatch:{ $eq: req.user._id}}})
        .populate("users", "-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updateAt: -1})
        .then(async (results)=> {
            results = await User.populate(results, {
                path:"latestMessage.sender",
                select:"name pic email",
            });

            res.status(200).send(results);
        });
        } catch (error) {
            res.status(400);
           throw new Error(error.message); 
        }
    });

    // creating logic for create Group Chat

    const createGroupChat = asyncHandler(async(req, res)=> {
      // body sending frontend dosent have name or user first all name & users
     if(!req.body.users || !req.body.name){
      return res.status(400).send({message:"Please fill all the fields"});
     }
     
     //from frontend it came in array type and here we change into object 
     var users = JSON.parse(req.body.users);

     // if user are less then 2 then group can't be created
     if(users.length < 2){
      return res.status(400).send("More then 2 users are required to create Group");
     }

     //currently logined user will aslo be part of group member 1st
     users.push(req.user);

     try {
          const groupChat = await Chat.create({
               chatName: req.body.name,
               users:users,
               isGroupChat: true,
               groupAdmin: req.user,
          })

          //when group create succesfully then send that group data to user
          const fullGroupChat = await Chat.findOne({_id: groupChat._id})
                               .populate("users", "-password")
                               .populate("groupAdmin", "-password");

                               res.status(200).json(fullGroupChat);
     } catch (error) {
        res.status(400);
        throw new Error(error.message);
     }
    });

    //creating logic for rename a group
    const renameGroup = asyncHandler(async(req, res)=>{
        const {chatId, chatName } = req.body;

        const updateChat = await Chat.findByIdAndUpdate( 
          chatId,
          {
            chatName:chatName
          },
          // new mean that chat is updated if we not give new it will return old name of chat
          {
            new: true,
          }
        )
          //-password mean not to show password or not to send
        .populate("users","-password")
        .populate("groupAdmin","-password");

        if(!updateChat){
          res.status(400);
          throw new Error("chat not found")
        }else{
          res.json(updateChat);
        }
    });

    // createing logic for the add member to group
    const addToGroup = asyncHandler(async(req, res)=>{
      //need GroupChatId and userId which we need to add
      const {chatId, userId} = req.body;

      //find the chat by ChatId and then push user in users array and update
      const added =await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: {users:userId},
        },
        {new: true}
      ).populate("users", "-password")
      .populate("groupAdmin","-password");

      if(!added){
        res.status(404);
        throw new Error("Chat Not Found");
      }else{
          res.json(added);
      }

    });


     // createing logic for to remove member from the group
     const removeFromGroup = asyncHandler(async(req, res)=>{
      //need GroupChatId and userId which we need to add
      const {chatId, userId} = req.body;

      //find the chat by ChatId and then push user in users array and update
      const removed =await Chat.findByIdAndUpdate(
        chatId,
        {
          $pull: {users:userId},
        },
        {new: true}
      )
      .populate("users", "-password")
      .populate("groupAdmin","-password");

      if(!removed){
        res.status(404);
        throw new Error("Chat Not Found");
      }else{
          res.json(removed);
      }

    });

module.exports = {accessChat, fetchChats, createGroupChat, renameGroup,addToGroup,removeFromGroup };