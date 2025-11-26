import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { normalizePhone } from '../utils/validation';
import { CaseStatus } from '@prisma/client';
import { logger } from '../utils/logger';

export const startImport = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { fileName, totalRows } = req.body;

        if (!req.user?.id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const importRecord = await prisma.import.create({
            data: {
                fileName,
                totalRows,
                importedById: req.user.id,
                status: 'PROCESSING'
            }
        });
        res.json({ importId: importRecord.id });
    } catch (e) { next(e); }
};

export const batchIngest = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { cases, importId } = req.body;

        if (!req.user?.id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        if (!importId) {
            res.status(400).json({ message: 'Missing importId' });
            return;
        }

        const importerId = req.user.id;

        const created: any[] = [];
        const updated: any[] = [];
        const skipped: any[] = [];
        const failed: any[] = [];

        const importRecord = await prisma.import.findUnique({ where: { id: importId } });
        if (!importRecord) {
            res.status(404).json({ message: `Import record ${importId} not found` });
            return;
        }

        for (const row of cases) {
            try {
                await prisma.$transaction(async (tx) => {
                    const normalizedPhone = normalizePhone(row.phone);
                    const dobDate = new Date(row.dob);
                    if (isNaN(dobDate.getTime())) throw new Error("Invalid Date");

                    const payload = {
                        applicantName: row.applicant_name,
                        dob: dobDate,
                        email: row.email || null,
                        phone: normalizedPhone,
                        category: row.category as any,
                        priority: (row.priority || 'LOW') as any,
                        status: CaseStatus.SUBMITTED,
                        importId,
                        assignedToId: null
                    };

                    const existingCase = await tx.case.findUnique({
                        where: { caseId: row.case_id }
                    });

                    if (existingCase) {
                        const isChanged =
                            existingCase.applicantName !== payload.applicantName ||
                            existingCase.dob.getTime() !== payload.dob.getTime() ||
                            existingCase.email !== payload.email ||
                            existingCase.phone !== payload.phone ||
                            existingCase.category !== payload.category ||
                            existingCase.priority !== payload.priority;

                        if (isChanged) {
                            const resultingCase = await tx.case.update({
                                where: { caseId: row.case_id },
                                data: payload
                            });

                            await tx.caseHistory.create({
                                data: {
                                    caseId: resultingCase.id,
                                    action: 'UPDATED',
                                    userId: importerId,
                                    newValue: JSON.stringify(row)
                                }
                            });
                            updated.push({ case_id: row.case_id });
                        } else {
                            skipped.push({ case_id: row.case_id });
                        }
                    } else {
                        const resultingCase = await tx.case.create({
                            data: { ...payload, caseId: row.case_id }
                        });

                        await tx.caseHistory.create({
                            data: {
                                caseId: resultingCase.id,
                                action: 'CREATED',
                                userId: importerId,
                                newValue: JSON.stringify(row)
                            }
                        });
                        created.push({ case_id: row.case_id });
                    }
                });

            } catch (error: any) {
                failed.push({ row: row, errors: [error.message] });
            }
        }

        await prisma.import.update({
            where: { id: importId },
            data: {
                successCount: { increment: created.length + updated.length },
                failureCount: { increment: failed.length }
            }
        });

        res.json({ created, updated, skipped, failed });

    } catch (e) {
        logger.error(`Batch Ingest Fatal Error: ${e}`);
        next(e);
    }
};