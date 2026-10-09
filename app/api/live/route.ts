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
- متن تشخیص‌داده‌شده و زبان را برمی‌گرداند

حالت‌های زبان (پارامتر lang):
- fa   → فقط فارسی (سریع‌ترین و دقیق‌ترین برای فارسی)
- en   → فقط انگلیسی
- auto → تشخیص خودکار زبان (فارسی + تمام زبان‌های Whisper)

در حالت auto:
1) همزمان دو درخواست می‌رود:
   - Nova-3 فارسی (سریع)
   - Whisper با تشخیص خودکار زبان (برای بقیه‌ی زبان‌ها)
2) اگر Nova-3 با اطمینان بالا فارسی تشخیص داد، همان لحظه جواب برمی‌گردد
3) در غیر این صورت نتیجه‌ی Whisper استفاده می‌شود

اسم Secret در Cloudflare باید این باشد:
DEEPGRAM_API_KEY
*/

const DEEPGRAM_LISTEN_URL =
  "https://api.deepgram.com/v1/listen";

const DEEPGRAM_PROJECTS_URL =
  "https://api.deepgram.com/v1/projects";

const NOVA_MODEL = "nova-3";
const WHISPER_MODEL = "whisper-medium";

type LangMode = "auto" | "fa" | "en";

const DEFAULT_LANG: LangMode = "auto";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MIN_AUDIO_BYTES = 800;

const TIMEOUT_MS = 25000;

/*
  اگر Nova-3 فارسی با این اطمینان (یا بیشتر) جواب داد،
  دیگر منتظر Whisper نمی‌مانیم.
*/
const FAST_PATH_CONFIDENCE = 0.8;

type ListenResult = {
  ok: boolean;
  status: number;
  transcript: string;
  confidence: number;
  language: string;
};

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

function parseLang(value: string | null): LangMode {
  if (value === "fa" || value === "en" || value === "auto") {
    return value;
  }

  return DEFAULT_LANG;
}

/*
  کد زبان را ساده می‌کند: fa-IR → fa ، "Persian" → fa
*/
function normalizeLang(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const lower = value.trim().toLowerCase();

  if (lower === "persian" || lower === "farsi") {
    return "fa";
  }

  if (lower === "english") {
    return "en";
  }

  return lower.split(/[-_]/)[0];
}

/*
  چند درصد حرف‌های متن، عربی/فارسی (خط فارسی) است؟
*/
function arabicScriptRatio(text: string): number {
  const letters = text.match(/[A-Za-z\u0600-\u06FF]/g);

  if (!letters || letters.length === 0) {
    return 0;
  }

  const arabic = text.match(/[\u0600-\u06FF]/g);

  return (arabic ? arabic.length : 0) / letters.length;
}

