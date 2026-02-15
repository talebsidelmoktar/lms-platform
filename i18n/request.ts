import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const headerLocale = (await headers()).get("x-locale");
  const cookieLocale = (await cookies()).get("academy-language")?.value;
  const requested = headerLocale ?? cookieLocale ?? routing.defaultLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [common, auth, dashboard] = await Promise.all([
    import(`../locales/${locale}/common.json`),
    import(`../locales/${locale}/auth.json`),
    import(`../locales/${locale}/dashboard.json`),
  ]);

  return {
    locale,
    messages: {
      common: common.default,
      auth: auth.default,
      dashboard: dashboard.default,
    },
  };
});
