export default function PropertiesPanel({ selected, update }: { selected: any, update: (e: any) => void }) {
    if (!selected)
        return (
            <div style={{ width: "300px", background: "#fafafa", padding: "15px" }}>
                <h3>Select element to edit</h3>
            </div>
        );

    return (
        <div style={{ width: "300px", background: "#fafafa", padding: "15px" }}>
            <h3>Edit Properties</h3>

            <label>Content</label>
            <input
                type="text"
                value={selected.content}
                onChange={(e) => update({ ...selected, content: e.target.value })}
                style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #aaa",
                }}
            />
        </div>
    );
}
