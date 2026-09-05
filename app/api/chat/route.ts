import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "پیام معتبر نیست." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key تنظیم نشده است." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "gemini-3.6-flash",
          input: message,
          store: false
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "خطا در ارتباط با Gemini",
        },
        { status: response.status }
      );
    }

    const steps = data?.steps || [];

    const modelOutput = steps.find(
      (step: any) => step.type === "model_output"
    );

    const reply =
      modelOutput?.content?.find(
        (item: any) => item.type === "text"
      )?.text ||
      "متأسفانه پاسخی دریافت نشد.";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "خطایی در سرور رخ داد." },
      { status: 500 }
    );
  }
}
