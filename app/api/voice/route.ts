import { NextRequest } from "next/server";

export const runtime = "nodejs";

/*
============================================================
MOBIXA — VOICE (TEXT TO SPEECH via ElevenLabs)
============================================================

مسیر فایل در گیت‌هاب:
app/api/voice/route.ts

تغییرات نسبت به نسخه‌ی قبل:
- می‌شود با modelId مدل دیگری انتخاب کرد (مثلاً eleven_v3 برای فارسی)
- اگر modelId ارسال نشود، همان مدل قبلی (eleven_multilingual_v2) استفاده می‌شود،
  پس بخش «تبدیل متن به صدا» سایت مثل قبل کار می‌کند
- اگر مدل انتخابی خطا داد (غیر از اعتبار/محدودیت)، خودکار با مدل قبلی دوباره امتحان می‌شود
*/

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

const ALLOWED_MODELS = [
  "eleven_multilingual_v2",
  "eleven_v3",
  "eleven_flash_v2_5",
];

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text = body?.text;
    const voiceId = body?.voiceId || DEFAULT_VOICE_ID;

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

    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audio.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
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
