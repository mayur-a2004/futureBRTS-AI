import graphviz
import os

def generate_diagram(payload):
    os.makedirs("outputs", exist_ok=True)
    dot = graphviz.Digraph()
    dot.node("User")
    dot.node("System")
    dot.edge("User", "System", label=payload.prompt or "Action")

    path = f"outputs/diagram_{payload.taskId}" # Graphviz appends extension automatically usually, but we might need to handle it. 
    # Graphviz render appends .pdf by default or format.
    # We will specify format='png'
    output_path = dot.render(path, format='png')
    
    return {
        "status": "SUCCESS",
        "artifacts": {"diagram": output_path}
    }
