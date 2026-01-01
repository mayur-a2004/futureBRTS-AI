export default function Sidebar({ onAdd }: { onAdd: (item: any) => void }) {
    const components = [
        { type: "heading", content: "Heading", id: Date.now() + "-h" },
        { type: "text", content: "Text", id: Date.now() + "-t" },
        { type: "button", content: "Button", id: Date.now() + "-b" },
    ];

    return (
        <div
            style={{
                width: "200px",
                background: "#111",
                color: "#fff",
                padding: "15px",
            }}
        >
            <h2 style={{ marginBottom: "20px" }}>Components</h2>
            {components.map((c) => (
                <div
                    key={c.id}
                    style={{
                        padding: "10px",
                        background: "#222",
                        marginBottom: "10px",
                        cursor: "pointer",
                    }}
                    onClick={() => onAdd({ ...c, id: Date.now() + c.type })}
                >
                    {c.type}
                </div>
            ))}
        </div>
    );
}
