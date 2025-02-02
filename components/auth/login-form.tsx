"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { getFirebaseAuthErrorMessage, STORAGE_KEY } from "@/lib/utils";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth } from "@/lib/firebase";
import Cookies from "js-cookie";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPassword, setisPassword] = useState<string>("password");
	const { setUser } = useAuth();
	const router = useRouter();

	const toggle = () => {
		setisPassword((password) =>
			password === "password" ? "text" : "password"
		);
	};
	// Clear error when email or password changes
	useEffect(() => {
		setError(null);
	}, [email, password]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setIsLoading(true);
		try {
			const result = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const userData = {
				uid: result.user?.uid,
				email: result.user?.email,
				displayName: result.user?.displayName,
				photoURL: result.user?.photoURL,
			};
			Cookies.set(STORAGE_KEY, JSON.stringify(userData), { expires: 7 });
			localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
			setUser(result.user);
			router.replace("/reports");
		} catch (error: any) {
			const errorCode = error.code;
			const errorMessage = getFirebaseAuthErrorMessage(errorCode);
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="p-4 mx-4 border rounded-lg">
			<h2 className="text-2xl font-bold mb-4">Login</h2>
			<form onSubmit={onSubmit} className="space-y-4">
				<div className="grid gap-2">
					<div className="grid gap-1">
						<div className="relative mb-4">
							<Input
								id="email"
								placeholder="name@gmail.com"
								type="email"
								className="px-6"
								autoCapitalize="none"
								autoComplete="email"
								autoCorrect="off"
								disabled={isLoading}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							<Mail className="h-4 w-4 text-gray-500 absolute top-2.5 left-1" />
						</div>
						<div className="relative">
							<Input
								id="password"
								placeholder="your password"
								type={isPassword}
								className="px-6"
								autoCapitalize="none"
								autoComplete="current-password"
								disabled={isLoading}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<LockKeyhole className="h-4 w-4 text-gray-500 absolute top-2.5 left-1" />
							<button type="button" onClick={toggle}>
								{isPassword === "password" ? (
									<EyeOff className="h-4 w-4 text-gray-500 absolute top-2.5 right-1" />
								) : (
									<Eye className="h-4 w-4 text-gray-500 absolute top-2.5 right-1" />
								)}
							</button>
						</div>
					</div>
					{error && (
						<div className="text-sm text-red-500 mt-2">{error}</div>
					)}
				</div>
				<Button className="w-full" type="submit" disabled={isLoading}>
					{isLoading && (
						<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
					)}
					Sign In
				</Button>
			</form>
		</div>
	);
}
