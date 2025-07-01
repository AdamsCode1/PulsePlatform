// routes/api.ts

import { Router } from 'express';
import usersRouter from './users';
import eventsRouter from './events';
import societiesRouter from './societies';
import rsvpsRouter from './rsvps';


console.log('usersRouter:', usersRouter);
console.log('eventsRouter:', eventsRouter);
console.log('societiesRouter:', societiesRouter);
console.log('rsvpsRouter:', rsvpsRouter);

const router = Router();

router.use('/users', usersRouter);
router.use('/events', eventsRouter);
router.use('/societies', societiesRouter);
router.use('/rsvps', rsvpsRouter);



export default router;
