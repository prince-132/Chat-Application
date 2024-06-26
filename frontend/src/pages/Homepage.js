import React, { useEffect } from 'react'
import { Box, Container, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

function Homepage() {
  const history = useHistory();

    useEffect(()=> {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        if(userInfo){
            history.push('/chats');
        }
    }, [history]);

  return (
    <Container maxW='xl' centerContent>
      <Box 
        d='flex'
        justifyContent='center'
        p={2}
        bg={'white'}
        w='100%'
        m='40px 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
      >
        <Text fontSize='3xl' fontFamily='Work sans' textAlign={'center'}>Chat-Now</Text>
      </Box>
      <Box bg={'white'} w='100%' p={4} borderRadius={'lg'} borderWidth={'1px'} >
        <Tabs variant={'soft-rounded'} >
          <TabList mb={'1em'}>
            <Tab width={'50% '}>Login</Tab>
            <Tab width={'50%'}>Sign Up</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default Homepage