/*
  یک درخواست به Deepgram
*/
async function listen(
  apiKey: string,
  audio: ArrayBuffer,
  contentType: string,
  params: Record<string, string>,
  signal: AbortSignal
): Promise<ListenResult> {
  const response = await fetch(
    `${DEEPGRAM_LISTEN_URL}?${new URLSearchParams(
      params
    ).toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: audio,
      signal,
    }
  );

  if (!response.ok) {
    let details = "";

    try {
      details = await response.text();
    } catch {
      // ignore
    }

    console.error(
      `DEEPGRAM_STT_ERROR ${response.status} (${
        params.model
      }):`,
      details
    );

    return {
      ok: false,
      status: response.status,
      transcript: "",
      confidence: 0,
      language: "",
    };
  }

  const data = await response.json();

  const channel = data?.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];

  return {
    ok: true,
    status: response.status,
    transcript:
      typeof alternative?.transcript === "string"
        ? alternative.transcript.trim()
        : "",
    confidence:
      typeof alternative?.confidence === "number"
        ? alternative.confidence
        : 0,
    language: normalizeLang(channel?.detected_language),
  };
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

    const lang = parseLang(
      request.nextUrl.searchParams.get("lang")
    );

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
        language: "",
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

    const master = new AbortController();

    const timer = setTimeout(() => {
      master.abort();
    }, TIMEOUT_MS);

    const onClientAbort = () => {
      master.abort();
    };

    if (request.signal.aborted) {
      master.abort();
    } else {
      request.signal.addEventListener(
        "abort",
        onClientAbort
      );
    }

    try {
      /* ---------- حالت‌های تک‌زبانه ---------- */

      if (lang === "fa" || lang === "en") {
        const result = await listen(
          apiKey,
          audio,
          contentType,
          {
            model: NOVA_MODEL,
            language: lang,
            smart_format: "true",
            punctuate: "true",
          },
          master.signal
        );

        if (!result.ok) {
          return json(
            { error: friendlyError(result.status) },
            result.status === 413 ? 413 : 502
          );
        }

        return json({
          transcript: result.transcript,
          confidence: result.confidence,
          language: lang,
        });
      }

      /* ---------- حالت خودکار ---------- */

      const whisperCtrl = new AbortController();

      const onMasterAbort = () => {
        whisperCtrl.abort();
      };

      master.signal.addEventListener(
        "abort",
        onMasterAbort
      );

      const persianPromise = listen(
        apiKey,
        audio,
        contentType,
        {
          model: NOVA_MODEL,
          language: "fa",
          smart_format: "true",
          punctuate: "true",
        },
        master.signal
      ).catch(() => null);

      const whisperPromise = listen(
        apiKey,
        audio,
        contentType,
        {
          model: WHISPER_MODEL,
          detect_language: "true",
          smart_format: "true",
        },
        whisperCtrl.signal
      ).catch(() => null);

      const persian = await persianPromise;

      /*
        مسیر سریع: Nova-3 با اطمینان بالا فارسی تشخیص داد
      */

      if (
        persian &&
        persian.ok &&
        persian.transcript &&
        persian.confidence >= FAST_PATH_CONFIDENCE &&
        arabicScriptRatio(persian.transcript) >= 0.8
      ) {
        whisperCtrl.abort();

        return json({
          transcript: persian.transcript,
          confidence: persian.confidence,
          language: "fa",
        });
      }

      const whisper = await whisperPromise;

      if (whisper && whisper.ok) {
        /*
          اگر Whisper گفت زبان فارسی است،
          متن Nova-3 (دقیق‌تر) را ترجیح می‌دهیم
        */

        if (
          whisper.language === "fa" &&
          persian &&
          persian.ok &&
          persian.transcript
        ) {
          return json({
            transcript: persian.transcript,
            confidence: persian.confidence,
            language: "fa",
          });
        }

        if (whisper.transcript) {
          return json({
            transcript: whisper.transcript,
            confidence: whisper.confidence,
            language: whisper.language,
          });
        }
      }

      /*
        Whisper جواب نداد؛ اگر متن Nova-3 شبیه فارسی بود از آن استفاده می‌کنیم
      */

      if (
        persian &&
        persian.ok &&
        persian.transcript &&
        arabicScriptRatio(persian.transcript) >= 0.5
      ) {
        return json({
          transcript: persian.transcript,
          confidence: persian.confidence,
          language: "fa",
        });
      }

      /*
        اگر هر دو درخواست خطای سرویس داشتند، خطا را برمی‌گردانیم؛
        اگر فقط چیزی شنیده نشد، متن خالی
      */

      const failed =
        (!whisper || !whisper.ok) &&
        (!persian || !persian.ok);

      if (failed) {
        const status =
          (whisper && whisper.status) ||
          (persian && persian.status) ||
          0;

        return json(
          { error: friendlyError(status) },
          502
        );
      }

      return json({
        transcript: "",
        confidence: 0,
        language: "",
      });
    } finally {
      clearTimeout(timer);

      request.signal.removeEventListener(
        "abort",
        onClientAbort
      );
    }
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
