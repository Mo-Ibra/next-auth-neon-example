import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email } = body;

    if (!code || !email) {
      return NextResponse.json(
        { error: "Missing verification code or email" },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: code },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (verificationToken.email !== email) {
      return NextResponse.json(
        { error: "Code does not match this email" },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { token: code },
      });
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    await prisma.emailVerificationToken.delete({
      where: { token: code },
    });

    return NextResponse.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
