import { Request, Response } from 'express';
import Student from '../models/Student';

export const createStudent = async (req: Request, res: Response) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error creating student', error });
    }
};

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error });
    }
};
