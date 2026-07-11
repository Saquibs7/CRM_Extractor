import test from "node:test";
import assert from "node:assert/strict";
import { extractContactInfo } from "./crm-rules.js";

test("extracts contact info from Facebook-style CSV headers", () => {
  const result = extractContactInfo({
    email_address: "lead@example.com",
    phone_number: "9876543210",
  });

  assert.equal(result.email, "lead@example.com");
  assert.equal(result.mobile, "9876543210");
});

test("accepts alternative email and phone aliases", () => {
  const result = extractContactInfo({
    contact_email: "another@example.com",
    mobile_number: "9988776655",
  });

  assert.equal(result.email, "another@example.com");
  assert.equal(result.mobile, "9988776655");
});
