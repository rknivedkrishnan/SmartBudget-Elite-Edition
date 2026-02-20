
import { GoogleGenAI } from "@google/genai";
import { Transaction, BudgetSummary } from "./types";

const getAI = (userKey?: string) => {
  const apiKey = userKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key");
  }
  return new GoogleGenAI(apiKey);
};

export async function getBudgetInsights(summary: BudgetSummary, transactions: Transaction[], userKey?: string) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const expenseBreakdown = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    As a professional financial advisor, analyze this monthly budget:
    Total Income: ${summary.totalIncome}
    Total Expenses: ${summary.totalExpenses}
    Net Savings: ${summary.netSavings}
    Savings Rate: ${summary.savingsRate.toFixed(2)}%

    Expense Breakdown by Category:
    ${JSON.stringify(expenseBreakdown, null, 2)}

    Provide 3 concise, actionable pieces of advice to improve this person's financial health. 
    Keep the tone encouraging but realistic.
    Format the response as 3 bullet points.
  `;

  try {
    const ai = getAI(userKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm unable to provide insights at the moment. Please try again later.";
  }
}
