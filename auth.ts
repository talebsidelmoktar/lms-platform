import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { phoneNumber } from "better-auth/plugins";
import { Pool } from "pg";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function withAltLocalOrigins(baseUrl: string) {
  try {
    const url = new URL(baseUrl);
    const http = new URL(url.toString());
    http.protocol = "http:";
    const https = new URL(url.toString());
    https.protocol = "https:";

    const fallbacks = [
      url.toString().replace(/\/$/, ""),
      http.toString().replace(/\/$/, ""),
      https.toString().replace(/\/$/, ""),
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://localhost:3000",
      "https://127.0.0.1:3000",
    ];

    return uniqueStrings(fallbacks);
  } catch {
    return uniqueStrings([baseUrl, "http://localhost:3000"]);
  }
}

function getChinguisoftConfig() {
  const validationKey = (process.env.CHINGUISOFT_VALIDATION_KEY ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/[{}]/g, "");
  const validationToken = (process.env.CHINGUISOFT_VALIDATION_TOKEN ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");

  const rawLang = (process.env.CHINGUISOFT_LANG?.trim() || "ar").toLowerCase();
  const lang = rawLang === "fr" ? "fr" : "ar";

  const debugLogCode =
    (process.env.CHINGUISOFT_DEBUG_LOG_CODE?.trim() ?? "").toLowerCase() ===
    "true";

  return { validationKey, validationToken, lang, debugLogCode };
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: requireEnv("DATABASE_URL"),
    ssl: { rejectUnauthorized: false },
  }),
  baseURL: requireEnv("BETTER_AUTH_URL").replace(/\/$/, ""),
  trustedOrigins: withAltLocalOrigins(requireEnv("BETTER_AUTH_URL")),
  socialProviders: {
    google: {
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      otpLength: 6,
      expiresIn: 600, // 10 minutes, matches Chinguisoft message
      phoneNumberValidator: async (phoneNumber) => {
        const digits = phoneNumber.replace(/[^\d]/g, "");
        const local =
          digits.startsWith("222") && digits.length === 11
            ? digits.slice(3)
            : digits;
        return /^[234]\d{7}$/.test(local);
      },
      callbackOnVerification: async (data, ctx) => {
        if (!ctx) return;

        const body = (ctx as unknown as { body?: unknown }).body;
        const desiredName =
          typeof body === "object" &&
          body !== null &&
          "desiredName" in body &&
          typeof (body as { desiredName?: unknown }).desiredName === "string"
            ? (body as { desiredName: string }).desiredName.slice(0, 80).trim()
            : "";

        const desiredPassword =
          typeof body === "object" &&
          body !== null &&
          "desiredPassword" in body &&
          typeof (body as { desiredPassword?: unknown }).desiredPassword ===
            "string"
            ? (body as { desiredPassword: string }).desiredPassword
                .slice(0, 200)
                .trim()
            : "";

        if (desiredName) {
          try {
            await ctx.context.internalAdapter.updateUser(data.user.id, {
              name: desiredName,
            });
          } catch (err) {
            console.warn(
              "[auth] callbackOnVerification update name failed",
              err,
            );
          }
        }

        if (desiredPassword) {
          try {
            const accounts = await ctx.context.internalAdapter.findAccounts(
              data.user.id,
            );
            const credentialAccount = accounts.find(
              (a) => a.providerId === "credential" && a.password,
            );
            if (!credentialAccount) {
              const passwordHash =
                await ctx.context.password.hash(desiredPassword);
              await ctx.context.internalAdapter.linkAccount({
                userId: data.user.id,
                providerId: "credential",
                accountId: data.user.id,
                password: passwordHash,
              });
            }
          } catch (err) {
            console.warn(
              "[auth] callbackOnVerification set password failed",
              err,
            );
          }
        }
      },
      signUpOnVerification: {
        getTempEmail(phoneNumber) {
          const normalized = phoneNumber.replace(/[^0-9+]/g, "");
          const safe = normalized.replace(/^\+/, "");
          return `phone_${safe}@local.invalid`;
        },
        getTempName(phoneNumber) {
          return `User ${phoneNumber}`;
        },
      },
      // Better Auth generates + verifies the OTP; Chinguisoft only delivers the SMS.
      // Chinguisoft supports passing an explicit `code`, so we can send Better Auth's code.
      async sendOTP({ phoneNumber, code }) {
        const { validationKey, validationToken, lang, debugLogCode } =
          getChinguisoftConfig();
        if (!validationKey || !validationToken) {
          throw new Error(
            "Missing CHINGUISOFT_VALIDATION_KEY / CHINGUISOFT_VALIDATION_TOKEN.",
          );
        }

        const response = await fetch(
          `https://chinguisoft.com/api/sms/validation/${validationKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Validation-token": validationToken,
            },
            body: JSON.stringify({
              phone: phoneNumber,
              lang,
              code: String(code),
            }),
          },
        );

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          if (response.status === 401) {
            console.error("[Chinguisoft] Unauthorized", {
              phoneNumber,
              validationKeyPrefix: validationKey.slice(0, 4),
              validationKeyLength: validationKey.length,
            });
          }
          throw new Error(
            `Chinguisoft send OTP failed (${response.status}). ${text}`.trim(),
          );
        }

        // For delivery debugging: confirm Chinguisoft accepted request + show remaining balance.
        // Do not log secrets. OTP logging is off by default; enable only temporarily.
        const text = await response.text().catch(() => "");
        try {
          const json = JSON.parse(text) as {
            code?: number | string;
            balance?: number;
          };
          const safe = {
            phoneNumber,
            balance: json.balance,
            providerCode: debugLogCode ? json.code : undefined,
          };
          console.info("[Chinguisoft] SMS request accepted", safe);
        } catch {
          console.info("[Chinguisoft] SMS request accepted", { phoneNumber });
        }
      },
    }),
  ],
});

export const authHandler = toNextJsHandler(auth.handler);
