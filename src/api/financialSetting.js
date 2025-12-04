// Base URL
const BASE_URL = "http://localhost:8000/financial-setting";

// POST → create/update user's financial setting
export async function saveFinancialSetting(data) {
  const payload = {
    user_id: data.user_id,

    // 後端要求的欄位名稱
    monthlyIncome: Number(data.monthlyIncome),
    totalAsset: Number(data.totalAsset),

    // array 結構後端會自動解析
    expenses: data.expenses || [],
    investments: data.investments || [],

    riskMode: data.riskMode || "fixed",
    fixedReturn: Number(data.fixedReturn || 0),
  };

  console.log("送到後端的 payload：", payload);

  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to update financial setting.");
  }

  return res.json();
}

// GET → retrieve user's financial setting
export async function getFinancialSetting(userId) {
  const res = await fetch(`${BASE_URL}/${userId}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch financial setting.");
  }

  return res.json();
}
