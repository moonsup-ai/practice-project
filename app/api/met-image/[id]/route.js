const OBJECT_API = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e7dfd2"/><stop offset="1" stop-color="#f3eee4"/></linearGradient></defs><rect width="1200" height="900" fill="url(#g)"/><text x="600" y="420" text-anchor="middle" fill="#7d8580" font-family="Arial,sans-serif" font-size="54" font-weight="700" letter-spacing="18">THE MET</text><text x="600" y="500" text-anchor="middle" fill="#7d8580" font-family="Arial,sans-serif" font-size="30">공개 이미지를 불러올 수 없습니다</text></svg>`;

function placeholder(status = 200) {
  return new Response(PLACEHOLDER_SVG, {
    status,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

export async function GET(_request, context) {
  const params = await context.params;
  const id = String(params?.id || "");
  if (!/^\d+$/.test(id)) return placeholder(400);

  try {
    const objectResponse = await fetch(`${OBJECT_API}${id}`, {
      headers: { "User-Agent": "met-family-guide/1.0" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });
    if (!objectResponse.ok) return placeholder();

    const object = await objectResponse.json();
    const imageUrl = object.primaryImageSmall || object.primaryImage || object.additionalImages?.[0];
    if (!imageUrl) return placeholder();

    const imageResponse = await fetch(imageUrl, {
      headers: { "User-Agent": "met-family-guide/1.0", Accept: "image/*" },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 86400 },
    });
    if (!imageResponse.ok) return placeholder();

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    return new Response(await imageResponse.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    });
  } catch {
    return placeholder();
  }
}
