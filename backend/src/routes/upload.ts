import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();
// Using legacy build for better compatibility in Node environment
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Store file in memory, not disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocument({ data: uint8Array }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

interface ExtractedExpense {
  description: string;
  amount: number;
  category: string;
  date: string;
}

async function extractExpensesFromText(
  text: string
): Promise<ExtractedExpense[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are a bank statement parser. Extract all expense/debit transactions from the provided bank statement text.
    Respond ONLY with a valid JSON array. No explanation, no markdown, no code fences. Raw JSON array only.
    If you cannot find any transactions, return an empty array: []`,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const today: any = new Date().toISOString().split("T")[0];

  const prompt = `Extract all debit/expense transactions from this bank statement.
Return a JSON array where each item has:
- description (string): merchant name or transaction description, keep it concise
- amount (number): transaction amount as positive number in rupees
- category (string): exactly one of: Housing, Food, Transport, Entertainment, Shopping, Health, Utilities, Education, Other
- date (string): date in YYYY-MM-DD format. If year is missing or unclear, use ${
    today.split("-")[0]
  }. If date is completely missing, use ${today}

Only include debits/expenses. Skip credits, deposits, salary credits, refunds, and opening/closing balances.

Bank statement text:
<statement>
${text.slice(0, 12000)}
</statement>`;

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const raw = response.response
    .text()
    .replace(/```json|```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(raw);
    // Ensure all dates use current year
    const currentYear = new Date().getFullYear().toString();
    return parsed.map((exp: ExtractedExpense) => ({
      ...exp,
      amount: Math.abs(exp.amount),
      date: exp.date?.startsWith(currentYear)
        ? exp.date
        : `${currentYear}-${
            exp.date?.slice(5) ?? new Date().toISOString().slice(5, 10)
          }`,
    }));
  } catch {
    throw new Error("Failed to parse extracted expenses from PDF");
  }
}

// POST /api/upload
router.post("/", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    // Extract text from PDF
    const text = await extractTextFromPDF(req.file.buffer);

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        error:
          "Could not extract text from PDF. The file may be scanned or image-based.",
      });
    }

    // Extract expenses using Gemini
    const expenses = await extractExpensesFromText(text);

    if (expenses.length === 0) {
      return res.status(200).json({
        expenses: [],
        message: "No expense transactions found in this PDF.",
        pageCount: 1, // We can return actual page count if needed by modifying extractTextFromPDF to also return it
      });
    }

    res.json({
      expenses,
      pageCount: 1, // pdfjs counts internally, simplify for now
      textLength: text.length,
      message: `Found ${expenses.length} transactions`,
    });
  } catch (error: any) {
    console.error("PDF upload error:", error);
    res.status(500).json({ error: error.message ?? "Failed to process PDF" });
  }
});

export default router;
