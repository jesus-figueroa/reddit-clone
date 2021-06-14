import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient, WithUrqlProps } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent, PropsWithChildren, useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

const ChangePassword: NextPage<{ token: string }> = () => {
	const router = useRouter();
	const [, changePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState("");
	return (
		<Wrapper variant="regular">
			<Formik
				initialValues={{ newPassword: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await changePassword({
						newPassword: values.newPassword,
						token:
							typeof router.query.token === "string" ? router.query.token : "",
					});
					if (response.data?.changePassword.errors) {
						const errorMap = toErrorMap(response.data.changePassword.errors);
						if ("token" in errorMap) {
							setTokenError(errorMap.token);
						}
						setErrors(errorMap);
					} else if (response.data?.changePassword.user) {
						router.push("/");
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="newPassword"
							placeholder="New Password"
							label="New Password"
							type="password"
						/>
						{tokenError ? (
							<Flex>
								<Box>
									<Box color="red">{tokenError}</Box>
									<NextLink href="/forgot-password">
										<Link>Send password reset again?</Link>
									</NextLink>
								</Box>
							</Flex>
						) : null}
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							Change Password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(
	ChangePassword as FunctionComponent<
		PropsWithChildren<WithUrqlProps | { token: string }>
	>
);
