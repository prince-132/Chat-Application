import { ViewIcon } from '@chakra-ui/icons';
import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, useDisclosure, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
// Existing imports...

const StatusModel = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [value, setValue] = useState('0');
    const [loading, setLoading] = useState(true);

    const toast = useToast();

    useEffect(() => {
        setLoading(true);
        if (user) {
            const changeStatus = async () => {
                const email = user.email; 
                try {
                    const config = {
                        headers: {
                            "Content-type": "application/json"
                        },
                    };
                    await axios.post('/api/user/status', { email, value }, config);
                    toast({
                        title: "Status Change Successful!",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: 'bottom',
                    }); 
                } catch (error) {
                    toast({
                        title: 'Error Occurred!',
                        description: error.response.data.message,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                        position: 'bottom',
                    });
                    setLoading(false);
                }
            };
            changeStatus();
        }
    }, [user, value, toast]);
    
    useEffect(() => {
        if (user) {
            console.log(user);
            const getStatus = async () => {
                const email = user.email;
                try {
                    const config = {
                        headers: {
                            "Content-type": "application/json"
                        },
                        params: { email: email }
                    };
                    const response = await axios.get(`/api/user/status`, config);
                    setValue(response.data.status.toString());

                    toast({
                        title: "Status Got Successful!",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: 'bottom',
                    });

                } catch (error) {
                    toast({
                        title: 'Error Occurred!',
                        description: error.response.data.message,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                        position: 'bottom',
                    });
                    setLoading(false);
                }
            };
            getStatus();
        }
    }, [user, toast]);

    if (!user)
        return null;
    return (
        <>
            {
                children ? (
                    <span onClick={onOpen}>{children}</span>
                ) : (
                    <IconButton
                        display={{ base: 'flex' }}
                        icon={<ViewIcon />}
                        onClick={onOpen}
                    />
                )
            }
            <Modal size="lg" isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent h={'410px'}>
                    <ModalHeader
                        fontSize={'30px'}
                        fontFamily={'Work sans'}
                        display={'flex'}
                        justifyContent={'center'}
                    >Set Status</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display={'flex'}
                        flexDir={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <RadioGroup onChange={setValue} value={value}>
                            <Stack spacing={5} direction='column'>
                                <Radio value='0'
                                    colorScheme='green'
                                    fontSize={{ base: '20px', md: '25px' }}
                                    fontFamily={'Work sans'}
                                    textAlign={'center'}
                                    p={'10px'}
                                >Available </Radio>
                                <Radio value='1'
                                    colorScheme='red'
                                    fontSize={{ base: '20px', md: '25px' }}
                                    fontFamily={'Work sans'}
                                    textAlign={'center'}
                                    p={'10px'}
                                >Busy</Radio>
                            </Stack>
                        </RadioGroup>
                    </ModalBody>

                    <ModalFooter >
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default StatusModel;
