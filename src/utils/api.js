const BASE_URL = "https://ksp-datathon-50043488989.development.catalystappsail.in";

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

export async function askQuestion(question, sessionId, token) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question: question, session_id: sessionId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export async function getGraph(firId, token) {
  const res = await fetch(`${BASE_URL}/graph?fir_id=${firId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load graph");
  return data;
}

export async function searchFIRs(query, token) {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Search failed");
  return data;
}
