import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
============================================================
MOBIXA — LIVE VOICE (SPEECH TO TEXT via Deepgram)
============================================================

مسیر فایل در گیت‌هاب:
app/api/live/route.ts

کار این فایل:
- صدای ضبط‌شده‌ی کاربر را از مرورگر می‌گیرد
- به Deepgram می‌فرستد
- متن تشخیص‌داده‌شده را برمی‌گرداند

کلید Deepgram فقط اینجا (سمت سرور) استفاده می‌شود
و هیچ‌وقت به مرورگر کاربر نمی‌رسد.

اسم Secret در Cloudflare باید این باشد:
DEEPGRAM_API_KEY
*/

const DEEPGRAM_LISTEN_URL =
  "https://api.deepgram.com/v1/listen";

const DEEPGRAM_PROJECTS_URL =
  "https://api.deepgram.com/v1/projects";

const MODEL = "nova-3";

const ALLOWED_LANGUAGES = ["fa", "en"];
const DEFAULT_LANGUAGE = "fa";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MIN_AUDIO_BYTES = 800;

const TIMEOUT_MS = 20000;

function getApiKey(): string {
  return (
    process.env.DEEPGRAM_API_KEY ||
    process.env.DEEPGRAM_KEY ||
    ""
  ).trim();
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type":
        "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function friendlyError(status: number): string {
  if (status === 401 || status === 403) {
    return "اتصال به سرویس تشخیص صدا برقرار نشد. کلید Deepgram را بررسی کن.";
  }

  if (status === 402) {
    return "اعتبار سرویس تشخیص صدا تمام شده است.";
  }

  if (status === 413) {
    return "صدای ضبط‌شده خیلی طولانی است. کوتاه‌تر صحبت کن.";
  }

  if (status === 429) {
    return "سرویس تشخیص صدا فعلاً شلوغ است. چند لحظه بعد دوباره امتحان کن.";
  }

  return "تشخیص صدا انجام نشد. دوباره امتحان کن.";
}

/*
============================================================
GET — بررسی سالم بودن تنظیمات
============================================================

/api/live          → فقط چک می‌کند کلید تنظیم شده یا نه
/api/live?check=1  → کلید را با Deepgram هم تست می‌کند
*/

export async function GET(request: NextRequest) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return json(
      {
        configured: false,
        error:
          "کلید Deepgram در Cloudflare تنظیم نشده است.",
      },
      500
    );
  }

  if (
    request.nextUrl.searchParams.get("check") !==
    "1"
  ) {
    return json({ configured: true });
  }

  try {
    const response = await fetch(
      DEEPGRAM_PROJECTS_URL,
      {
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      }
    );

    return json({
      configured: true,
      keyValid: response.ok,
      status: response.status,
    });
  } catch {
    return json({
      configured: true,
      keyValid: false,
      status: 0,
    });
  }
}

/*
============================================================
POST — تبدیل صدا به متن
============================================================
*/

export async function POST(request: NextRequest) {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return json(
        {
          error:
            "کلید Deepgram در Cloudflare تنظیم نشده است.",
        },
        500
      );
    }

    const requestedLanguage =
      request.nextUrl.searchParams.get("lang") ||
      DEFAULT_LANGUAGE;

    const language = ALLOWED_LANGUAGES.includes(
      requestedLanguage
    )
      ? requestedLanguage
      : DEFAULT_LANGUAGE;

    const audio = await request.arrayBuffer();

    if (audio.byteLength > MAX_AUDIO_BYTES) {
      return json(
        { error: friendlyError(413) },
        413
      );
    }

    /*
      صدای خیلی کوتاه یعنی کاربر چیزی نگفته؛
      خطا نمی‌دهیم، فقط متن خالی برمی‌گردانیم.
    */

    if (audio.byteLength < MIN_AUDIO_BYTES) {
      return json({
        transcript: "",
        confidence: 0,
      });
    }

    const rawType =
      request.headers.get("content-type") || "";

    const baseType = rawType
      .split(";")[0]
      .trim()
      .toLowerCase();

    const contentType =
      baseType.startsWith("audio/") ||
      baseType === "video/webm" ||
      baseType === "video/mp4"
        ? baseType
        : "application/octet-stream";

    const params = new URLSearchParams({
      model: MODEL,
      language,
      smart_format: "true",
      punctuate: "true",
    });

    const controller = new AbortController();

    const timer = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

    const onClientAbort = () => {
      controller.abort();
    };

    if (request.signal.aborted) {
      controller.abort();
    } else {
      request.signal.addEventListener(
        "abort",
        onClientAbort
      );
    }

    let response: Response;

    try {
      response = await fetch(
        `${DEEPGRAM_LISTEN_URL}?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": contentType,
          },
          body: audio,
          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timer);
      request.signal.removeEventListener(
        "abort",
        onClientAbort
      );
    }

    if (!response.ok) {
      let details = "";

      try {
        details = await response.text();
      } catch {
        // ignore
      }

      console.error(
        `DEEPGRAM_STT_ERROR ${response.status}:`,
        details
      );

      return json(
        { error: friendlyError(response.status) },
        response.status === 413 ? 413 : 502
      );
    }

    const data = await response.json();

    const alternative =
      data?.results?.channels?.[0]
        ?.alternatives?.[0];

    const transcript =
      typeof alternative?.transcript === "string"
        ? alternative.transcript.trim()
        : "";

    const confidence =
      typeof alternative?.confidence === "number"
        ? alternative.confidence
        : 0;

    return json({
      transcript,
      confidence,
    });
  } catch (error) {
    console.error("LIVE_STT_API_ERROR:", error);

    const aborted =
      error instanceof Error &&
      error.name === "AbortError";

    return json(
      {
        error: aborted
          ? "زمان تشخیص صدا تمام شد. دوباره امتحان کن."
          : "خطایی در پردازش صدا رخ داد.",
      },
      aborted ? 504 : 500
    );
  }
}
