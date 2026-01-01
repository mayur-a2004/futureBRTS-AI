import { useState, useEffect } from 'react';
import { createProject, getProjects } from '../../lib/api';

export default function Builder() {
    const [projects, setProjects] = useState<any[]>([]);
    const [form, setForm] = useState({ title: '', field: '', degree: '' });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await createProject(form);
            setForm({ title: '', field: '', degree: '' });
            loadProjects();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Project Builder</h1>
            <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                <input placeholder="Project Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <input placeholder="Field" value={form.field} onChange={e => setForm({ ...form, field: e.target.value })} required />
                <input placeholder="Degree" value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} required />
                <button type="submit">Create Project</button>
            </form>

            <h2>Saved Projects: {projects.length}</h2>
            <ul>
                {projects.map((p: any) => (
                    <li key={p._id}>
                        <strong>{p.title}</strong> - {p.field} ({p.degree})
                    </li>
                ))}
            </ul>
        </div>
    );
}
