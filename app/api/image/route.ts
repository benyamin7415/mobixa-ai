import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({
          error: "لطفاً توضیح تصویر را وارد کنید.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (prompt.length > 2048) {
      return new Response(
        JSON.stringify({
          error: "متن درخواست تصویر بیش از حد طولانی است.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { env } = getCloudflareContext();

    const ai = (env as any).AI;

    if (!ai) {
      return new Response(
        JSON.stringify({
          error: "Workers AI به پروژه متصل نیست.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("IMAGE_REQUEST_START");

    const result = await ai.run(
      "@cf/black-forest-labs/flux-1-schnell",
      {
        prompt: prompt.trim(),
        steps: 4,
        seed: Math.floor(Math.random() * 2147483647),
      }
    );

    console.log("IMAGE_REQUEST_SUCCESS");

    if (!result?.image) {
      return new Response(
        JSON.stringify({
          error: "Workers AI اجرا شد اما تصویر برنگرداند.",
          debug: result,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        image: `data:image/jpeg;base64,${result.image}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("IMAGE_GENERATION_ERROR", error);

    let errorMessage = "خطای نامشخص در Workers AI";

    try {
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }
    } catch {}

    return new Response(
      JSON.stringify({
        error: errorMessage,
        type: error?.name || "UnknownError",
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
