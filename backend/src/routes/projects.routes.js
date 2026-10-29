import { Router } from 'express';
import {
  createProject,
  updateMasterJson,
  handleProjectChat,
  getProjectLogoOptions,
  unlockProjectLead
} from '../controllers/projects.controller.js';

const router = Router();

router.post('/', createProject);
router.patch('/:id/master-json', updateMasterJson);
router.post('/:id/chat', handleProjectChat);
router.post('/:id/logo-options', getProjectLogoOptions);
router.post('/:id/unlock-lead', unlockProjectLead);

export default router;
