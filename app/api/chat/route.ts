import { NextRequest } from "next/server";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({
          error: "پیام معتبر نیست.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
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
            "Content-Type": "application/json",
          },
        }
      );
    }

    const validHistory: Message[] = Array.isArray(history)
      ? history.filter(
          (item: Message) =>
            (item.role === "user" ||
              item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim()
        )
      : [];

    // فقط آخرین 30 پیام برای کنترل حجم درخواست
    const recentHistory = validHistory.slice(-30);

    const contents = recentHistory.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: item.content,
        },
      ],
    }));

    // پیام جدید کاربر
    contents.push({
      role: "user",
      parts: [
        {
          text: message,
        },
      ],
    });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          contents,
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = "خطا در ارتباط با Gemini";

      try {
        const data = await response.json();

        errorMessage =
          data?.error?.message || errorMessage;
      } catch {}

      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!response.body) {
      return new Response(
        JSON.stringify({
          error: "پاسخ Streaming دریافت نشد.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "خطایی در سرور رخ داد.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
