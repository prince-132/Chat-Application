import { Box } from "@chakra-ui/react";
import { ChatState } from "../context/ChatProvider";
import SideDrawer from "../components/miscellanious/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useState } from "react";

function Chatpage() {
    const user = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: '100%', height:' 100%' }}>
      {user && <SideDrawer />}
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          {user && (
          <MyChats fetchAgain={fetchAgain} />)}
          {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        </Box>
    </div>
  )
}

export default Chatpage;
