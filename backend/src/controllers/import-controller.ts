import { Request, Response } from "express";
import { extractWithRetry, ExtractionBatch } from "../services/ai-extractor.js";
import { processCSVRecords, saveImportHistory } from "../services/import-service.js";
import { extractContactInfo, normalizeRecordForImport, shouldSkipRecord } from "../utils/crm-rules.js";

export async function importCSV(req: Request, res: Response) {
  try {
    const { csvData, fileName } = req.body;

    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return res.status(400).json({
        error: "Invalid CSV data provided",
        success: false,
      });
    }

    const normalizedRecords = csvData.map((record: Record<string, unknown>) =>
      normalizeRecordForImport(record)
    );

    // Filter records - skip those without email or phone
    const validRecords = normalizedRecords.filter((record: Record<string, unknown>) => {
      const { email, mobile } = extractContactInfo(record);
      return !shouldSkipRecord(email, mobile);
    });

    if (validRecords.length === 0) {
      return res.status(400).json({
        error: "No valid records found (records must have email or phone)",
        success: false,
        total: csvData.length,
        imported: 0,
        skipped: csvData.length,
        records: [],
      });
    }

    // Process in batches
    const batches = processCSVRecords(validRecords, 10);
    const extractedRecords = [];
    const errors = [];
    let totalSkipped = 0;

    for (let i = 0; i < batches.length; i++) {
      try {
        const batch: ExtractionBatch = {
          records: batches[i],
          batchId: `batch_${i}_${Date.now()}`,
        };

        const result = await extractWithRetry(batch, 3);

        if (result.success) {
          extractedRecords.push(...result.records);
          totalSkipped += result.skipped;
        } else {
          errors.push(`Batch ${i} failed: ${result.errors.join(", ")}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Batch ${i} error: ${errorMsg}`);
      }
    }

    // Save import history
    await saveImportHistory({
      fileName,
      totalRecords: csvData.length,
      importedRecords: extractedRecords.length,
      skippedRecords: csvData.length - extractedRecords.length,
      createdAt: new Date(),
      error: errors.length > 0 ? errors[0] : undefined,
    });

    res.json({
      success: true,
      total: csvData.length,
      imported: extractedRecords.length,
      skipped: csvData.length - extractedRecords.length,
      records: extractedRecords,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Import error:", errorMsg);

    res.status(500).json({
      success: false,
      error: "Failed to process CSV import",
      message: errorMsg,
    });
  }
}

export function healthCheck(req: Request, res: Response) {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
