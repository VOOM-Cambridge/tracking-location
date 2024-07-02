var modal;

function create_modal(){
	modal = document.createElement('div');
	modal.id = "add_user_entry_modal";
	modal.classList.add("modal");
	document.body.appendChild(modal);

	modal_content = document.createElement('div');
	modal_content.id = "add_user_entry_modal_content";
	modal_content.classList.add("modal_content");
	modal.appendChild(modal_content);
	
	entry_prompt = document.createElement('text');
	entry_prompt.classList.add("user_entry_prompt");
	modal_content.appendChild(entry_prompt);

	user_entry = document.createElement('input');
	user_entry.setAttribute("type","text")
	user_entry.classList.add("user_entry");
	user_entry.onkeypress = function(event) { if (event.keyCode == 13) {update_user_entry(modal_id,modal_key,user_entry.value); return false;} else {return true;}};
	modal_content.appendChild(user_entry);

	submit_entry = document.createElement('button');
	submit_entry.classList.add("save_entry");
	submit_entry.innerHTML = "Save";
	submit_entry.onclick = function() { update_user_entry(modal_id,modal_key,user_entry.value)};
	modal_content.appendChild(submit_entry);

	close_modal = document.createElement('button');
	close_modal.classList.add("modal_close");
	close_modal.innerHTML = "Close";
	close_modal.onclick = function() {hide_modal();};
	modal_content.appendChild(close_modal);
}

function display_modal(id,key,title,current_value) {
	modal_id = id;
	modal_key = key
	entry_prompt.innerHTML = "Please enter the "+title+" for job "+id;
	user_entry.value = current_value;
	setTimeout(function() { user_entry.focus() }, 20);
	modal.style.display = "block";
}

function hide_modal() {
  modal.style.display = "none";
}

function update_user_entry(id,key,content){
	var index = jobstate.findIndex(el => el.id === id)
	if (index != -1){
		jobstate[index][key] = content;
		msg = {}
		msg.id = id
		msg[key] = content
		wsc.send("custom_entry_update",msg);
	}
	hide_modal();
	doRenderTable();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    hide_modal();
  }
}
