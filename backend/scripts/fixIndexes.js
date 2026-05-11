import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI;

async function fixIndexes() {
  try {
    await mongoose.connect(MONGO_URI);

    const db = mongoose.connection.db;

    console.log('Connected to MongoDB');

    const indexes = await db.collection('users').indexes();
    console.log('Current indexes:', indexes);

    try {
      await db.collection('users').dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (err) {
      console.log('username_1 index not found');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixIndexes();
