export interface CRMRecord {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
}

export const ALLOWED_CRM_STATUS = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
];

export const ALLOWED_DATA_SOURCES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

export function validateCRMStatus(status?: string): boolean {
  if (!status) return false;
  return ALLOWED_CRM_STATUS.includes(status);
}

export function validateDataSource(source?: string): boolean {
  if (!source) return true; // Optional field
  return ALLOWED_DATA_SOURCES.includes(source);
}

export function validateEmail(email?: string): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalizedEmail);
}

export function validateMobile(mobile?: string): boolean {
  if (!mobile) return false;
  const normalizedMobile = mobile.trim();
  // Basic validation: at least 7 digits
  const digitsOnly = normalizedMobile.replace(/\D/g, "");
  return digitsOnly.length >= 7;
}

const EMAIL_FIELD_ALIASES = [
  "email",
  "email_address",
  "emailaddress",
  "primary_email",
  "contact_email",
  "emailid",
  "mail",
];

const MOBILE_FIELD_ALIASES = [
  "mobile_without_country_code",
  "mobile",
  "phone",
  "phone_number",
  "mobile_number",
  "contact_number",
  "whatsapp",
  "whatsapp_number",
  "cell",
  "cell_phone",
];

function getFirstValue(record: Record<string, unknown>, aliases: string[]): string | undefined {
  const normalizedRecord = Object.entries(record).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {}
  );

  for (const alias of aliases) {
    const value = normalizedRecord[alias];
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue) return trimmedValue;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

export function extractContactInfo(record: Record<string, unknown>): {
  email?: string;
  mobile?: string;
} {
  return {
    email: getFirstValue(record, EMAIL_FIELD_ALIASES),
    mobile: getFirstValue(record, MOBILE_FIELD_ALIASES),
  };
}

export function normalizeRecordForImport(record: Record<string, unknown>): Record<string, unknown> {
  const normalizedRecord = { ...record };
  const contactInfo = extractContactInfo(record);

  if (contactInfo.email && !normalizedRecord.email) {
    normalizedRecord.email = contactInfo.email;
  }

  if (contactInfo.mobile && !normalizedRecord.mobile_without_country_code) {
    normalizedRecord.mobile_without_country_code = contactInfo.mobile;
  }

  return normalizedRecord;
}

export function shouldSkipRecord(email?: string, mobile?: string): boolean {
  // Skip if neither email nor mobile is present
  return !validateEmail(email) && !validateMobile(mobile);
}
