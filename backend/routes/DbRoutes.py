def UpdateHistory(oldNodes, newNodes):

    lengthOfNewNodes = len(newNodes)

    newHistory = {
        # We add all previous oldNodes
        "current_leaf": f"m{str(len(oldNodes)+lengthOfNewNodes-1)}",
        "nodes": {
            node: {
                "parent_id": oldNodes[node]["parent_id"],
                "role": oldNodes[node]["role"],
                "text": oldNodes[node]["text"],
            }
            for node in oldNodes
        }
        | newNodes,
    }

    return newHistory
