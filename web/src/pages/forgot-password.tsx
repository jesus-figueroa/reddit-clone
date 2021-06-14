import { Box, Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
	const [complete, setComplete] = useState(false);
	const [, forgotPassword] = useForgotPasswordMutation();
	return (
		<Wrapper variant="regular">
			<Formik
				initialValues={{ email: "" }}
				onSubmit={async (values, { setErrors }) => {
					await forgotPassword(values);
					setComplete(true);
				}}
			>
				{({ isSubmitting }) =>
					complete ? (
						<Box>Password request sent, please check your email</Box>
					) : (
						<Form>
							<Box mt={4}>
								<InputField
									name="email"
									placeholder="Email"
									label="Email"
									type="email"
								/>
							</Box>
							<Flex>
								<Button
									mt={4}
									type="submit"
									isLoading={isSubmitting}
									colorScheme="teal"
								>
									Forgot Password
								</Button>
							</Flex>
						</Form>
					)
				}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
