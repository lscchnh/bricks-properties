export type Property = {
  id: string;
  address: string;
  bricksOwned: number;
  url: string;
  imageUrl?: string;
  returnOnInvestment?: number;
  rentalDividends?: number;
  lat?: number;
  lng?: number;
};

type Raw = Record<string, unknown>;

const isObject = (value: unknown): value is Raw =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toNumber = (value: unknown): number | undefined => {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
};

const firstString = (...values: unknown[]): string | undefined =>
  values.find((v): v is string => typeof v === "string" && v.trim() !== "")?.trim();

function readAddress(raw: Raw): string | undefined {
  const { address } = raw;
  if (typeof address === "string") return firstString(address);
  if (isObject(address)) {
    const localized = firstString(address.fr, address.en);
    if (localized) return localized;
    const parts = [address.street, address.zipCode ?? address.postalCode, address.city]
      .map((p) => firstString(p))
      .filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return firstString(raw.name, raw.title, raw.city);
}

function readImage(raw: Raw): string | undefined {
  const gallery = raw.imageGallery ?? raw.images;
  const first = Array.isArray(gallery) ? gallery[0] : undefined;
  return firstString(first, isObject(first) ? first.url : undefined, raw.image, raw.coverImage);
}

function readOwned(raw: Raw): number {
  const investor = raw.investorBricks;
  return toNumber(isObject(investor) ? investor.owned : undefined) ?? 0;
}

/**
 * Converts a property object from the Bricks.co API into the shape the map uses.
 * The API is undocumented and has changed shape before, so every field is read defensively.
 */
export function normalizeProperty(raw: unknown): Property | undefined {
  if (!isObject(raw)) return undefined;
  const id = raw.id;
  if (typeof id !== "string" && typeof id !== "number") return undefined;
  const address = readAddress(raw);
  if (!address) return undefined;

  return {
    id: String(id),
    address,
    bricksOwned: readOwned(raw),
    url: `https://app.bricks.co/properties/${encodeURIComponent(String(id))}`,
    imageUrl: readImage(raw),
    returnOnInvestment: toNumber(raw.returnOnInvestment),
    rentalDividends: toNumber(raw.rentalDividends),
    lat: toNumber(raw.lat ?? raw.latitude),
    lng: toNumber(raw.lng ?? raw.lon ?? raw.longitude),
  };
}

export const isLocated = (p: Property): p is Property & { lat: number; lng: number } =>
  p.lat !== undefined && p.lng !== undefined;
