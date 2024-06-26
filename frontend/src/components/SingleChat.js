import React, { useEffect, useState } from 'react';
import { ChatState } from '../context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModel from './miscellanious/ProfileModel';
import UpdateGroupChatModel from './miscellanious/UpdateGroupChatModel';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../assets/typing.json'

const ENDPOINT = "http://localhost:5000";
const socket = io(ENDPOINT);
let typingTimeout;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification, isUserOnline } = ChatState();
    const toast = useToast()

    const [ messages, setMessages ] = useState([])
    const [ loading, setLoading ] = useState(false);
    const [ newMessages, setNewMessages ] = useState('');
    const [ socketConnected, setSocketConnected ] = useState(false);
    const [ isTyping, setIsTyping ] = useState(false);

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      renderSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
    
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
    
          setLoading(true);
    
          const { data } = await axios.get(
            `/api/message/${selectedChat._id}`,
            config
          );

          setMessages(data);
          setLoading(false);
    
          socket.emit("join chat", selectedChat._id);
        } catch (error) {
          toast({
            title: "Error Occurred!",
            description: "Failed to Load the Messages",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      };

    useEffect(() => {
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on('typing', () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));

      
    }, [user]);

    useEffect(() => {
        fetchMessages();
    }, [selectedChat]);

    useEffect(() => {
      socket.on("message received", (newMessageReceived) => {
        if(!selectedChat || !selectedChat._id || selectedChat._id !== newMessageReceived.chat._id){
          if(!notification.includes(newMessageReceived)){
            setNotification([newMessageReceived, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        }
        else
          setMessages(prevMessages => [...prevMessages, newMessageReceived]);
      });
      
      return () => {
        socket.off("message received");
      };
    }, [selectedChat]);

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessages) {
          socket.emit("stop typing", selectedChat._id);
          try {
            const config = {
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            };
            setNewMessages("");
            const { data } = await axios.post(
              "/api/message",
              {
                content: newMessages,
                chatId: selectedChat._id,
              },
              config
            );

            socket.emit("new message", data);
            setMessages([...messages, data]);
          } catch (error) {
            toast({
              title: "Error Occurred!",
              description: "Failed to send the Message",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
          }
        }
      };

    const typingHandler = (e) => {
        setNewMessages(e.target.value);

        if (!socketConnected) return;

        if (!isTyping) {
          socket.emit("typing", selectedChat._id);
          setIsTyping(true);
        }

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          setIsTyping(false);
          socket.emit("stop typing", selectedChat._id);
        }, 3000);
    }

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="space-between" 
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                {selectedChat.userConnected && socketConnected ? (<span style={{ color: "green" }}>Online</span> ) : null}
                                <ProfileModel
                                    user={getSenderFull(user, selectedChat.users)}
                                />
                            </>
                        ) : (
                            <>
                                <Box style={{display: 'flex', flexDirection: 'column'}}>
                                    {selectedChat.chatName.toUpperCase()+'AAAA'}
                                </Box>
                                <Box>
                                    <UpdateGroupChatModel
                                        fetchMessages={fetchMessages}
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                    />
                                </Box>
                            </>
                        )}
                    </Text>
                    <Box
                        d="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="scroll"
                    >
                    {loading ? (
                        <Spinner 
                            size={'lg'}
                            w={20}
                            h={20}
                            alignSelf={'center'}
                            margin={'auto'}
                        />
                    ) : (
                        <div className='message' >
                            <ScrollableChat messages={messages} />
                        </div>
                    )}

                    <div style={{ display:'flex', flexDirection: 'column-reverse', position: 'sticky', bottom: 1, zIndex: 1000, overflowY: 'scroll' }}>
                        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                          {isTyping ? <div><Lottie
                            options={defaultOptions}
                            width={70}
                            style={{marginBottom: 15, marginLeft: 0}}
                          /></div>: (<></>)}
                            <Input 
                                variant={'filled'}
                                bg={'#E0E0E0'}
                                placeholder='Enter a Message...'
                                onChange={typingHandler}
                                value={newMessages}
                            />
                        </FormControl>
                    </div>
                    </Box>
                </>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    Click on a user to start chatting
                </Box>
            )}
        </>
    );
};

export default SingleChat;
