import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Financial advice knowledge base
export const financialKnowledge = [
  {
    id: "1",
    title: "50/30/20 Budget Rule",
    content:
      "The 50/30/20 rule recommends spending 50% of income on needs (rent, groceries, utilities), 30% on wants (dining, entertainment, shopping), and 20% on savings and debt repayment. This is the most widely recommended budgeting framework for beginners.",
  },
  {
    id: "2",
    title: "Food and Dining Benchmarks",
    content:
      "Healthy spending on food is 10-15% of monthly income. Groceries should be 8-10% and dining out 5-7%. If dining out exceeds 10% of income, it is considered high. Meal prepping and cooking at home can reduce food costs by 40-60%.",
  },
  {
    id: "3",
    title: "Housing Costs",
    content:
      "Housing should not exceed 30% of monthly income. This includes rent, utilities, and maintenance. If housing exceeds 40%, it puts significant pressure on other budget categories. Consider roommates or relocating if housing costs are too high.",
  },
  {
    id: "4",
    title: "Transport Spending",
    content:
      "Transport costs should be 10-15% of income. This includes fuel, ride-sharing, public transport, and vehicle maintenance. Excessive ride-sharing (Uber/Ola) is a common overspend area. Using public transport can cut transport costs by 60-70%.",
  },
  {
    id: "5",
    title: "Entertainment and Subscriptions",
    content:
      "Entertainment including streaming services, subscriptions, and leisure should stay under 5-8% of income. Audit subscriptions every 3 months — most people pay for 2-3 services they rarely use. Cancel unused subscriptions immediately.",
  },
  {
    id: "6",
    title: "Emergency Fund",
    content:
      "Everyone needs an emergency fund covering 3-6 months of expenses. Start by saving 10% of income monthly until the fund is built. Keep it in a liquid savings account, not invested. This prevents going into debt during unexpected events.",
  },
  {
    id: "7",
    title: "Debt Management",
    content:
      "High-interest debt (credit cards, personal loans) should be paid off aggressively. Use the avalanche method: pay minimums on all debts, put extra money toward the highest interest rate debt first. Never carry a credit card balance if avoidable.",
  },
  {
    id: "8",
    title: "Savings Rate",
    content:
      "A healthy savings rate is 20% of income. Below 10% is considered low. Even saving 5% consistently is better than nothing. Automate savings by setting up auto-transfers on payday so you save before you spend.",
  },
  {
    id: "9",
    title: "Shopping and Impulse Spending",
    content:
      "Shopping and discretionary spending should be under 10% of income. Common overspend triggers: late night online shopping, sales and discounts, boredom shopping. Use a 24-hour rule — wait a day before any unplanned purchase over ₹1000.",
  },
  {
    id: "10",
    title: "Indian Expense Benchmarks",
    content:
      "For average Indian urban salaries: Rent 20-35% of income, Groceries 8-12%, Dining 5-8%, Transport 8-12%, Entertainment 3-5%, Utilities 3-5%, Savings minimum 20%. Metro cities like Mumbai and Delhi have higher housing costs so adjust accordingly.",
  },
];

// Vector store
interface VectorEntry {
  id: string;
  title: string;
  content: string;
  embedding: number[];
}

class FinancialVectorStore {
  private entries: VectorEntry[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    console.log("Building financial knowledge base...");
    for (const doc of financialKnowledge) {
      const embedding = await this.getEmbedding(doc.content);
      this.entries.push({ ...doc, embedding });
    }
    this.initialized = true;
    console.log("Knowledge base ready.");
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response: any = await genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: { taskType: "RETRIEVAL_DOCUMENT" },
    });
    return response!.embeddings![0].values!;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => {
      const bj = b[i] ?? 0;
      return sum + val * bj;
    }, 0);
    const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return dot / (magA * magB);
  }

  async search(query: string, topK = 2): Promise<string> {
    const queryEmbedding = await this.getEmbedding(query);
    const results = this.entries
      .map((e) => ({
        ...e,
        score: this.cosineSimilarity(queryEmbedding, e.embedding),
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, topK);
    return results.map((r) => `[${r.title}]\n${r.content}`).join("\n\n");
  }
}

export const vectorStore = new FinancialVectorStore();
