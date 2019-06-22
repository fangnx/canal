import React from 'react';
import {
	Label,
	Card,
	Grid,
	Form,
	TextArea,
	Input,
	Button,
	Segment,
	Icon,
	Message
} from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dateFormat from 'dateformat';
import { addPost } from '../../actions/postActions';
import { store } from '../../store';

const SPACE_KEY = 32;
const COMMA_KEY = 188;
const BACKSPACE_KEY = 8;
const tagColors = [
	'orange',
	'yellow',
	'olive',
	'green',
	'teal',
	'blue',
	'purple',
	'brown',
	'grey'
];

const styles = {
	title: {
		marginTop: '15px',
		width: '100%',
		fontFamily: 'Cairo',
		fontSize: '1.5em',
		fontWeight: '600'
	},
	content: {
		marginTop: '15px',
		width: '100%',
		fontSize: '1em',
		background: 'rgba(245, 245, 245)'
	},
	tags: {
		marginTop: '15px',
		width: '100%',
		border: '1px solid #ddd',
		borderRadius: '0px',
		boxShadow: 'none',
		background: 'rgba(245, 245, 245)'
	},
	tagInput: {
		display: 'inline !important'
	},
	message: {
		width: '100%'
	},
	button: {},
	iconGroup: { background: 'transparent', padding: 'none', float: 'right' },
	icon: { margin: '0' }
};

class AddPost extends React.Component {
	constructor() {
		super();
		this.state = {
			title: '',
			content: '',
			author: '',
			authorEmail: '',
			timeStamp: '',
			tags: [],
			currentTag: '',
			success: false
		};

		this.onKeyUp = this.onKeyUp.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.appendTag = this.appendTag.bind(this);
	}

	capitalizeTag(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}

	onKeyUp(e) {
		const key = e.keyCode;
		if (key === SPACE_KEY || key === COMMA_KEY) {
			this.appendTag();
		}
	}

	onKeyDown(e) {
		const key = e.keyCode;
		if (key === BACKSPACE_KEY && !this.state.currentTag) {
			this.editTag();
		}
	}

	appendTag() {
		const { tags, currentTag } = this.state;
		let rawTag = currentTag.trim();
		rawTag = rawTag.replace(/,/g, '');

		if (rawTag) {
			this.setState({
				tags: [...tags, rawTag],
				currentTag: '' // Empties the tag currently selected
			});
		}
	}

	editTag() {
		const { tags } = this.state;
		const lastTag = tags.pop();
		this.setState({ currentTag: lastTag });
	}

	onChange = (e, data) => {
		this.setState({ [data.id]: data.value });
	};

	componentDidMount() {
		if (!!store.getState().auth.isAuthenticated) {
			this.setState({
				author: store.getState().auth.user.name,
				authorEmail: store.getState().auth.user.email
			});
		}
	}

	onSubmit = async e => {
		e.preventDefault();
		const newPost = {
			title: this.state.title,
			content: this.state.content,
			author: this.state.author,
			authorEmail: this.state.authorEmail,
			timeStamp: dateFormat(new Date(), 'isoDateTime'),
			tags: this.state.tags,
			viewCount: 0,
			likeCount: 0
		};

		addPost(newPost).then(res => {
			if (res.status === 200) {
				this.setState({ success: true });
			}
		});
	};

	render() {
		const { tags, success } = this.state;

		return (
			<div className="postView-wrapper">
				<Card className="postView-card" fluid>
					<Card.Content className="postView-card-content">
						<Grid padded className="postView-card-grid">
							<Grid.Row>
								<Label color="grey" size="large">
									Title
								</Label>

								<Input
									id="title"
									value={this.state.title}
									onChange={this.onChange}
									placeholder=""
									style={styles.title}
								/>
							</Grid.Row>

							<Grid.Row>
								<Label color="grey" size="large">
									Content
								</Label>

								<TextArea
									id="content"
									value={this.state.content}
									onChange={this.onChange}
									placeholder="Write whatever you want ;)"
									rows="12"
									style={styles.content}
								/>
							</Grid.Row>

							<Grid.Row>
								<div>
									<Label color="grey" size="large">
										Tags
									</Label>
								</div>

								<Segment style={styles.tags}>
									<Label.Group size="large" className="addPost-tagList">
										{tags.map((tag, index) => (
											<Label color={tagColors[index % tagColors.length]}>
												{this.capitalizeTag(tag)}
												<Icon name="delete" />
											</Label>
										))}
									</Label.Group>
									<Input
										id="currentTag"
										placeholder="Add tags here"
										value={this.state.currentTag}
										onChange={this.onChange}
										onKeyUp={this.onKeyUp}
										onKeyDown={this.onKeyDown}
										style={styles.tagInput}
									/>
								</Segment>
							</Grid.Row>

							{this.state.success ? (
								<Grid.Row>
									<Message success header="Success" content="Posted!" />
								</Grid.Row>
							) : (
								''
							)}

							<Grid.Row>
								<Button
									disabled={false}
									onClick={this.onSubmit}
									animated="vertical"
									size="big"
									primary
								>
									<Button.Content visible>Submit</Button.Content>
									<Button.Content hidden>
										<FontAwesomeIcon icon={['fas', 'check']} size="1x" />
									</Button.Content>
								</Button>
							</Grid.Row>
						</Grid>
					</Card.Content>
				</Card>
			</div>
		);
	}
}

export default AddPost;
