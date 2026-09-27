import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, modelId } = await req.json();

    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "متن وارد نشده است." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "ELEVENLABS_API_KEY تنظیم نشده است." },
        { status: 500 }
      );
    }

    const selectedVoice =
      voiceId || "21m00Tcm4TlvDq8ikWAM";

    const selectedModel =
      modelId || "eleven_multilingual_v2";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: selectedModel,
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

      return Response.json(
        {
          error: "خطا در تبدیل متن به صدا",
          details: errorText,
        },
        { status: response.status }
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
      { error: "خطایی در پردازش درخواست رخ داد." },
      { status: 500 }
    );
  }
}
