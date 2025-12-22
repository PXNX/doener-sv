#!/usr/bin/env bun
interface BahnStation {
	eva: number;
	ds100: string;
	lat: number;
	lon: number;
	name: string;
	is_active_ris: boolean;
	is_active_iris: boolean;
	meta_evas: number[];
	available_transports: string[];
	number_of_events: number | null;
}

interface RailwayStation {
	country: string;
	id: string;
	title: string;
	lat: number;
	lon: number;
	photos: any[];
	shortCode: string;
}

interface BahnStationsResponse {
	stations: BahnStation[];
}

interface RailwayStationsResponse {
	photoBaseUrl: string;
	licenses: any[];
	photographers: any[];
	stations: RailwayStation[];
}

interface OutputStation {
	eva: number;
	stationIdGER: string | null;
	name: string;
	city: string | null;
	country: string;
	latitude: number;
	longitude: number;
}

async function fetchStations() {
	console.log('Fetching stations from bahnvorhersage.de...');
	const bahnResponse = await fetch('https://bahnvorhersage.de/api/stations.json');
	const bahnData: BahnStationsResponse = await bahnResponse.json();

	console.log('Fetching photo stations from railway-stations.org...');
	const railwayResponse = await fetch('https://api.railway-stations.org/photoStationsByCountry/de');
	const railwayData: RailwayStationsResponse = await railwayResponse.json();

	return { bahnStations: bahnData.stations, railwayStations: railwayData.stations };
}

function extractCityFromName(name: string): string {
	// Try to extract city from station name
	// Common patterns: "City Hbf", "City Station", "City-Suburb", "City (Qualifier)"

	// Remove common station suffixes
	const withoutSuffix = name
		.replace(/\s+(Hbf|Hauptbahnhof|Bahnhof|Bf)(\s|$)/i, ' ')
		.replace(/\s+\([^)]+\)$/, '') // Remove parenthetical qualifiers
		.trim();

	// Take the first part before any dash or "am"/"an"/"bei"
	const cityPart = withoutSuffix.split(/[-\/]|(\sam\s)|(\san\s)|(\sbei\s)/i)[0].trim();

	return cityPart || name; // Fallback to full name if extraction fails
}

function matchStations(
	bahnStations: BahnStation[],
	railwayStations: RailwayStation[]
): OutputStation[] {
	const railwayMap = new Map<string, string>();
	railwayStations.forEach((station) => {
		if (station.shortCode) {
			railwayMap.set(station.shortCode, station.id); // Keep as string
		}
	});

	console.log(`\nMatching ${bahnStations.length} stations from bahnvorhersage.de...`);
	console.log(`Available ${railwayStations.length} photo stations with shortCode...`);

	let matchCount = 0;
	const outputStations: OutputStation[] = bahnStations.map((station) => {
		const stationIdGER = railwayMap.get(station.ds100);
		if (stationIdGER !== undefined) {
			matchCount++;
		}

		// Extract city from station name
		// Format is usually "City Station Name" or "City Hbf" or "City-Suburb"
		const city = extractCityFromName(station.name);

		return {
			eva: station.eva,
			stationIdGER: stationIdGER ?? null,
			name: station.name,
			city: city,
			country: 'de',
			latitude: station.lat,
			longitude: station.lon
		};
	});

	console.log(
		`\n✓ Matched ${matchCount} stations (${((matchCount / bahnStations.length) * 100).toFixed(2)}%)`
	);
	console.log(`✗ Unmatched: ${bahnStations.length - matchCount} stations`);

	// Deduplicate by EVA number at the end - keep first occurrence
	const evaMap = new Map<number, OutputStation>();
	let duplicateCount = 0;

	outputStations.forEach((station) => {
		if (!evaMap.has(station.eva)) {
			evaMap.set(station.eva, station);
		} else {
			duplicateCount++;
		}
	});

	if (duplicateCount > 0) {
		console.log(`⚠️  Removed ${duplicateCount} duplicate EVA numbers from final output`);
	}

	return Array.from(evaMap.values());
}

