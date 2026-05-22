import { Router } from 'express';
import { collageProjectController } from './collage_project.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/create', collageProjectController.createProject);
router.post('/discovery', collageProjectController.discoveryChat);
router.post('/synergy-advice', collageProjectController.getSynergyAdvice);
router.get('/list', collageProjectController.getUserProjects);
router.get('/education-domains', collageProjectController.getEducationDomains);
router.get('/search-domains', collageProjectController.searchDomains);
router.get('/:id/memory/recall', collageProjectController.recallMemory);
router.delete('/:id', collageProjectController.deleteProject);
router.post('/:id/approve', collageProjectController.approveManifest);
router.post('/:id/build', collageProjectController.buildProject);
router.get('/:id/build-status', collageProjectController.getBuildStatus);
router.post('/:id/generate-blueprint', collageProjectController.generateBlueprint);
router.get('/:id/blueprint', collageProjectController.getBlueprint);
router.post('/:id/chat', collageProjectController.handleProjectChat);
router.post('/:id/post-build-iteration', collageProjectController.postBuildIteration);
router.get('/:id/chat-history', collageProjectController.getChatHistory);
router.get('/:id/download', collageProjectController.downloadProject);
router.get('/:id/download-pdf', collageProjectController.downloadPdf);
router.get('/:id/download-ppt', collageProjectController.downloadPpt);
router.get('/:id/download-word', collageProjectController.downloadWord);
router.get('/:id/files', collageProjectController.getProjectFiles);
router.get('/:id/file-content', collageProjectController.getFileContent);
router.get('/:id/tasks', collageProjectController.getProjectTasks);
router.get('/:id/system-logs', collageProjectController.getSystemLogs);
router.get('/:id/versions', collageProjectController.getProjectVersions);
router.patch('/:id/update-status', collageProjectController.updateProjectStatus);
router.get('/:id', collageProjectController.getProject);

export default router;
