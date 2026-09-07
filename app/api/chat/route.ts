import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({
          error: "پیام معتبر نیست.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Gemini API Key تنظیم نشده است.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = "خطا در ارتباط با Gemini";

      try {
        const data = await response.json();

        errorMessage =
          data?.error?.message ||
          data?.error?.status ||
          errorMessage;
      } catch {}

      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const data = await response.json();

    const parts =
      data?.candidates?.[0]?.content?.parts;

    let text = "";

    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (
          typeof part?.text === "string"
        ) {
          text += part.text;
        }
      }
    }

    if (!text) {
      return new Response(
        JSON.stringify({
          error: "Gemini پاسخ متنی معتبری برنگرداند.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        text,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error(
      "CHAT_API_TEST_ERROR:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "خطایی در سرور رخ داد.";

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}
