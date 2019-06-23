import React from 'react';
import { HashRouter, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Header.css';
import { logoutUser } from '../../actions/loginSignoutActions';
import { store } from '../../store';
import UserLabel from './UserLabel';

class Header extends React.Component {
	constructor() {
		super();
		this.state = {
			isLoggedIn: false,
			userName: '',
			userAvatar: ''
		};
	}

	handleLogout = e => {
		e.preventDefault();
		this.props.logoutUser();
	};

	componentDidMount() {
		if (store.getState().auth.isAuthenticated) {
			this.setState({
				isLoggedIn: true
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		console.log(nextProps.auth);
		if (nextProps.auth.isAuthenticated) {
			this.setState({
				isLoggedIn: true
			});
		} else {
			this.setState({
				isLoggedIn: false
			});
		}
		console.log(this.state);
	}

	render() {
		const { isLoggedIn } = this.state;

		return (
			<HashRouter>
				<Menu inverted borderless className="header-menu">
					<Menu.Menu>
						<Menu.Item as={NavLink} to="/" exact name="main">
							<FontAwesomeIcon icon={['fas', 'water']} size="2x" />
						</Menu.Item>

						<Menu.Item as={NavLink} to="/myposts" name="addPost">
							MY POSTS
						</Menu.Item>

						<Menu.Item as={NavLink} to="/post/add" name="addPost">
							NEW POST
						</Menu.Item>
					</Menu.Menu>

					<Menu.Menu position="right" className="header-menu-rightmenu">
						{isLoggedIn ? (
							<Menu.Item>
								<UserLabel
									userName={this.props.auth.user.name}
									userAvatar={this.props.auth.user.avatar}
								/>
							</Menu.Item>
						) : (
							<React.Fragment>
								<Menu.Item
									as={NavLink}
									to="/registration"
									name="register"
									color="teal"
								>
									<span>Register</span>
								</Menu.Item>

								<Menu.Item as={NavLink} to="/login" name="login" color="teal">
									<span>Log In</span>
								</Menu.Item>
							</React.Fragment>
						)}
					</Menu.Menu>
				</Menu>
			</HashRouter>
		);
	}
}

Header.propTypes = {
	logoutUser: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
	auth: state.auth
});

export default connect(
	mapStateToProps,
	{ logoutUser }
)(Header);