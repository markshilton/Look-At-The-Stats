from bs4 import BeautifulSoup
import requests
import json
import re

races = json.load(open('raceConfig.json', 'r'))
categories = json.load(open('categoryConfig.json', 'r'))

seasonData = []

def scrapeRace(race):
	raceData = {}

	raceData['year'] = race['Year']
	raceData['roundNumber'] = race['roundNumber']
	raceData['venue'] = race['raceVenue']
	raceData['competition'] = race['Competition']
	raceData['results'] = []

	#scrape the data for all categories into a Beautiful Soup soup
	print('scraping...' + race['rootsandrainURL'])
	r = requests.get(race['rootsandrainURL'])
	soup = BeautifulSoup(r.text.replace('&nbsp;',''))

	for category in categories:
		categoryResults = {}
		categoryResults['category'] = category['categoryName']
		categoryResults['categoryResults'] = []

		table = soup.find("table", id=category['rootsandrainCategoryName'], class_="list tablesorter")

		for row in table.find('tbody').findAll('tr'):
			result = {}	
			cells = row.findAll('td')

			result['position'] = cells[0].text 
			result['name'] = cells[2].text.strip() #removing any hanging or leading spaces from the name
			result['sector1'] = re.sub('s? \(.*\)','' ,cells[11].text) #remove the rankings and and hanging 's' from times in seconds only
			result['sector2'] = re.sub('s? \(.*\)','' , cells[12].text)
			result['sector3'] = re.sub('s? \(.*\)','' , cells[13].text)
			result['finishTime'] = re.sub('s? \(.*\)','' , cells[14].text)

			categoryResults['categoryResults'].append(result)

		raceData['results'].append(categoryResults)

	return raceData

for race in races:
	raceData = scrapeRace(race)
	seasonData.append(raceData)

with open('seasonData.json', 'w', encoding='utf-8') as outfile:
	json.dump(seasonData, outfile)