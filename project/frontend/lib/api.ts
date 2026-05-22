export const API_URL = "http://localhost:7001/api";

export const saveBlueprint = async (payload: { nodes: any[] }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authorization missing. Please login.");
    }

    const res = await fetch(`${API_URL}/blueprints`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            nodes: payload.nodes
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to save");
    }

    return data;
};
