const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const tokens = require('./tokens.json');
const log = require(`./handlers/logHandler.js`);
const ms = require('ms');


client.on("error", (e) => {
	log.error(e);
	return;
});

client.on("warn", (e) => {
	log.warn(e);
	return;
});


client.on("ready", async() => {
	try {
		setTimeout(async function() {
			log.info(`Connecting...`)
		}, ms('3s'));
		log.info(`Logged in as ${client.user.tag}: ${client.user.email}`)
	} catch (e) {
		log.error(e.stack)
	}
	let qlutch = "no"
	let guild1 = client.guilds.get(`${tokens.guild.copy_from}`)
	let guild2 = client.guilds.get(`${tokens.guild.copy_to}`);

	let channels = guild1.channels.filter(c => c.type === "text").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c);
	let categories = guild1.channels.filter(c => c.type === "category").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c);
	let roles = guild1.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).map(r => r);
	let voice = guild1.channels.filter(c => c.type === "voice").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c);


  let allowedRegions = ['brazil', 'us-west', 'singapore', 'eu-central', 'hongkong',
                    'us-south', 'amsterdam', 'us-central', 'london', 'us-east', 'sydney', 'japan',
                    'eu-west', 'frankfurt', 'russia'];

  let region = allowedRegions.includes(guild2.region) ? guild2.region : 'us-central';

	let guildname = guild1.name;
	let guildico = guild1.iconURL;

	await guild2.setIcon(guildico).then(icon => {
		log.info('Set Guild Icon to ' + guildico)
	})
	await guild2.setName(guildname).then(name => {
		log.info('Set Guild Name to ' + name)
	})
  await guild2.setRegion(region).then(m => {
		log.info('Set Guild Region to ' + region)
	})
  await guild2.setVerificationLevel(guild1.verificationLevel).then(m => {
		log.info('Set Guild Verification to ' + guild1.verificationLevel)
	})

	for (var i = 0; i < roles.length; i++) {
		let do2 = await guild2.roles.find(c => c.name === roles[i].name)
		if (do2) continue;
		guild2.createRole({
			type: roles[i].type,
			name: roles[i].name,
			color: roles[i].hexColor,
			hoist: roles[i].hoist,
			permissions: roles[i].permissions,
			managed: roles[i].managed,
			mentionable: roles[i].mentionable
		}).then(createdRole => {
			log.info('Created Role ' + createdRole.name)
		})
	}


	guild1.emojis.forEach(emoji => {
		let do2 = guild2.emojis.find(c => c.name === emoji.name)
		if (do2) return;
		guild2.createEmoji(emoji.url, emoji.name).then(createdEmoji => {
			log.info('Created Emoji ' + createdEmoji)
		})
	})

	categories.forEach(async(category) => {
	let do2 = await guild2.channels.find(c => c.name === category.name)
	if (do2) return;


    await guild2.createChannel(category.name, 'category').then(createdCategory => {
			log.info('Created category ' + createdCategory.name)
		})
	})


	if (qlutch == "no") {
		for (var i = 0; i < channels.length; i++) {
			let do1 = channels[i]
			let do2 = await guild2.channels.find(c => c.name === do1.name)
			if (do2) continue;

			if (!do1.parent) {
				var channel2 = await guild2.createChannel(do1.name, 'text')
				if (channels[i].topic) {
					channel2.setTopic(channels[i].topic)
				}
			}
			if (do1.parent) {
				var channel = await guild2.createChannel(do1.name, 'text')
				if (channels[i].topic) {
					channel.setTopic(channels[i].topic)
				}
				var ll = await guild2.channels.find(c => c.name === do1.parent.name)
				if (ll) {
					channel.setParent(guild2.channels.find(c => c.name === do1.parent.name).id)
				} else {
					var ll1 = await guild2.createChannel(do1.parent.name, 'category')
					channel.setParent(ll1)
				}
			}
			log.info('Created Text Channel ')
		}

		for (var i = 0; i < voice.length; i++) {
			let do1 = voice[i]
			let do2 = await guild2.channels.find(c => c.name === do1.name)
			if (do2) continue;
			if (!do1.parent) {
				await guild2.createChannel(do1.name, 'voice')
			}
			if (do1.parent) {
				var channel = await guild2.createChannel(do1.name, 'voice')
				var ll = await guild2.channels.find(c => c.name === do1.parent.name)
				if (ll) {
					channel.setParent(guild2.channels.find(c => c.name === do1.parent.name).id)
				} else {
					var ll1 = await guild2.createChannel(do1.parent.name, 'category')
					channel.setParent(ll1)
				}
			}
			log.info('Created Voice Channel ' + channel.name)
		}

	}


	if (qlutch == "yes") {
		for (var i = 0; i < guild2.channels.array().length; i++) {
			guild2.channels.array()[i].delete();
		}
	}
	log.info('Guild has successfully been cloned.')
})


client.login(`${tokens.token}`);
