"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import Cookies from "js-cookie";
import { STORAGE_KEY } from "@/lib/utils";

export default function LoginPage() {
	const user = Cookies.get(STORAGE_KEY);
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.replace("/reports");
		}
	}, [user]);

	return (
		<div className="container flex h-screen w-screen flex-col items-center justify-center">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Welcome back
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your credentials to continue
					</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}
