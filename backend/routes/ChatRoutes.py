from google import genai

sysinstruct = (
    # "You are a helpful assistant, that's designed to assist the user in its problems."
    "Respond with reasonable amount of tokens."
)

async def Chat(client, history, prompt):
    chat = client.aio.chats.create(
            model="gemini-3.1-flash-lite",
            config={"system_instruction": sysinstruct},
            history=history
        )

    response = await chat.send_message(prompt)

    return response.text


