function oldestToNewest(a,b){
	return a.timestamp-b.timestamp
}

function newestToOldest(a,b){
	return b.timestamp-a.timestamp
}

function sortByTime(data,order){
	if(order === 'descending')
		data.sort(oldestToNewest);
	else
		data.sort(newestToOldest);
	return data;
}

function groupByLocation(locations,data){
	var grouped = {};
	
	for (element of locations){
		grouped[element] = [];
	}

	for (element of data){
		if (grouped[element.location] === undefined){
			console.error("unknown location: "+String(element.location));
			continue;
		}
		other_fields = {}
		for (key in element){
			if (key === "location")
				continue
			other_fields[key] = element[key]
		}
		grouped[element.location].push(other_fields)
	}
	return grouped;
}

function timeDifferenceString(from,to){
	var delta = to - from;

	var days = Math.floor(delta / (3600000*24));
	delta -= days*3600000*24;
	var hours = Math.floor(delta/3600000);
	delta -= hours*3600000;
	var minutes = Math.floor(delta/60000);
		
	var dString = days.toString().padStart(3, '\xA0');
	var hString = hours.toString().padStart(2, '\xA0');
	var mString = minutes.toString().padStart(2, '\xA0'); //non breaking spaces

	if (days > 0)
		return dString + "d " + hString + "h " + mString + "m ";
	if (hours > 0)	
		return hString + "h " + mString + "m ";
	return mString + "m ";
}


