const cheerio = require('cheerio');
const E = require('events');
const request = require('request');
const separateReqPool = { maxSockets: 15 };
const async = require('async');
let tweets = {}, apiurls = [], N = [];

//discord utils
const { token } = require("./botSettings.json")
const { Discord, Client, RichEmbed } = require('discord.js')
const client = new Client();

client.on('ready', () => {
	console.log('botReady');
});

/////  CONFIGURE TWITTER HANDLERS ////
var THandlers = [
	{
		name: 'Adam Schefter',
		url: "https://twitter.com/AdamSchefter",
		webhook: "https://discordapp.com/api/webhooks/643533548124504083/UxlELS1bMFnOtPdMFYYn_rF9qPwqGyujxH_WZnbP59IUg5kg64LmFiNSSEglb6jIE9Ft",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY0WHO7U6v_16C1B3F-Ncq0zThve9OTIzU8PN6qEXAhmS6vTOa4w&s",
		keywords: "*",
	},
	{
		name: 'Ian Rapoport',
		url: "https://twitter.com/RapSheet",
		webhook: "https://discordapp.com/api/webhooks/643533548124504083/UxlELS1bMFnOtPdMFYYn_rF9qPwqGyujxH_WZnbP59IUg5kg64LmFiNSSEglb6jIE9Ft",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8WVdkEjVf4o1Rya6YSICFX96iERHtW0Tu5_nkdMI7Na0FUzW-BQ&s",
		keywords: "*",
	},
	{
		name: 'PFF Fantasy',
		url: "https://twitter.com/PFF_Fantasy",
		webhook: "https://discordapp.com/api/webhooks/643533548124504083/UxlELS1bMFnOtPdMFYYn_rF9qPwqGyujxH_WZnbP59IUg5kg64LmFiNSSEglb6jIE9Ft",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQcxklkdPLpycmHgwpBTTpTO_gAbXY4FOlNPS3et-sWjKy2hs_&s",
		keywords: "*",
	},
	{
		name: 'Rotoworld',
		url: "https://twitter.com/Rotoworld_FB",
		webhook: "https://discordapp.com/api/webhooks/643533548124504083/UxlELS1bMFnOtPdMFYYn_rF9qPwqGyujxH_WZnbP59IUg5kg64LmFiNSSEglb6jIE9Ft",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdfCLH3PXxu4uqH2RQjb9XZTJTQyGCqRTyuzMPllOz0HoX46ij-Q&s",
		keywords: "*",
	},
	{
		name: 'Field Yates',
		url: "https://twitter.com/FieldYates",
		webhook: "https://discordapp.com/api/webhooks/643533548124504083/UxlELS1bMFnOtPdMFYYn_rF9qPwqGyujxH_WZnbP59IUg5kg64LmFiNSSEglb6jIE9Ft",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiGCNIngnGAMZx9kYcSmdgk5PCQCZ8mFrfz_OdUaPZ67ntvKBliw&s",
		keywords: "*",
	},

	//test server webhook
	{
		name: 'SportBot',
		url: "https://twitter.com/AdamSchefter",
		webhook: "https://discordapp.com/api/webhooks/638843583822299136/s-X0YxXeWHuXTYG3WeXpBkbn4taigZ2kjleT6_DndaH8To5-EEBG5YV2KmE7GywJF9mS",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ01Y889yvPT0vnKSTBu5quBSiOSZDo4LnEhLNYs2eljOg2_C5e&s",
		keywords: "*",
	},
	{
		name: 'SportBot',
		url: "https://twitter.com/RapSheet",
		webhook: "https://discordapp.com/api/webhooks/638843583822299136/s-X0YxXeWHuXTYG3WeXpBkbn4taigZ2kjleT6_DndaH8To5-EEBG5YV2KmE7GywJF9mS",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ01Y889yvPT0vnKSTBu5quBSiOSZDo4LnEhLNYs2eljOg2_C5e&s",
		keywords: "*",
	},
	{
		name: 'SportBot',
		url: "https://twitter.com/PFF_Fantasy",
		webhook: "https://discordapp.com/api/webhooks/638843583822299136/s-X0YxXeWHuXTYG3WeXpBkbn4taigZ2kjleT6_DndaH8To5-EEBG5YV2KmE7GywJF9mS",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ01Y889yvPT0vnKSTBu5quBSiOSZDo4LnEhLNYs2eljOg2_C5e&s",
		keywords: "*",
	},
	{
		name: 'SportBot',
		url: "https://twitter.com/Rotoworld_FB",
		webhook: "https://discordapp.com/api/webhooks/638843583822299136/s-X0YxXeWHuXTYG3WeXpBkbn4taigZ2kjleT6_DndaH8To5-EEBG5YV2KmE7GywJF9mS",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ01Y889yvPT0vnKSTBu5quBSiOSZDo4LnEhLNYs2eljOg2_C5e&s",
		keywords: "*",
	},
	{
		name: 'SportBot',
		url: "https://twitter.com/FieldYates",
		webhook: "https://discordapp.com/api/webhooks/638843583822299136/s-X0YxXeWHuXTYG3WeXpBkbn4taigZ2kjleT6_DndaH8To5-EEBG5YV2KmE7GywJF9mS",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ01Y889yvPT0vnKSTBu5quBSiOSZDo4LnEhLNYs2eljOg2_C5e&s",
		keywords: "*",
	},
	{
		name: 'SportBot',
		url: "https://twitter.com/MatthewBerryTMR",
		webhook: "https://discordapp.com/api/webhooks/638843583822299136/s-X0YxXeWHuXTYG3WeXpBkbn4taigZ2kjleT6_DndaH8To5-EEBG5YV2KmE7GywJF9mS",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ01Y889yvPT0vnKSTBu5quBSiOSZDo4LnEhLNYs2eljOg2_C5e&s",
		keywords: "*",
	},
	{
		name: 'Vic Tafur',
		url: "https://twitter.com/VicTafur",
		webhook: "https://discordapp.com/api/webhooks/638843583822299136/s-X0YxXeWHuXTYG3WeXpBkbn4taigZ2kjleT6_DndaH8To5-EEBG5YV2KmE7GywJF9mS",
		avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ01Y889yvPT0vnKSTBu5quBSiOSZDo4LnEhLNYs2eljOg2_C5e&s",
		keywords: "*",
	}
];

