export class CommandParser {
    static parse(input: string): { action: string, requires: string[] } {
        const lowerInput = input.toLowerCase();

        // Defaults
        let action = "process";
        const requires: string[] = ["file"];

        // 1. GENERATION Intents (Creating content)
        if (lowerInput.includes("generate") || lowerInput.includes("create") || lowerInput.includes("make")) {
            if (lowerInput.includes("image") || lowerInput.includes("photo") || lowerInput.includes("picture")) {
                action = "generate_image";
                return { action, requires: ["prompt"] }; // No file required for pure generation
            }
        }

        // 2. DEEP ANALYSIS Intents (Boosting Intelligence)
        if (lowerInput.includes("deep") || lowerInput.includes("audit") || lowerInput.includes("analyze fully") || lowerInput.includes("scan")) {
            action = "deep_analysis";
            requires.push("deep_metrics");
        }

        // 3. STANDARD Intents
        else if (lowerInput.includes("ocr") || lowerInput.includes("read") || lowerInput.includes("extract text")) {
            action = "ocr";
            requires.push("text");
        } else if (lowerInput.includes("summary") || lowerInput.includes("summarize")) {
            action = "summary";
            requires.push("text");
        } else if (lowerInput.includes("video") || lowerInput.includes("watch")) {
            action = "video_analysis";
            requires.push("frames");
        } else if (lowerInput.includes("audio") || lowerInput.includes("transcribe")) {
            action = "transcription";
            requires.push("audio");
        } else if (lowerInput.includes("zip") || lowerInput.includes("unzip") || lowerInput.includes("extract")) {
            action = "archive_extract";
        }

        return { action, requires };
    }
}
