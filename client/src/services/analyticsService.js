import api from "./api";

export const getMonthlyAnalysis = async () => {
    const response = await api.get(
        "/analytics/monthly"
    )
    return response.data
}
