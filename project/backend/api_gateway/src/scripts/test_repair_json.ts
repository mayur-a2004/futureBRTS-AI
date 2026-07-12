import { safeJsonParse } from '../modules/minerva/minerva.service';

function runTests() {
    console.log("🧪 RUNNING JSON REPAIR UNIT TESTS...\n");

    // Case 1: Clean valid JSON
    const validStr = `{"title": "Valid Lesson", "nodes": [{"id": 1, "name": "Basic Physics"}]}`;
    const cleanParsed = safeJsonParse(validStr);
    console.log("Case 1 (Valid JSON):", cleanParsed ? "✅ PASSED" : "❌ FAILED");
    if (cleanParsed) console.log("   Parsed Title:", cleanParsed.title);

    // Case 2: Truncated inside string value
    const truncatedValue = `{"title": "Intro to Web Develop`;
    const repaired1 = safeJsonParse(truncatedValue);
    console.log("\nCase 2 (Truncated String Value):", repaired1 ? "✅ PASSED" : "❌ FAILED");
    if (repaired1) console.log("   Repaired Output:", JSON.stringify(repaired1));

    // Case 3: Truncated inside complex nested structure (middle of array)
    const truncatedArray = `{"title": "Mathematics", "nodes": [{"name": "Trig", "priority": "HIGH"}, {"name": "Algebra", "prio`;
    const repaired2 = safeJsonParse(truncatedArray);
    console.log("\nCase 3 (Truncated Array Object):", repaired2 ? "✅ PASSED" : "❌ FAILED");
    if (repaired2) console.log("   Repaired Output:", JSON.stringify(repaired2));

    console.log("\n🏁 ALL UNIT TESTS COMPLETED!");
}

runTests();
