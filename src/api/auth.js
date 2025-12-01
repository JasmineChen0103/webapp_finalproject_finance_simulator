const API_BASE = "http://127.0.0.1:8000";

/** 登入 */
export async function loginApi(email, password) {
    const res = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        throw new Error("Invalid login");
    }

    return await res.json();
}

/** 註冊 */
export async function registerApi(username, email, password, confirmPwd){
    const res = await fetch(`${API_BASE}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            email,
            password,
            confirmPwd
        }),
    });

    if (!res.ok) {
        throw new Error("Registration failed");
    }

    return await res.json();
}
