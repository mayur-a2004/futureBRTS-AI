import { useState, useEffect } from 'react';
import { createStudent, getStudents } from '../lib/api';

export default function Home() {
    const [students, setStudents] = useState<any[]>([]);
    const [form, setForm] = useState({ name: '', age: '', level: 'fresher', field: '' });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await createStudent({ ...form, age: Number(form.age) });
            setForm({ name: '', age: '', level: 'fresher', field: '' });
            loadStudents();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Student Registration</h1>
            <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <input placeholder="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required />
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="college">College</option>
                    <option value="fresher">Fresher</option>
                </select>
                <input placeholder="Field" value={form.field} onChange={e => setForm({ ...form, field: e.target.value })} required />
                <button type="submit">Add Student</button>
            </form>

            <h2>Total Students: {students.length}</h2>
            <ul>
                {students.map((s: any) => (
                    <li key={s._id}>{s.name} - {s.level} ({s.field})</li>
                ))}
            </ul>
        </div>
    );
}
