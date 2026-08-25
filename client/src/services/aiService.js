import api from "./api"

export const getFinancialInsight = async () => {
    const response = await api.get(
        "/ai/insights"
    )
    return response.data
}