import React, { useState } from 'react'

const OfllineMsgModel = () => {
    const [output, setOutput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const responce = async() => {
        try {
            let message = 'Give a reply message for a chat application if "I am not able to reply to sender" in 20 words'
            setIsLoadingConvert(true)
            let req = await fetch(`http://localhost:3000/api/data`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt:message })
            });
        } catch (error) {
            
        }
    }
  return (
    <div>
      
    </div>
  )
}

export default OfllineMsgModel
