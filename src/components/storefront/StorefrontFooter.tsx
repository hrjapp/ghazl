type Store = {
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  socialLinks: unknown;
  slug: string;
};

export function StorefrontFooter({ store }: { store: Store }) {
  const year = new Date().getFullYear();
  const storeHomeUrl = `/preview/${store.slug}`;

  return (
    <footer className="border-t border-gray-100 bg-gray-50/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <span className="text-lg">🧶</span>
              </div>
              <span className="text-lg font-extrabold text-gray-900">
                {store.name}
              </span>
            </div>
            {store.description && (
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {store.description}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-gray-900">تواصل معنا</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              {store.phone && (
                <li dir="ltr" className="text-right nums">
                  {store.phone}
                </li>
              )}
              {store.email && (
                <li dir="ltr" className="text-right">
                  {store.email}
                </li>
              )}
              {(store.city || store.address) && (
                <li>
                  {[store.city, store.address].filter(Boolean).join("، ")}
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-gray-900">طرق الدفع</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {["الدفع عند الاستلام", "بطاقة مدى", "فيزا"].map((m) => (
                <span
                  key={m}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          © {year} {store.name} — جميع الحقوق محفوظة
          <span className="block mt-1">
            مدعوم بواسطة{" "}
            <a href={storeHomeUrl} className="font-bold text-brand-600">
              متاجر
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
