"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchIngest = exports.startImport = void 0;
const prisma_1 = require("../utils/prisma");
const validation_1 = require("../utils/validation");
const client_1 = require("@prisma/client");
const startImport = async (req, res, next) => {
    try {
        const { fileName, totalRows } = req.body;
        const importRecord = await prisma_1.prisma.import.create({
            data: {
                fileName,
                totalRows,
                importedById: req.user.id,
                status: 'PROCESSING'
            }
        });
        res.json({ importId: importRecord.id });
    }
    catch (e) {
        next(e);
    }
};
exports.startImport = startImport;
const batchIngest = async (req, res, next) => {
    try {
        const { cases, importId } = req.body;
        const importerId = req.user.id;
        const successful = [];
        const failed = [];
        await prisma_1.prisma.$transaction(async (tx) => {
            for (const row of cases) {
                try {
                    const normalizedPhone = (0, validation_1.normalizePhone)(row.phone);
                    const newCase = await tx.case.create({
                        data: {
                            caseId: row.case_id,
                            applicantName: row.applicant_name,
                            dob: new Date(row.dob),
                            email: row.email || null,
                            phone: normalizedPhone,
                            category: row.category,
                            priority: (row.priority || 'LOW'),
                            status: client_1.CaseStatus.SUBMITTED,
                            importId,
                            assignedToId: null // or default
                        }
                    });
                    await tx.caseHistory.create({
                        data: {
                            caseId: newCase.id,
                            action: 'CREATED',
                            userId: importerId,
                            newValue: JSON.stringify(row)
                        }
                    });
                    successful.push({ case_id: row.case_id });
                }
                catch (error) {
                    failed.push({
                        row: row,
                        errors: [error.message.includes('Unique constraint') ? 'Case ID already exists' : error.message]
                    });
                }
            }
            await tx.import.update({
                where: { id: importId },
                data: {
                    successCount: { increment: successful.length },
                    failureCount: { increment: failed.length }
                }
            });
        });
        res.json({ successful, failed });
    }
    catch (e) {
        next(e);
    }
};
exports.batchIngest = batchIngest;
//# sourceMappingURL=importController.js.map