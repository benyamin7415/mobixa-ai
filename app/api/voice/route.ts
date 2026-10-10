import { NextRequest } from "next/server";

export const runtime = "nodejs";

/*
============================================================
MOBIXA — VOICE (TEXT TO SPEECH)
============================================================

مسیر فایل در گیت‌هاب:
app/api/voice/route.ts

دو سرویس صدا:

1) Deepgram Aura-2  → برای ۷ زبان: انگلیسی، اسپانیایی، آلمانی،
   فرانسوی، هلندی، ایتالیایی و ژاپنی (از اعتبار ۲۰۰ دلاری Deepgram)
2) ElevenLabs       → برای فارسی و همه‌ی زبان‌های دیگر

انتخاب سرویس:
- اگر درخواست lang داشته باشد و از آن ۷ زبان باشد
  (و متن خط فارسی/عربی نداشته باشد) → Deepgram
- در غیر این صورت (یا اگر Deepgram خطا بدهد) → ElevenLabs

بخش «تبدیل متن به صدا» سایت lang نمی‌فرستد،
پس مثل قبل با ElevenLabs کار می‌کند.

Secret های Cloudflare:
- ELEVENLABS_API_KEY
- DEEPGRAM_API_KEY
*/

/* ---------- ElevenLabs ---------- */

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

const ALLOWED_MODELS = [
  "eleven_multilingual_v2",
  "eleven_v3",
  "eleven_flash_v2_5",
];

/* ---------- Deepgram Aura-2 (صدای مردانه برای هماهنگی با صدای فارسی) ---------- */

const DEEPGRAM_SPEAK_URL = "https://api.deepgram.com/v1/speak";

const DEEPGRAM_VOICES: Record<string, string> = {
  en: "aura-2-apollo-en",
  es: "aura-2-javier-es",
  de: "aura-2-julius-de",
  fr: "aura-2-hector-fr",
  nl: "aura-2-sander-nl",
  it: "aura-2-dionisio-it",
  ja: "aura-2-fujin-ja",
};

const DEEPGRAM_MAX_CHARS = 1900;

function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function normalizeLang(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().split(/[-_]/)[0];
}

function voiceSettingsFor(modelId: string) {
  /*
    مدل eleven_v3 فقط تنظیم stability را قبول می‌کند
    (مقدارهای 0.0 خلاقانه، 0.5 طبیعی، 1.0 پایدار)
  */

  if (modelId === "eleven_v3") {
    return { stability: 0.5 };
  }

  return {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
    use_speaker_boost: true,
  };
}

function callElevenLabs(
  apiKey: string,
  voiceId: string,
  text: string,
  modelId: string
) {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
      voiceId
    )}`,
    {
      method: "POST",

      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },

      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voiceSettingsFor(modelId),
      }),
    }
  );
}

function audioResponse(
  audio: ArrayBuffer,
  provider: "deepgram" | "elevenlabs"
) {
  return new Response(audio, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.byteLength.toString(),
      "Cache-Control": "no-store",
      "X-Voice-Provider": provider,
    },
  });
}

/*
  تلاش برای خواندن با Deepgram؛ اگر نشد null برمی‌گرداند
*/
async function tryDeepgram(
  text: string,
  lang: string
): Promise<Response | null> {
  const model = DEEPGRAM_VOICES[lang];
  const apiKey = (process.env.DEEPGRAM_API_KEY || "").trim();

  if (!model || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${DEEPGRAM_SPEAK_URL}?model=${encodeURIComponent(
        model
      )}&encoding=mp3`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.slice(0, DEEPGRAM_MAX_CHARS),
        }),
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
        `VOICE: Deepgram ${model} failed with ${response.status}:`,
        details
      );

      return null;
    }

    const audio = await response.arrayBuffer();

    if (audio.byteLength < 200) {
      return null;
    }

    return audioResponse(audio, "deepgram");
  } catch (error) {
    console.error("VOICE: Deepgram error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text = body?.text;
    const voiceId = body?.voiceId || DEFAULT_VOICE_ID;
    const lang = normalizeLang(body?.lang);

    const requestedModel =
      typeof body?.modelId === "string" &&
      ALLOWED_MODELS.includes(body.modelId)
        ? body.modelId
        : DEFAULT_MODEL_ID;

    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "متن وارد نشده است." },
        { status: 400 }
      );
    }

    if (typeof voiceId !== "string" || !voiceId.trim()) {
      return Response.json(
        { error: "مدل صدا انتخاب نشده است." },
        { status: 400 }
      );
    }

    /*
      ۷ زبان پشتیبانی‌شده توسط Deepgram → اول Deepgram
    */

    if (lang && DEEPGRAM_VOICES[lang] && !hasArabicScript(text)) {
      const deepgram = await tryDeepgram(text, lang);

      if (deepgram) {
        return deepgram;
      }
    }

    /*
      فارسی و بقیه‌ی زبان‌ها (یا خطای Deepgram) → ElevenLabs
    */

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error:
            "کلید ElevenLabs در Cloudflare تنظیم نشده است.",
        },
        { status: 500 }
      );
    }

    let response = await callElevenLabs(
      apiKey,
      voiceId,
      text,
      requestedModel
    );

    /*
      اگر مدل انتخابی مشکل داشت (نه اعتبار تمام شده و نه محدودیت تعداد)،
      یک بار با مدل قبلی امتحان می‌کنیم
    */

    if (
      !response.ok &&
      requestedModel !== DEFAULT_MODEL_ID &&
      [400, 403, 404, 422].includes(response.status)
    ) {
      console.error(
        `VOICE: model ${requestedModel} failed with ${response.status}, falling back`
      );

      response = await callElevenLabs(
        apiKey,
        voiceId,
        text,
        DEFAULT_MODEL_ID
      );
    }

    if (!response.ok) {
      const errorText = await response.text();

      let details = errorText;

      try {
        const parsed = JSON.parse(errorText);

        if (parsed?.detail?.message) {
          details = parsed.detail.message;
        } else if (parsed?.detail) {
          details =
            typeof parsed.detail === "string"
              ? parsed.detail
              : JSON.stringify(parsed.detail);
        }
      } catch {
        // متن خطا JSON نبود
      }

      return Response.json(
        {
          error: "ElevenLabs نتونست صدا رو تولید کنه.",
          details,
        },
        {
          status: response.status,
        }
      );
    }

    const audio = await response.arrayBuffer();

    return audioResponse(audio, "elevenlabs");
  } catch (error) {
    console.error("VOICE API ERROR:", error);

    return Response.json(
      {
        error: "خطایی در پردازش درخواست رخ داد.",
      },
      {
        status: 500,
      }
    );
  }
}
