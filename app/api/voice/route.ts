import { NextRequest } from "next/server";

export const runtime = "nodejs";

const ELEVENLABS_API = "https://api.elevenlabs.io";

type ElevenVoice = {
  voice_id: string;
  name: string;
  description?: string | null;
  category?: string;
  labels?: Record<string, string>;
};

function getApiKey() {
  return process.env.ELEVENLABS_API_KEY;
}

/**
 * GET
 * گرفتن Voiceهایی که برای استفاده مستقیم از API مناسب‌اند.
 *
 * عمداً Voice Library را وارد لیست نمی‌کنیم،
 * چون Free Tier اجازه استفاده از Library Voiceها از API را نمی‌دهد.
 */
export async function GET() {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return Response.json(
        {
          error:
            "ELEVENLABS_API_KEY تنظیم نشده است. کلید ElevenLabs را در Cloudflare Environment Variables قرار بده.",
        },
        { status: 500 }
      );
    }

    const headers = {
      "xi-api-key": apiKey,
      Accept: "application/json",
    };

    const requests = [
      fetch(
        `${ELEVENLABS_API}/v2/voices?page_size=100&voice_type=default`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      ),
      fetch(
        `${ELEVENLABS_API}/v2/voices?page_size=100&voice_type=non-community`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      ),
    ];

    const responses = await Promise.all(requests);

    const results: ElevenVoice[] = [];

    for (const response of responses) {
      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (Array.isArray(data?.voices)) {
        results.push(...data.voices);
      }
    }

    const uniqueVoices = Array.from(
      new Map(
        results.map((voice) => [voice.voice_id, voice])
      ).values()
    );

    if (uniqueVoices.length === 0) {
      return Response.json(
        {
          error:
            "هیچ Voice قابل استفاده‌ای برای API پیدا نشد. از داخل ElevenLabs یک Voice شخصی/مجاز برای حسابت اضافه کن.",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        voices: uniqueVoices.map((voice) => ({
          id: voice.voice_id,
          name: voice.name || "AI Voice",
          description:
            voice.description ||
            voice.labels?.description ||
            "صدای طبیعی و حرفه‌ای",
        })),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return Response.json(
      {
        error: "دریافت لیست صداها با خطا مواجه شد.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 * تبدیل متن به صدا
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text =
      typeof body?.text === "string" ? body.text.trim() : "";

    const voiceId =
      typeof body?.voiceId === "string"
        ? body.voiceId.trim()
        : "";

    const modelId =
      typeof body?.modelId === "string" && body.modelId.trim()
        ? body.modelId.trim()
        : "eleven_multilingual_v2";

    if (!text) {
      return Response.json(
        {
          error: "متنی برای تبدیل به صدا وارد نشده است.",
        },
        { status: 400 }
      );
    }

    if (!voiceId) {
      return Response.json(
        {
          error: "یک مدل صدا انتخاب کن.",
        },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();

    if (!apiKey) {
      return Response.json(
        {
          error:
            "ELEVENLABS_API_KEY در Cloudflare تنظیم نشده است.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${ELEVENLABS_API}/v1/text-to-speech/${encodeURIComponent(
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
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      let details = errorText;

      try {
        const parsed = JSON.parse(errorText);

        if (parsed?.detail?.message) {
          details = parsed.detail.message;
        } else if (parsed?.detail?.status) {
          details = parsed.detail.status;
        }
      } catch {
        // متن خطای خام را نگه می‌داریم
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
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        error: "خطایی در پردازش درخواست تولید صدا رخ داد.",
      },
      { status: 500 }
    );
  }
}
