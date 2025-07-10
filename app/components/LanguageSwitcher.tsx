"use client";
import {useRouter, usePathname, useLocale} from 'next-intl/client';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const changeLocale = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    document.cookie = `NEXT_LOCALE=${next}; path=/`;
    router.replace(pathname, {locale: next});
  };

  return (
    <select
      onChange={changeLocale}
      value={locale}
      className="bg-zinc-800 text-white text-sm rounded p-1"
    >
      <option value="en">EN</option>
      <option value="pt">PT</option>
    </select>
  );
}
