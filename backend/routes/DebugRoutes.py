def PrintConversation(history):
    history.reverse()
    for i in range(len(history)):
        print(f"{i} {history[i]["parts"][0]["text"]}\n")
