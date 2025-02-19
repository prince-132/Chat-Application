import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { ChatState } from '../../context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from 'react-notification-badge'
import { Effect } from 'react-notification-badge'
import StatusModel from './StatusModel'

const SideDrawer = () => {
  const [search, setSearch] = useState();
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo")
    history.push('/')
  }

  const handleSearch = async() => {
    if(!search){
      toast({
        title: 'Please enter something to Search',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });
      return;
    }

    try {
      setLoading(true)
      const config ={
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      const filteredResults = data.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        user.email.toLowerCase().includes(search.toLowerCase())
      );
  
      setSearchResult(filteredResults);
    } catch (error) {
        toast({
          title: 'Error Occured!',
          description: "Failed to Load the Search Results",
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-left',
        })
    }
  }

  const accessChat = async(userId) => {
    try {
      setLoadingChat(true)

      const config ={
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const {data} = await axios.post('/api/chat', { userId }, config);
      if(!chats.find((c) => c._id === data._id))
        setChats([data, ...chats]);

      setSelectedChat(data)
      setLoadingChat(false)
      onClose()
    } catch (error) {
      toast({
        title: 'Error fetching the chat!',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      }) 
    }
  }

  return (
    <>
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        bg={'white'}
        w={'100%'}
        p={'5px 10px'}
        borderWidth={'2px'}
      >
        <Tooltip
          label="Search Users to Chat" hasArrow placement='bottom-end'>
          <Button variant={'ghost'} onClick={onOpen}>
            <i class="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: 'none', md: 'flex' }} px={'3'}>Search User</Text>
          </Button>
        </Tooltip>
        <Text fontSize={'2xl'} fontFamily={'Work sans'} fontWeight='800'>
          Chat-Now
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge 
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize={'2xl'} m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map(notif => (
                <MenuItem 
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat)
                    setNotification(notification.filter((n) => n !== notif))
                  }}
                >
                  {notif.chat.isGroupChat ? 
                    `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              {user && 
              <Avatar 
                size={'sm'} 
                cursor={'pointer'} 
                name={user.name} 
                src={user.pic}
              />}
            </MenuButton>
            {user && <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModel>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              <MenuDivider />
              <StatusModel user={user}>
                <MenuItem>Status</MenuItem>
              </StatusModel>
            </MenuList>}
          </Menu>
        </div>
      </Box>

      <Drawer placement='left' onClose={onClose} isOpen={isOpen} >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={'1px'}>
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box pb={2} display={'flex'} flexDir={'row'} alignItems="center">
              <Input 
                placeholder='Search by name or Email'
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                onClick={handleSearch}
              >Go</Button>
            </Box>
            {loading ? <ChatLoading /> : (
              searchResult?.map((user) => (
                <UserListItem 
                  key={user._id}
                  user={user}
                  handleFunction={()=> accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml={'auto'} display={'flex'}/>}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer
