import { Router } from 'express';
import chatRoutes from './chat.routes';

const router = Router();

// Mount chat routes
router.use('/chat', chatRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