function generateSQLInserts(stations: OutputStation[]): string {
	// Filter out stations without German station ID
	const stationsWithGerID = stations.filter((s) => s.stationIdGER !== null);
	console.log(
		`\nFiltering: ${stations.length - stationsWithGerID.length} stations without German station ID removed`
	);

	// Final safety check: deduplicate by both EVA and stationIdGER
	const evaMap = new Map<number, OutputStation>();
	const gerIdMap = new Map<string, OutputStation>();
	const uniqueStations: OutputStation[] = [];

	let duplicateEvaCount = 0;
	let duplicateGerIdCount = 0;

	stationsWithGerID.forEach((station) => {
		let shouldAdd = true;

		// Check EVA uniqueness
		if (evaMap.has(station.eva)) {
			duplicateEvaCount++;
			shouldAdd = false;
		}

		// Check German station ID uniqueness
		if (gerIdMap.has(station.stationIdGER!)) {
			duplicateGerIdCount++;
			shouldAdd = false;
		}

		if (shouldAdd) {
			evaMap.set(station.eva, station);
			gerIdMap.set(station.stationIdGER!, station);
			uniqueStations.push(station);
		}
	});

	if (duplicateEvaCount > 0 || duplicateGerIdCount > 0) {
		console.log(
			`⚠️ SQL generation: removed ${duplicateEvaCount} duplicate EVAs and ${duplicateGerIdCount} duplicate German station IDs`
		);
	}

	const lines: string[] = [
		'-- Generated SQL INSERT statements for stations',
		'-- Run this in your PostgreSQL database',
		'-- Only includes stations with German station IDs',
		'',
		'INSERT INTO stations (eva, station_id_ger, name, city, country, latitude, longitude) VALUES'
	];

	const valueLines = uniqueStations.map((station, index) => {
		const eva = station.eva;
		const stationIdGER = `'${station.stationIdGER!.replace(/'/g, "''")}'`; // Escape as string
		const name = station.name.replace(/'/g, "''"); // Escape single quotes
		const city = station.city ? `'${station.city.replace(/'/g, "''")}'` : 'NULL';
		const country = station.country;
		const lat = station.latitude;
		const lon = station.longitude;

		const trailing = index < uniqueStations.length - 1 ? ',' : ';';
		return `  (${eva}, ${stationIdGER}, '${name}', ${city}, '${country}', ${lat}, ${lon})${trailing}`;
	});

	lines.push(...valueLines);
	lines.push('');
	return lines.join('\n');
}

async function main() {
	try {
		const { bahnStations, railwayStations } = await fetchStations();
		const outputStations = matchStations(bahnStations, railwayStations);

		// Save JSON output
		const jsonFile = 'stations.json';
		await Bun.write(jsonFile, JSON.stringify(outputStations, null, 2));
		console.log(`\n✓ JSON data saved to ${jsonFile}`);

		// Generate and save SQL
		const sqlFile = 'stations.sql';
		const sql = generateSQLInserts(outputStations);
		await Bun.write(sqlFile, sql);
		console.log(`✓ SQL INSERT statements saved to ${sqlFile}`);

		// Show some examples
		const matched = outputStations.filter((s) => s.stationIdGER !== null).slice(0, 3);
		if (matched.length > 0) {
			console.log('\nExample matched stations:');
			matched.forEach((s) => {
				console.log(`  ${s.name} (EVA: ${s.eva}) → German Station ID: ${s.stationIdGER}`);
			});
		}

		// Verify uniqueness
		const evaSet = new Set(outputStations.map((s) => s.eva));
		console.log(`\n📊 Total stations: ${outputStations.length}`);
		console.log(`✓ Unique EVA numbers: ${evaSet.size}`);
		console.log(
			`📸 With German Station ID: ${outputStations.filter((s) => s.stationIdGER !== null).length}`
		);

		if (evaSet.size !== outputStations.length) {
			console.error(
				`\n⚠️ WARNING: Found ${outputStations.length - evaSet.size} duplicate EVA numbers in output!`
			);
		}
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

main();
