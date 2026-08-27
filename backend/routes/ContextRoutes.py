def BuildContext(nodes, current_leaf):
    # We're starting at the current_leaf and go up, checking if there's anything past that leaf
    # Then we establish the highest descendant and iterate from reverse from that leaf
    llmhistoryparsed = []
    i = 1
    temp = None
    temp2 = None
    while current_leaf + i <= len(nodes) - 1:
        if nodes[f"m{current_leaf + i}"]["parent_id"] == f"m{current_leaf}":
            temp = current_leaf + i + 1
            temp2 = current_leaf + i
            while temp <= len(nodes) - 1:
                if nodes[f"m{temp}"]["parent_id"] == f"m{current_leaf}":
                    temp2 = temp
                temp += 1
            current_leaf = temp2
            i = 1
        else:
            i += 1
    # Creating the context
    s_node = int(nodes[f"m{current_leaf}"]["parent_id"][1:])
    for i in range(current_leaf, -1, -1):
        if (
            i == s_node
            or nodes[f"m{i}"]["parent_id"][1:] == None
            and nodes[f"m{i}"]["parent_id"] == "m0"
            or i == current_leaf
        ):
            node = {
                "role": nodes[f"m{i}"]["role"],
                "parts": [{"text": nodes[f"m{i}"]["text"]}],
            }
            llmhistoryparsed.append(node)
            if i != 0:
                s_node = int(nodes[f"m{i}"]["parent_id"][1:])
        else:
            continue
    return list(reversed(llmhistoryparsed))


def PartialContext(current_leaf, nodes):
    # Used for reprompt and regeneratePrompt route, builds history from a current_leaf and DOESN'T look beyond.
    s_node = current_leaf
    branch = []
    for j in range(current_leaf, -1, -1):
        if j == s_node:
            node = {
                "node": f"m{j}",
                "parent_id": nodes[f"m{j}"]["parent_id"],
                "role": nodes[f"m{j}"]["role"],
                "text": nodes[f"m{j}"]["text"],
            }
            branch.append(node)
            if nodes[f"m{j}"]["parent_id"] == None:
                break
            if j != 0:
                s_node = int(nodes[f"m{j}"]["parent_id"][1:])

        else:
            continue
    return branch
