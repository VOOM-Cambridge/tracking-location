
var wsocket = "";
var tableID = "";
var tableColumns = [];

function websocket_create(url,tID,tCol) {
	wsocket = new WebSocket("ws://"+window.location.host+url);
	wsocket.onopen = on_open
	wsocket.onmessage = on_message
	wsocket.onclose = on_close
	wsocket.onerror = on_error
	tableID=tID
	tableColumns=tCol
};

function on_open(event) {
  console.log("Connection established");
  //console.log("Sending to server");
  //wsocket.send(JSON.stringify({'message':'ping'})); //test code
  //alert("sent");
};

function on_message(event) {
	console.log("Got ws message: "+event.data);
	var msg = JSON.parse(event.data);
	
	//todo handle mode messages

	var table = document.getElementById(tableID);
	var row = table.insertRow(1);
	
	var i;
	for (i=0; i<tableColumns.length;i++){
		var cell = row.insertCell(i);
		cell.innerHTML = msg[tableColumns[i]];
	}

	if (msg.dir == "I")
		row.className = "in-row";
	else if (msg.dir == "O")
		row.className = "out-row";
};

function on_close(event) {
  if (event.wasClean) {
  console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died');
  }
};

function on_error(error) {
  console.log(`[error] ${error.message}`);
};

function set_mode(mode){
	var rec_ind = document.getElementById("state-receiving");
	var send_ind = document.getElementById("state-sending");
	if (mode == "send"){
		rec_ind.style.display="none";
		send_ind.style.display="block";
	}
	else{
		rec_ind.style.display="block";
		send_ind.style.display="none";
	}
};
