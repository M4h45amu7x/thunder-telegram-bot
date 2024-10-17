import { Prisma, PrismaClient } from '@prisma/client'

Prisma.Decimal.prototype.toJSON = function () {
    return this.toNumber() as any
}

export const prisma = new PrismaClient()
