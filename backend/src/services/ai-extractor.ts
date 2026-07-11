import { GoogleGenAI } from "@google/genai";
import { config } from "../config/env.js";
import {
  CRMRecord,
  ALLOWED_CRM_STATUS,
  ALLOWED_DATA_SOURCES,
  extractContactInfo,
} from "../utils/crm-rules.js";

const genAI = new GoogleGenAI({ apiKey: config.googleApiKey });

export interface ExtractionBatch {
  records: Record<string, string>[];
  batchId: string;
}

export interface ExtractionResult {
  success: boolean;
  records: CRMRecord[];
  skipped: number;
  errors: string[];
}

const EXTRACTION_PROMPT = `You are a CRM data extraction expert. Your task is to intelligently extract and map lead information from CSV data into standard CRM fields.

Given the following CSV records with their original column headers, extract and map them to the CRM schema below:

CRM Fields:
- created_at (ISO datetime)
- name (Full name)
- email (Primary email address)
- country_code (e.g., +91)
- mobile_without_country_code (Phone number without country code)
- company (Company name)
- city (City name)
- state (State/Province)
- country (Country name)
- lead_owner (Sales rep or owner)
- crm_status (One of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE)
- crm_note (Additional remarks, follow-up notes, extra contacts)
- data_source (One of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots)
- possession_time (Property possession timeline)
- description (Additional description)

Rules:
1. If multiple emails exist, use the first one in the email field and append others to crm_note
2. If multiple phone numbers exist, use the first one and append others to crm_note
3. For crm_status, intelligently infer based on context if not explicitly stated
4. For data_source, only set if you're confident about the source
5. Skip records that have neither email nor phone number
6. Dates must be in valid JavaScript Date format
7. Keep crm_note concise but informative

Return ONLY a valid JSON array of extracted records. Do not include any explanations or markdown formatting.
Example format:
[{"created_at":"2026-05-13T10:00:00Z","name":"John Doe","email":"john@example.com",...}]`;

export async function extractCRMFields(batch: ExtractionBatch): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    success: false,
    records: [],
    skipped: 0,
    errors: [],
  };

  try {
    if (!config.googleApiKey) {
      result.errors.push("GOOGLE_API_KEY is not configured");
      return result;
    }

    // Format the input data for the prompt
    const csvText = formatCSVForPrompt(batch.records);

    const message = `${EXTRACTION_PROMPT}\n\nCSV Data to process:\n${csvText}`;

    const geminiResponse = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: message,
    });

    const responseText = geminiResponse.text || "";

    // Parse the JSON response
    const extractedRecords = parseGeminiResponse(responseText);

    for (const record of extractedRecords) {
      const validated = validateAndCleanRecord(record);
      if (validated) {
        result.records.push(validated);
      } else {
        result.skipped++;
      }
    }

    result.success = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(`Batch ${batch.batchId}: ${errorMessage}`);
  }

  return result;
}

export async function extractWithRetry(
  batch: ExtractionBatch,
  maxRetries: number = 3
): Promise<ExtractionResult> {
  let lastError: ExtractionResult = {
    success: false,
    records: [],
    skipped: 0,
    errors: [],
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await extractCRMFields(batch);

      if (result.success) {
        return result;
      }

      lastError = result;

      // Exponential backoff: wait 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError.errors.push(`Attempt ${attempt + 1} failed`);
    }
  }

  return lastError;
}

function formatCSVForPrompt(records: Record<string, string>[]): string {
  if (records.length === 0) return "";

  const headers = Object.keys(records[0]);
  const headerLine = headers.join(",");
  const dataLines = records.map((record) =>
    headers.map((h) => `"${(record[h] || "").replace(/"/g, '""')}"`).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

function parseGeminiResponse(response: string): CRMRecord[] {
  try {
    // Extract JSON array from response (in case there's extra text)
    const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
}

function validateAndCleanRecord(record: any): CRMRecord | null {
  const cleaned: CRMRecord = {};

  // Validate required fields
  const { email, mobile } = extractContactInfo(record);
  const normalizedEmail = email?.trim();
  const normalizedMobile = mobile?.trim();

  if (!normalizedEmail && !normalizedMobile) {
    return null; // Skip records without contact info
  }

  // Set fields if present
  if (record.created_at) cleaned.created_at = record.created_at;
  if (record.name) cleaned.name = record.name.trim();
  if (normalizedEmail) cleaned.email = normalizedEmail.toLowerCase();
  if (record.country_code) cleaned.country_code = record.country_code.trim();
  if (normalizedMobile) cleaned.mobile_without_country_code = normalizedMobile;
  if (record.company) cleaned.company = record.company.trim();
  if (record.city) cleaned.city = record.city.trim();
  if (record.state) cleaned.state = record.state.trim();
  if (record.country) cleaned.country = record.country.trim();
  if (record.lead_owner) cleaned.lead_owner = record.lead_owner.trim();

  // Validate CRM status
  if (record.crm_status && ALLOWED_CRM_STATUS.includes(record.crm_status)) {
    cleaned.crm_status = record.crm_status;
  }

  if (record.crm_note) cleaned.crm_note = record.crm_note.trim();

  // Validate data source
  if (record.data_source && ALLOWED_DATA_SOURCES.includes(record.data_source)) {
    cleaned.data_source = record.data_source;
  }

  if (record.possession_time) cleaned.possession_time = record.possession_time.trim();
  if (record.description) cleaned.description = record.description.trim();

  return cleaned;
}
