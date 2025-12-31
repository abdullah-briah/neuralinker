// backend/src/services/prisma.ts

import { PrismaClient } from '@prisma/client';

// إنشاء كائن PrismaClient بدون adapter
const prisma = new PrismaClient();

export default prisma;
