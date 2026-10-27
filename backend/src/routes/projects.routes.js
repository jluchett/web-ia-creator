import { Router } from 'express';
import { createProject, updateMasterJson } from '../controllers/projects.controller.js';

const router = Router();

router.post('/', createProject);
router.patch('/:id/master-json', updateMasterJson);

export default router;
