let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getWompiToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch(
    "https://id.wompi.sv/connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.WOMPI_APP_ID!,
        client_secret: process.env.WOMPI_API_SECRET!,
        audience: "wompi_api",
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Error obteniendo token Wompi: ${JSON.stringify(data)}`
    );
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}
