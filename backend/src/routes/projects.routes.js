import { Router } from 'express';
import {
  createProject,
  updateMasterJson,
  handleProjectChat,
  getProjectLogoOptions
} from '../controllers/projects.controller.js';

const router = Router();

router.post('/', createProject);
router.patch('/:id/master-json', updateMasterJson);
router.post('/:id/chat', handleProjectChat);
router.post('/:id/logo-options', getProjectLogoOptions);

export default router;
