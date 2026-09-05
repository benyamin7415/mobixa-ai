import { NextRequest } from "next/server";

type ChatMessage = {
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

    /*
     * تاریخچه را بررسی می‌کنیم.
     * فقط پیام‌های معتبر user و assistant پذیرفته می‌شوند.
     */
    const validHistory: ChatMessage[] = Array.isArray(history)
      ? history.filter(
          (item: ChatMessage) =>
            item &&
            (item.role === "user" ||
              item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim().length > 0
        )
      : [];

    /*
     * برای جلوگیری از بزرگ شدن بیش از حد درخواست،
     * حداکثر 30 پیام آخر را به Gemini می‌فرستیم.
     */
    const recentHistory = validHistory.slice(-30);

    /*
     * پیام فعلی را هم به انتهای تاریخچه اضافه می‌کنیم.
     */
    const conversation = [
      ...recentHistory,
      {
        role: "user",
        content: message,
      },
    ];

    /*
     * Gemini Interactions API از input به صورت آرایه
     * برای ارسال مکالمه چندپیامی پشتیبانی می‌کند.
     */
    const input = conversation.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      content: [
        {
          type: "text",
          text: item.content,
        },
      ],
    }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: "gemini-3.6-flash",
          input,
          store: false,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      let data: any = null;

      try {
        data = await response.json();
      } catch {}

      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            "خطا در ارتباط با Gemini",
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
        "Content-Type": "text/event-stream",
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
