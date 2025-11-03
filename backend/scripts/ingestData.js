// backend/src/scripts/ingestData.js
import dataIngestionService from '../src/services/dataIngestion.js';
import { logger } from '../src/utils/logger.js';
import mongoose from 'mongoose';
import config from '../src/config/index.js';

async function runDataIngestion() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI);
    logger.info('Connected to MongoDB');
    
    // Run the data ingestion
    const results = await dataIngestionService.runFullIngestion();
    
    logger.info('Data ingestion completed successfully:', results);
    
    // Close the MongoDB connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Data ingestion failed:', error);
    
    // Close the MongoDB connection if it's open
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run the data ingestion
runDataIngestion();