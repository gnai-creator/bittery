"use client";
import {useRouter, usePathname} from '../../navigation';
import {useLocale} from 'next-intl';

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
      <option value="es">ES</option>
      <option value="fr">FR</option>
      <option value="sv">SV</option>
      <option value="de">DE</option>
      <option value="ru">RU</option>
    </select>
  );
}
