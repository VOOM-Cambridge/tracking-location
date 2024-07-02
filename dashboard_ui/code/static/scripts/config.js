/**
This configuration script customises the job tracking (management) locations dashboard.
Select which states should be displayed by setting each state to "on" or "off".
The state names have to be identical to the database table headings.
**/
function config(){//EDITED: Jan
	//select which states should be displayed (table columns of the dashboard)
	const select_states={
		id:			"on",//ATTENTION: id always needs to be "on" for the search bar
		//job_number:	"on",
		timestamp:	"on",
		user1:		"on",
		user2:		"on",
		user3:		"on"
	}
	
	//only preceed with states which are "on"
	let displayed_states=[];
	for (const[key,value] of Object.entries(select_states)){
		if(value=="on")displayed_states.push(key);
	}
	return displayed_states;
}
