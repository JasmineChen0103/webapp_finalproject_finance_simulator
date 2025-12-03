const API_BASE = "http://127.0.0.1:8000";

/**
 * 呼叫後端 API 執行財務模擬 (POST /simulate)
 * @param {object} requestPayload - SimulationRequest payload
 * @returns {Promise<object>} 包含 lineChart, pieChart, statCards 數據的結果
 */
export async function simulateApi(requestPayload) {
    const res = await fetch(`${API_BASE}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
        let errorDetail = "Simulation failed.";
        try {
            const errorData = await res.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (e) {
            // ignore JSON parse error
        }
        throw new Error(errorDetail);
    }

    return await res.json();
}