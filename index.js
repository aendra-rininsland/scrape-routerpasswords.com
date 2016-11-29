const Nightmare = require('nightmare');
const { writeFileSync } = require('fs');

async function processQueue() {
	const nightmare = Nightmare({ show: true, waitTimeout: 5000 });
	const data = {};

	try {
		const models = await nightmare.goto('http://routerpasswords.com/')
			.wait('.form-control[name="router"]')
			.evaluate(() => {
				return [...document.querySelectorAll('.form-control[name="router"] option')]
					.map((v) => {
						return v.getAttribute('value');
					});
			});
		for (let i = 0; i < 3; i++) {
			console.log(`Processing ${models[i]}`);

			data[models[i]] = await nightmare
				.wait('.form-control[name="router"]')
				.wait('.form-control[name="router"]')
				.select('.form-control[name="router"]', models[i])
				.click('input[name="findpassword"]')
				.wait('#result table')
				.wait('.form-control[name="router"]')
				.wait('input[name="findpassword"]')
				.wait(1000)
				.evaluate(() => {
					return [...document.querySelectorAll('#result table tr')].map(row => {
						const cells = row.querySelectorAll('td:not(:first-child)');
						if (cells.length) {
							return {
								model: cells[0].textContent,
								protocol: cells[1].textContent,
								username: cells[2].textContent,
								password: cells[3].textContent,
							};
						} else {
							return undefined;
						}
					})
					.filter(i => i);
				});
		}
	} catch(e) {
		console.dir(e);
	}
	console.log('Done!');

	nightmare.end();

	return data;
}


processQueue().then(d => {
	console.info('Writing to ' + './all-router-default-passwords.json');
	writeFileSync('./all-router-default-passwords.json', JSON.stringify(d));
});