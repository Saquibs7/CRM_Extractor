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

    // Helper: try to detect quota/exhausted errors and extract retry seconds
    const extractQuotaInfo = (err: any): { isQuota: boolean; retryAfter?: number; raw?: any } => {
      try {
        const bodyErr = err?.response?.data?.error || err?.error || err;

        // If Google-style error object
        if (bodyErr && (bodyErr.status === "RESOURCE_EXHAUSTED" || bodyErr.code === 429 || /quota/i.test(bodyErr.message || ""))) {
          // look for RetryInfo in details
          const details = bodyErr.details || [];
          const retryDetail = details.find((d: any) => d?.["@type"]?.includes("RetryInfo"));
          let retrySeconds: number | undefined;

          if (retryDetail) {
            const rd = retryDetail.retryDelay || retryDetail.retryDelay?.seconds || retryDetail.retryDelay?.nanos;
            if (typeof rd === "string") {
              const m = rd.match(/(\d+(?:\.\d+)?)/);
              if (m) retrySeconds = Math.ceil(Number(m[1]));
            } else if (typeof rd === "number") {
              retrySeconds = Math.ceil(rd);
            } else if (retryDetail.retryDelay && typeof retryDetail.retryDelay.seconds === "number") {
              retrySeconds = Math.ceil(retryDetail.retryDelay.seconds);
            }
          }

          // fallback: parse message text like 'Please retry in 44.32100283s.'
          if (!retrySeconds) {
            const msg = String(bodyErr.message || err.message || "");
            const m = msg.match(/retry (?:in|after) (\d+(?:\.\d+)?)s/i);
            if (m) retrySeconds = Math.ceil(Number(m[1]));
          }

          return { isQuota: true, retryAfter: retrySeconds, raw: bodyErr };
        }

        // Top-level code/message checks
        if (err?.code === 429 || /RESOURCE_EXHAUSTED|quota/i.test(String(err?.message || ""))) {
          const m = String(err?.message || "").match(/retry (?:in|after) (\d+(?:\.\d+)?)s/i);
          const retry = m ? Math.ceil(Number(m[1])) : undefined;
          return { isQuota: true, retryAfter: retry, raw: err };
        }
      } catch (parseErr) {
        // ignore parse errors
      }

      return { isQuota: false };
    };

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
        // If this is a quota error from the remote AI service, return a clear structured response
        const quota = extractQuotaInfo(error);
        if (quota.isQuota) {
          const retrySeconds = quota.retryAfter ?? 60;
          console.warn(`Quota exceeded on batch ${i}, retry after ${retrySeconds}s`);
          return res
            .status(429)
            .setHeader("Retry-After", String(retrySeconds))
            .json({
              success: false,
              error: "Quota exceeded",
              message: `The AI service quota was exceeded. Please retry after ${retrySeconds} seconds.`,
              retryAfter: retrySeconds,
            });
        }

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
