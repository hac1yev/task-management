import { connectToDB } from "@/lib/connectToDB";
import { hashPassword } from "@/lib/hashPassword";
import { verifyAccessToken } from "@/lib/verifyToken";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { newPassword,confirmPassword } = await req.json();
    const bearer = req.headers.get("Authorization");    

    const accessToken = bearer?.split(" ")[1] || "";

    const isValidAccessToken = await verifyAccessToken(accessToken);
    
    if(!isValidAccessToken) {
        return NextResponse.json({ message: 'Forbidden!' }, { status: 403 });
    }
    
    if(newPassword === "" || confirmPassword === "") {
        return NextResponse.json({ message: 'Please fill both inputs!' }, { status: 400 });
    }

    if(newPassword !== confirmPassword) {
        return NextResponse.json({ message: 'Passwords are not equal!' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);
    
    await connectToDB();

    await User.findOneAndUpdate({ email: isValidAccessToken.email }, { password: hashedPassword });

    return NextResponse.json({ message: 'Password changed!' });
};
