const API_BASE = "http://127.0.0.1:8000";

/**
 * 取得用戶的財務設定 (GET /financial-setting/{user_id})
 */
export async function getFinancialSettingApi(user_id) {
    const res = await fetch(`${API_BASE}/financial-setting/${user_id}`);

    if (!res.ok) {
        let errorDetail = "Failed to fetch financial setting.";
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