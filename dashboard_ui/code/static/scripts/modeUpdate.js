function set_mode(msg){
		var rec_ind = document.getElementById("state-receiving");
		var send_ind = document.getElementById("state-sending");
		if (msg.mode_changed_to == "send"){
			rec_ind.style.display="none";
			send_ind.style.display="flex";
		}
		else{
			rec_ind.style.display="flex";
			send_ind.style.display="none";
		}
	};
