/**
 * Register.jsx
 *
 * @author nxxinf
 * @github https://github.com/fangnx
 * @created 2019-06-23 00:52:32
 * @last-modified 2019-09-10 15:42:54
 */

import React from 'react';
import { connect } from 'react-redux';
import {
	Button,
	Checkbox,
	Card,
	Form,
	Input,
	Image,
	Dropdown,
	Message,
	Transition
} from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Register.css';

import { registerUser } from '../../actions/userActions';
import axios from 'axios';
import { storage } from '../../configureFirebase';

const genderOptions = [
	{ key: 'm', text: 'Male', value: 'm' },
	{ key: 'f', text: 'Female', value: 'f' },
	{ key: 'o', text: 'Other', value: 'o' }
];

class Register extends React.Component {
	constructor() {
		super();
		this.state = {
			name: '',
			email: '',
			gender: '',
			password: '',
			passwordRe: '',
			avatar: '',
			checked: false,
			errors: {},
			success: false,
			visible: false
		};
	}

	componentDidMount() {
		this.setState({ visible: true });
	}

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.errors &&
			Object.keys(nextProps.errors).length > 0 &&
			!nextProps.errors.registerSuccess
		) {
			this.setState({
				errors: nextProps.errors,
				success: false
			});
		} else if (nextProps.errors.registerSuccess) {
			this.setState({ errors: {}, success: true });
		}
	}

	onChange = (e, data) => {
		this.setState({ [data.id]: data.value });
	};

	onCheck = () => {
		this.setState({ checked: !this.state.checked });
	};

	onUploadAvatar = e => {
		const imageName = 'firebase-image-' + Date.now();
		const uploadImage = storage
			.ref(`images/${imageName}`)
			.put(e.target.files[0]);

		uploadImage.on(
			'state_changed',
			snapshot => {},
			error => alert(error),
			() => {
				storage
					.ref('images')
					.child(imageName)
					.getDownloadURL()
					.then(url => {
						this.setState({
							avatar: url
						});

						const avatarImage = {
							name: imageName,
							imageData: url
						};

						axios
							.post('api/images/uploadavatar', avatarImage)
							.then(value => {
								if (value.data.success) {
									alert('Avatar image uploaded!');
								}
							})
							.catch(err => alert(err));
					});
			}
		);
	};

	onSubmit = e => {
		e.preventDefault();
		const newUser = {
			name: this.state.name,
			email: this.state.email,
			gender: this.state.gender,
			password: this.state.password,
			passwordRe: this.state.passwordRe,
			avatar: this.state.avatar
		};
		this.props.registerUser(newUser);
	};

	render() {
		const errors = this.state.errors;
		const isSuccess = this.state.success;
		const { visible } = this.state;

		return (
			<div className="registration-wrapper">
				<Transition visible={visible} duration={400} animation="scale">
					<Card className="registration-card" fluid>
						<Card.Header className="registration-card-header">
							<span>
								<h1>Register</h1>
							</span>
						</Card.Header>
						<Card.Content className="registration-card-content">
							<Form success={isSuccess} className="registration-form">
								<Form.Field error={!!errors.name} required>
									<label for="name" className="registration-field-text">
										Name
									</label>
									<Input
										id="name"
										value={this.state.name}
										onChange={this.onChange}
										placeholder="Name"
									/>
									<span className="registration-field-msg">{errors.name}</span>
								</Form.Field>

								<Form.Field error={!!errors.email} required>
									<label for="email" className="registration-field-text">
										Email
									</label>
									<Input
										id="email"
										value={this.state.email}
										onChange={this.onChange}
										placeholder="Email"
									/>
									<span className="registration-field-msg">{errors.email}</span>
								</Form.Field>

								<Form.Field error={!!errors.password} required>
									<label for="password" className="registration-field-text">
										Password
									</label>
									<Input
										id="password"
										value={this.state.password}
										onChange={this.onChange}
										type="password"
										placeholder="Password"
									/>
									<span className="registration-field-msg">
										{errors.password}
									</span>
								</Form.Field>

								<Form.Field error={!!errors.passwordRe} required>
									<label for="passwordRe" className="registration-field-text">
										Confirm Password
									</label>
									<Input
										id="passwordRe"
										value={this.state.passwordRe}
										onChange={this.onChange}
										type="password"
										placeholder="Confirm Password"
									/>
									<span className="registration-field-msg">
										{errors.passwordRe}
									</span>
								</Form.Field>

								<Form.Field error={!!errors.gender} required>
									<label for="gender" className="registration-field-text">
										Gender
									</label>
									<Dropdown
										selection
										search
										id="gender"
										value={this.state.gender}
										onChange={this.onChange}
										options={genderOptions}
										placeholder="Gender"
									/>
									<span className="registration-field-msg">
										{errors.gender}
									</span>
								</Form.Field>

								<Form.Field>
									<label for="avatar" className="registration-field-text">
										Avatar
									</label>
									<Input
										id="avatar"
										type="file"
										onChange={this.onUploadAvatar}
									/>
									<Image src={this.state.avatar} />
								</Form.Field>

								<Form.Field
									control={Checkbox}
									checked={this.state.checked}
									onClick={this.onCheck}
									label="I agree to the Terms and Conditions"
								/>
								<Message
									success
									header="Success"
									content="You have registered successfully~"
								/>
								<Form.Field
									as={Button}
									className="registration-button"
									disabled={!this.state.checked}
									onClick={this.onSubmit}
									animated="vertical"
									size="large"
									primary
								>
									<Button.Content visible>Submit</Button.Content>
									<Button.Content hidden>
										<FontAwesomeIcon icon={['fas', 'check']} size="1x" />
									</Button.Content>
								</Form.Field>
							</Form>
						</Card.Content>
					</Card>
				</Transition>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	auth: state.auth,
	errors: state.errors
});

const mapDispatchToProps = dispatch => ({
	registerUser: data => dispatch(registerUser(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Register);
