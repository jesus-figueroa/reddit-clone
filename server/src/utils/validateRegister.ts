import { UsernamePasswordInput } from "./UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
	if (!options.email.includes("@")) {
		return [
			{
				field: "email",
				message: "invalid email",
			},
		];
	}

	if (options.username.includes("@")) {
		return [
			{
				field: "username",
				message: "cannot be an email",
			},
		];
	}

	if (options.username.length <= 2) {
		return [
			{
				field: "username",
				message: "length must be at least 3",
			},
		];
	}

	if (options.password.length <= 2) {
		return [
			{
				field: "password",
				message: "length must be at least 3",
			},
		];
	}
	return null;
};
