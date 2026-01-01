import 'dotenv/config';
import app from './app';
import prisma from './services/prisma';

const PORT = process.env.PORT || 4000;

console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
