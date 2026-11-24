export interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
  retryOn?: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryOn = [408, 429, 500, 502, 503, 504],
    onRetry,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok && retryOn.includes(response.status)) {
        throw new HttpError(response.status, `HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      if (lastError instanceof HttpError) {
        const status = lastError.status;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          throw lastError;
        }
      } else {
        if (lastError.message.includes('HTTP 4') &&
            !lastError.message.includes('408') &&
            !lastError.message.includes('429')
        ) {
          throw lastError;
        }
      }

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      const delay = retryDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function postWithRetry<T = any>(
  url: string,
  data: any,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  return fetchJsonWithRetry<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function putWithRetry<T = any>(
  url: string,
  data: any,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  return fetchJsonWithRetry<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function patchWithRetry<T = any>(
  url: string,
  data: any,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  return fetchJsonWithRetry<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  return fetchJsonWithRetry<T>(url, {
    ...options,
    method: 'DELETE',
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch') ||
    error.name === 'TypeError'
  );
}

export function isRetryableError(error: Error): boolean {
  if (isNetworkError(error)) {
    return true;
  }

  if (error instanceof HttpError) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.some((status) =>
    error.message.includes(`HTTP ${status}`)
  );
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchWithRetryAndTimeout(
  url: string,
  options: FetchWithRetryOptions & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 30000, ...retryOptions } = options;

  return fetchWithRetry(url, {
    ...retryOptions,
    signal: AbortSignal.timeout(timeout),
  });
}
