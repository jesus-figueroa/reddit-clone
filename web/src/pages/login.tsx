import { Box, Button, Flex, Link, Spacer } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { Wrapper } from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

const Login: React.FC<{}> = ({}) => {
	const router = useRouter();
	const [, login] = useLoginMutation();
	return (
		<Layout>
			<Wrapper variant="regular">
				<Formik
					initialValues={{ usernameOrEmail: "", password: "" }}
					onSubmit={async (values, { setErrors }) => {
						const response = await login(values);
						if (response.data?.login.errors) {
							setErrors(toErrorMap(response.data.login.errors));
						} else if (response.data?.login.user) {
							if (typeof router.query.next === "string") {
								router.push(router.query.next);
							} else {
								router.push("/");
							}
						}
					}}
				>
					{({ isSubmitting }) => (
						<Form>
							<InputField
								name="usernameOrEmail"
								placeholder="Username or Email"
								label="Username or Email"
							/>
							<Box mt={4}>
								<InputField
									name="password"
									placeholder="password"
									label="Password"
									type="password"
								/>
							</Box>
							<Flex>
								<Button
									mt={4}
									type="submit"
									isLoading={isSubmitting}
									colorScheme="teal"
								>
									Login
								</Button>
								<Spacer />
								<Box>
									<NextLink href="/forgot-password">
										<Link>Forgot Password?</Link>
									</NextLink>
								</Box>
							</Flex>
						</Form>
					)}
				</Formik>
			</Wrapper>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(Login);
