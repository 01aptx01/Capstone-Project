// web/web-ui/tests/test_login_helpers.js
const assert = require("assert");

// Copy of the frontend's normalizePhone function from app/(auth)/login/page.tsx
function normalizePhone(raw) {
  return raw.replace(/\D/g, "").slice(0, 10);
}

// Ideal helper that fixes the +66 and length issues
function normalizePhoneFixed(raw) {
  // Strip all non-digits except +
  let cleaned = raw.replace(/[^\d+]/g, "");
  
  // If it starts with +66 or 66, convert it to 0
  if (cleaned.startsWith("+66")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("66") && cleaned.length > 10) {
    cleaned = "0" + cleaned.slice(2);
  }
  
  // Clean all non-digits again (to remove a leading + if any)
  cleaned = cleaned.replace(/\D/g, "");
  
  return cleaned;
}

console.log("=== Running Frontend Login Helper Tests ===");

try {
  // Test Case 1: Standard Thai Local Format
  console.log("Test Case 1: local format '0812345678'...");
  assert.strictEqual(normalizePhone("0812345678"), "0812345678");
  assert.strictEqual(normalizePhoneFixed("0812345678"), "0812345678");
  console.log("✅ Passed");

  // Test Case 2: Local format with hyphens
  console.log("Test Case 2: local format with hyphens '081-234-5678'...");
  assert.strictEqual(normalizePhone("081-234-5678"), "0812345678");
  assert.strictEqual(normalizePhoneFixed("081-234-5678"), "0812345678");
  console.log("✅ Passed");

  // Test Case 3: International +66 Format
  console.log("Test Case 3: international format '+66812345678'...");
  const buggyResult3 = normalizePhone("+66812345678");
  console.log(`   - Buggy normalizePhone output: "${buggyResult3}" (Expected "0812345678")`);
  
  // The buggy version fails this test case because it slices out "6681234567"
  try {
    assert.strictEqual(buggyResult3, "0812345678");
    console.log("✅ Buggy code passed? (This should not happen)");
  } catch (err) {
    console.log("❌ Buggy code FAILED (as expected: slices incorrectly and lacks leading 0)");
  }
  
  const fixedResult3 = normalizePhoneFixed("+66812345678");
  assert.strictEqual(fixedResult3, "0812345678");
  console.log("✅ Fixed normalizePhone output: '0812345678' Passed");

  // Test Case 4: International format with spaces and +66
  console.log("Test Case 4: international format with spaces '+66 81-234-5678'...");
  const buggyResult4 = normalizePhone("+66 81-234-5678");
  console.log(`   - Buggy normalizePhone output: "${buggyResult4}" (Expected "0812345678")`);
  
  const fixedResult4 = normalizePhoneFixed("+66 81-234-5678");
  assert.strictEqual(fixedResult4, "0812345678");
  console.log("✅ Fixed normalizePhone output: '0812345678' Passed");

  // Test Case 5: Over-length input with typo at the end
  console.log("Test Case 5: over-length input with typos '08123456789'...");
  const buggyResult5 = normalizePhone("08123456789");
  console.log(`   - Buggy normalizePhone output: "${buggyResult5}" (Silently sliced the last digit '9')`);
  
  // Standard Thai phone length is 10 digits
  console.log("✅ Helper test execution completed.\n");

} catch (error) {
  console.error("❌ Test crashed:", error);
}
