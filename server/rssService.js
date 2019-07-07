/**
 * rssService.js
 *
 * @author nxxinf
 * @github https://github.com/fangnx
 * @created 2019-07-03 17:22:30
 * @last-modified 2019-07-06 01:43:16
 */

import axios from 'axios';
import Post from './models/Post';
import { CronJob } from 'cron';
import TurndownService from 'turndown';

const axiosLocal = axios.create({
	baseURL: 'http://localhost:5000'
});

/**
 * Converts plain RSS to JSON format.
 * https://rss2json.com/
 */
const rssToJson = url => 'https://api.rss2json.com/v1/api.json?rss_url=' + url;

/**
 * Fetches items from the RSS source and creates a list of Posts.
 *
 * @param {String} sourceName
 * @param {String} sourceUrl
 * @param {String} category
 * @param {Number} numOfItem
 */
const getPostsFromRssSource = (sourceName, sourceUrl, category, numOfItems) => {
	const turndownService = new TurndownService();

	return axios.get(rssToJson(sourceUrl)).then(res => {
		console.log(res);
		if (res.data.items) {
			const postFieldsArr = [];
			const rawItems = res.data.items.slice(0, numOfItems);

			rawItems.forEach(item => {
				const postFields = {
					title: item.title,
					content: turndownService.turndown(item.description),
					author: sourceName,
					authorEmail: 'RSS',
					timeStamp: item.pubDate,
					tags: [category],
					viewCount: 0,
					likeCount: 0
				};
				postFieldsArr.push(postFields);
			});
			// console.log(postFieldsArr);
			return postFieldsArr;
		}
	});
};

/**
 * Adds a list of posts to the datebase.
 * @param {Array} posts - list of post fields.
 */
const submitPosts = posts => {
	posts.forEach(postFields => {
		const newPost = new Post(postFields);
		newPost
			.save()
			.then(value => console.log('Posted!'))
			.catch(err => console.log(err));
	});
};

/**
 * Posts from all registered active RSS sources, on a daily basis.
 * At 01:30 every day.
 */
const postDailySubscriptions = () => {
	const cronJob = new CronJob(
		'0 30 1 * * *',
		() => {
			console.log('Daily task started!');
			// Gets all active Source objects from the database as valid subscriptions.
			axiosLocal
				.post('/api/sources/allactive')
				.then(res => {
					const subscriptions = res.data;
					subscriptions.forEach(async source => {
						// Gets all posts (daily quota) from one source.
						const posts = await getPostsFromRssSource(
							source.name,
							source.sourceUrl,
							source.category,
							source.dailyLimit
						);
						await submitPosts(posts);
						console.log(`Posted from ${source.name} ;)`);
					});
				})
				.catch(err => console.log(err));
		},
		null,
		true,
		'America/Montreal'
	);

	return cronJob;
};

export { postDailySubscriptions };
