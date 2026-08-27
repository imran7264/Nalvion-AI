import api from "./api";

export const getFinancialInsights = async () => {
  const response = await api.get("/ai/insights");

  return response.data;
};

export const askNalvion = async (question) => {
  const response = await api.post("/ai/ask", {
    question,
  });

  return response.data;
};