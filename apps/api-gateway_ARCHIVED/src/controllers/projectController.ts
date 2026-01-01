import { Request, Response } from 'express';
import ProjectBlueprint from '../models/ProjectBlueprint';

export const createProject = async (req: Request, res: Response) => {
    try {
        const project = await ProjectBlueprint.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
};

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await ProjectBlueprint.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};
