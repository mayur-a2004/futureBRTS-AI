

interface CanvasProps {
    nodes: any[];
    onNodesChange: (nodes: any[]) => void;
    onNodeSelect?: (node: any) => void;
}

export default function Canvas({
    nodes = [],
    onNodeSelect,
}: CanvasProps) {
    return (
        <div
            style={{
                flex: 1,
                background: "transparent",
                position: "relative",
                overflow: "hidden",
                width: "100%",
                height: "100%"
            }}
        >
            {nodes.map((node) => (
                <div
                    key={node.id}
                    onClick={() => onNodeSelect && onNodeSelect(node)}
                    style={{
                        position: "absolute",
                        left: node.x || 100,
                        top: node.y || 100,
                        background: "#1e1e2e",
                        color: "#fff",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #4f46e5",
                        cursor: "pointer",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                    }}
                >
                    <div className="text-xs text-gray-400 mb-1 font-bold tracking-wider">{node.type}</div>
                    <div className="font-bold text-sm">{node.label || "Untitled Node"}</div>
                </div>
            ))}
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-medium">
                    Drag and drop components here
                </div>
            )}
        </div>
    );
}
