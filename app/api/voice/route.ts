import { NextRequest } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL = "eleven_multilingual_v2";

function getApiKey() {
  return process.env.ELEVENLABS_API_KEY;
}

/*
  GET
  دریافت صداهای قابل دسترس اکانت از ElevenLabs
*/
export async function GET() {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return Response.json(
        {
          error: "ELEVENLABS_API_KEY تنظیم نشده است.",
        },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error: "خطا در دریافت صداهای ElevenLabs.",
          details: data,
        },
        { status: response.status }
      );
    }

    const voices = Array.isArray(data?.voices)
      ? data.voices.map((voice: any) => ({
          id: voice.voice_id,
          name: voice.name,
          description:
            voice.description ||
            voice.labels?.description ||
            "صدای هوش مصنوعی",
          category: voice.category || "",
          labels: voice.labels || {},
        }))
      : [];

    return Response.json({
      voices,
    });
  } catch {
    return Response.json(
      {
        error: "خطایی در دریافت صداها رخ داد.",
      },
      { status: 500 }
    );
  }
}

/*
  POST
  تبدیل متن به صدا
*/
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text = body?.text;
    const voiceId = body?.voiceId;
    const modelId = body?.modelId || DEFAULT_MODEL;

    if (!text || typeof text !== "string") {
      return Response.json(
        {
          error: "متن وارد نشده است.",
        },
        { status: 400 }
      );
    }

    if (!voiceId || typeof voiceId !== "string") {
      return Response.json(
        {
          error: "یک صدا انتخاب کن.",
        },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();

    if (!apiKey) {
      return Response.json(
        {
          error: "ELEVENLABS_API_KEY تنظیم نشده است.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
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
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      let details: any = errorText;

      try {
        details = JSON.parse(errorText);
      } catch {
        // متن خام است
      }

      return Response.json(
        {
          error: "ElevenLabs نتونست این صدا رو تولید کنه.",
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
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        error: "خطایی در پردازش درخواست رخ داد.",
      },
      { status: 500 }
    );
  }
}
