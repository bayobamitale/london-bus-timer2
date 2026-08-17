const TFL_BASE_URL = 'https://api.tfl.gov.uk';

export class TflApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'TflApiError';
    this.status = status;
  }
}

export async function tflFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(path.startsWith('http') ? path : `${TFL_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new TflApiError(`TfL request failed (${res.status}): ${path}`, res.status);
  }

  return (await res.json()) as T;
}
