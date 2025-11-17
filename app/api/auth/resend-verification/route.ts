import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Check for existing token and its creation time
    const existingToken = await prisma.emailVerificationToken.findFirst({
      where: { email },
      orderBy: { expires: "desc" },
    });

    // Rate limiting: Allow resend only after 1 minute
    if (existingToken) {
      const tokenAge =
        Date.now() - existingToken.expires.getTime() + 24 * 60 * 60 * 1000;
      const oneMinute = 60 * 1000;

      if (tokenAge < oneMinute) {
        const waitTime = Math.ceil((oneMinute - tokenAge) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${waitTime} seconds before requesting a new code`,
          },
          { status: 429 }
        );
      }

      // Delete old token
      await prisma.emailVerificationToken.deleteMany({
        where: { email },
      });
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create new verification token
    await prisma.emailVerificationToken.create({
      data: {
        email,
        token: verificationCode,
        expires: expiresAt,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