//ADD TWEETS
THandlers.forEach((th, i) => {
	tweets[th.url] = [];
	apiurls.push(th.url);
});

//DISCORD WEBHOOK
const sendDiscordMessage = (pl) => {
	const { content, turl } = pl;
	const { name, webhook, avatar_url } = THandlers.filter((d, i) => d.url === turl)[0];
	const embed = new Discord.RichEmbed()
		.setColor("#33FFD8")
		.setTitle(username)
		.setDescription(content);

	request.post(webhook).form({ username: name, avatar_url: avatar_url, content: `\n${content}\n\n :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign:\n\n`, embed: embed });

	console.log('Twitter => Discord program is running');

	//MONITOR
	setInterval(() => {
		async.map(apiurls, function (item, callback) {
			request({ url: item, pool: separateReqPool }, function (error, response, body) {
				try {
					const $ = cheerio.load(body);
					var turl = "https://twitter.com" + response.req.path;
					if (!tweets[turl].length) {
						//FIRST LOAD
						for (let i = 0; i < $('div.js-tweet-text-container p').length; i++) {
							tweets[turl].push($('div.js-tweet-text-container p').eq(i).text());
						}
					}
					else {
						//EVERY OTHER TIME
						for (let i = 0; i < $('div.js-tweet-text-container p').length; i++) {
							const s_tweet = $('div.js-tweet-text-container p').eq(i).text();
							//CHECK IF TWEET IS NEWS
							if (tweets[turl].indexOf(s_tweet) === -1) {
								tweets[turl].push(s_tweet);
								const th_kw = THandlers.filter((d, i) => d.url === turl)[0].keywords.split(',');
								const th_name = THandlers.filter((d, i) => d.url === turl)[0].name;
								let nFlag = false;
								th_kw.forEach((kw, j) => {
									if (kw === '*') {
										nFlag = true;
									}
									else {
										if (s_tweet.indexOf(kw) != -1) {
											nFlag = true;
										}
									}
								});
								if (nFlag) {
									sendDiscordMessage({ content: s_tweet, turl: turl });
								}
							}
						}
					}
				} catch (e) {
					console.log('Error =>' + e);
				}
			});
		}, function (err, results) {
			//console.log(results);
		});
	}, 1000); //RUNS EVERY 1 SECONDS
}
client.login(token);