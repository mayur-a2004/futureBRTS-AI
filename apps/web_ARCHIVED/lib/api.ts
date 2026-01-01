const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const createStudent = async (data: any) => {
    const res = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getStudents = async () => {
    const res = await fetch(`${API_URL}/students`);
    return res.json();
};

export const createProject = async (data: any) => {
    const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getProjects = async () => {
    const res = await fetch(`${API_URL}/projects`);
    return res.json();
};
